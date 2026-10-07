"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GRIEVANCE_EMAIL } from "@/lib/consent";

// DPDP Act 2023 consent, as a layered notice: the form shows one compact
// checkbox line; the full notice (itemised data, purpose, sharing, rights,
// grievance route) opens in a dialog. Ticking the box *opens the notice
// first* — consent is only recorded when the person presses "I agree" in it,
// so nobody can consent without the notice having been put in front of them.
// Un-ticking is immediate (withdrawal must be as easy as giving consent).
// The box is never pre-ticked and the form must block submit until it is.

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

export function ConsentNotice({ dataItems, purpose, sharedWith, checked, onChange, error, className = "" }: ConsentNoticeProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          // Ticking opens the notice; consent is given from the dialog's "I agree".
          onChange={(e) => (e.target.checked ? setOpen(true) : onChange(false))}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          aria-hidden
          className={`mt-px flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
            checked ? "bg-tertiary" : `border-[1.5px] bg-bg-base ${error ? "border-error" : "border-tertiary"}`
          }`}
        >
          {checked && <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={12} height={12} />}
        </label>
        <div className="flex flex-col gap-0.5 text-[15px] leading-[21px] text-text-primary">
          <label htmlFor={id} className="cursor-pointer">
            I agree to ServeSaathi&apos;s Terms and Privacy Notice, and consent to my details being used for this purpose.
          </label>
          <span id={hintId} className="sr-only">
            {checked ? "Untick to withdraw consent." : "Ticking opens the privacy notice so you can read it and confirm."}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="self-start rounded-control font-semibold text-primary underline underline-offset-2 hover:text-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Read how we use your details
          </button>
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="pl-9 text-[13px] leading-[17px] text-error">
          {error}
        </p>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="How we use your details"
        description="Please read this before you agree."
        size="sm"
        actions={
          checked ? (
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="light" onClick={() => setOpen(false)}>
                Not now
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onChange(true);
                  setOpen(false);
                }}
              >
                I agree
              </Button>
            </>
          )
        }
      >
        <div className="flex flex-col gap-3 text-[16px] leading-[22px] text-text-secondary">
          <p>
            <span className="font-semibold text-text-primary">We collect: </span>
            {dataItems.join(", ")}.
          </p>
          <p>
            <span className="font-semibold text-text-primary">We use it to </span>
            {purpose}
          </p>
          {sharedWith && (
            <p>
              <span className="font-semibold text-text-primary">Shared with </span>
              {sharedWith}
            </p>
          )}
          <p>
            We keep it only as long as this purpose needs, or as the law requires. You can access, correct or erase your data,
            or withdraw this consent at any time (it&apos;s as easy as giving it), by writing to{" "}
            <a href={`mailto:${GRIEVANCE_EMAIL}`} className="font-semibold text-primary underline">
              {GRIEVANCE_EMAIL}
            </a>
            . If we don&apos;t resolve a complaint, you can approach the Data Protection Board of India.
          </p>
          <p>
            Full details:{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-primary underline">
              Terms &amp; Conditions
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-primary underline">
              Privacy Notice
            </Link>{" "}
            <span className="text-text-muted">(open in a new tab)</span>
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default ConsentNotice;
