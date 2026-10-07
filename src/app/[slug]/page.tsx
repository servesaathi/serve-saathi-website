import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/app/ComingSoon";

// Single shared route for every signed-in section that isn't built yet, so
// nav links resolve without a dedicated page.tsx per route. Add an entry
// here instead of a new src/app/<slug>/page.tsx.
const COMING_SOON: Record<string, { title: string; module: string }> = {
  "care-plan": { title: "Care Plan", module: "Care Plan module" },
  "service-history": { title: "Service History", module: "Service History module" },
  "family-elder": { title: "Family & Elder", module: "Family & Elder module" },
  payment: { title: "Payment", module: "Payment module" },
  community: { title: "Community & Resources", module: "Community & Resources module" },
  provider: { title: "Provider Dashboard", module: "Provider dashboard" },
  notifications: { title: "Notifications", module: "Notification Center module" },
};

export default async function ComingSoonRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = COMING_SOON[slug];
  if (!entry) notFound();
  return <ComingSoon title={entry.title} module={entry.module} />;
}
