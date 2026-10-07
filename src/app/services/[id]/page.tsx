import type { Metadata } from "next";
import { providerService } from "@/lib/api/services/provider.service";
import { reviewService } from "@/lib/api/services/review.service";
import { toAvailability, toReview } from "@/components/services/data";
import { loadProvider } from "@/components/services/loadProvider";
import { ProviderDetail } from "@/components/services/ProviderDetail";
import { SiteShell } from "@/components/site/SiteShell";

// Provider detail — Figma "02c_Homepage / Explore Service - Service Detail
// (About / Review)", nodes 3337:163900 / 3337:166010. Reached from "See
// details" on the Explore listing and the compare table. Rendered per request
// (the API goes through axios, not fetch, so Next can't infer this itself)
// so a provider's edits show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const provider = await loadProvider((await params).id);
  return { title: `${provider.name} · Serve Saathi` };
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await loadProvider(id);
  // Availability and reviews are secondary — if either fails, the page still
  // renders with that section's empty state rather than erroring out.
  const [availability, reviews] = await Promise.all([
    providerService.getAvailability(id).then(toAvailability, () => null),
    reviewService.list(id, { limit: 10, sortBy: "createdAt", sortOrder: "DESC" }).then((r) => r.items.map(toReview), () => null),
  ]);

  return (
    <SiteShell>
      <ProviderDetail provider={provider} availability={availability} reviews={reviews} />
    </SiteShell>
  );
}
