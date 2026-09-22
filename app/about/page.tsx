import type { Metadata } from "next";
import Link from "next/link";

import { ProgressTools } from "@/components/clear-progress";
import { formatLicenseDate } from "@/lib/study-config";

export const metadata: Metadata = {
  title: "About",
  description: "What this study desk is for, and what it deliberately leaves out.",
};

export default function AboutPage() {
  return (
    <article className="study-prose max-w-3xl">
      <p className="font-sans text-xs uppercase tracking-[0.16em] text-muted">About</p>
      <h1 className="mt-2 font-display text-5xl leading-none">How to use this desk</h1>
      <p>
        This is Jon Marien&apos;s reading desk for two certifications. BSCP notes follow
        PortSwigger Web Security Academy topic families and the Burp tools you actually drive
        in a lab. Security+ notes follow the public SY0-701 domain names and stay short enough
        to review.
      </p>
      <h2>What belongs here</h2>
      <ul>
        <li>The idea behind a vulnerability class, in original prose.</li>
        <li>What evidence a tester compares, and which Burp tool holds that comparison.</li>
        <li>The defensive control that removes the class of bug.</li>
        <li>Distinctions Security+ items tend to hinge on, without sample questions.</li>
      </ul>
      <h2>What does not belong here</h2>
      <ul>
        <li>Exploit proof-of-concepts, weaponized payloads, malware, or copy-paste attack scripts.</li>
        <li>A quiz engine, flashcards, or a bank of CompTIA or PortSwigger exam questions.</li>
        <li>Step-by-step reproduction of a live attack. Academy labs are the place for syntax.</li>
      </ul>
      <h2>Progress</h2>
      <p>
        Marking a lesson not started, in progress, or done writes to <code>localStorage</code> in
        this browser. There is no account. Opening a lesson moves it to in progress if you had not
        marked it yet. The BSCP reminder uses a planning date of {formatLicenseDate()}.
      </p>
      <ProgressTools />
      <h2>Keyboard</h2>
      <ul>
        <li>
          <code>/</code> or Ctrl/Cmd+K opens search. Escape closes it.
        </li>
        <li>Arrow keys move through search results. Enter opens the highlighted one when focus is still in the box.</li>
        <li>Tab reaches the track filters, lesson links, and progress buttons.</li>
      </ul>
      <h2>Adding a lesson</h2>
      <p>
        Add an <code>.mdx</code> file under <code>content/bscp/</code> or{" "}
        <code>content/security-plus/</code>. The README has the frontmatter schema. The site
        fails the build if a family name, order, or related link is wrong.
      </p>
      <p>
        <Link href="/">Back to the desk</Link>
      </p>
    </article>
  );
}
