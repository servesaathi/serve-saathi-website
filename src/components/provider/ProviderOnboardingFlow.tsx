"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { TextInput } from "@/components/ui/TextInput";
import { FormField, isWideField, OptionCard } from "@/components/provider/FormField";
import { StageLayout } from "@/components/provider/StageLayout";
import { StepRail } from "@/components/provider/StepRail";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  CATEGORY_FORMS,
  emailError,
  getCategoryForm,
  mobileError,
  sanitizePhoneInput,
  toE164,
  validateField,
  validateSection,
  visibleSections,
  type Answers,
} from "@/lib/provider-onboarding";
import { recordConsent } from "@/lib/consent";
import useAuthStore from "@/store/auth.store";

// Provider onboarding, as a full-window stepper: account → category → one
// step per form section → review → submitted. The category picks a schema
// from CATEGORY_FORMS (the Google Forms ported to
// src/lib/provider-onboarding); every step after that is rendered from it.
// Layout follows the booking screen: header, dark stepper rail where the
// Sidebar normally sits, full-width content, and a Back/Next row pinned to
// the bottom of the window.
//
// TODO(backend): there is no endpoint yet that accepts a provider's profile
// answers (POST /providers only takes email/name/password, and the account
// itself is created via /auth/register with role "provider"). Until one
// exists, drafts and the final application are kept in localStorage so
// nothing is lost — swap `submitApplication` for the real call.

const STORAGE_KEY = "servesaathi-provider-application";
const CHIP = "Provider onboarding";

type Stage = "account" | "category" | "form" | "review" | "done";
type Draft = { category?: string; answers?: Answers; step?: number };

function loadDraft(): Draft {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}

const ACCOUNT_DATA_ITEMS = ["First and last name", "Email", "Mobile number (if given)", "Password (stored encrypted)"];
const APPLICATION_DATA_ITEMS = [
  "Everything entered in this application, including contact-person details and any documents or registration numbers",
];

function submitApplication(category: string, answers: Answers) {
  // TODO(backend): send this record with the application once an endpoint exists.
  const consent = recordConsent("provider-application", APPLICATION_DATA_ITEMS);
  try {
    window.localStorage.setItem(
      `${STORAGE_KEY}-submitted`,
      JSON.stringify({ category, answers, consent, submittedAt: new Date().toISOString() })
    );
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing more we can do client-side */
  }
}

function BackButton({ onClick, href, children = "Back" }: { onClick?: () => void; href?: string; children?: ReactNode }) {
  const icon = <Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} className="-scale-x-100" />;
  return href ? (
    <Button href={href} variant="secondary" fullWidth leftIcon={icon}>
      {children}
    </Button>
  ) : (
    <Button type="button" variant="secondary" fullWidth leftIcon={icon} onClick={onClick}>
      {children}
    </Button>
  );
}

const FIELD_GRID = "grid gap-x-6 gap-y-6 md:grid-cols-2";

function AccountStep() {
  const setSession = useAuthStore((s) => s.setSession);
  const [v, setV] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v | "consent", string>>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };
  // Validate email/phone as soon as the user leaves the field, not only on submit.
  const blurCheck = (k: "email" | "phone") => () =>
    setErrors((p) => ({ ...p, [k]: k === "email" ? emailError(v.email) : mobileError(v.phone) }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!v.firstName.trim()) errs.firstName = "Enter your first name.";
    if (!v.lastName.trim()) errs.lastName = "Enter your last name.";
    if (!v.email.trim()) errs.email = "Enter your email address.";
    else if (emailError(v.email)) errs.email = emailError(v.email);
    const phoneErr = mobileError(v.phone);
    if (phoneErr) errs.phone = phoneErr;
    if (v.password.length < 8) errs.password = "Use at least 8 characters.";
    if (!consent) errs.consent = "Please read the notice and tick the box to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setFormError(undefined);
    try {
      recordConsent("account-creation", ACCOUNT_DATA_ITEMS);
      const phone = toE164(v.phone);
      const { accessToken, user } = await authService.register({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        password: v.password,
        role: "provider",
        ...(phone ? { phone } : {}),
      });
      setSession(accessToken, user);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <StageLayout
      onSubmit={submit}
      chip={CHIP}
      title="Create your provider account"
      description="You'll use this to sign in and manage your listing. Already registered? Use provider log in."
      actions={
        <>
          <BackButton href="/provider/login">Provider log in</BackButton>
          <Button type="submit" fullWidth loading={busy}>
            Create account &amp; continue
          </Button>
        </>
      }
    >
      <div className={FIELD_GRID}>
        <TextInput label="First name" requiredMark autoComplete="given-name" value={v.firstName} onChange={set("firstName")} error={errors.firstName} />
        <TextInput label="Last name" requiredMark autoComplete="family-name" value={v.lastName} onChange={set("lastName")} error={errors.lastName} />
        <TextInput label="Email" requiredMark type="email" autoComplete="email" value={v.email} onChange={set("email")} onBlur={blurCheck("email")} error={errors.email} />
        <TextInput label="Mobile number" type="tel" autoComplete="tel" placeholder="10-digit mobile number" helperText="Optional. Indian mobile numbers only." inputMode="tel" value={v.phone} onChange={(e) => set("phone")({ target: { value: sanitizePhoneInput(e.target.value) } })} onBlur={blurCheck("phone")} error={errors.phone} />
        <PasswordInput label="Password" requiredMark autoComplete="new-password" placeholder="At least 8 characters" value={v.password} onChange={set("password")} error={errors.password} />
      </div>
      <ConsentNotice
        dataItems={ACCOUNT_DATA_ITEMS}
        purpose="create your provider account, sign you in, and contact you about your listing."
        checked={consent}
        onChange={(c) => {
          setConsent(c);
          setErrors((p) => ({ ...p, consent: undefined }));
        }}
        error={errors.consent}
      />
      {formError && (
        <p role="alert" className="text-[14px] leading-5 text-error">
          {formError}
        </p>
      )}
    </StageLayout>
  );
}

