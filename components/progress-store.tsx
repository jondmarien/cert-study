"use client";

import { useSyncExternalStore } from "react";

import { PROGRESS_KEY } from "@/lib/keys";
import {
  EMPTY_PROGRESS,
  lessonKey,
  parseProgress,
  type LastOpened,
  type ProgressState,
  type ProgressStatus,
} from "@/lib/progress";
import type { TrackId } from "@/lib/types";

const EVENT = "study-progress";

let rawCache: string | null = null;
let stateCache: ProgressState = EMPTY_PROGRESS;

function syncCache() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw === rawCache) return stateCache;
  rawCache = raw;
  stateCache = parseProgress(raw);
  return stateCache;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function publish(next: ProgressState) {
  const raw = JSON.stringify(next);
  localStorage.setItem(PROGRESS_KEY, raw);
  rawCache = raw;
  stateCache = next;
  window.dispatchEvent(new Event(EVENT));
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, syncCache, () => EMPTY_PROGRESS);
}

export function setLessonStatus(
  track: TrackId,
  slug: string,
  status: ProgressStatus | "new",
) {
  const current = parseProgress(localStorage.getItem(PROGRESS_KEY));
  const key = lessonKey(track, slug);
  const statuses = { ...current.statuses };
  if (status === "new") delete statuses[key];
  else statuses[key] = status;
  publish({ ...current, statuses });
}

export function markOpened(entry: LastOpened) {
  const current = parseProgress(localStorage.getItem(PROGRESS_KEY));
  const key = lessonKey(entry.track, entry.slug);
  const statuses = { ...current.statuses };
  if (!statuses[key]) statuses[key] = "reading";
  const unchanged =
    current.last?.href === entry.href &&
    statuses[key] === current.statuses[key];
  if (unchanged && current.last) return;
  publish({ statuses, last: entry });
}

export function clearProgress() {
  publish(EMPTY_PROGRESS);
}
