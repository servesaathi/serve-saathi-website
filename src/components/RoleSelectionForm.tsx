"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import type { ApiRole } from "@/lib/api/types";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Button } from "./ui/Button";
import { CheckIcon } from "./CheckIcon";

type Role = "senior" | "family" | "saathi" | "partner";

const ROLES: { id: Role; label: string }[] = [
  { id: "senior", label: "Senior" },
  { id: "family", label: "Family" },
  { id: "saathi", label: "Saathi" },
  { id: "partner", label: "Partner" },
];

// Roles are a fixed backend enum, NOT master data — there is no /roles endpoint.
// The mapping below is copied verbatim from the live OpenAPI RegisterDto schema:
//   role: enum ["customer","provider","family","partner"]  (default "customer")
//   "Self-registration is limited to customer/provider/family/partner
//    (Senior/Saathi/Family/Partner in the app UI) — admin roles are granted
//    internally."
const ROLE_TO_API: Record<Role, ApiRole> = {
  senior: "customer",
  family: "family",
  saathi: "provider",
  partner: "partner",
};

// "Join (Choose a role)" content — Figma node 1867:16577 (fileKey
// dreRLvM7kEty4p5sNhup0I). Rendered inside <AuthLayout>, which supplies the
// two-column shell, the "Welcome to Serve Saathi" H1 and the sign-in prompt.
export function RoleSelectionForm() {
  const router = useRouter();
  const setRole = useOnboardingStore((s) => s.setRole);
  const [role, setLocalRole] = useState<Role>("senior");
  const groupName = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setRole(ROLE_TO_API[role]);
    router.push("/verify-phone");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[543px] flex-col items-center gap-6"
    >
      <svg viewBox="0 0 283 165" className="h-auto w-[220px] sm:w-[283px]" aria-hidden="true">
        <path
          d="M24.2312 164.117C24.2312 164.117 -9.85439 122.676 6.80355 80.0128C17.6617 52.2041 58.3944 36.966 81.381 52.2041C91.1719 58.6944 122.582 52.4227 139.354 25.5532C171.945 -26.6606 285.688 5.04968 264.981 85.2156C254.959 124.01 295.478 125.42 274.832 164.199L24.2312 164.117Z"
          fill="var(--color-border-hairline)"
        />
      </svg>

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[22px] leading-[30px] font-semibold text-text-primary">Choose a role</h2>
        <p className="max-w-[533px] text-[16px] leading-[22px] text-text-secondary">
          Choose How You Want to Be Part of the ServeSaathi Community
        </p>
      </div>

      <fieldset className="flex w-full flex-col gap-4">
        <legend className="sr-only">Choose your role</legend>
        {ROLES.map((option) => {
          const selected = option.id === role;
          return (
            <label
              key={option.id}
              className={`flex h-12 w-full cursor-pointer items-center justify-between rounded-control border-[1.5px] px-6 py-2 transition-colors ${
                selected
                  ? "border-tertiary bg-bg-orange"
                  : "border-border-hairline bg-bg-base hover:border-border-card"
              }`}
            >
              <span className="text-[16px] text-text-secondary">{option.label}</span>
              <input
                type="radio"
                name={groupName}
                value={option.id}
                checked={selected}
                onChange={() => setLocalRole(option.id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-tertiary ${
                  selected ? "bg-tertiary" : "bg-bg-base"
                }`}
              >
                {selected && <CheckIcon className="size-3" />}
              </span>
            </label>
          );
        })}
      </fieldset>

      <Button type="submit" className="mt-2 w-full max-w-[320px]">
        Ready to create an account
      </Button>
    </form>
  );
}
