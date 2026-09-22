import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { calloutSections } from "@/lib/callouts";

type AnchorProps = ComponentProps<"a">;

function MdxAnchor({ href = "", children, ...props }: AnchorProps) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel="noreferrer" target="_blank" {...props}>
      {children}
    </a>
  );
}

function Callout({
  kind,
  className,
  children,
}: {
  kind: keyof typeof calloutSections;
  className: string;
  children: ReactNode;
}) {
  const section = calloutSections[kind];
  return (
    <section className={className} aria-labelledby={section.id}>
      <h2 id={section.id} className="callout-title">
        {section.title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function Lab({ children }: { children: ReactNode }) {
  return (
    <Callout kind="Lab" className="callout callout-lab">
      {children}
    </Callout>
  );
}

export function Defend({ children }: { children: ReactNode }) {
  return (
    <Callout kind="Defend" className="callout callout-defend">
      {children}
    </Callout>
  );
}

export function Pitfall({ children }: { children: ReactNode }) {
  return (
    <Callout kind="Pitfall" className="callout callout-pitfall">
      {children}
    </Callout>
  );
}

export function Exam({ children }: { children: ReactNode }) {
  return (
    <Callout kind="Exam" className="callout callout-exam">
      {children}
    </Callout>
  );
}

function Table(props: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}

export const mdxComponents = {
  a: MdxAnchor,
  table: Table,
  Lab,
  Defend,
  Pitfall,
  Exam,
};
