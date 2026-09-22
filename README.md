# Study Desk

Personal study site for Jon Marien. It covers two certification tracks as **structured reading and lab technique**:

- **BSCP** — Burp Suite Certified Practitioner, aligned with PortSwigger Web Security Academy topic families
- **Security+** — CompTIA Security+ in the SY0-701 domain shape

Question practice stays in **Drill** with the coach. This app is not a quiz engine, a flashcard deck, or a question bank.

## What these notes will not contain

- Exploit proof-of-concepts, weaponized payloads, malware, or copy-paste attack scripts
- Step-by-step reproduction of live attacks
- Copied CompTIA or PortSwigger exam questions

Vulnerable behavior is described as what to look for and how a tester or defender reasons. Academy labs are where specific syntax belongs, and only against targets you are allowed to test.

## Stack

- Next.js (App Router) and TypeScript
- Bun as the package manager and script runner
- Tailwind CSS
- Lessons as MDX under `content/`

Bun 1.4 writes a text `bun.lock` by default. This repo sets `saveTextLockfile = false` in `bunfig.toml` so installs use the binary **`bun.lockb`** lockfile.

## Commands

From a clean clone:

```bash
bun install
bun run dev
```

Then open the URL Bun prints (usually `http://localhost:3000`).

Other scripts:

```bash
bun run build   # production build; also typechecks and compiles every lesson
bun run start   # serve the production build
bun run lint
```

`bun run build` fails if a lesson's frontmatter, family name, order, or related link is invalid. Fix the file named in the error.

## Layout

```
app/                     routes (home, track hubs, lessons, search, about)
components/              UI
lib/                     content loader, search, progress types
content/bscp/            BSCP lessons (*.mdx)
content/security-plus/   Security+ lessons (*.mdx)
lib/study-config.ts      BSCP license planning date
```

Progress (not started / in progress / done) is stored in the browser's `localStorage`. There is no account.

The home page shows an optional BSCP timing reminder. The planning date is `BSCP_LICENSE_ENDS` in `lib/study-config.ts` (21 December 2026, about 90 days from when the desk was set up). Change it to the real Burp Suite Professional end date if that is different.

## How to add a lesson

1. Create `content/bscp/your-slug.mdx` or `content/security-plus/your-slug.mdx`.
   The filename is the URL slug: lowercase letters, numbers, and hyphens.
2. Start with frontmatter:

```yaml
---
title: Short title
family: Server-side
order: 45
status: ready          # or outline
minutes: 12
summary: One or two sentences that show up on the hub and in search.
objectives:
  - A behavior the reader should be able to explain
  - A second objective
academy: SQL injection # optional; BSCP Academy topic name
related:
  - track: security-plus
    slug: vulnerability-types
tags:
  - injection
---
```

3. Use a `family` from that track. They are listed in `lib/tracks.ts`.
4. Pick an `order` that is unique inside the track. Ready notes use the study path. Outlines use 1000 and up so they sit at the bottom of a family and stay off the previous/next path.
5. Point `related` at slugs that exist. The build checks.
6. For a stub, set `status: outline` and start the body with a `## TODO` section so the page badge and the file agree.
7. In the body, write original prose. Useful callouts, each at most once per file:

```mdx
## Core idea

Explain the trust boundary.

<Lab>

What to compare in Burp. No payloads.

</Lab>

<Defend>

The control that removes the class of bug.

</Defend>

<Pitfall>

A mistake people make when studying this.

</Pitfall>
```

Security+ notes use `<Exam>` instead of `<Lab>` when the point is how a stem is usually framed. Do not write sample exam questions.

Leave a blank line after the opening tag and before the closing tag so Markdown inside the callout is parsed.

8. Run `bun run build` before you rely on the page.

Search is available from the header (`/` or Ctrl/Cmd+K) and at `/search`. Track hubs can filter by family, ready versus outline, and local progress.
