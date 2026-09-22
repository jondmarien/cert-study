"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";

import { useSearch } from "@/components/search-provider";
import { cn } from "@/lib/cn";
import { searchDocuments } from "@/lib/search";
import type { TrackId } from "@/lib/types";

const SUGGESTIONS = [
  { href: "/bscp/sql-injection", label: "SQL injection" },
  { href: "/bscp/burp-proxy", label: "Burp Proxy" },
  { href: "/security-plus/general-security-concepts", label: "Security concepts" },
  { href: "/security-plus/risk-management", label: "Risk management" },
];

export function SearchPanel({
  autoFocus = false,
  initialQuery = "",
  onNavigate,
  showTrackFilter = true,
}: {
  autoFocus?: boolean;
  initialQuery?: string;
  onNavigate?: () => void;
  showTrackFilter?: boolean;
}) {
  const { documents } = useSearch();
  const [query, setQuery] = useState(initialQuery);
  const [track, setTrack] = useState<TrackId | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const inputId = useId();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const results = useMemo(() => {
    const pool =
      track === "all" ? documents : documents.filter((doc) => doc.track === track);
    return searchDocuments(pool, query, 12);
  }, [documents, query, track]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-result]") ?? [],
    );
    const current = links.findIndex((link) => link === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = links[current + 1] ?? links[0];
      next?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = current <= 0 ? inputRef.current : links[current - 1];
      next?.focus();
    }
    if (event.key === "Enter" && document.activeElement === inputRef.current && links[0]) {
      event.preventDefault();
      links[0].click();
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <label htmlFor={inputId} className="sr-only">
        Search notes
      </label>
      <input
        id={inputId}
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search topics, tools, domains"
        role="combobox"
        aria-expanded={query.trim().length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink outline-none placeholder:text-muted"
      />
      {showTrackFilter ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Limit search to a track">
          {(
            [
              ["all", "Both tracks"],
              ["bscp", "BSCP"],
              ["security-plus", "Security+"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={track === id}
              onClick={() => setTrack(id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                track === id
                  ? "border-accent bg-soft text-ink"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={listRef} id={listId} className="mt-4" role="listbox" aria-label="Search results">
        <p className="sr-only" aria-live="polite">
          {query.trim()
            ? `${results.length} result${results.length === 1 ? "" : "s"}`
            : "Type to search notes"}
        </p>
        {query.trim() === "" ? (
          <div>
            <p className="text-sm text-muted">Try a topic or open one of these.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-result
                    onClick={onNavigate}
                    className="inline-block rounded-full border border-line px-3 py-1 text-sm hover:border-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted">No notes match that.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((result) => (
              <li key={result.href}>
                <Link
                  href={result.href}
                  data-result
                  onClick={onNavigate}
                  className="block rounded-xl border border-line bg-paper px-3 py-3 hover:border-accent focus-visible:border-accent"
                >
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {result.trackTitle} · {result.family}
                    </span>
                    {result.status === "outline" ? (
                      <span className="text-xs text-warn">Outline</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{result.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
