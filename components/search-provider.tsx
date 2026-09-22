"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { SearchDocument } from "@/lib/types";

type SearchContextValue = {
  documents: SearchDocument[];
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({
  documents,
  children,
}: {
  documents: SearchDocument[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ documents, open, setOpen }),
    [documents, open],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");
      if (
        event.key === "/" &&
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const value = useContext(SearchContext);
  if (!value) throw new Error("SearchProvider is missing");
  return value;
}
