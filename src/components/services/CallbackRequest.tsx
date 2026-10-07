"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { TextInput } from "@/components/ui/TextInput";
import { recordConsent, type ConsentRecord } from "@/lib/consent";
import { useHydrated } from "@/lib/useHydrated";
import useAuthStore from "@/store/auth.store";
import { directionsUrl, type Provider } from "./data";

// "Request a Callback" — adapted from Figma "02c ... Service Detail
// (Booking)" (3337:170357) with the booking-only parts removed (proceed
// options, exact time slots, payment): ServeSaathi only passes the request on
// to the provider, who calls the family back. On submit it shows
// "Request Received" (3341:171763).
//
// DPDP: collects only what a callback needs (name, mobile, a preferred day +
// time window, optional notes) and blocks submit until the consent box is
// ticked. TODO(backend): no callback-request endpoint exists yet — requests
// are kept in localStorage (`servesaathi-callback-requests`), consent record
// included, until one does.

const WINDOWS = [
  { value: "morning", label: "Morning (9–12)" },
  { value: "afternoon", label: "Afternoon (12–4)" },
  { value: "evening", label: "Evening (4–7)" },
] as const;
type TimeWindow = (typeof WINDOWS)[number]["value"];

const DATA_ITEMS = ["Your name", "Mobile number", "Preferred day and time to be called", "Any notes you add"];

type Errors = Partial<Record<"name" | "phone" | "consent", string>>;

type Submitted = {
  day: Date;
  timeWindow: TimeWindow;
  notes: string;
  submittedAt: Date;
};

function nextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => new Date(today.getTime() + i * 86_400_000));
}

const fmtDay = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const windowLabel = (w: TimeWindow) => WINDOWS.find((x) => x.value === w)!.label;

function ProviderHeading({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center gap-1.5 self-start rounded-card border-[1.5px] border-border-hairline bg-border-hairline px-2 py-1 text-[18px] leading-7 font-semibold text-primary">
        <Image src="/icons/services/verified.svg" alt="" width={24} height={24} />
        Verified Partner
      </span>
      <p className="font-serif text-[36px] leading-[44px] text-text-primary sm:text-[54px] sm:leading-[60px]">
        {provider.name}
      </p>
    </div>
  );
}

export function CallbackRequest({ provider }: { provider: Provider }) {
  // Dates ("today" + the next 6 days) and the signed-in prefill both come
  // from the browser, so mount the form only after hydration.
  const hydrated = useHydrated();
  return hydrated ? <CallbackForm provider={provider} /> : <div className="min-h-[60vh]" aria-busy />;
}

