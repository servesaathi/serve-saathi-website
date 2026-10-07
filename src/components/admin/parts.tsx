"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { PageMeta } from "@/lib/admin";

// Small building blocks shared by the admin Users / Providers screens.

export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[36px] leading-[44px] text-text-primary">{title}</h1>
        {description && <p className="text-[18px] leading-7 text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "green" | "orange" | "red" | "grey";
const TONES: Record<Tone, string> = {
  green: "bg-border-hairline text-primary-pressed",
  orange: "bg-orange-line text-[#a84c12]",
  red: "bg-[#fde2e2] text-[#991b1b]",
  grey: "bg-[#ecebea] text-text-secondary",
};

/** Status pill — text always carries the meaning, colour only reinforces it. */
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[14px] leading-5 font-semibold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

const ACTION_BASE =
  "inline-flex h-10 items-center justify-center rounded-control px-3 text-[15px] leading-5 font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45";
const ACTION_TONES = {
  default: "border border-border-card bg-bg-base text-primary hover:bg-bg-layout",
  danger: "border border-[#f3b4b4] bg-bg-base text-error hover:bg-[#fff1f1]",
  primary: "bg-primary text-white hover:bg-primary-pressed",
};

/** Compact 40px row-action button (tables need something smaller than the 48px Button). */
export function ActionButton({
  tone = "default",
  className = "",
  ...props
}: { tone?: keyof typeof ACTION_TONES } & ComponentPropsWithoutRef<"button">) {
  return <button type="button" className={`${ACTION_BASE} ${ACTION_TONES[tone]} ${className}`} {...props} />;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${ACTION_BASE} ${ACTION_TONES.default}`}>
      {children}
    </Link>
  );
}

export function AdminPagination({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-[16px] leading-[22px] text-text-secondary">
        Showing {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <ActionButton onClick={() => onPage(meta.page - 1)} disabled={meta.page <= 1}>
          Previous
        </ActionButton>
        <span className="px-2 text-[16px] text-text-secondary">
          Page {meta.page} of {meta.totalPages}
        </span>
        <ActionButton onClick={() => onPage(meta.page + 1)} disabled={meta.page >= meta.totalPages}>
          Next
        </ActionButton>
      </div>
    </nav>
  );
}

/** Success/failure line after an action — announced to screen readers. */
export function Flash({ message, tone, onDismiss }: { message: string; tone: "success" | "error"; onDismiss: () => void }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-center justify-between gap-4 rounded-card px-4 py-3 text-[16px] leading-[22px] ${
        tone === "success" ? "bg-border-hairline text-primary-pressed" : "bg-[#fde2e2] text-[#991b1b]"
      }`}
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="font-semibold underline">
        Dismiss
      </button>
    </div>
  );
}

export const TABLE = {
  wrap: "w-full overflow-x-auto rounded-card border border-border-hairline bg-bg-base",
  table: "w-full min-w-[880px] border-collapse text-left",
  th: "border-b border-border-hairline bg-bg-layout px-4 py-3 text-[14px] leading-5 font-semibold tracking-wide text-text-secondary uppercase",
  td: "border-b border-border-hairline px-4 py-3 align-middle text-[16px] leading-[22px] text-text-secondary",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Two-column label/value list for the detail pages. */
export function DetailList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-card border border-border-hairline bg-bg-base p-6 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-[14px] leading-5 text-text-tertiary">{r.label}</dt>
          <dd className="text-[16px] leading-[22px] break-words text-text-primary">{r.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
