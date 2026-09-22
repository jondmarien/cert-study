import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
        <p>Concepts and lab technique only. Drills stay in Drill with your coach.</p>
        <p className="flex gap-4">
          <Link href="/about" className="underline decoration-line underline-offset-4 hover:text-ink">
            About these notes
          </Link>
          <Link href="/search" className="underline decoration-line underline-offset-4 hover:text-ink">
            Search
          </Link>
        </p>
      </div>
    </footer>
  );
}
