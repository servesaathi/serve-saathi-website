"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminQuery } from "@/lib/admin/useAdminQuery";
import { providerService } from "@/lib/api/services/provider.service";
import { useCategories } from "@/lib/useCategories";
import { useIsSignedIn } from "@/lib/useHydrated";
import { Pagination } from "./Pagination";
import { ProviderCard } from "./ProviderCard";
import { FREE_PROVIDER_COUNT, PROVIDERS_PER_PAGE, toProviderSummary } from "./data";

// Figma nodes 3316:43575 "Right Side" (Sorted By + Services List) and
// 3318:89008 "Unlock Pop Up" — a signed-out visitor sees the first
// FREE_PROVIDER_COUNT cards clearly, the rest blurred behind a gate asking
// for mobile+OTP verification. A signed-in user (phone already verified)
// never sees the gate.
//
// Data: GET /providers?categoryId=&page=&limit=&sortBy=&sortOrder=. All
// state lives in the URL (?category=<slug>&page=&sort=) so results are
// linkable and Back works. The category slug is resolved to its id via
// GET /categories; an unknown slug falls back to every provider.

const SORTS = {
  "top-rated": { label: "Top Rated", sortBy: "averageRating", sortOrder: "DESC" },
  experience: { label: "Most Experienced", sortBy: "yearsOfExperience", sortOrder: "DESC" },
  newest: { label: "Newest", sortBy: "createdAt", sortOrder: "DESC" },
} as const;
type SortKey = keyof typeof SORTS;
const DEFAULT_SORT: SortKey = "top-rated";

const isSortKey = (v: string | null): v is SortKey => v !== null && v in SORTS;

export function ProviderResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const signedIn = useIsSignedIn();
  // Until auth hydrates (signedIn === null) keep the tail blurred but don't
  // show the popup, so neither audience sees a one-frame flash of the other's UI.
  const locked = signedIn !== true;

  const slug = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sortParam = searchParams.get("sort");
  const sort: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT;

  const { categories, error: categoriesError } = useCategories();
  // Wait for categories before fetching a filtered list, so a deep link to
  // ?category=x doesn't flash every provider first.
  const categoriesReady = !slug || categories !== undefined || categoriesError !== undefined;
  const category = slug ? categories?.find((c) => c.slug === slug) : undefined;

  const { data, error, loading, reload } = useAdminQuery(
    `${categoriesReady}|${category?.id ?? ""}|${page}|${sort}`,
    () =>
      categoriesReady
        ? providerService.getProviders({
            categoryId: category?.id,
            page,
            limit: PROVIDERS_PER_PAGE,
            sortBy: SORTS[sort].sortBy,
            sortOrder: SORTS[sort].sortOrder,
          })
        : Promise.resolve(undefined)
  );

  function setParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const providers = data?.items.map(toProviderSummary);
  const unknownCategory = slug && categories && !category;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <p className="text-[18px] leading-7 text-text-secondary" aria-live="polite">
          {data && !loading
            ? `${data.meta.total} ${data.meta.total === 1 ? "provider" : "providers"}${category ? ` in ${category.name}` : ""}`
            : " "}
        </p>
        <label className="flex items-center gap-4">
          <span className="text-[24px] leading-8 font-semibold text-primary uppercase">Sort by</span>
          <span className="relative">
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value === DEFAULT_SORT ? null : e.target.value, page: null })}
              className="h-12 w-[260px] appearance-none rounded-input border-[1.5px] border-border-hairline bg-bg-base py-3 pr-10 pl-4 text-[18px] leading-7 text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Image
              src="/icons/homepage/explore-sort-chevron.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          </span>
        </label>
      </div>

      {unknownCategory && (
        <p className="rounded-card bg-bg-orange px-4 py-3 text-[16px] leading-[22px] text-text-secondary">
          We couldn&apos;t find that category, so we&apos;re showing every provider.
        </p>
      )}

      {error && !providers ? (
        <div className="flex flex-col items-start gap-4 rounded-card bg-bg-base p-6">
          <p className="text-[18px] leading-7 text-text-secondary">We couldn&apos;t load providers right now. {error}</p>
          <button
            type="button"
            onClick={reload}
            className="flex h-12 items-center rounded-control bg-primary px-6 text-[18px] font-semibold text-white hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Try again
          </button>
        </div>
      ) : !providers ? (
        <div aria-busy className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-card bg-bg-base" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-card bg-bg-base p-6">
          <p className="text-[20px] leading-7 font-semibold text-text-primary">No providers listed yet</p>
          <p className="text-[18px] leading-7 text-text-secondary">
            {category
              ? `We don't have verified ${category.name} providers yet. Try another category, or check back soon.`
              : "Check back soon — we're verifying new providers every week."}
          </p>
        </div>
      ) : (
        <div className={`relative grid w-full grid-cols-1 gap-6 sm:grid-cols-2 ${loading ? "opacity-60" : ""}`}>
          {providers.map((provider, i) => {
            const gated = locked && (page > 1 || i >= FREE_PROVIDER_COUNT);
            return (
              <div
                key={provider.id}
                aria-hidden={gated || undefined}
                inert={gated || undefined}
                className={gated ? "pointer-events-none blur-sm select-none" : ""}
              >
                <ProviderCard provider={provider} />
              </div>
            );
          })}

          {signedIn === false && (page > 1 || providers.length > FREE_PROVIDER_COUNT) && (
            <div
              className={`pointer-events-auto absolute left-1/2 w-[400px] max-w-[90%] -translate-x-1/2 ${
                page > 1 ? "top-10" : "top-[26%]"
              }`}
            >
              <div className="flex w-full flex-col items-center gap-5 rounded-card bg-bg-layout p-6 shadow-[0_6px_12px_rgba(0,0,0,0.15)]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-[24px] leading-8 font-semibold text-text-primary">View Providers</p>
                  <p className="text-[18px] leading-7 text-text-secondary">
                    Enter your mobile number and OTP to unlock more providers.
                  </p>
                </div>
                <Link
                  href={`/verify-phone?next=${encodeURIComponent(`${pathname}${searchParams.size ? `?${searchParams}` : ""}`)}`}
                  className="flex h-[50px] w-full items-center justify-center rounded-control bg-primary text-[18px] font-medium text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Unlock All Providers
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {data && (
        <Pagination
          page={page}
          totalPages={data.meta.totalPages}
          onChange={(p) => setParams({ page: p > 1 ? String(p) : null })}
        />
      )}
    </div>
  );
}

export default ProviderResults;
