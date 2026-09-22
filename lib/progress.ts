import type { TrackId } from "@/lib/types";

export type ProgressStatus = "reading" | "done";
export type VisibleStatus = "new" | ProgressStatus;

export type LastOpened = {
  track: TrackId;
  slug: string;
  title: string;
  href: string;
};

export type ProgressState = {
  statuses: Record<string, ProgressStatus>;
  last: LastOpened | null;
};

export const EMPTY_PROGRESS: ProgressState = {
  statuses: {},
  last: null,
};

export function lessonKey(track: TrackId, slug: string): string {
  return `${track}:${slug}`;
}

export function parseProgress(raw: string | null): ProgressState {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return EMPTY_PROGRESS;
    const record = data as { statuses?: unknown; last?: unknown };
    const statuses: Record<string, ProgressStatus> = {};
    if (record.statuses && typeof record.statuses === "object") {
      for (const [key, value] of Object.entries(record.statuses)) {
        if (value === "reading" || value === "done") statuses[key] = value;
      }
    }
    return { statuses, last: parseLast(record.last) };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function parseLast(value: unknown): LastOpened | null {
  if (!value || typeof value !== "object") return null;
  const last = value as Partial<LastOpened>;
  if (
    (last.track !== "bscp" && last.track !== "security-plus") ||
    typeof last.slug !== "string" ||
    typeof last.title !== "string" ||
    typeof last.href !== "string"
  ) {
    return null;
  }
  return {
    track: last.track,
    slug: last.slug,
    title: last.title,
    href: last.href,
  };
}

export function statusFor(
  state: ProgressState,
  track: TrackId,
  slug: string,
): VisibleStatus {
  return state.statuses[lessonKey(track, slug)] ?? "new";
}

export function tallyProgress(
  state: ProgressState,
  track: TrackId,
  slugs: readonly string[],
): { done: number; reading: number; fresh: number } {
  let done = 0;
  let reading = 0;
  for (const slug of slugs) {
    const status = statusFor(state, track, slug);
    if (status === "done") done += 1;
    if (status === "reading") reading += 1;
  }
  return { done, reading, fresh: slugs.length - done - reading };
}
