"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { OtpInput } from "@/components/ui/OtpInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import { recordConsent } from "@/lib/consent";
import type { StartInput } from "@/lib/ews/ewsService";
import type { Mode } from "@/lib/ews/questionnaire";
import { ChoiceCard } from "./ChoiceCard";
import { EwsDialog } from "./EwsDialog";
import { StepBar } from "./StepBar";

// Before the first question — the Figma "2min Quick Check" pop-up frames
// (3343:184030 …) and "OPT Verfiy Code" (3344:332631 / 3344:332665) carry the
// spec's set-up steps instead of their own placeholder questions (decided with
// the user, 2026-10-09):
//   1. Layer-1 consent notice (spec G, P1) — "I agree" records consent.
//   2. Who is answering? Self / Assisted / Proxy (spec A).
//   3a. Self: "Are you answering on your own right now?" (private items gate).
//   3b. Proxy: the elder's name, relationship and mobile …
//   4.  … then the elder's OTP, or the elder confirming on screen. A family
//       member can't start until the elder agrees (spec G "special situations").
// TODO(backend): there's no OTP endpoint for elder consent yet, so the code is
// checked against DEMO_OTP locally (shown on screen, like the reference demo).

const DEMO_OTP = "4321";
const RESEND_SECONDS = 30;

const RELATIONSHIPS = [
  "Daughter",
  "Son",
  "Spouse",
  "Daughter-in-law",
  "Son-in-law",
  "Grandchild",
  "Sibling",
  "Other family",
  "Paid caregiver",
].map((r) => ({ value: r.toLowerCase(), label: r }));

const CONSENT_ITEMS = ["Your answers to about 26 short questions", "Who answered (you, with help, or a family member)"];

type Step = "consent" | "notnow" | "mode" | "private" | "proxy" | "otp" | "declined";

type SetupDialogProps = {
  open: boolean;
  onClose: () => void;
  onStart: (input: StartInput) => void;
};

export function SetupDialog({ open, onClose, onStart }: SetupDialogProps) {
  const [step, setStep] = useState<Step>("consent");
  const [mode, setMode] = useState<Mode | null>(null);
  const [alone, setAlone] = useState<"yes" | "no" | null>(null);
  const [declineMsg, setDeclineMsg] = useState("");

  const close = () => {
    onClose();
    // Reset after the close animation frame so the next open starts fresh.
    setTimeout(() => {
      setStep("consent");
      setMode(null);
      setAlone(null);
    }, 0);
  };

  const total = mode === "proxy" ? 4 : 3;
  const position: Partial<Record<Step, number>> = { consent: 1, mode: 2, private: 3, proxy: 3, otp: 4 };

  const titles: Record<Step, string> = {
    consent: "Before you begin",
    notnow: "No problem",
    mode: "Who is answering?",
    private: "One quick check",
    proxy: "Who are you answering for?",
    otp: "Enter verification code",
    declined: "Check-in not started",
  };

  return (
    <EwsDialog open={open} onClose={close} title={titles[step]}>
      {position[step] && <StepBar current={position[step]!} total={step === "consent" ? 3 : total} />}

      {step === "consent" && (
        <ConsentStep
          onAgree={() => {
            recordConsent("ews-check-in", CONSENT_ITEMS);
            setStep("mode");
          }}
          onNotNow={() => setStep("notnow")}
        />
      )}

      {step === "notnow" && (
        <Message
          text="That’s fine. You can still use Serve Saathi’s helpline, guides and directory. You can take the check-in any time from Home."
          action={<Button onClick={close} fullWidth>Back to Home</Button>}
        />
      )}

      {step === "mode" && (
        <fieldset className="flex flex-col gap-4">
          <legend className="pb-4 text-[18px] leading-7 font-semibold text-text-primary">Who is answering today?</legend>
          {(
            [
              ["self", "I am answering myself"],
              ["assisted", "I’m answering, someone is helping me read or tap"],
              ["proxy", "I’m a family member answering for someone"],
            ] as [Mode, string][]
          ).map(([value, label]) => (
            <ChoiceCard key={value} name="ews-mode" value={value} label={label} checked={mode === value} onSelect={(v) => setMode(v as Mode)} />
          ))}
          <Actions
            onBack={() => setStep("consent")}
            continueDisabled={!mode}
            onContinue={() => {
              if (mode === "self") setStep("private");
              else if (mode === "proxy") setStep("proxy");
              // Assisted: private items are skipped (the helper may be the
              // source of harm); the elder is offered them privately later.
              else onStart({ mode: "assisted", privateConfirmed: false });
            }}
          />
        </fieldset>
      )}

      {step === "private" && (
        <fieldset className="flex flex-col gap-4">
          <legend className="pb-4 text-[18px] leading-7 font-semibold text-text-primary">
            A few questions later are personal. Are you answering on your own right now?
          </legend>
          <ChoiceCard name="ews-alone" value="yes" label="Yes, I am on my own" checked={alone === "yes"} onSelect={() => setAlone("yes")} />
          <ChoiceCard name="ews-alone" value="no" label="No, someone is with me" checked={alone === "no"} onSelect={() => setAlone("no")} />
          <Actions
            onBack={() => setStep("mode")}
            continueDisabled={!alone}
            continueLabel="Start check-in"
            onContinue={() => onStart({ mode: "self", privateConfirmed: alone === "yes" })}
          />
        </fieldset>
      )}

      {(step === "proxy" || step === "otp") && (
        <ProxySteps
          step={step}
          onBack={() => setStep(step === "otp" ? "proxy" : "mode")}
          onSent={() => setStep("otp")}
          onAgreed={(proxy) => onStart({ mode: "proxy", privateConfirmed: false, proxy })}
          onDeclined={(msg) => {
            setDeclineMsg(msg);
            setStep("declined");
          }}
        />
      )}

      {step === "declined" && (
        <Message
          text={declineMsg}
          action={
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button variant="secondary" fullWidth href="tel:14567">
                Call Elderline 14567
              </Button>
              <Button fullWidth onClick={close}>
                Back to Home
              </Button>
            </div>
          }
        />
      )}
    </EwsDialog>
  );
}

