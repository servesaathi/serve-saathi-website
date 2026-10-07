import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CallbackRequest } from "@/components/services/CallbackRequest";
import { getProvider } from "@/components/services/data";
import { SiteShell } from "@/components/site/SiteShell";

// "Request a Callback" for one provider — replaces the design's Book flow
// (ServeSaathi is discovery-only). See CallbackRequest for the Figma lineage.

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const provider = getProvider((await params).id);
  return { title: provider ? `Request a callback · ${provider.name}` : "Serve Saathi" };
}

export default async function RequestCallbackPage({ params }: { params: Promise<{ id: string }> }) {
  const provider = getProvider((await params).id);
  if (!provider) notFound();

  return (
    <SiteShell>
      <CallbackRequest provider={provider} />
    </SiteShell>
  );
}
