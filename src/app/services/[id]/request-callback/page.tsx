import type { Metadata } from "next";
import { CallbackRequest } from "@/components/services/CallbackRequest";
import { loadProvider } from "@/components/services/loadProvider";
import { SiteShell } from "@/components/site/SiteShell";

// "Request a Callback" for one provider — replaces the design's Book flow
// (ServeSaathi is discovery-only). See CallbackRequest for the Figma lineage.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const provider = await loadProvider((await params).id);
  return { title: `Request a callback · ${provider.name}` };
}

export default async function RequestCallbackPage({ params }: { params: Promise<{ id: string }> }) {
  const provider = await loadProvider((await params).id);

  return (
    <SiteShell>
      <CallbackRequest provider={provider} />
    </SiteShell>
  );
}