function ConsentStep({ onAgree, onNotNow }: { onAgree: () => void; onNotNow: () => void }) {
  return (
    <div className="flex flex-col gap-4 text-[18px] leading-7 text-text-secondary">
      {/* Spec G, Layer 1 — verbatim. */}
      <p>
        The Elder Well-being Score asks about <strong className="text-text-primary">26 short questions</strong> about daily life,
        health habits, feelings, home, and money matters. It takes about <strong className="text-text-primary">10 minutes</strong>.
      </p>
      <p>
        <strong className="text-text-primary">Why:</strong> to show which areas are going well and where support might help, and to
        suggest next steps. <strong className="text-text-primary">It is not a medical test or diagnosis.</strong>
      </p>
      <p>
        <strong className="text-text-primary">Who sees it:</strong> only you. Family members see it only if you choose to share. Our
        support team sees only what they need to help you if you ask.
      </p>
      <p>
        <strong className="text-text-primary">It’s your choice:</strong> you can skip questions, stop anytime, and delete your answers
        later. Not taking it won’t affect anything else in Serve Saathi.
      </p>
      {/* Layer 2 — "Read more". */}
      <details className="rounded-card bg-bg-base px-4 py-3 text-[16px] leading-[22px]">
        <summary className="cursor-pointer font-semibold text-primary">Read more</summary>
        <ul className="mt-2 list-disc pl-5">
          <li>Answers are kept for 24 months (or 30 days if you turn off history).</li>
          <li>You can withdraw any time from Settings — family access stops immediately.</li>
          <li>You can contact our Grievance Officer from Help.</li>
          <li>You can nominate someone to act for you.</li>
          <li>
            Full{" "}
            <Link href="/privacy" className="font-semibold text-primary underline">
              Privacy Notice
            </Link>
            .
          </li>
        </ul>
      </details>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
        <Button fullWidth onClick={onAgree}>
          I agree, let’s begin
        </Button>
        <Button fullWidth variant="secondary" onClick={onNotNow}>
          Not now
        </Button>
      </div>
    </div>
  );
}

