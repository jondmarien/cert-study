import type { SearchDocument } from "./types";

export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
  limit = 20,
): SearchDocument[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const ranked = documents
    .map((document) => ({ document, score: scoreDocument(document, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title));

  return ranked.slice(0, limit).map((entry) => entry.document);
}

function scoreDocument(document: SearchDocument, words: readonly string[]): number {
  const title = document.title.toLowerCase();
  const family = document.family.toLowerCase();
  const tags = document.tags.join(" ").toLowerCase();
  const summary = document.summary.toLowerCase();
  const text = document.text.toLowerCase();
  const haystack = `${title} ${family} ${tags} ${summary} ${text}`;

  if (!words.every((word) => haystack.includes(word))) return 0;

  return words.reduce((total, word) => {
    let score = 1;
    if (title === word) score += 80;
    else if (title.startsWith(word)) score += 36;
    else if (title.includes(word)) score += 24;
    if (tags.includes(word)) score += 16;
    if (family.includes(word)) score += 10;
    if (summary.includes(word)) score += 8;
    if (text.includes(word)) score += 3;
    return total + score;
  }, 0);
}
