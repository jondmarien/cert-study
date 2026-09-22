"use client";

import Link from "next/link";

import { useProgress } from "@/components/progress-store";
import { tallyProgress } from "@/lib/progress";
import type { TrackId } from "@/lib/types";

export type HomeCard = {
  id: TrackId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  href: string;
  lessonCount: number;
  readyCount: number;
  readyMinutes: number;
  slugs: string[];
};

export type HomeStart = {
  href: string;
  title: string;
  summary: string;
  trackTitle: string;
};

export function HomeView({
  cards,
  starts,
  knownHrefs,
}: {
  cards: HomeCard[];
  starts: HomeStart[];
  knownHrefs: string[];
}) {
  const progress = useProgress();
  const known = new Set(knownHrefs);
  const last = progress.last && known.has(progress.last.href) ? progress.last : null;

  return (
    <div className="space-y-8">
      {last ? (
        <section className="rounded-2xl border border-accent bg-soft px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Continue</p>
          <h2 className="mt-1 font-display text-3xl">
            <Link href={last.href} className="underline decoration-accent/40 underline-offset-4">
              {last.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted">Picked up from this browser.</p>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const tally = tallyProgress(progress, card.id, card.slugs);
          const width = card.lessonCount === 0 ? 0 : (tally.done / card.lessonCount) * 100;
          return (
            <article
              key={card.id}
              className="flex flex-col rounded-2xl border border-line bg-card p-5"
              style={{ borderTopWidth: 4, borderTopColor: card.id === "bscp" ? "var(--accent)" : "var(--copper)" }}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-muted">{card.eyebrow}</p>
              <h2 className="mt-2 font-display text-4xl leading-none">
                <Link href={card.href} className="hover:text-accent">
                  {card.shortTitle}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{card.title}</p>
              <p className="mt-4 flex-1 text-base leading-7">{card.summary}</p>
              <div className="mt-5">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={card.lessonCount}
                  aria-valuenow={tally.done}
                  aria-label={`${card.shortTitle} modules marked done`}
                >
                  <div className="h-full bg-accent" style={{ width: `${width}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {tally.done} of {card.lessonCount} marked done
                  {tally.reading > 0 ? ` · ${tally.reading} in progress` : ""}
                  {" · "}
                  {card.readyCount} ready notes · about {card.readyMinutes} min
                </p>
              </div>
              <Link
                href={card.href}
                className="mt-4 inline-flex w-fit rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-accent hover:text-accent-ink"
              >
                Open {card.shortTitle}
              </Link>
            </article>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-3xl">Suggested opening notes</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {starts.map((start) => (
            <li key={start.href}>
              <Link
                href={start.href}
                className="block h-full rounded-2xl border border-line bg-card px-4 py-3 hover:border-accent"
              >
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  {start.trackTitle}
                </span>
                <span className="mt-1 block font-medium">{start.title}</span>
                <span className="mt-1 block text-sm text-muted">{start.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
