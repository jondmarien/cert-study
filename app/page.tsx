import { HomeView, type HomeCard, type HomeStart } from "@/components/home-view";
import { UrgencyBanner } from "@/components/urgency-banner";
import { getAllLessons, getStartLinks, getTrackLessons } from "@/lib/content";
import { TRACK_LIST } from "@/lib/tracks";

export default function HomePage() {
  const cards: HomeCard[] = TRACK_LIST.map((track) => {
    const lessons = getTrackLessons(track.id);
    const ready = lessons.filter((lesson) => lesson.status === "ready");
    return {
      id: track.id,
      title: track.title,
      shortTitle: track.shortTitle,
      eyebrow: track.eyebrow,
      summary: track.summary,
      href: track.href,
      lessonCount: lessons.length,
      readyCount: ready.length,
      readyMinutes: ready.reduce((total, lesson) => total + lesson.minutes, 0),
      slugs: lessons.map((lesson) => lesson.slug),
    };
  });

  const starts: HomeStart[] = TRACK_LIST.flatMap((track) =>
    getStartLinks(track.id).map((lesson) => ({
      href: lesson.href,
      title: lesson.title,
      summary: lesson.summary,
      trackTitle: track.shortTitle,
    })),
  );

  return (
    <div>
      <UrgencyBanner />
      <section className="mt-8 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Personal cert desk</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">
          Learn the ideas. Drill the reps with your coach.
        </h1>
        <p className="mt-5 text-lg leading-8">
          Two tracks live here: Burp Suite Certified Practitioner and CompTIA Security+ in the
          SY0-701 shape. Read for the concept, the evidence you would compare, and the control
          that would have stopped it. Question practice stays in Drill.
        </p>
      </section>
      <div className="mt-8">
        <HomeView
          cards={cards}
          starts={starts}
          knownHrefs={getAllLessons().map((lesson) => lesson.href)}
        />
      </div>
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-display text-2xl">Read, then lab</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            BSCP notes tell you what a family of bugs means and which Burp tool to reach for.
            The exact lab input belongs in an Academy lab you are allowed to use.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-display text-2xl">No question bank</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Security+ notes are short distinctions, not practice items. If a page says Outline,
            the write-up is still a checklist.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-display text-2xl">Progress stays local</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Mark a note not started, in progress, or done. That record lives in this browser.
            Press / to search both tracks.
          </p>
        </article>
      </section>
    </div>
  );
}
