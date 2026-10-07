import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROVIDERS, getProvider } from "@/components/services/data";
import { ProviderDetail } from "@/components/services/ProviderDetail";
import { SiteShell } from "@/components/site/SiteShell";

// Provider detail — Figma "02c_Homepage / Explore Service - Service Detail
// (About / Review)", nodes 3337:163900 / 3337:166010. Reached from "See
// details" on the Explore listing and the compare table.

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const provider = getProvider((await params).id);
  return { title: provider ? `${provider.name} · Serve Saathi` : "Serve Saathi" };
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const provider = getProvider((await params).id);
  if (!provider) notFound();

  return (
    <SiteShell>
      <ProviderDetail provider={provider} />
    </SiteShell>
  );
}
