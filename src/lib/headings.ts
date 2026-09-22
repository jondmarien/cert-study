import GithubSlugger from "github-slugger";

import { calloutSections, type CalloutName } from "./callouts";
import type { Heading } from "./types";

const calloutNames = Object.keys(calloutSections) as CalloutName[];

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const heading = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const text = heading[1].trim();
      headings.push({ id: slugger.slug(text), text });
      continue;
    }

    const callout = /^<([A-Za-z]+)>$/.exec(line);
    if (!callout) continue;
    const name = callout[1];
    if (!calloutNames.includes(name as CalloutName)) continue;
    const section = calloutSections[name as CalloutName];
    headings.push({ id: section.id, text: section.title });
  }

  return headings;
}
