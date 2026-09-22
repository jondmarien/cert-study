"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-5xl">The page failed to render</h1>
      <p className="mt-4 text-muted">
        Try again. If a content file is invalid, the build output names the file.
        {error.digest ? ` Reference ${error.digest}.` : ""}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-ink px-4 py-2 text-sm text-paper"
      >
        Try again
      </button>
    </div>
  );
}
