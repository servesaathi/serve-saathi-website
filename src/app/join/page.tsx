import { AuthLayout } from "@/components/onboarding/AuthLayout";
import { RoleSelectionForm } from "@/components/RoleSelectionForm";

// "Join (Choose a role)" — Figma node 1798:21693, fileKey dreRLvM7kEty4p5sNhup0I.
// Step 1 of the "Start + Setting up new account for User" flow (node 1795:31515).
// The marketing landing page lives at "/"; this is the register entry point.
export default function JoinPage() {
  return (
    <AuthLayout slide={0}>
      <RoleSelectionForm />
    </AuthLayout>
  );
}
