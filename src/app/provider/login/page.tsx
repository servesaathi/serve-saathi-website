import Link from "next/link";
import { LoginForm } from "@/components/onboarding/LoginForm";
import { PortalPage } from "@/components/provider/PortalPage";

export default function ProviderLoginPage() {
  return (
    <PortalPage tagline="Provider log in — manage your listing and reach families looking for care.">
      <LoginForm mode="provider" />
      <p className="text-[18px] leading-7 text-text-secondary">
        New provider?{" "}
        <Link href="/provider/onboarding" className="font-semibold text-primary hover:underline">
          Onboard your facility
        </Link>
      </p>
    </PortalPage>
  );
}
