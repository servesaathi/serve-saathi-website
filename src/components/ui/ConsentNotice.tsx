"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { GRIEVANCE_EMAIL } from "@/lib/consent";

// DPDP Act 2023 notice-at-collection + explicit consent checkbox. Rendered on
// every form that asks for personal data (see src/lib/consent.ts). The notice
// itemises the data, states the purpose, and tells the person how to exercise
// their rights / withdraw consent / complain to the Data Protection Board —
// the checkbox is never pre-ticked and the form must block submit until it is.
//
// Visual: same orange square checkbox as the Explore Services filter pills
// (Figma 3316:43526), on a bg-orange tinted notice card.

type ConsentNoticeProps = {
  /** Itemised personal data this form collects, e.g. ["Mobile number"]. */
  dataItems: string[];
  /** Plain-language reason, completing "We use it to …". */
  purpose: string;
  /** Who else receives it, if anyone, completing "Shared with …". */
  sharedWith?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
};

export function ConsentNotice({
  dataItems,
  purpose,
  sharedWith,
  checked,
  onChange,
  error,
  className = "",
}: ConsentNoticeProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const noticeId = `${id}-notice`;

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      <section
        id={noticeId}
        aria-label="Privacy notice"
        className="flex flex-col gap-2 rounded-card border border-orange-line bg-bg-orange p-4 text-[14px] leading-5 text-text-secondary"
      >
        <p className="text-[16px] leading-[22px] font-semibold text-text-primary">How we use your details</p>
        <p>
          <span className="font-semibold text-text-strong">We collect: </span>
          {dataItems.join(", ")}.
        </p>
        <p>
          <span className="font-semibold text-text-strong">We use it to </span>
          {purpose}
        </p>
        {sharedWith && (
          <p>
            <span className="font-semibold text-text-strong">Shared with </span>
            {sharedWith}
          </p>
        )}
        <p>
          We keep it only as long as this purpose needs, or as the law requires. You can access, correct or
          erase your data, or withdraw this consent at any time (it&apos;s as easy as giving it), by writing to{" "}
          <a href={`mailto:${GRIEVANCE_EMAIL}`} className="font-semibold text-primary underline">
            {GRIEVANCE_EMAIL}
          </a>
          . If we don&apos;t resolve a complaint, you can approach the Data Protection Board of India.
        </p>
      </section>

      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={`${noticeId}${error ? ` ${errorId}` : ""}`}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[4px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
            checked ? "bg-tertiary" : `border-[1.5px] bg-bg-base ${error ? "border-error" : "border-tertiary"}`
          }`}
        >
          {checked && <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={12} height={12} />}
        </span>
        <span className="text-[16px] leading-[22px] text-text-primary">
          I have read this notice and agree to ServeSaathi&apos;s{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-primary underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-primary underline">
            Privacy Notice
          </Link>
          . I consent to my details above being used for this purpose.
        </span>
      </label>

      {error && (
        <p id={errorId} role="alert" className="text-[13px] leading-[17px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default ConsentNotice;
