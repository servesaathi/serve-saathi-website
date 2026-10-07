"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import type { PageMeta } from "@/lib/admin";

// Building blocks for the admin screens. There's no admin frame in Figma, so
// each piece is lifted from the closest real one:
//   table      → "Invoice History" on 04a_Account / Payment - Method (3366:72086)
//   stat cards → that frame's "Outstanding / This Month" cards
//   search bar → its "Search + Filter" row
//   status pill→ its "Pop-over Chip" (Confirmed / Pay Now)
//   pagination → Explore Services pagination (3316:43608)
//   row avatar → Family Access rows (3388:81883)

/* ---------- icons ---------- */

/**
 * Renders a design-system SVG (exported from Figma, unchanged) tinted with
 * the current text colour via CSS mask — one asset serves green, red or
 * white buttons without editing the file's own fill.
 */
export function Icon({ src, size = 24, className = "" }: { src: string; size?: number; className?: string }) {
  const style: CSSProperties = {
    width: size,
    height: size,
    WebkitMask: `url(${src}) center / contain no-repeat`,
    mask: `url(${src}) center / contain no-repeat`,
  };
  return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={style} />;
}

export const ICONS = {
  view: "/icons/homepage/arrow-right.svg",
  back: "/icons/services/back-arrow.svg",
  edit: "/icons/admin/edit.svg",
  delete: "/icons/admin/delete.svg",
  close: "/icons/admin/close.svg",
  success: "/icons/admin/success.svg",
  add: "/icons/services/add.svg",
  search: "/icons/homepage/explore-search.svg",
  users: "/icons/admin/profile.svg",
  providers: "/icons/admin/group.svg",
} as const;

/* ---------- page header & stats ---------- */

export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[40px] leading-[48px] text-text-primary">{title}</h1>
        {description && <div className="text-[18px] leading-7 text-text-secondary">{description}</div>}
      </div>
      {action}
    </div>
  );
}

/** Figma "Outstanding" card: label, big orange number, muted caption. */
export function StatCard({ label, value, caption, loading }: { label: string; value: ReactNode; caption?: string; loading?: boolean }) {
  return (
    <div className="flex flex-col rounded-card bg-bg-base px-6 py-5">
      <p className="text-[18px] leading-7 font-semibold text-text-secondary">{label}</p>
      <p className={`text-[40px] leading-[48px] text-tertiary ${loading ? "opacity-40" : ""}`}>{value}</p>
      {caption && <p className="text-[16px] leading-[22px] text-text-muted">{caption}</p>}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>;
}

/* ---------- buttons ---------- */

const ICON_BTN_TONES = {
  neutral: "text-text-secondary hover:bg-bg-layout",
  primary: "text-primary hover:bg-border-hairline",
  danger: "text-error hover:bg-[#fde2e2]",
};

/**
 * 44px icon-only button with a visible tooltip on hover/focus. `label` is
 * both the accessible name and the tooltip; `hint` replaces the tooltip when
 * disabled (e.g. "not supported by the backend yet").
 */
export function IconButton({
  icon,
  label,
  hint,
  tone = "neutral",
  className = "",
  ...props
}: {
  icon: string;
  label: string;
  hint?: string;
  tone?: keyof typeof ICON_BTN_TONES;
} & Omit<ComponentPropsWithoutRef<"button">, "children">) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className={`flex size-11 items-center justify-center rounded-control transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-[#c9c7c5] disabled:hover:bg-transparent ${ICON_BTN_TONES[tone]} ${className}`}
        {...props}
      >
        <Icon src={icon} size={22} />
      </button>
      <Tooltip text={props.disabled && hint ? hint : label} />
    </span>
  );
}

export function IconLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <span className="group relative inline-flex">
      <Link
        href={href}
        aria-label={label}
        className={`flex size-11 items-center justify-center rounded-control transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${ICON_BTN_TONES.primary}`}
      >
        <Icon src={icon} size={22} />
      </Link>
      <Tooltip text={label} />
    </span>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span
      role="presentation"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-[240px] -translate-x-1/2 rounded-control bg-secondary px-2.5 py-1 text-center text-[13px] leading-[17px] text-white opacity-0 shadow transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
    >
      {text}
    </span>
  );
}

