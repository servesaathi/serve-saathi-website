"use client";

import Image from "next/image";

// Figma node 3316:43608 "Pagination" ("Back · 1 2 … 5 6 · Next"). Page
// numbers come from the API's meta.totalPages: first, last and the current
// page's neighbours are shown, gaps collapse to "…".
function pageList(page: number, totalPages: number): (number | "…")[] {
  const keep = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...keep].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…" as const, p] : [p]));
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex w-full items-center justify-between">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-10 w-[100px] items-center justify-between rounded-control border-[1.35px] border-border-card bg-[#d5e5d6] px-4 text-[16px] font-medium text-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      >
        <Image src="/icons/homepage/explore-pagination-back.svg" alt="" width={24} height={24} aria-hidden />
        Back
      </button>

      <div className="flex items-center">
        {pageList(page, totalPages).map((p, i) =>
          typeof p === "number" ? (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={page === p ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={`flex size-9 items-center justify-center rounded-full text-[16px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                page === p ? "bg-primary text-white" : "text-[#58975b]"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={`ellipsis-${i}`} className="flex size-9 items-center justify-center text-[16px] font-semibold text-[#58975b]">
              {p}
            </span>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-10 w-[98px] items-center justify-between rounded-control bg-secondary px-4 text-[16px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      >
        Next
        <Image src="/icons/homepage/explore-pagination-next.svg" alt="" width={24} height={24} aria-hidden />
      </button>
    </nav>
  );
}

export default Pagination;
