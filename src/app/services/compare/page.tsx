import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/services/BackLink";
import { CompareTable } from "@/components/services/CompareTable";
import { MAX_COMPARE, getProvider } from "@/components/services/data";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Compare providers · Serve Saathi" };

// "02b_Homepage / Explore Service - Compare Detail Lock / UnLock" — Figma
// 3318:96619 / 3337:165440. Providers come from `?ids=a,b,c` (set by the
// CompareBar) so a comparison is linkable; the lock is decided client-side
// from auth state inside CompareTable.
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids = "" } = await searchParams;
  const providers = [...new Set(ids.split(","))]
    .map((id) => getProvider(id.trim()))
    .filter((p) => p !== undefined)
    .slice(0, MAX_COMPARE);

  return (
    <SiteShell>
      <div className="flex flex-col gap-12 pt-10 pb-16">
        <div className="flex flex-col gap-6">
          <BackLink href="/services" />
          <h1 className="font-serif text-[40px] leading-[48px] text-text-primary">
            Compare Organizations for your Assisted Living
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
