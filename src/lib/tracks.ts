import type { TrackId } from "./types";

export type TrackFamily = {
  name: string;
  blurb: string;
};

export type TrackInfo = {
  id: TrackId;
  title: string;
  shortTitle: string;
  href: string;
  eyebrow: string;
  summary: string;
  detail: string;
  families: readonly TrackFamily[];
  startHere: readonly string[];
};

const bscp: TrackInfo = {
  id: "bscp",
  title: "Burp Suite Certified Practitioner",
  shortTitle: "BSCP",
  href: "/bscp",
  eyebrow: "Web testing, concept first",
  summary:
    "PortSwigger Academy topic families at study level, plus how to work in Burp. Notes explain what to compare and why. Lab syntax stays in the Academy labs.",
  detail:
    "BSCP is a practical exam: you are asked to understand a small application and exercise it inside a lab. These notes build the mental model and the Burp workflow. They do not contain exploit scripts. When a topic needs a concrete input, do that step in an official lab you are allowed to use.",
  families: [
    {
      name: "Method",
      blurb: "How to study this track, how to stay in scope, and how to map an app before changing anything.",
    },
    {
      name: "Burp workflow",
      blurb: "What Proxy, Repeater, Intruder, Logger, and Collaborator are each for.",
    },
    {
      name: "Server-side",
      blurb: "Bugs where the server trusts input, a parser, or an object the client should not control.",
    },
    {
      name: "Authentication",
      blurb: "Sessions, passwords, MFA, OAuth, and tokens — checks that fail when the server trusts the wrong proof.",
    },
    {
      name: "Client-side",
      blurb: "Browser rules: what the client enforces, what it ignores, and what the server still has to check.",
    },
  ],
  startHere: ["how-to-study", "burp-proxy", "sql-injection", "access-control"],
};

const securityPlus: TrackInfo = {
  id: "security-plus",
  title: "CompTIA Security+",
  shortTitle: "Security+",
  href: "/security-plus",
  eyebrow: "SY0-701 style domains",
  summary:
    "Concise, exam-oriented notes for the five Security+ domains. Distinctions the exam cares about, not a textbook and not a question bank.",
  detail:
    "Security+ tests whether you can name the right control, threat, or process for a situation. These notes follow the public SY0-701 domain names and paraphrase the ideas. Confirm current domain weights against CompTIA's outline before you sit. Drill questions stay with your coach.",
  families: [
    {
      name: "General concepts",
      blurb: "Controls, security goals, zero trust, and the cryptographic ideas other domains lean on.",
    },
    {
      name: "Threats and mitigations",
      blurb: "Who attacks, how they get in, which weaknesses matter, and which controls answer them.",
    },
    {
      name: "Architecture",
      blurb: "How networks, data, and recovery are designed so a single failure is not the whole story.",
    },
    {
      name: "Operations",
      blurb: "Identity, monitoring, vulnerabilities, and incidents — the work of running security day to day.",
    },
    {
      name: "Program management",
      blurb: "Governance, risk, suppliers, and the oversight that decides what 'good enough' means.",
    },
  ],
  startHere: [
    "general-security-concepts",
    "vulnerability-types",
    "identity-and-access",
    "risk-management",
  ],
};

export const tracks: Record<TrackId, TrackInfo> = {
  bscp,
  "security-plus": securityPlus,
};

export const TRACK_LIST: readonly TrackInfo[] = [bscp, securityPlus];

export function getTrack(id: TrackId): TrackInfo {
  return tracks[id];
}

export function familyNames(id: TrackId): readonly string[] {
  return tracks[id].families.map((family) => family.name);
}
