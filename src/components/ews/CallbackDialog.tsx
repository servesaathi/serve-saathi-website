"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentNotice } from "@/components/ui/ConsentNotice";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { recordConsent } from "@/lib/consent";
import { requestCallback, type CallbackCategory } from "@/lib/ews/ewsService";
import { CALLBACK_HOURS } from "@/lib/ews/questionnaire";
import useAuthStore from "@/store/auth.store";
import { EwsDialog } from "./EwsDialog";

// Helpline callback — Figma "Booking" pop-up (3344:332695) with the booking
// removed: ServeSaathi is discovery-only, so "Reserve" becomes "Request a
// callback" and the "Agents are currently online" line (a promise we can't
// keep) becomes the spec's fixed business-hours copy.
//
// Kept to one decision: the person is signed in and their account already has
// the mobile number they logged in with, so we show it and ask them to
// confirm — "Change" opens a field for a different number. No name field: the
// account name goes with the request. Accounts without a phone (email sign-up)
// get an empty number field. Consent is still a separate tick: a callback is a
// new purpose for that number (DPDP).

const DATA_ITEMS = ["Mobile number", "Your name (from your account)"];

/** "9876543210" → "+91 98765 43210". */
const formatPhone = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
const toDigits = (phone: string | null | undefined) => (phone ?? "").replace(/\D/g, "").slice(-10);

type CallbackDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Called once the request is saved. */
  onRequested?: () => void;
  category: CallbackCategory;
  safetyEventKey?: string;
  dim?: string;
  /** S6: call back only on a number the person confirms is safe. */
  isPrivate?: boolean;
};

export function CallbackDialog({ open, onClose, onRequested, category, safetyEventKey, dim, isPrivate = false }: CallbackDialogProps) {
  const user = useAuthStore((s) => s.user);
  const accountPhone = toDigits(user?.phone);
  const hasAccountPhone = accountPhone.length === 10;

  const [editing, setEditing] = useState(!hasAccountPhone);
  const [phone, setPhone] = useState(hasAccountPhone ? accountPhone : "");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"phone" | "consent", string>>>({});
  const [done, setDone] = useState(false);

  const close = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setEditing(!hasAccountPhone);
      setPhone(hasAccountPhone ? accountPhone : "");
      setErrors({});
    }, 0);
  };

  const digits = toDigits(phone);

  return (
    <EwsDialog open={open} onClose={close} title={done ? "Request received" : "Request a callback"} size="sm">
      {done ? (
        <div className="flex flex-col gap-6 text-center">
          <p className="text-[18px] leading-7 text-text-secondary">
            Thank you. We’ll call you on <strong className="text-text-primary">{formatPhone(digits)}</strong>. {CALLBACK_HOURS} We’ll call
            within 2 working days.
          </p>
          <Button fullWidth onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const errs: typeof errors = {};
            if (digits.length !== 10) errs.phone = "Enter a 10-digit mobile number.";
            if (!consent) errs.consent = "Please agree before we call you.";
            setErrors(errs);
            if (Object.keys(errs).length) {
              if (errs.phone) setEditing(true);
              return;
            }
            recordConsent("callback-request", DATA_ITEMS);
            await requestCallback({
              userId: user ? String(user.id) : "anonymous",
              category,
              safetyEventKey,
              dim,
              name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
              phone: digits,
              private: isPrivate,
            });
            setDone(true);
            onRequested?.();
          }}
        >
          {isPrivate && (
            <p className="text-[18px] leading-7 text-text-secondary">
              Only use a number that is safe for us to call. We won’t tell anyone else you asked.
            </p>
          )}

          {editing ? (
            <PhoneInput
              label={hasAccountPhone ? "Call me on a different number" : "Mobile number to call"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              autoFocus={hasAccountPhone}
            />
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[16px] leading-[22px] text-text-tertiary">We’ll call you on</span>
                <span className="text-[20px] leading-7 font-semibold text-text-primary">{formatPhone(digits)}</span>
              </div>
              <Button type="button" variant="hyperlink" onClick={() => setEditing(true)} aria-label="Change the number to call">
                Change
              </Button>
            </div>
          )}
          {editing && hasAccountPhone && (
            <Button
              type="button"
              variant="hyperlink"
              className="self-start"
              onClick={() => {
                setPhone(accountPhone);
                setEditing(false);
                setErrors((x) => ({ ...x, phone: undefined }));
              }}
            >
              Use {formatPhone(accountPhone)} instead
            </Button>
          )}

          <ConsentNotice
            dataItems={DATA_ITEMS}
            purpose="call you back about the support you asked for"
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          />
          <Button type="submit" fullWidth>
            Request a callback
          </Button>
          <p className="text-center text-[16px] leading-[22px] text-text-tertiary italic">{CALLBACK_HOURS}</p>
        </form>
      )}
    </EwsDialog>
  );
}

export default CallbackDialog;
