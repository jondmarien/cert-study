import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-2 font-display text-5xl">That page is not on the desk</h1>
      <p className="mt-4 text-muted">The track or lesson slug does not match a note.</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper"
      >
        Back home
      </Link>
    </div>
  );
}
