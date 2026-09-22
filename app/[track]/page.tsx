import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackHub } from "@/components/track-hub";
import { getTrackLessons, isTrackId } from "@/lib/content";
import { getTrack } from "@/lib/tracks";
import { TRACK_IDS } from "@/lib/types";
import { formatLicenseDate } from "@/lib/study-config";

export function generateStaticParams() {
  return TRACK_IDS.map((track) => ({ track }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  if (!isTrackId(track)) return {};
  const info = getTrack(track);
  return { title: info.shortTitle, description: info.summary };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!isTrackId(track)) notFound();
  const info = getTrack(track);
  const detail =
    track === "bscp"
      ? `${info.detail} Planning date for Burp Pro access: ${formatLicenseDate()}.`
      : info.detail;

  return (
    <TrackHub
      track={track}
      title={info.shortTitle}
      detail={detail}
      families={info.families.map((family) => ({ name: family.name, blurb: family.blurb }))}
      lessons={getTrackLessons(track).map((lesson) => ({
        slug: lesson.slug,
        href: lesson.href,
        title: lesson.title,
        summary: lesson.summary,
        family: lesson.family,
        order: lesson.order,
        status: lesson.status,
        minutes: lesson.minutes,
      }))}
    />
  );
}
