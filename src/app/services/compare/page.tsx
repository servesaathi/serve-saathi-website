import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/services/BackLink";
import { CompareTable } from "@/components/services/CompareTable";
import { MAX_COMPARE, isProviderId, toProvider } from "@/components/services/data";
import { providerService } from "@/lib/api/services/provider.service";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Compare providers · Serve Saathi" };

// "02b_Homepage / Explore Service - Compare Detail Lock / UnLock" — Figma
// 3318:96619 / 3337:165440. Providers come from `?ids=a,b,c` (set by the
// CompareBar) so a comparison is linkable; the lock is decided client-side
// from auth state inside CompareTable. Profiles come from
// GET /services/providers/{id}/profile; an id that fails to load (deleted,
// unverified) just drops out of the comparison.
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids = "" } = await searchParams;
  const wanted = [...new Set(ids.split(",").map((id) => id.trim()))].filter(isProviderId).slice(0, MAX_COMPARE);
  const results = await Promise.allSettled(wanted.map((id) => providerService.getProfile(id)));
  const providers = results.flatMap((r) => (r.status === "fulfilled" ? [toProvider(r.value)] : []));

  // "…for your Assisted Living" when every provider shares a category.
  const shared = providers[0]?.categories.find((c) => providers.every((p) => p.categories.includes(c)));

  return (
    <SiteShell>
      <div className="flex flex-col gap-12 pt-10 pb-16">
        <div className="flex flex-col gap-6">
          <BackLink href="/services" />
          <h1 className="font-serif text-[40px] leading-[48px] text-text-primary">
            {shared ? `Compare Organizations for your ${shared}` : "Compare Organizations"}
          </h1>
        </div>

        {providers.length >= 2 ? (
          <CompareTable providers={providers} />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-card bg-bg-base p-6">
            <p className="text-[18px] leading-7 text-text-secondary">
              Pick at least two providers to compare. Tick &ldquo;Compare&rdquo; on up to {MAX_COMPARE} providers in
              Explore Services.
            </p>
            <Link
              href="/services"
              className="flex h-12 items-center rounded-control bg-primary px-6 text-[18px] font-semibold text-white hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Explore Services
            </Link>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
