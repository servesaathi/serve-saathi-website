import { LoginForm } from "@/components/onboarding/LoginForm";
import { PortalPage } from "@/components/provider/PortalPage";

export default function AdminLoginPage() {
  return (
    <PortalPage tagline="Admin log in — for Serve Saathi staff only.">
      <LoginForm mode="admin" />
    </PortalPage>
  );
}
