import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonBody } from "@/components/lesson-body";
import { LessonChrome } from "@/components/lesson-chrome";
import {
  getAllLessons,
  getLesson,
  getLessonHeadings,
  getNeighbors,
  isTrackId,
  resolveRelated,
} from "@/lib/content";
import { getTrack } from "@/lib/tracks";

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({
    track: lesson.track,
    slug: lesson.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}): Promise<Metadata> {
  const { track, slug } = await params;
  if (!isTrackId(track)) return {};
  const lesson = getLesson(track, slug);
  if (!lesson) return {};
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}) {
  const { track, slug } = await params;
  if (!isTrackId(track)) notFound();
  const lesson = getLesson(track, slug);
  if (!lesson) notFound();
  const info = getTrack(track);
  const neighbors = getNeighbors(lesson);

  return (
    <LessonChrome
      track={lesson.track}
      trackTitle={info.shortTitle}
      trackHref={info.href}
      slug={lesson.slug}
      title={lesson.title}
      summary={lesson.summary}
      family={lesson.family}
      status={lesson.status}
      minutes={lesson.minutes}
      academy={lesson.academy}
      objectives={lesson.objectives}
      headings={getLessonHeadings(lesson)}
      related={resolveRelated(lesson)}
      previous={neighbors.previous}
      next={neighbors.next}
    >
      <LessonBody source={lesson.body} />
    </LessonChrome>
  );
}