/** Labelled 44px button (icon + text) for detail-page headers. */
export function ActionButton({
  icon,
  tone = "default",
  className = "",
  children,
  ...props
}: { icon?: string; tone?: "default" | "danger" | "primary" } & ComponentPropsWithoutRef<"button">) {
  const tones = {
    default: "border border-border-card bg-bg-base text-primary hover:bg-bg-layout",
    danger: "border border-[#f3b4b4] bg-bg-base text-error hover:bg-[#fff1f1]",
    primary: "bg-primary text-white hover:bg-primary-pressed",
  };
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-control px-4 text-[16px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]} ${className}`}
      {...props}
    >
      {icon && <Icon src={icon} size={20} />}
      {children}
    </button>
  );
}

/* ---------- status pill ---------- */

type Tone = "green" | "orange" | "red" | "grey";
const TONES: Record<Tone, string> = {
  green: "bg-border-hairline text-primary-pressed",
  orange: "bg-orange-line text-[#a84c12]",
  red: "bg-[#fde2e2] text-[#991b1b]",
  grey: "bg-[#ecebea] text-text-secondary",
};

/** Figma "Pop-over Chip" — fully rounded, 16/20. Text carries the meaning. */
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[15px] leading-5 whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/* ---------- search ---------- */

/** Figma "Search + Filter": 48px field, leading search icon, then extra controls. */
export function SearchBar({
  id,
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex h-12 flex-1 items-center gap-3 rounded-input border-[1.5px] border-border-hairline bg-bg-base pr-2 pl-4 focus-within:border-primary">
        <Image src={ICONS.search} alt="" width={24} height={24} />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="submit"
          className="h-9 rounded-control bg-primary px-4 text-[15px] font-semibold text-white hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Search
        </button>
      </div>
      {children}
    </form>
  );
}

/* ---------- table ---------- */

export const TABLE = {
  wrap: "hidden overflow-hidden rounded-card border border-orange-line md:block",
  table: "w-full table-fixed border-collapse text-left",
  th: "border-b border-l border-orange-line bg-bg-orange px-5 py-2 text-[17px] leading-6 font-semibold text-[#a84c12] first:border-l-0",
  td: "border-b border-l border-border-hairline bg-bg-base px-5 py-3 align-middle text-[17px] leading-[26px] text-text-secondary first:border-l-0",
};

/** Initials avatar + two-line identity, as in Figma's Family Access rows. */
export function Identity({ name, sub, href }: { name: string; sub?: ReactNode; href?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const title = (
    <span title={name} className="truncate text-[17px] leading-6 font-semibold text-text-primary">
      {name}
    </span>
  );
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-border-hairline text-[16px] font-semibold text-primary-pressed">
        {initials || "—"}
      </span>
      <div className="flex min-w-0 flex-col">
        {href ? (
          <Link href={href} className="truncate hover:underline focus-visible:underline focus-visible:outline-none">
            {title}
          </Link>
        ) : (
          title
        )}
        {sub && <span className="truncate text-[15px] leading-5 text-text-muted">{sub}</span>}
      </div>
    </div>
  );
}

/** Mobile replacement for a table row (tables hide below md). */
export function MobileCard({ children }: { children: ReactNode }) {
  return <li className="flex flex-col gap-3 rounded-card bg-bg-base p-4">{children}</li>;
}

export function TableState({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className={`${TABLE.td} py-12 text-center text-text-muted`}>
        {children}
      </td>
    </tr>
  );
}

/* ---------- pagination ---------- */

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, page - 1, page, page + 1, total - 1, total].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]));
}

/** Explore Services pagination styling, but wired: Back · numbered pages · Next. */
export function AdminPagination({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-4 lg:flex-row">
      <p className="text-[16px] leading-[22px] text-text-secondary">
        Showing {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
          className="flex h-11 items-center gap-2 rounded-control border-[1.35px] border-border-card bg-border-hairline px-4 text-[16px] font-semibold text-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon src={ICONS.back} size={20} />
          Back
        </button>
        <ol className="flex items-center">
          {pageList(meta.page, meta.totalPages).map((p, i) =>
            p === "…" ? (
              <li key={`gap-${i}`} aria-hidden className="flex size-10 items-center justify-center text-[16px] font-semibold text-[#58975b]">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === meta.page ? "page" : undefined}
                  className={`flex size-10 items-center justify-center rounded-full text-[16px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    p === meta.page ? "bg-primary text-white" : "text-[#58975b] hover:bg-border-hairline"
                  }`}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ol>
        <button
          type="button"
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="flex h-11 items-center gap-2 rounded-control bg-secondary px-4 text-[16px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <Icon src={ICONS.view} size={20} />
        </button>
      </div>
    </nav>
  );
}

/* ---------- misc ---------- */

/** Success/failure line after an action — announced to screen readers. */
export function Flash({ message, tone, onDismiss }: { message: string; tone: "success" | "error"; onDismiss: () => void }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-center justify-between gap-4 rounded-card px-4 py-3 text-[16px] leading-[22px] ${
        tone === "success" ? "bg-border-hairline text-primary-pressed" : "bg-[#fde2e2] text-[#991b1b]"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon src={tone === "success" ? ICONS.success : ICONS.close} size={20} />
        {message}
      </span>
      <button type="button" onClick={onDismiss} className="rounded-control px-2 py-1 font-semibold underline">
        Dismiss
      </button>
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Label/value grid for the detail pages, on a white card. */
export function DetailList({ title, rows }: { title?: string; rows: { label: string; value: ReactNode }[] }) {
  return (
    <section className="flex flex-col gap-3">
      {title && <h2 className="text-[24px] leading-8 font-semibold text-text-primary">{title}</h2>}
      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-card bg-bg-base p-6 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[15px] leading-5 text-text-muted">{r.label}</dt>
            <dd className="text-[17px] leading-6 break-words text-text-primary">{r.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
