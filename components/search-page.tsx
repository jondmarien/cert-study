"use client";

import { useSearchParams } from "next/navigation";

import { SearchPanel } from "@/components/search-panel";

export function SearchPageClient() {
  const params = useSearchParams();
  return <SearchPanel initialQuery={params.get("q") ?? ""} />;
}
