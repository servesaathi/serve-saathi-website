"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { recordConsent } from "@/lib/consent";
import { useOnboardingStore } from "@/store/onboarding.store";

// Right-hand column of "Mobile Phone Verify" — Figma node 1867:16828.
// Collects the mobile number, calls authService.requestOtp, then moves to the
// OTP step. DPDP: the OTP isn't requested until the consent box is ticked.
// `?next=/path` (e.g. from the Explore Services "Unlock" gate) is remembered
// so the person lands back where they were once verified.

export function PhoneVerifyForm() {
  const router = useRouter();
  const role = useOnboardingStore((s) => s.role);
  const setPhone = useOnboardingStore((s) => s.setPhone);
  const setReturnTo = useOnboardingStore((s) => s.setReturnTo);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string>();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // Read directly (not useSearchParams) so the page needs no Suspense boundary.
  useEffect(() => {
    setReturnTo(new URLSearchParams(window.location.search).get("next"));
  }, [setReturnTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = digits.replace(/\D/g, "");
    const phoneError = clean.length !== 10 ? "Enter a valid 10-digit mobile number." : undefined;
    const missingConsent = consent ? undefined : "Please read the notice and tick the box to continue.";
    setError(phoneError);
    setConsentError(missingConsent);
    if (phoneError || missingConsent) return;

    const phone = `+91${clean}`;
    setSubmitting(true);
    try {
      // TODO(backend): send this record with requestOtp once the API accepts it.
      recordConsent("phone-verification", ["Mobile number"]);
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

        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <PhoneInput
            value={digits}
            onChange={(e) => setDigits(e.target.value)}
            error={error}
            maxLength={12}
          />
          <ConsentNotice
            dataItems={["Mobile number"]}
            purpose="send you a one-time password, verify it's you, and sign you in or create your account."
            checked={consent}
            onChange={(v) => {
              setConsent(v);
              if (v) setConsentError(undefined);
            }}
            error={consentError}
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
