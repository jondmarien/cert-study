"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useProgress } from "@/components/progress-store";
import { cn } from "@/lib/cn";
import { statusFor, tallyProgress, type VisibleStatus } from "@/lib/progress";
import type { LessonStatus, TrackId } from "@/lib/types";

export type HubLesson = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  family: string;
  order: number;
  status: LessonStatus;
  minutes: number;
};

export type HubFamily = {
  name: string;
  blurb: string;
};

export function TrackHub({
  track,
  title,
  detail,
  families,
  lessons,
}: {
  track: TrackId;
  title: string;
  detail: string;
  families: HubFamily[];
  lessons: HubLesson[];
}) {
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const [noteStatus, setNoteStatus] = useState<"all" | LessonStatus>("all");
  const [progressFilter, setProgressFilter] = useState<"all" | VisibleStatus>("all");

  const slugs = lessons.map((lesson) => lesson.slug);
  const tally = tallyProgress(progress, track, slugs);
  const width = lessons.length === 0 ? 0 : (tally.done / lessons.length) * 100;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (family !== "All" && lesson.family !== family) return false;
      if (noteStatus !== "all" && lesson.status !== noteStatus) return false;
      if (progressFilter !== "all" && statusFor(progress, track, lesson.slug) !== progressFilter) {
        return false;
      }
      if (!needle) return true;
      const haystack = `${lesson.title} ${lesson.summary} ${lesson.family}`.toLowerCase();
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [family, lessons, noteStatus, progress, progressFilter, query, track]);

  const groups = families
    .map((item) => ({
      ...item,
      lessons: visible.filter((lesson) => lesson.family === item.name),
    }))
    .filter((item) => item.lessons.length > 0);

  return (
    <div>
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Track</p>
        <h1 className="mt-2 font-display text-5xl leading-none">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink">{detail}</p>
        <div className="mt-5">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={lessons.length}
            aria-valuenow={tally.done}
            aria-label="Modules marked done"
          >
            <div className="h-full bg-accent" style={{ width: `${width}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {tally.done} done · {tally.reading} in progress · {tally.fresh} not started
          </p>
        </div>
      </header>

      <div className="mt-8 space-y-4 rounded-2xl border border-line bg-card p-4">
        <div>
          <label htmlFor="module-filter" className="text-sm font-medium">
            Filter modules
          </label>
          <input
            id="module-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, summary, or family"
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-base"
          />
        </div>
        <FilterRow
          label="Family"
          value={family}
          options={["All", ...families.map((item) => item.name)]}
          onChange={setFamily}
        />
        <FilterRow
          label="Notes"
          value={noteStatus}
          options={[
            ["all", "All notes"],
            ["ready", "Ready"],
            ["outline", "Outlines"],
          ]}
          onChange={setNoteStatus}
        />
        <FilterRow
          label="Progress"
          value={progressFilter}
          options={[
            ["all", "Any progress"],
            ["new", "Not started"],
            ["reading", "In progress"],
            ["done", "Done"],
          ]}
          onChange={setProgressFilter}
        />
        <p className="text-sm text-muted">
          Showing {visible.length} of {lessons.length}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 text-muted">Nothing matches those filters.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.name} aria-labelledby={`family-${slugify(group.name)}`}>
              <h2 id={`family-${slugify(group.name)}`} className="font-display text-3xl">
                {group.name}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">{group.blurb}</p>
              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
                {group.lessons.map((lesson) => {
                  const state = statusFor(progress, track, lesson.slug);
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={lesson.href}
                        data-lesson={lesson.slug}
                        className="flex flex-col gap-2 px-4 py-4 hover:bg-soft sm:flex-row sm:items-start sm:justify-between"
                      >
                        <span>
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{lesson.title}</span>
                            <StatusPill status={lesson.status} progress={state} />
                          </span>
                          <span className="mt-1 block text-sm text-muted">{lesson.summary}</span>
                        </span>
                        <span className="shrink-0 text-sm text-muted">{lesson.minutes} min</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[] | readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  const normalized = options.map((option) =>
    typeof option === "string" ? ([option, option] as const) : option,
  );
  return (
    <div>
      <p className="text-sm font-medium" id={`${slugify(label)}-label`}>
        {label}
      </p>
      <div
        className="mt-2 flex flex-wrap gap-2"
        role="group"
        aria-labelledby={`${slugify(label)}-label`}
      >
        {normalized.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              value === id ? "border-accent bg-soft text-ink" : "border-line text-muted hover:text-ink",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusPill({
  status,
  progress,
}: {
  status: LessonStatus;
  progress: VisibleStatus;
}) {
  const progressLabel =
    progress === "done" ? "Done" : progress === "reading" ? "In progress" : "Not started";
  return (
    <span className="flex flex-wrap gap-1 text-xs">
      <span
        className={cn(
          "rounded-full px-2 py-0.5",
          status === "outline" ? "bg-warn-soft text-warn" : "bg-soft text-accent",
        )}
      >
        {status === "outline" ? "Outline" : "Ready"}
      </span>
      <span className="rounded-full bg-paper px-2 py-0.5 text-muted">{progressLabel}</span>
    </span>
  );
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
