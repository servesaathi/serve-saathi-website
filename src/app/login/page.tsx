import { AuthLayout } from "@/components/onboarding/AuthLayout";
import { LoginForm } from "@/components/onboarding/LoginForm";

// "Enter Email" (existing-user login) — Figma node 1914:30884, fileKey
// dreRLvM7kEty4p5sNhup0I. Part of the Existing User module (node 1798:43754).
export default function LoginPage() {
  return (
    <AuthLayout slide={2} promptVariant="login">
      <LoginForm />
    </AuthLayout>
  );
}
