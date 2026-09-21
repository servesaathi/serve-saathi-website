"use client";

import Image from "next/image";
import { useState } from "react";
import { FACILITY_CATEGORIES } from "./data";

// Figma node 3316:43516 "Icon Card Views" — dome-shaped icon chips, active
// item gets a solid tertiary (orange) fill instead of the light-orange tint.
export function CategoryIconRow() {
  const [active, setActive] = useState<string>(FACILITY_CATEGORIES[0].slug);

  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-4">
      {FACILITY_CATEGORIES.map((c) => {
        const selected = active === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActive(c.slug)}
            className="flex h-[124px] w-[148px] flex-col items-center gap-1 rounded-card bg-bg-base pb-2"
          >
            <span
              className={`flex h-[72px] w-full items-center justify-center rounded-t-card ${
                selected ? "rounded-b-full bg-tertiary" : "rounded-b-full bg-orange-line"
              }`}
            >
              <Image
                src={selected ? "/icons/homepage/explore-category-white.svg" : "/icons/homepage/explore-category-orange.svg"}
                alt=""
                width={46}
                height={46}
                aria-hidden
              />
            </span>
            <span className="px-1 text-center text-[14px] leading-5 text-text-secondary">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryIconRow;
