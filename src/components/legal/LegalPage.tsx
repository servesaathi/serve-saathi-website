import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";

// Shared shell for /privacy and /terms: serif H1 (same as other redesign
// pages), "last updated" line, then readable 18/28 prose sections.

export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: ReactNode; children: ReactNode }) {
  return (
    <SiteShell>
      <article className="flex max-w-[800px] flex-col gap-8 pt-10 pb-16 text-[18px] leading-7 text-text-secondary">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[40px] leading-[48px] text-text-primary">{title}</h1>
          <p className="text-[16px] leading-[22px] text-text-tertiary">Last updated: {updated}</p>
        </header>
        <div className="flex flex-col gap-4">{intro}</div>
        {children}
      </article>
    </SiteShell>
  );
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-3">
      <h2 className="text-[22px] leading-[30px] font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-6">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
