"use client";

import Link from "next/link";
import { useEffect } from "react";

import { markOpened, setLessonStatus, useProgress } from "@/components/progress-store";
import { cn } from "@/lib/cn";
import { statusFor, type VisibleStatus } from "@/lib/progress";
import type { Heading, LessonStatus, ResolvedRelated, TrackId } from "@/lib/types";
import type { ReactNode } from "react";

export function LessonChrome({
  track,
  trackTitle,
  trackHref,
  slug,
  title,
  summary,
  family,
  status,
  minutes,
  academy,
  objectives,
  headings,
  related,
  previous,
  next,
  children,
}: {
  track: TrackId;
  trackTitle: string;
  trackHref: string;
  slug: string;
  title: string;
  summary: string;
  family: string;
  status: LessonStatus;
  minutes: number;
  academy?: string;
  objectives: string[];
  headings: Heading[];
  related: ResolvedRelated[];
  previous: { href: string; title: string; family: string } | null;
  next: { href: string; title: string; family: string } | null;
  children: ReactNode;
}) {
  const progress = useProgress();
  const current = statusFor(progress, track, slug);
  const href = `/${track}/${slug}`;

  useEffect(() => {
    markOpened({ track, slug, title, href });
  }, [href, slug, title, track]);

  const crossTrack = related.filter((item) => item.track !== track);
  const sameTrack = related.filter((item) => item.track === track);
  const crossLabel =
    track === "bscp" ? "Related Security+ ideas" : "Related BSCP notes";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <article>
        <p className="text-sm text-muted">
          <Link href={trackHref} className="underline decoration-line underline-offset-4">
            {trackTitle}
          </Link>
          <span aria-hidden="true"> · </span>
          {family}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-none">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8">{summary}</p>
        <p className="mt-3 text-sm text-muted">
          {minutes} min read
          {academy ? ` · Academy topic: ${academy}` : ""}
          {status === "outline" ? " · Outline, not a finished note" : ""}
        </p>
        <ProgressButtons
          current={current}
          onChange={(nextStatus) => setLessonStatus(track, slug, nextStatus)}
        />
        {status === "outline" ? (
          <p className="mt-4 rounded-2xl border border-warn bg-warn-soft px-4 py-3 text-sm">
            Outline. This module is on the map so you can track it. The page below is a writing
            checklist, not finished study material.
          </p>
        ) : null}
        <section className="mt-8 rounded-2xl border border-line bg-card px-4 py-4" aria-labelledby="objectives-heading">
          <h2 id="objectives-heading" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            Objectives
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
        {headings.length > 0 ? (
          <details className="mt-6 rounded-2xl border border-line bg-card px-4 py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">On this page</summary>
            <Toc headings={headings} />
          </details>
        ) : null}
        <div className="mt-8 max-w-3xl">{children}</div>
        {sameTrack.length > 0 ? (
          <RelatedList title="More on this track" items={sameTrack} />
        ) : null}
        {crossTrack.length > 0 ? <RelatedList title={crossLabel} items={crossTrack} /> : null}
        <nav aria-label="Curriculum" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link href={previous.href} className="rounded-2xl border border-line bg-card px-4 py-3 hover:border-accent">
              <span className="text-xs uppercase tracking-[0.14em] text-muted">Previous</span>
              <span className="mt-1 block font-medium">{previous.title}</span>
              <span className="text-sm text-muted">{previous.family}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="rounded-2xl border border-line bg-card px-4 py-3 text-right hover:border-accent sm:col-start-2"
            >
              <span className="text-xs uppercase tracking-[0.14em] text-muted">Next</span>
              <span className="mt-1 block font-medium">{next.title}</span>
              <span className="text-sm text-muted">{next.family}</span>
            </Link>
          ) : null}
        </nav>
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          {headings.length > 0 ? (
            <nav aria-label="On this page" className="rounded-2xl border border-line bg-card px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">On this page</p>
              <Toc headings={headings} />
            </nav>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function ProgressButtons({
  current,
  onChange,
}: {
  current: VisibleStatus;
  onChange: (status: VisibleStatus) => void;
}) {
  const options: { id: VisibleStatus; label: string }[] = [
    { id: "new", label: "Not started" },
    { id: "reading", label: "In progress" },
    { id: "done", label: "Done" },
  ];
  return (
    <div className="mt-5" role="group" aria-label="Study progress">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={current === option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              current === option.id
                ? "border-accent bg-soft text-ink"
                : "border-line text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol className="mt-3 space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a href={`#${heading.id}`} className="text-muted hover:text-ink">
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function RelatedList({ title, items }: { title: string; items: ResolvedRelated[] }) {
  return (
    <section className="mt-10" aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <h2 id={title.replace(/\s+/g, "-").toLowerCase()} className="font-display text-3xl">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block rounded-xl border border-line px-3 py-3 hover:border-accent">
              <span className="font-medium">{item.title}</span>
              <span className="mt-1 block text-sm text-muted">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
