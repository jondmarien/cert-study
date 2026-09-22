"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { THEME_KEY } from "@/lib/keys";

const EVENT = "study-theme";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  return () => window.removeEventListener(EVENT, onStoreChange);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex shrink-0 rounded-full border border-line p-0.5"
    >
      <ThemeChoice
        label="Light"
        pressed={!dark}
        onSelect={() => apply(false)}
        icon={<SunIcon />}
      />
      <ThemeChoice
        label="Dark"
        pressed={dark}
        onSelect={() => apply(true)}
        icon={<MoonIcon />}
      />
    </div>
  );
}

function ThemeChoice({
  label,
  pressed,
  onSelect,
  icon,
}: {
  label: string;
  pressed: boolean;
  onSelect: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={pressed}
      aria-label={`${label} theme`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm",
        pressed ? "bg-soft text-ink" : "text-muted hover:text-ink",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function apply(nextDark: boolean) {
  document.documentElement.classList.toggle("dark", nextDark);
  localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
  window.dispatchEvent(new Event(EVENT));
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none">
      <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
        d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
      <path d="M9.4 1.6a.7.7 0 0 1 .2.8 4.6 4.6 0 0 0 4 6.7.7.7 0 0 1 .6.9A6.4 6.4 0 1 1 8.6 1.4a.7.7 0 0 1 .8.2Z" />
    </svg>
  );
}
