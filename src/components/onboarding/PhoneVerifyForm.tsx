"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useOnboardingStore } from "@/store/onboarding.store";

// Right-hand column of "Mobile Phone Verify" — Figma node 1867:16828.
// Collects the mobile number, calls authService.requestOtp, then moves to the
// OTP step.

export function PhoneVerifyForm() {
  const router = useRouter();
  const role = useOnboardingStore((s) => s.role);
  const setPhone = useOnboardingStore((s) => s.setPhone);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = digits.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const phone = `+91${clean}`;
    setError(undefined);
    setSubmitting(true);
    try {
      await authService.requestOtp({ phone, role: role ?? "customer" });
      setPhone(phone);
      router.push("/verify-otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-[600px] flex-col items-center gap-12">
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-8 px-6">
        <p className="max-w-[456px] text-center text-[18px] leading-[22px] text-text-secondary">
          Create profiles for the seniors you care about and begin their journey with us.
        </p>

        <div className="w-full max-w-[400px]">
          <PhoneInput
            value={digits}
            onChange={(e) => setDigits(e.target.value)}
            error={error}
            maxLength={12}
          />
        </div>

        <Button type="submit" loading={submitting} className="w-full max-w-[320px]">
          Continue
        </Button>
      </form>

      <div className="flex w-full max-w-[400px] flex-col items-stretch gap-4 pt-24">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border-hairline" />
          <span className="text-[16px] leading-[22px] font-semibold text-text-secondary">OR</span>
          <span className="h-px flex-1 bg-border-hairline" />
        </div>

        <Button
          variant="light"
          fullWidth
          leftIcon={<Image src="/icons/google.png" alt="" width={20} height={20} />}
        >
          Sign in with Google
        </Button>
        <Button variant="light" fullWidth href="/login">
          Sign in with Email
        </Button>
      </div>
    </div>
  );
}

export default PhoneVerifyForm;
