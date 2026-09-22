"use client";

import { useSyncExternalStore } from "react";

import { BANNER_KEY } from "@/lib/keys";
import { BSCP_LICENSE_ENDS, daysUntil, formatLicenseDate } from "@/lib/study-config";

const EVENT = "study-banner";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function dismissed() {
  return localStorage.getItem(BANNER_KEY) === "dismissed";
}

function subscribeClock(onStoreChange: () => void) {
  const timer = window.setInterval(onStoreChange, 60 * 60 * 1000);
  return () => window.clearInterval(timer);
}

export function UrgencyBanner() {
  const hidden = useSyncExternalStore(subscribe, dismissed, () => false);
  const days = useSyncExternalStore(
    subscribeClock,
    () => daysUntil(BSCP_LICENSE_ENDS),
    () => null,
  );
  if (hidden) return null;

  const dateLabel = formatLicenseDate();
  const timing =
    days === null
      ? null
      : days > 1
        ? `${days} days from today`
        : days === 1
          ? "1 day from today"
          : days === 0
            ? "today"
            : `${Math.abs(days)} days ago`;

  return (
    <aside className="rounded-2xl border border-warn bg-warn-soft px-4 py-3" aria-label="BSCP timing reminder">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-sm leading-6 text-ink">
          <span className="font-semibold">BSCP timing. </span>
          This desk assumes Burp Suite Professional access through {dateLabel}
          {timing ? ` (${timing})` : ""}. The exam is a lab, so use authorized PortSwigger labs
          while these concepts are fresh. Edit the date in{" "}
          <code className="text-xs">lib/study-config.ts</code> if your license ends on another day.
        </p>
        <button
          type="button"
          className="rounded-full border border-line bg-card px-3 py-1 text-sm"
          onClick={() => {
            localStorage.setItem(BANNER_KEY, "dismissed");
            window.dispatchEvent(new Event(EVENT));
          }}
        >
          Dismiss reminder
        </button>
      </div>
    </aside>
  );
}

export function restoreUrgencyBanner() {
  localStorage.removeItem(BANNER_KEY);
  window.dispatchEvent(new Event(EVENT));
}