function ProxySteps({
  step,
  onBack,
  onSent,
  onAgreed,
  onDeclined,
}: {
  step: "proxy" | "otp";
  onBack: () => void;
  onSent: () => void;
  onAgreed: (proxy: NonNullable<StartInput["proxy"]>) => void;
  onDeclined: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "relationship" | "phone" | "consent" | "otp", string>>>({});
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const elder = name.trim() || "them";
  const digits = phone.replace(/\D/g, "");

  if (step === "proxy") {
    return (
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const errs: typeof errors = {};
          if (!name.trim()) errs.name = "Enter their name.";
          if (!relationship) errs.relationship = "Choose how you’re related.";
          if (digits.length !== 10) errs.phone = "Enter their 10-digit mobile number.";
          if (!consent) errs.consent = "Please agree before we send the code.";
          setErrors(errs);
          if (Object.keys(errs).length) return;
          recordConsent("ews-check-in", ["Their name", "Their mobile number", "Your relationship to them"]);
          setOtp("");
          setSeconds(RESEND_SECONDS);
          onSent();
        }}
      >
        <p className="text-[18px] leading-7 text-text-secondary">
          We need their permission first. We’ll send a code to their phone — ask them to share it with you.
        </p>
        <TextInput label="Their name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="off" />
        <Select
          label="You are their…"
          placeholder="Select relationship"
          options={RELATIONSHIPS}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          error={errors.relationship}
        />
        <PhoneInput label="Their mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
        <ConsentNotice
          dataItems={["Their name", "Their mobile number", "Your relationship to them"]}
          purpose="ask them for permission by text message, and label the results as answered by you"
          checked={consent}
          onChange={setConsent}
          error={errors.consent}
        />
        <Actions onBack={onBack} continueLabel="Send code" submit />
      </form>
    );
  }

  const masked = `+91-${digits.slice(0, 2)}****${digits.slice(-2)}`;
  const proxy = (consentMethod: "otp_elder" | "assisted_confirm") => ({ elderName: name.trim(), relationship, consentMethod });

  return (
    <form
      className="flex flex-col items-center gap-6 text-center"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (otp !== DEMO_OTP) {
          setErrors({ otp: `That code doesn’t match. Please check with ${elder}.` });
          return;
        }
        onAgreed(proxy("otp_elder"));
      }}
    >
      <p className="text-[18px] leading-7 text-text-secondary">
        The code has been sent to {elder}’s mobile
        <br />
        <strong className="text-text-strong">{masked}</strong>
      </p>
      <OtpInput length={4} value={otp} onChange={setOtp} error={Boolean(errors.otp)} autoFocus ariaLabel="Verification code" />
      {errors.otp && <p className="text-[16px] leading-[22px] text-error">{errors.otp}</p>}
      <p className="text-[14px] leading-5 text-text-muted">Demo code: {DEMO_OTP}</p>
      <Button type="submit" fullWidth disabled={otp.length < 4}>
        Continue
      </Button>
      <p className="text-[18px] leading-7 text-text-secondary">
        Didn’t receive the code?{" "}
        {seconds > 0 ? (
          <strong>Resend in 00:{String(seconds).padStart(2, "0")}</strong>
        ) : (
          <button type="button" className="font-semibold text-primary underline" onClick={() => setSeconds(RESEND_SECONDS)}>
            Resend
          </button>
        )}
      </p>
      <div className="flex w-full flex-col gap-2 border-t-[1.5px] border-border-hairline pt-4">
        <Button type="button" variant="light" fullWidth onClick={() => onAgreed(proxy("assisted_confirm"))}>
          {elder} will confirm here
        </Button>
        <Button
          type="button"
          variant="hyperlink"
          onClick={() => onDeclined(`${elder} has chosen not to do the check-in right now. That’s their choice.`)}
        >
          {elder} says no
        </Button>
        <Button
          type="button"
          variant="hyperlink"
          onClick={() =>
            onDeclined(`We can only do this check-in with ${elder}’s agreement or a legal guardian’s. Our helpline can guide you.`)
          }
        >
          {elder} can’t make this decision
        </Button>
        <Button type="button" variant="hyperlink" onClick={onBack}>
          Change details
        </Button>
      </div>
    </form>
  );
}

function Actions({
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = "Continue",
  submit,
}: {
  onBack: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  submit?: boolean;
}) {
  return (
    <div className="flex gap-4 pt-6 sm:gap-6">
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={onBack}
        leftIcon={<Image src="/icons/ews/arrow-left-white.svg" alt="" width={24} height={24} />}
      >
        Back
      </Button>
      <Button type={submit ? "submit" : "button"} fullWidth disabled={continueDisabled} onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}

function Message({ text, action }: { text: string; action: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-[18px] leading-7 text-text-secondary">{text}</p>
      {action}
    </div>
  );
}

export default SetupDialog;
