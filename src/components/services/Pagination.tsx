"use client";

import Image from "next/image";
import { useState } from "react";

// Figma node 3316:43608 "Pagination". Static page set (1, 2, ..., 5, 6) to
// match the design — real page count depends on a providers API that
// doesn't exist yet.
const PAGES = [1, 2, "…", 5, 6] as const;

export function Pagination() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="flex h-10 w-[100px] items-center justify-between rounded-control border-[1.35px] border-border-card bg-[#d5e5d6] px-4 text-[16px] font-medium text-primary-pressed disabled:opacity-50"
      >
        <Image src="/icons/homepage/explore-pagination-back.svg" alt="" width={24} height={24} aria-hidden />
        Back
      </button>

      <div className="flex items-center">
        {PAGES.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={page === p ? "page" : undefined}
              className={`flex size-9 items-center justify-center rounded-full text-[16px] font-semibold ${
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
        onClick={() => setPage((p) => p + 1)}
        className="flex h-10 w-[98px] items-center justify-between rounded-control bg-secondary px-4 text-[16px] font-medium text-white"
      >
        Next
        <Image src="/icons/homepage/explore-pagination-next.svg" alt="" width={24} height={24} aria-hidden />
      </button>
    </div>
  );
}

export default Pagination;
