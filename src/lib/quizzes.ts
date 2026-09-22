import fs from "node:fs";
import path from "node:path";

import { getLesson } from "./curriculum";
import { quizSchema, type Quiz } from "./quiz-schema";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export type QuizFile = Quiz & {
  id: string;
  href: string;
};

function fail(message: string): never {
  throw new Error(`Content error: ${message}`);
}

export function loadQuizFiles(): QuizFile[] {
  const dir = path.join(process.cwd(), "content/quizzes");
  if (!fs.existsSync(dir)) fail("content/quizzes is missing");
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();
  const quizzes = files.map((name) => {
    const id = name.replace(/\.json$/, "");
    if (!SLUG_PATTERN.test(id)) {
      fail(`content/quizzes/${name} filename must be a lowercase slug`);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "invalid JSON";
      fail(`content/quizzes/${name} is not valid JSON (${detail})`);
    }
    const parsed = quizSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "quiz"}: ${issue.message}`)
        .join("; ");
      fail(`content/quizzes/${name} ${detail}`);
    }
    if (parsed.data.lesson) {
      const lesson = getLesson(parsed.data.lesson.track, parsed.data.lesson.slug);
      if (!lesson) {
        fail(
          `content/quizzes/${name} links to a missing lesson ${parsed.data.lesson.track}/${parsed.data.lesson.slug}`,
        );
      }
    }
    return {
      ...parsed.data,
      id,
      href: `/quizzes/${id}`,
    };
  });
  const seen = new Set<string>();
  for (const quiz of quizzes) {
    if (seen.has(quiz.id)) fail(`content/quizzes has two files named ${quiz.id}`);
    seen.add(quiz.id);
  }
  return quizzes;
}