const subscribeNoop = () => () => {};

export function ProviderOnboardingFlow() {
  // The draft lives in localStorage, so only mount the real flow on the
  // client (false during SSR/hydration, true after) — lets the inner
  // component read it with plain lazy initial state instead of an effect.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <SiteHeader />
      {hydrated ? <Flow /> : <div className="min-h-[60vh] flex-1" aria-busy />}
      <SiteFooter />
    </div>
  );
}

function Flow() {
  const user = useAuthStore((s) => s.user);
  const [draft] = useState<Draft>(() => {
    const d = loadDraft();
    return d.category && getCategoryForm(d.category) ? d : {};
  });
  const [flowStage, setStage] = useState<Stage>(draft.category ? "form" : "category");
  const [category, setCategory] = useState<string | undefined>(draft.category);
  const [answers, setAnswers] = useState<Answers>(draft.answers ?? {});
  const [step, setStep] = useState(draft.step ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryError, setCategoryError] = useState(false);
  const [applicationConsent, setApplicationConsent] = useState(false);
  const [applicationConsentError, setApplicationConsentError] = useState<string>();

  // Signed-out visitors always land on account creation; the rest of the
  // flow resumes wherever they were once a session exists.
  const stage: Stage = user ? flowStage : "account";

  useEffect(() => {
    if (!category || stage === "done") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ category, answers, step }));
    } catch {
      /* ignore */
    }
  }, [category, answers, step, stage]);

  const form = getCategoryForm(category);
  const sections = useMemo(() => (form ? visibleSections(form, answers) : []), [form, answers]);
  const section = sections[Math.min(step, sections.length - 1)];

  // Rail: account · category · one per visible section · review. Before a
  // category is chosen the section list is unknown, so it shows one
  // placeholder step.
  const steps = ["Create account", "Choose category", ...(form ? sections.map((s) => s.title) : ["Provider details"]), "Review"];
  const current =
    stage === "account" ? 0 : stage === "category" ? 1 : stage === "form" ? 2 + Math.min(step, sections.length - 1) : stage === "review" ? steps.length - 1 : steps.length;

  function jumpTo(i: number) {
    setErrors({});
    if (i === 1) setStage("category");
    else if (i >= 2 && i < steps.length - 1) {
      setStep(i - 2);
      setStage("form");
    }
    window.scrollTo({ top: 0 });
  }

  function next(e: FormEvent) {
    e.preventDefault();
    if (!section) return;
    const errs = validateSection(section, answers);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (step >= sections.length - 1) setStage("review");
    else setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  function back() {
    setErrors({});
    if (stage === "review") setStage("form");
    else if (step > 0) setStep(step - 1);
    else setStage("category");
    window.scrollTo({ top: 0 });
  }

  function submit() {
    // Re-validate everything — earlier answers may have changed which fields are visible.
    for (let i = 0; i < sections.length; i++) {
      const errs = validateSection(sections[i], answers);
      if (Object.keys(errs).length) {
        setStep(i);
        setErrors(errs);
        setStage("form");
        return;
      }
    }
    if (!applicationConsent) {
      setApplicationConsentError("Please read the notice and tick the box to submit your application.");
      return;
    }
    if (category) submitApplication(category, answers);
    setStage("done");
    window.scrollTo({ top: 0 });
  }

  let body: ReactNode = null;

  if (stage === "account") {
    body = <AccountStep />;
  } else if (stage === "category") {
    body = (
      <StageLayout
        chip={CHIP}
        title="What kind of provider are you?"
        description="Pick your category. Each one has its own short set of questions after the common details."
        onSubmit={(e) => {
          e.preventDefault();
          if (!category) return setCategoryError(true);
          setErrors({});
          setStage("form");
          window.scrollTo({ top: 0 });
        }}
        actions={
          <>
            <BackButton href="/">Back to home</BackButton>
            <Button type="submit" fullWidth rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}>
              Continue
            </Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-3">
          <legend className={`text-[18px] leading-7 font-semibold ${categoryError ? "text-error" : "text-text-primary"}`}>Category</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORY_FORMS.map((c) => (
              <OptionCard
                key={c.slug}
                name="category"
                label={c.title}
                description={c.blurb}
                multi={false}
                checked={c.slug === category}
                hasError={categoryError}
                onToggle={() => {
                  if (c.slug !== category) {
                    setAnswers({});
                    setStep(0);
                  }
                  setCategory(c.slug);
                  setCategoryError(false);
                }}
              />
            ))}
          </div>
          {categoryError && <p className="text-[13px] leading-[17px] text-error">Choose a category to continue.</p>}
          <p className="text-[14px] leading-5 text-text-tertiary">
            More categories (hospitals, home care, diagnostics and others) will be added here.
          </p>
        </fieldset>
      </StageLayout>
    );
  } else if (stage === "form" && form && section) {
    const last = step >= sections.length - 1;
    body = (
      <StageLayout
        onSubmit={next}
        chip={`${form.title} · Step ${step + 1} of ${sections.length}`}
        title={section.title}
        description={section.description}
        actions={
          <>
            <BackButton onClick={back} />
            <Button type="submit" fullWidth rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}>
              {last ? "Review" : "Next"}
            </Button>
          </>
        }
      >
        <div className={FIELD_GRID}>
          {section.fields.map((f) => (
            <div key={f.id} className={isWideField(f) ? "md:col-span-2" : undefined}>
              <FormField
                field={f}
                value={answers[f.id]}
                error={errors[f.id]}
                onChange={(val) => {
                  setAnswers((p) => ({ ...p, [f.id]: val }));
                  setErrors((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== f.id)));
                }}
                onBlur={() => {
                  // Early feedback for filled-in fields only; "required" waits for Next.
                  const val = answers[f.id];
                  const filled = Array.isArray(val) ? val.length > 0 : !!val?.trim();
                  if (!filled) return;
                  const err = validateField(f, val);
                  setErrors((p) => {
                    const rest = Object.fromEntries(Object.entries(p).filter(([k]) => k !== f.id));
                    return err ? { ...rest, [f.id]: err } : rest;
                  });
                }}
              />
            </div>
          ))}
        </div>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            Please fix the highlighted fields to continue.
          </p>
        )}
      </StageLayout>
    );
  } else if (stage === "review" && form) {
    body = (
      <StageLayout
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        chip={form.title}
        title="Review your details"
        description="Check everything below. You can edit any page before submitting."
        actions={
          <>
            <BackButton onClick={back} />
            <Button type="submit" fullWidth>
              Submit application
            </Button>
          </>
        }
      >
        {sections.map((s, i) => (
          <section key={s.id} className="rounded-card border border-border-hairline bg-bg-base p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-[20px] leading-7 font-semibold text-text-primary">{s.title}</h2>
              <button
                type="button"
                onClick={() => {
                  setStep(i);
                  setStage("form");
                }}
                className="text-[16px] font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Edit
              </button>
            </div>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              {s.fields.map((f) => {
                const val = answers[f.id];
                const text = Array.isArray(val) ? val.join(", ") : val;
                return (
                  <div key={f.id} className="min-w-0">
                    <dt className="text-[14px] leading-5 text-text-tertiary">{f.label}</dt>
                    <dd className="text-[16px] leading-[22px] break-words text-text-primary">{text || "—"}</dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
        <ConsentNotice
          dataItems={APPLICATION_DATA_ITEMS}
          purpose="verify your organisation, list it on ServeSaathi so families can discover you, and contact you about your listing."
          sharedWith="families who view your listing (your public profile details only — never your documents or personal IDs)."
          checked={applicationConsent}
          onChange={(c) => {
            setApplicationConsent(c);
            if (c) setApplicationConsentError(undefined);
          }}
          error={applicationConsentError}
        />
      </StageLayout>
    );
  } else {
    body = (
      <StageLayout
        chip={CHIP}
        title="Thank you — application received"
        description="Our team will review your registration details. Verified Provider status is decided by Serve Saathi after review."
        actions={
          <div className="sm:col-span-2">
            <Button href="/" fullWidth>
              Back to home
            </Button>
          </div>
        }
      >
        {null}
      </StageLayout>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <StepRail steps={steps} current={current} onSelect={user ? jumpTo : undefined} />
      <div className="flex min-w-0 flex-1 flex-col">{body}</div>
    </div>
  );
}

export default ProviderOnboardingFlow;