function CallbackForm({ provider }: { provider: Provider }) {
  // Signed-in (phone already OTP-verified): prefill from the account, still editable.
  const user = useAuthStore((s) => s.user);
  const [days] = useState(() => nextDays(7));
  const [name, setName] = useState(() => (user ? `${user.firstName} ${user.lastName}`.trim() : ""));
  const [phone, setPhone] = useState(() => (user?.phone ?? "").replace(/^\+91/, ""));
  const [dayIndex, setDayIndex] = useState(0);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("morning");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    const found: Errors = {};
    if (!name.trim()) found.name = "Enter your name so the provider knows who to ask for.";
    if (digits.length !== 10) found.phone = "Enter a valid 10-digit mobile number.";
    if (!consent) found.consent = "Please read the notice above and tick the box to continue.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const consentRecord: ConsentRecord = recordConsent("callback-request", DATA_ITEMS);
    const result: Submitted = { day: days[dayIndex], timeWindow, notes: notes.trim(), submittedAt: new Date() };
    try {
      const key = "servesaathi-callback-requests";
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      localStorage.setItem(
        key,
        JSON.stringify([
          ...existing,
          {
            providerId: provider.id,
            name: name.trim(),
            phone: `+91${digits}`,
            preferredDay: result.day.toISOString(),
            timeWindow,
            notes: result.notes,
            submittedAt: result.submittedAt.toISOString(),
            consent: consentRecord,
          },
        ])
      );
    } catch {
      // Storage unavailable — still show the confirmation; nothing else depends on it.
    }
    setSubmitting(false);
    setSubmitted(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) return <RequestReceived provider={provider} request={submitted} />;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10 pt-10 pb-16">
      <ProviderHeading provider={provider} />

      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] leading-8 font-semibold text-text-primary">Request a Callback</h1>
        <p className="text-[18px] leading-7 text-text-secondary">
          Tell us when suits you and {provider.name} will call you back. ServeSaathi doesn&apos;t take bookings or
          payments — you decide everything directly with the provider.
        </p>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="pb-4 text-[22px] leading-[30px] font-semibold text-text-primary">Your details</legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextInput
            label="Full name"
            autoComplete="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
            error={errors.name}
          />
          <PhoneInput
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors((x) => ({ ...x, phone: undefined }));
            }}
            autoComplete="tel-national"
            maxLength={12}
            error={errors.phone}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="pb-4 text-[22px] leading-[30px] font-semibold text-text-primary">
          Preferred day — {days[dayIndex].toLocaleDateString("en-IN", { month: "long" })}
        </legend>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {days.map((d, i) => {
            const selected = i === dayIndex;
            return (
              <label
                key={d.toISOString()}
                className={`flex cursor-pointer flex-col items-center rounded-control border-[1.5px] py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                  selected ? "border-tertiary bg-bg-orange" : "border-border-hairline bg-bg-base"
                }`}
              >
                <input
                  type="radio"
                  name="day"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setDayIndex(i)}
                  aria-label={fmtDay(d)}
                />
                <span className="text-[18px] leading-7 text-text-primary">{d.getDate()}</span>
                <span className="text-[14px] leading-5 text-text-tertiary uppercase">
                  {i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4">
        <h2 className="text-[22px] leading-[30px] font-semibold text-text-primary">Preferred time to be called</h2>
        <SegmentedTabs<TimeWindow>
          ariaLabel="Preferred time to be called"
          options={WINDOWS.map((w) => ({ value: w.value, label: w.label }))}
          value={timeWindow}
          onChange={setTimeWindow}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="callback-notes" className="text-[16px] leading-[22px] font-semibold text-text-primary">
          Additional Notes <span className="font-normal text-text-tertiary">(optional)</span>
        </label>
        <textarea
          id="callback-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific requirement or questions"
          className="w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <p className="text-[13px] leading-[17px] text-text-tertiary">
          Please don&apos;t include medical records here — share those directly with the provider if they ask.
        </p>
      </div>

      <ConsentNotice
        dataItems={DATA_ITEMS}
        purpose={`pass your request to ${provider.name} so they can call you back about care options.`}
        sharedWith={`${provider.name} only, for this callback. Once they contact you, they handle your details under their own privacy policy.`}
        checked={consent}
        onChange={(v) => {
          setConsent(v);
          setErrors((x) => ({ ...x, consent: undefined }));
        }}
        error={errors.consent}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Button variant="secondary" href={`/services/${provider.id}`} className="flex-1">
          Back
        </Button>
        <Button type="submit" loading={submitting} className="flex-1">
          Send Request
        </Button>
      </div>
    </form>
  );
}

function InfoField({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-4 py-2.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border-hairline">
        <Image src={icon} alt="" width={28} height={28} />
      </span>
      <div className="flex flex-col gap-0.5 text-[18px] leading-7">
        <p className="font-semibold text-text-primary">{title}</p>
        {children}
      </div>
    </div>
  );
}

function RequestReceived({ provider, request }: { provider: Provider; request: Submitted }) {
  const steps = [
    { title: "Request Submitted", done: true },
    { title: "Verified by Team", done: false },
    { title: "Callback Scheduled", detail: windowLabel(request.timeWindow), done: false },
    { title: "Provider Calls You", detail: fmtDay(request.day), done: false },
    { title: "Follow-up", detail: "Pending", done: false },
  ];

  return (
    <div className="flex flex-col gap-12 pt-10 pb-16" role="status" aria-live="polite">
      <div className="flex flex-col">
        <div className="flex flex-col gap-1 rounded-t-card bg-bg-base px-6 py-6 sm:px-10">
          <h1 className="text-[24px] leading-8 text-text-secondary">Request Received</h1>
          <p className="text-[18px] leading-7 text-text-muted">
            We&apos;re passing your request to {provider.name}. They&apos;ll call you on your chosen day.
          </p>
        </div>
        <p className="rounded-b-card bg-[#1c4b1e] px-4 py-1.5 text-center text-[16px] leading-5 text-white">
          Care Facilities - Assisted Living
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[40px] leading-[48px] text-text-primary">Request Timeline</h2>
        <ol className="relative flex flex-col gap-4 md:flex-row md:justify-between">
          <span aria-hidden className="absolute top-7 right-14 left-14 hidden h-[3px] bg-border-card md:block" />
          {steps.map((s) => (
            <li key={s.title} className="relative flex flex-row items-start gap-4 px-4 py-2 md:flex-col">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  s.done ? "bg-orange-line" : "bg-border-hairline"
                }`}
              >
                <Image src={s.done ? "/icons/services/step-done.svg" : "/icons/services/step-pending.svg"} alt="" width={28} height={28} />
              </span>
              <div className="flex flex-col gap-0.5 text-[18px] leading-7 text-text-secondary">
                <p className="font-semibold">
                  {s.title}
                  <span className="sr-only">{s.done ? " — done" : " — upcoming"}</span>
                </p>
                {s.detail && <p>{s.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4 py-6">
        <h2 className="text-[26px] leading-[34px] font-semibold text-text-primary">Active Request Info</h2>
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-3">
          <InfoField icon="/icons/services/info-location.svg" title="Location">
            <p className="text-text-secondary">{provider.name}</p>
            <p className="max-w-[240px] text-text-muted">{provider.address}</p>
            <a
              href={directionsUrl(provider.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[16px] leading-[22px] font-semibold text-tertiary hover:underline"
            >
              <Image src="/icons/services/directions.svg" alt="" width={24} height={24} />
              Get Directions
            </a>
          </InfoField>
          <InfoField icon="/icons/services/info-calendar.svg" title="Date & Time">
            <p className="text-text-secondary">{fmtDay(request.day)}</p>
            <p className="text-tertiary">{windowLabel(request.timeWindow)}</p>
          </InfoField>
          <InfoField icon="/icons/services/info-notes.svg" title="Notes">
            <p className="text-text-secondary">{request.notes || "NA"}</p>
          </InfoField>
          <InfoField icon="/icons/services/info-phone.svg" title="Method">
            <p className="text-text-secondary">Request Callback</p>
          </InfoField>
          <InfoField icon="/icons/services/info-clock.svg" title="Submitted">
            <p className="text-text-secondary">
              {request.submittedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </p>
          </InfoField>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Button variant="secondary" href={`/services/${provider.id}`} className="flex-1">
          Back to {provider.name}
        </Button>
        <Button href="/services" className="flex-1">
          Explore more providers
        </Button>
      </div>

      <p className="text-[14px] leading-5 text-text-tertiary">
        Changed your mind? Write to us via the{" "}
        <Link href="/privacy" className="font-semibold text-primary underline">
          Privacy Notice
        </Link>{" "}
        contacts to withdraw this request and have your details deleted.
      </p>
    </div>
  );
}

export default CallbackRequest;
