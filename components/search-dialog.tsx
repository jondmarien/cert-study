"use client";

import { useEffect } from "react";

import { SearchPanel } from "@/components/search-panel";
import { useSearch } from "@/components/search-provider";

export function SearchDialog() {
  const { open, setOpen } = useSearch();

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (before instanceof HTMLElement) before.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-ink/40"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        className="search-pop relative z-10 w-full max-w-xl rounded-2xl border border-line bg-card p-4 shadow-none"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="search-dialog-title" className="font-display text-2xl">
            Search notes
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-line px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>
        <SearchPanel autoFocus onNavigate={() => setOpen(false)} />
        <p className="mt-3 text-xs text-muted">
          Arrow keys move through results. Escape closes.
        </p>
      </div>
    </div>
  );
}
