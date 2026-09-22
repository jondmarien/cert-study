import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchPageClient } from "@/components/search-page";

export const metadata: Metadata = {
  title: "Search",
  description: "Search BSCP and Security+ study notes.",
};

export default function SearchPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Both tracks</p>
      <h1 className="mt-2 font-display text-5xl">Search</h1>
      <p className="mt-3 text-muted">
        Titles, summaries, tags, and the text of the notes. Outlines are included and labeled.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted">Loading search…</p>}>
          <SearchPageClient />
        </Suspense>
      </div>
    </div>
  );
}
