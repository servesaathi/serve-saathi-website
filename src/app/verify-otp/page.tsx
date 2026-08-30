import { AuthLayout } from "@/components/onboarding/AuthLayout";
import { OtpVerifyForm } from "@/components/onboarding/OtpVerifyForm";

// "OTP Verification" — Figma node 1798:21748, fileKey dreRLvM7kEty4p5sNhup0I.
// Step 3 of the "Start + Setting up new account for User" flow (node 1795:31515).
export default function VerifyOtpPage() {
  return (
    <AuthLayout slide={2} title="Create an account">
      <OtpVerifyForm />
    </AuthLayout>
  );
}
