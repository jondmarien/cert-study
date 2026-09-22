"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSearch } from "@/components/search-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

const links = [
  { href: "/bscp", label: "BSCP" },
  { href: "/security-plus", label: "Security+" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { setOpen } = useSearch();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="mr-auto leading-tight">
          <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            Jon Marien
          </span>
          <span className="font-display text-2xl text-ink">Study Desk</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm",
                  active ? "bg-soft text-ink" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-keyshortcuts="/"
          className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent"
        >
          Search
          <kbd className="ml-2 hidden rounded border border-line px-1.5 py-0.5 text-[0.7rem] text-muted sm:inline">
            /
          </kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
