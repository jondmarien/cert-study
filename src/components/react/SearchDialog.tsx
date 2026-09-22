import React, { startTransition, useEffect, useState } from "react";

// React 19.3 exports this value. Vite's SSR runner misses the named export on React's CommonJS entry.
const ViewTransition = React.ViewTransition;

import type { SearchDocument } from "@/lib/types";

import { SearchPanel } from "./SearchPanel";

export default function SearchDialog({ documents }: { documents: SearchDocument[] }) {
  const [open, setOpen] = useState(false);

  function setOpenAnimated(next: boolean) {
    startTransition(() => {
      setOpen(next);
    });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setOpenAnimated(true);
      }
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenAnimated(true);
      }
      if (event.key === "Escape") setOpenAnimated(false);
    }
    function onOpen() {
      setOpenAnimated(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

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

  if (!open) return <span hidden data-search-dialog="closed" />;

  return (
    <ViewTransition enter="search-enter" exit="search-exit">
      <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
        <button
          type="button"
          aria-label="Close search"
          className="absolute inset-0 bg-ink/40"
          onClick={() => setOpenAnimated(false)}
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
              onClick={() => setOpenAnimated(false)}
              className="rounded-full border border-line px-3 py-1 text-sm"
            >
              Close
            </button>
          </div>
          <SearchPanel documents={documents} autoFocus onNavigate={() => setOpenAnimated(false)} />
          <p className="mt-3 text-xs text-muted">Arrow keys move through results. Escape closes.</p>
        </div>
      </div>
    </ViewTransition>
  );
}
