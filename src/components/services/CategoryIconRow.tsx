"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/lib/useCategories";

// Figma node 3316:43516 "Icon Card Views" — dome-shaped icon chips, active
// item gets a solid tertiary (orange) fill instead of the light-orange tint.
// Chips are the live categories (GET /categories). The selection lives in
// `?category=<slug>` — shared with the Sidebar's Explore Services submenu —
// and clicking the active chip again clears it back to all providers.
export function CategoryIconRow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories, error } = useCategories();
  const active = searchParams.get("category");

  function select(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (slug === active) params.delete("category");
    else params.set("category", slug);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  if (error) return null;

  if (!categories) {
    return (
      <div aria-busy className="flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[124px] w-[148px] animate-pulse rounded-card bg-bg-base" />
        ))}
      </div>
    );
  }

  return (
    <div role="group" aria-label="Filter by category" className="flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-4">
      {categories.map((c) => {
        const selected = active === c.slug;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={selected}
            onClick={() => select(c.slug)}
            className="flex h-[124px] w-[148px] flex-col items-center gap-1 rounded-card bg-bg-base pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              className={`flex h-[72px] w-full items-center justify-center rounded-t-card rounded-b-full ${
                selected ? "bg-tertiary" : "bg-orange-line"
              }`}
            >
              {c.iconUrl ? (
                // Admin-uploaded icon on an arbitrary host — plain <img>, not next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.iconUrl} alt="" width={46} height={46} aria-hidden className="size-[46px] object-contain" />
              ) : (
                <Image
                  src={selected ? "/icons/homepage/explore-category-white.svg" : "/icons/homepage/explore-category-orange.svg"}
                  alt=""
                  width={46}
                  height={46}
                  aria-hidden
                />
              )}
            </span>
            <span className="px-1 text-center text-[14px] leading-5 text-text-secondary">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryIconRow;
