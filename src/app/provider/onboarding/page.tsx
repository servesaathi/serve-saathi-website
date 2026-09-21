import { PortalPage } from "@/components/provider/PortalPage";
import { ProviderOnboardingFlow } from "@/components/provider/ProviderOnboardingFlow";

export default function ProviderOnboardingPage() {
  return (
    <PortalPage width={720}>
      <div className="w-full rounded-2xl bg-bg-base p-6 sm:p-10">
        <ProviderOnboardingFlow />
      </div>
    </PortalPage>
  );
}
