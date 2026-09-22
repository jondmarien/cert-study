import { PROGRESS_KEY } from "./keys";
import {
  EMPTY_PROGRESS,
  lessonKey,
  parseProgress,
  type LastOpened,
  type ProgressState,
  type ProgressStatus,
} from "./progress";
import type { TrackId } from "./types";

const EVENT = "study-progress";

export function readProgress(): ProgressState {
  if (typeof localStorage === "undefined") return EMPTY_PROGRESS;
  return parseProgress(localStorage.getItem(PROGRESS_KEY));
}

export function subscribeProgress(onChange: () => void): () => void {
  const listener = () => onChange();
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function publish(next: ProgressState) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function setLessonStatus(
  track: TrackId,
  slug: string,
  status: ProgressStatus | "new",
) {
  const current = readProgress();
  const key = lessonKey(track, slug);
  const statuses = { ...current.statuses };
  if (status === "new") delete statuses[key];
  else statuses[key] = status;
  publish({ ...current, statuses });
}

export function markOpened(entry: LastOpened) {
  const current = readProgress();
  const key = lessonKey(entry.track, entry.slug);
  const statuses = { ...current.statuses };
  if (!statuses[key]) statuses[key] = "reading";
  const unchanged =
    current.last?.href === entry.href && statuses[key] === current.statuses[key];
  if (unchanged && current.last) return;
  publish({ statuses, last: entry });
}

export function clearProgress() {
  publish(EMPTY_PROGRESS);
}
