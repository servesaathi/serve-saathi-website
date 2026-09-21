"use client";

import Image from "next/image";

// Figma node 3316:43512 "Search + Filter". Search field has a leading icon
// (TextInput only supports a trailing endAdornment), so this is hand-rolled
// rather than reusing it — same tokens (border-hairline, rounded-input,
// bg-base) as everywhere else.
export function SearchFilterBar() {
  return (
    <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
      <div className="flex h-12 w-full flex-1 items-center gap-3 rounded-input border-[1.5px] border-border-hairline bg-bg-base pl-4 pr-5">
        <Image src="/icons/homepage/explore-search.svg" alt="" width={24} height={24} aria-hidden />
        <input
          type="search"
          placeholder="Search caregivers"
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
      </div>

      <div className="flex h-12 w-full shrink-0 items-center gap-4 sm:w-[295px]">
        <button
          type="button"
          className="flex flex-1 items-center gap-1 rounded-input px-2 text-[16px] leading-[22px] text-secondary"
        >
          <Image src="/icons/homepage/explore-location-pin.svg" alt="" width={24} height={24} aria-hidden />
          <span className="truncate">New Delhi, Delhi 110001</span>
          <Image src="/icons/homepage/explore-location-chevron.svg" alt="" width={16} height={16} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Toggle map view"
          className="flex size-10 shrink-0 items-center justify-center rounded-[4px] bg-primary transition-colors hover:bg-primary-pressed"
        >
          <Image src="/icons/homepage/explore-map-toggle.svg" alt="" width={24} height={24} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default SearchFilterBar;
