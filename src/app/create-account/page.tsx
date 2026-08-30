import { AuthLayout } from "@/components/onboarding/AuthLayout";
import { CreateAccountForm } from "@/components/onboarding/CreateAccountForm";

// "Create an account" — Figma node 1798:21776, fileKey dreRLvM7kEty4p5sNhup0I.
// Step 4 of the "Start + Setting up new account for User" flow (node 1795:31515).
export default function CreateAccountPage() {
  return (
    <AuthLayout slide={0} title="Create an account">
      <CreateAccountForm />
    </AuthLayout>
  );
}
