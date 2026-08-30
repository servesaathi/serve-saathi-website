import { AuthLayout } from "@/components/onboarding/AuthLayout";
import { PhoneVerifyForm } from "@/components/onboarding/PhoneVerifyForm";

// "Mobile Phone Verify" — Figma node 1798:21717, fileKey dreRLvM7kEty4p5sNhup0I.
// Step 2 of the "Start + Setting up new account for User" flow (node 1795:31515).
export default function VerifyPhonePage() {
  return (
    <AuthLayout slide={1}>
      <PhoneVerifyForm />
    </AuthLayout>
  );
}
