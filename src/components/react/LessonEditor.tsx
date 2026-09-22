import { useState } from "react";

import { DEV_LESSON_RETURN_KEY } from "../../lib/keys";

function rememberReturn(target: string) {
  try {
    sessionStorage.setItem(
      DEV_LESSON_RETURN_KEY,
      JSON.stringify({ href: target, at: Date.now() }),
    );
  } catch {
    // Private mode can block storage. Navigation still runs when the reload does not.
  }
}

function forgetReturn() {
  try {
    sessionStorage.removeItem(DEV_LESSON_RETURN_KEY);
  } catch {
    // Ignore a blocked storage API. The save error is the message that matters.
  }
}

type Props = {
  track: string;
  slug: string;
  source: string;
};

export default function LessonEditor({ track, slug, source }: Props) {
  const [draft, setDraft] = useState(source);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  async function save() {
    const target = `/${track}/${slug}`;
    setPending(true);
    setErrors([]);
    // The content loader full-reloads the open page after the file write, which
    // can cancel this navigation. The next document finishes the return.
    rememberReturn(target);
    try {
      const response = await fetch("/api/dev/lesson", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ track, slug, source: draft }),
      });
      const body = (await response.json()) as { errors?: string[] };
      if (!response.ok || (body.errors && body.errors.length > 0)) {
        forgetReturn();
        setErrors(body.errors?.length ? body.errors : ["The editor could not save that note."]);
        setPending(false);
        return;
      }
      window.location.assign(target);
    } catch {
      forgetReturn();
      setErrors(["The dev server did not accept the save."]);
      setPending(false);
    }
  }

  return (
    <form
      className="mx-auto max-w-3xl"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Dev server only</p>
      <h1 className="mt-2 font-display text-5xl leading-none">Edit this note</h1>
      <p className="mt-4 text-lg leading-8">
        This writes <code>content/{track}/{slug}.mdx</code> on the machine running{" "}
        <code>bun run dev</code>. The published site has no place to store that file.
      </p>
      <label className="mt-6 block text-sm">
        File
        <textarea
          className="mt-2 min-h-[28rem] w-full rounded-2xl border border-line bg-card px-4 py-3 font-mono text-sm leading-6"
          value={draft}
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      {errors.length > 0 ? (
        <ul className="mt-4 rounded-2xl border border-copper bg-soft-copper px-4 py-3 text-sm" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-sm text-accent-ink disabled:opacity-50"
          disabled={pending || draft === source}
        >
          {pending ? "Saving" : "Save to disk"}
        </button>
        <a href={`/${track}/${slug}`} className="rounded-full border border-line px-4 py-2 text-sm">
          Back to the note
        </a>
      </div>
    </form>
  );
}
