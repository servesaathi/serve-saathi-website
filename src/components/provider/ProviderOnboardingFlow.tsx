"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { authService, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { TextInput } from "@/components/ui/TextInput";
import { FormField } from "@/components/provider/FormField";
import {
  CATEGORY_FORMS,
  getCategoryForm,
  validateSection,
  visibleSections,
  type Answers,
} from "@/lib/provider-onboarding";
import useAuthStore from "@/store/auth.store";

// Provider onboarding: account → category → one page per form section →
// review → submitted. The category picks a schema from CATEGORY_FORMS (the
// Google Forms ported to src/lib/provider-onboarding); everything after that
// is rendered from the schema.
//
// TODO(backend): there is no endpoint yet that accepts a provider's profile
// answers (POST /providers only takes email/name/password, and the account
// itself is created via /auth/register with role "provider"). Until one
// exists, drafts and the final application are kept in localStorage so
// nothing is lost — swap `submitApplication` for the real call.

const STORAGE_KEY = "servesaathi-provider-application";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "account" | "category" | "form" | "review" | "done";
type Draft = { category?: string; answers?: Answers; step?: number };

function loadDraft(): Draft {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}

function submitApplication(category: string, answers: Answers) {
  try {
    window.localStorage.setItem(
      `${STORAGE_KEY}-submitted`,
      JSON.stringify({ category, answers, submittedAt: new Date().toISOString() })
    );
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing more we can do client-side */
  }
}

function StepHeader({ title, description, progress }: { title: string; description?: string; progress?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {progress && <p className="text-[14px] leading-5 font-semibold text-tertiary">{progress}</p>}
      <h2 className="font-serif text-[28px] leading-[1.2] text-secondary sm:text-[32px]">{title}</h2>
      {description && <p className="text-[16px] leading-[22px] text-text-secondary">{description}</p>}
    </div>
  );
}

function AccountStep() {
  const setSession = useAuthStore((s) => s.setSession);
  const [v, setV] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!v.firstName.trim()) errs.firstName = "Enter your first name.";
    if (!v.lastName.trim()) errs.lastName = "Enter your last name.";
    if (!EMAIL_RE.test(v.email)) errs.email = "Enter a valid email address.";
    if (v.password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setFormError(undefined);
    try {
      const phone = v.phone.replace(/[\s-]/g, "");
      const { accessToken, user } = await authService.register({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        password: v.password,
        role: "provider",
        ...(phone ? { phone: phone.startsWith("+") ? phone : `+91${phone.slice(-10)}` } : {}),
      });
      setSession(accessToken, user);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <StepHeader
        title="Create your provider account"
        description="You'll use this to sign in and manage your listing."
        progress="Step 1"
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextInput label="First name" requiredMark autoComplete="given-name" value={v.firstName} onChange={set("firstName")} error={errors.firstName} />
        <TextInput label="Last name" requiredMark autoComplete="family-name" value={v.lastName} onChange={set("lastName")} error={errors.lastName} />
      </div>
      <TextInput label="Email" requiredMark type="email" autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} />
      <TextInput label="Mobile number" type="tel" autoComplete="tel" placeholder="10-digit mobile number" value={v.phone} onChange={set("phone")} error={errors.phone} />
      <PasswordInput label="Password" requiredMark autoComplete="new-password" placeholder="At least 8 characters" value={v.password} onChange={set("password")} error={errors.password} />
      {formError && <p className="text-[13px] leading-[17px] text-error">{formError}</p>}
      <Button type="submit" loading={busy} className="w-full sm:w-auto sm:self-start">
        Create account &amp; continue
      </Button>
      <p className="text-[16px] leading-[22px] text-text-secondary">
        Already registered?{" "}
        <Link href="/provider/login" className="font-semibold text-primary hover:underline">
          Provider log in
        </Link>
      </p>
    </form>
  );
}

const subscribeNoop = () => () => {};

export function ProviderOnboardingFlow() {
  // The draft lives in localStorage, so only mount the real flow on the
  // client (false during SSR/hydration, true after) — lets the inner
  // component read it with plain lazy initial state instead of an effect.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  return hydrated ? <Flow /> : <div className="min-h-[320px]" aria-busy />;
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
    if (category) submitApplication(category, answers);
    setStage("done");
    window.scrollTo({ top: 0 });
  }

  if (stage === "account") return <AccountStep />;

  if (stage === "category") {
    return (
      <div className="flex flex-col gap-6">
        <StepHeader
          title="What kind of provider are you?"
          description="Pick your category. Each category has its own short set of questions after the common details."
          progress="Step 2"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORY_FORMS.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                if (c.slug !== category) {
                  setAnswers({});
                  setStep(0);
                }
                setCategory(c.slug);
                setErrors({});
                setStage("form");
              }}
              className={`flex flex-col gap-2 rounded-card border-[1.5px] bg-bg-base p-5 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                c.slug === category ? "border-primary" : "border-border-hairline"
              }`}
            >
              <span className="text-[18px] leading-6 font-semibold text-text-primary">{c.title}</span>
              <span className="text-[16px] leading-[22px] text-text-secondary">{c.blurb}</span>
            </button>
          ))}
        </div>
        <p className="text-[14px] leading-5 text-text-tertiary">
          More categories (hospitals, home care, diagnostics and others) will be added here.
        </p>
      </div>
    );
  }

  if (stage === "form" && form && section) {
    return (
      <form onSubmit={next} className="flex flex-col gap-6" noValidate>
        <StepHeader
          title={section.title}
          description={section.description}
          progress={`${form.title} · Page ${step + 1} of ${sections.length}`}
        />
        <div className="flex flex-col gap-6">
          {section.fields.map((f) => (
            <FormField
              key={f.id}
              field={f}
              value={answers[f.id]}
              error={errors[f.id]}
              onChange={(val) => {
                setAnswers((p) => ({ ...p, [f.id]: val }));
                setErrors((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== f.id)));
              }}
            />
          ))}
        </div>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            Please fix the highlighted fields to continue.
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="light" onClick={back}>
            Back
          </Button>
          <Button type="submit">{step >= sections.length - 1 ? "Review" : "Next"}</Button>
        </div>
      </form>
    );
  }

  if (stage === "review" && form) {
    return (
      <div className="flex flex-col gap-6">
        <StepHeader title="Review your details" description={`${form.title} application`} />
        {sections.map((s, i) => (
          <section key={s.id} className="rounded-card border border-border-hairline bg-bg-base p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-[18px] leading-6 font-semibold text-text-primary">{s.title}</h3>
              <button
                type="button"
                onClick={() => {
                  setStep(i);
                  setStage("form");
                }}
                className="text-[16px] font-semibold text-primary hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
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
        <div className="flex gap-3">
          <Button type="button" variant="light" onClick={back}>
            Back
          </Button>
          <Button type="button" onClick={submit}>
            Submit application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <StepHeader
        title="Thank you — application received"
        description="Our team will review your registration details. Verified Provider status is decided by Serve Saathi after review."
      />
      <Button href="/">Back to home</Button>
    </div>
  );
}

export default ProviderOnboardingFlow;
