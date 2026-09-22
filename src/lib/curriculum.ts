import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { extractHeadings } from "./headings";
import { lessonFrontmatterSchema } from "./schema";
import { stripMarkup } from "./text";
import { familyNames, getTrack, TRACK_LIST } from "./tracks";
import type {
  Heading,
  Lesson,
  LessonMeta,
  LessonNeighbor,
  ResolvedRelated,
  SearchDocument,
  TrackId,
} from "./types";
import { TRACK_IDS } from "./types";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

let cached: Lesson[] | null = null;

export function isTrackId(value: string): value is TrackId {
  return (TRACK_IDS as readonly string[]).includes(value);
}

function cacheAcrossReads(): boolean {
  return import.meta.env?.DEV !== true;
}

export function loadCurriculum(): Lesson[] {
  if (cached && cacheAcrossReads()) return cached;
  const lessons = TRACK_IDS.flatMap((track) => readTrack(track));
  assertUnique(lessons);
  assertRelated(lessons);
  assertStartHere(lessons);
  if (cacheAcrossReads()) cached = lessons;
  return lessons;
}

export function resolveLessonFile(track: string, slug: string): string | null {
  if (!isTrackId(track) || !SLUG_PATTERN.test(slug)) return null;
  const root = path.resolve(process.cwd(), "content", track);
  const file = path.resolve(root, `${slug}.mdx`);
  if (!file.startsWith(`${root}${path.sep}`)) return null;
  return file;
}

export function saveLessonSource(track: string, slug: string, source: unknown): string[] {
  if (!isTrackId(track)) return ["Choose a BSCP or Security+ lesson."];
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) return ["That lesson address is not valid."];
  if (typeof source !== "string") return ["The editor did not send the note text."];
  if (source.length > 200_000) return ["That note is too large to save from the editor."];
  const file = resolveLessonFile(track, slug);
  if (!file) return ["That path is not a lesson file."];
  if (!fs.existsSync(file)) return ["That lesson file does not exist yet. Add it in the repo first."];
  let candidate: Lesson;
  try {
    candidate = parseRawLesson(track, slug, source);
  } catch (error) {
    return [error instanceof Error ? error.message : "Could not read that note."];
  }
  try {
    const next = loadCurriculum().map((lesson) =>
      lesson.track === track && lesson.slug === slug ? candidate : lesson,
    );
    assertUnique(next);
    assertRelated(next);
    assertStartHere(next);
  } catch (error) {
    return [error instanceof Error ? error.message : "That note failed the content checks."];
  }
  fs.writeFileSync(file, source.endsWith("\n") ? source : `${source}\n`);
  cached = null;
  return [];
}

export function getTrackLessons(track: TrackId): Lesson[] {
  return loadCurriculum().filter((lesson) => lesson.track === track);
}

export function getLesson(track: TrackId, slug: string): Lesson | undefined {
  return getTrackLessons(track).find((lesson) => lesson.slug === slug);
}

export function getSearchDocuments(): SearchDocument[] {
  return loadCurriculum().map((lesson) => ({
    track: lesson.track,
    trackTitle: getTrack(lesson.track).shortTitle,
    slug: lesson.slug,
    href: lesson.href,
    title: lesson.title,
    summary: lesson.summary,
    family: lesson.family,
    status: lesson.status,
    minutes: lesson.minutes,
    tags: lesson.tags,
    text: stripMarkup(
      `${lesson.objectives.join(" ")} ${lesson.academy ?? ""} ${lesson.body}`,
    ),
  }));
}

export function getLessonHeadings(lesson: Lesson): Heading[] {
  return extractHeadings(lesson.body);
}

export function resolveRelated(lesson: LessonMeta): ResolvedRelated[] {
  const all = loadCurriculum();
  return lesson.related.map((link) => {
    const target = all.find((item) => item.track === link.track && item.slug === link.slug);
    if (!target) {
      fail(`${lesson.track}/${lesson.slug} related link is missing at resolve time`);
    }
    return {
      track: target.track,
      slug: target.slug,
      href: target.href,
      title: link.label ?? target.title,
      summary: target.summary,
      family: target.family,
    };
  });
}

