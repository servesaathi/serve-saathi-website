"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { TextInput } from "@/components/ui/TextInput";
import useAuthStore from "@/store/auth.store";

// Right-hand column of "Enter Email" (existing-user login) — Figma node
// 1914:30887. Email + password → authService.login → dashboard.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof fieldError = {};
    if (!EMAIL_RE.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setFieldError(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError(undefined);
    setSubmitting(true);
    try {
      const { accessToken, user } = await authService.login({ email: email.trim(), password });
      setSession(accessToken, user);
      router.push("/dashboard");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6 px-6">
        <div className="flex w-full flex-col gap-6">
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldError((p) => ({ ...p, email: undefined }));
            }}
            error={fieldError.email}
          />
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldError((p) => ({ ...p, password: undefined }));
            }}
            error={fieldError.password}
          />
          {formError && <p className="text-[13px] leading-[17px] text-error">{formError}</p>}
        </div>

        <Button type="submit" loading={submitting} className="w-full max-w-[320px]">
          Continue
        </Button>

        <Link
          href="/forgot-password"
          className="text-[16px] leading-[22px] font-semibold text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </form>

      {/* Existing users can also sign in with mobile number + OTP — the phone
          step returns isNewUser=false for a known number and logs them in. */}
      <div className="flex w-full max-w-[400px] flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border-hairline" />
          <span className="text-[16px] leading-[22px] font-semibold text-text-secondary">OR</span>
          <span className="h-px flex-1 bg-border-hairline" />
        </div>
        <Button variant="light" fullWidth href="/verify-phone">
          Continue with mobile number
        </Button>
      </div>
    </div>
  );
}

export default LoginForm;
