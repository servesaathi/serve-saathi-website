"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import useAuthStore from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";

// Right-hand column of "OTP Verification" — Figma node 1867:16992.
const OTP_LENGTH = 4;
const RESEND_SECONDS = 28;

function maskPhone(phone: string | null): string {
  if (!phone) return "your verified mobile number";
  const clean = phone.replace(/[^\d+]/g, "");
  const cc = clean.startsWith("+91") ? "+91" : clean.slice(0, 3);
  const rest = clean.slice(cc.length);
  if (rest.length < 4) return phone;
  return `${cc}-${rest.slice(0, 2)}****${rest.slice(-2)}`;
}

export function OtpVerifyForm() {
  const router = useRouter();
  const phone = useOnboardingStore((s) => s.phone);
  const role = useOnboardingStore((s) => s.role);
  const setPhoneVerificationToken = useOnboardingStore((s) => s.setPhoneVerificationToken);
  const setSession = useAuthStore((s) => s.setSession);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  // Reached only via the phone step — bounce back if we have no number.
  useEffect(() => {
    if (!phone) router.replace("/verify-phone");
  }, [phone, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function verify(value: string) {
    if (!phone || value.length !== OTP_LENGTH || submitting) return;
    setError(undefined);
    setSubmitting(true);
    try {
      const result = await authService.verifyOtp({ phone, code: value });
      if (result.isNewUser) {
        setPhoneVerificationToken(result.phoneVerificationToken ?? null);
        router.push("/create-account");
      } else if (result.accessToken && result.user) {
        // Phone already belongs to an account — this call logged them in.
        setSession(result.accessToken, result.user);
        router.push("/dashboard");
      } else {
        setError("Something went wrong verifying that code. Please try again.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!phone || seconds > 0) return;
    try {
      await authService.requestOtp({ phone, role: role ?? "customer" });
      setSeconds(RESEND_SECONDS);
      setError(undefined);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    verify(code);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex w-full max-w-[600px] flex-col items-center gap-6">
      <p className="max-w-[600px] text-center text-[16px] leading-[22px] text-text-secondary">
        Create profiles for the seniors you care about and begin their journey with us.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[400px] flex-col items-center gap-6 px-6"
      >
        <h2 className="text-center text-[26px] leading-[34px] font-semibold text-text-primary">
          Enter verification code
        </h2>

        <p className="text-center text-[16px] leading-[22px] text-text-secondary">
          The OTP has been sent to your verified mobile{" "}
          <span className="text-[20px] font-bold text-text-secondary">{maskPhone(phone)}</span>
        </p>

        <div className="py-2">
          <OtpInput
            length={OTP_LENGTH}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (error) setError(undefined);
            }}
            onComplete={verify}
            error={Boolean(error)}
            disabled={submitting}
            autoFocus
          />
        </div>

        {error && <p className="text-[13px] leading-[17px] text-error">{error}</p>}

        <Button
          type="submit"
          loading={submitting}
          disabled={code.length !== OTP_LENGTH}
          className="w-full max-w-[320px]"
        >
          Continue
        </Button>

        <p className="text-center text-[16px] leading-[22px] text-text-secondary">
          Didn&apos;t receive OTP?{" "}
          {seconds > 0 ? (
            <span className="font-bold">
              Resend in {mm}:{ss}
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="font-bold text-primary hover:underline"
            >
              Resend OTP
            </button>
          )}
        </p>
      </form>
    </div>
  );
}

export default OtpVerifyForm;