export function getNeighbors(lesson: LessonMeta): {
  previous: LessonNeighbor | null;
  next: LessonNeighbor | null;
} {
  if (lesson.status !== "ready") return { previous: null, next: null };
  const ready = getTrackLessons(lesson.track).filter((item) => item.status === "ready");
  const index = ready.findIndex((item) => item.slug === lesson.slug);
  return {
    previous: index > 0 ? toNeighbor(ready[index - 1]) : null,
    next: index >= 0 && index < ready.length - 1 ? toNeighbor(ready[index + 1]) : null,
  };
}

export function getStartLinks(track: TrackId): LessonMeta[] {
  const lessons = getTrackLessons(track);
  return getTrack(track).startHere.map((slug) => {
    const lesson = lessons.find((item) => item.slug === slug);
    if (!lesson) fail(`${track} start link ${slug} disappeared`);
    return lesson;
  });
}

function toNeighbor(lesson: Lesson): LessonNeighbor {
  return { href: lesson.href, title: lesson.title, family: lesson.family };
}

function readTrack(track: TrackId): Lesson[] {
  const dir = path.join(process.cwd(), "content", track);
  if (!fs.existsSync(dir)) fail(`missing content directory content/${track}`);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readLesson(track, dir, file))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function readLesson(track: TrackId, dir: string, file: string): Lesson {
  const slug = file.slice(0, -".mdx".length);
  return parseRawLesson(track, slug, fs.readFileSync(path.join(dir, file), "utf8"));
}

function parseRawLesson(track: TrackId, slug: string, raw: string): Lesson {
  if (!SLUG_PATTERN.test(slug)) {
    fail(`${track}/${slug}.mdx slug must be lowercase letters, numbers, and hyphens`);
  }
  let parsed: { data: unknown; content: string };
  try {
    parsed = matter(raw);
  } catch {
    fail(`${track}/${slug}.mdx frontmatter could not be parsed`);
  }
  const frontmatter = lessonFrontmatterSchema.safeParse(parsed.data);
  if (!frontmatter.success) {
    const details = frontmatter.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    fail(`${track}/${slug}.mdx ${details}`);
  }
  const data = frontmatter.data;
  if (!familyNames(track).includes(data.family)) {
    fail(
      `${track}/${slug}.mdx family "${data.family}" is not one of: ${familyNames(track).join(", ")}`,
    );
  }
  if (data.status === "ready" && !parsed.content.trim()) {
    fail(`${track}/${slug}.mdx is marked ready but has an empty body`);
  }
  return {
    ...data,
    track,
    slug,
    href: `/${track}/${slug}`,
    body: parsed.content.trim(),
  };
}

function assertUnique(lessons: readonly Lesson[]): void {
  const slugs = new Set<string>();
  const orders = new Set<string>();
  for (const lesson of lessons) {
    const slugKey = `${lesson.track}/${lesson.slug}`;
    if (slugs.has(slugKey)) fail(`duplicate slug ${slugKey}`);
    slugs.add(slugKey);
    const orderKey = `${lesson.track}:${lesson.order}`;
    if (orders.has(orderKey)) {
      fail(`duplicate order ${lesson.order} in ${lesson.track} (${lesson.slug})`);
    }
    orders.add(orderKey);
  }
}

function assertRelated(lessons: readonly Lesson[]): void {
  const known = new Set(lessons.map((lesson) => `${lesson.track}/${lesson.slug}`));
  for (const lesson of lessons) {
    for (const link of lesson.related) {
      const key = `${link.track}/${link.slug}`;
      if (!known.has(key)) {
        fail(`${lesson.track}/${lesson.slug} related link ${key} does not exist`);
      }
      if (link.track === lesson.track && link.slug === lesson.slug) {
        fail(`${lesson.track}/${lesson.slug} cannot relate to itself`);
      }
    }
  }
}

function assertStartHere(lessons: readonly Lesson[]): void {
  for (const track of TRACK_LIST) {
    for (const slug of track.startHere) {
      const lesson = lessons.find((item) => item.track === track.id && item.slug === slug);
      if (!lesson) fail(`${track.id} startHere slug "${slug}" does not exist`);
      if (lesson.status !== "ready") {
        fail(`${track.id} startHere slug "${slug}" must be a ready lesson`);
      }
    }
  }
}

function fail(message: string): never {
  throw new Error(`Content error: ${message}`);
}
