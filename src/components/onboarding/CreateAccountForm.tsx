"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { TextInput } from "@/components/ui/TextInput";
import { recordConsent } from "@/lib/consent";
import useAuthStore from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";

// Right-hand column of "Create an account" — Figma node 1875:27374.
// DPDP: the design's passive "By continuing, you agree…" line is replaced by
// an explicit notice + un-ticked consent checkbox that gates submit.

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirm" | "consent", string>>;

const DATA_ITEMS = ["First and last name", "Email address", "Mobile number (already verified)", "Password (stored encrypted)"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateAccountForm() {
  const router = useRouter();
  const phone = useOnboardingStore((s) => s.phone);
  const role = useOnboardingStore((s) => s.role);
  const phoneVerificationToken = useOnboardingStore((s) => s.phoneVerificationToken);
  const returnTo = useOnboardingStore((s) => s.returnTo);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const setSession = useAuthStore((s) => s.setSession);

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // This screen is only reachable after a verified OTP for a new user.
  useEffect(() => {
    if (!phoneVerificationToken) router.replace("/verify-phone");
  }, [phoneVerificationToken, router]);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!values.firstName.trim()) next.firstName = "Enter a first name.";
    if (!values.lastName.trim()) next.lastName = "Enter a last name.";
    if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (values.confirm !== values.password) next.confirm = "Passwords don't match.";
    if (!consent) next.consent = "Please read the notice and tick the box to create your account.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setFormError(undefined);
    setSubmitting(true);
    try {
      // TODO(backend): send this record with register() once the API accepts it.
      recordConsent("account-creation", DATA_ITEMS);
      const { accessToken, user } = await authService.register({
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: phone ?? undefined,
        role: role ?? undefined,
        phoneVerificationToken: phoneVerificationToken ?? undefined,
      });
      setSession(accessToken, user);
      resetOnboarding();
      router.push(returnTo ?? "/create-profile");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[600px] flex-col items-center gap-6 px-6">
      <div className="flex w-full flex-col gap-6">
        <TextInput
          label="First name"
          placeholder="Enter recipient's name"
          autoComplete="given-name"
          value={values.firstName}
          onChange={set("firstName")}
          error={errors.firstName}
        />
        <TextInput
          label="Last name"
          placeholder="Enter recipient's last name"
          autoComplete="family-name"
          value={values.lastName}
          onChange={set("lastName")}
          error={errors.lastName}
        />
        <TextInput
          label="Email address"
          type="email"
          placeholder="Enter Email address"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <PasswordInput
          label="New Password"
          placeholder="Enter your password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />

        <ConsentNotice
          dataItems={DATA_ITEMS}
          purpose="create and run your ServeSaathi account, show you care providers that match your needs, and contact you about requests you make."
          checked={consent}
          onChange={(v) => {
            setConsent(v);
            setErrors((prev) => ({ ...prev, consent: undefined }));
          }}
          error={errors.consent}
        />

        {formError && <p className="text-[13px] leading-[17px] text-error">{formError}</p>}
      </div>

      <Button type="submit" loading={submitting} className="w-full max-w-[320px]">
        Create an account
      </Button>
    </form>
  );
}

export default CreateAccountForm;
