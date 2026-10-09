"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SafetyEvent, SafetyUserAction } from "@/lib/ews/ewsService";
import { CALLBACK_HOURS, NOT_EMERGENCY, SAFETY, type Mode } from "@/lib/ews/questionnaire";
import { CallbackDialog } from "./CallbackDialog";
import { EwsDialog } from "./EwsDialog";

// Safety & escalation card (spec E). No Figma frame exists for it, so it uses
// the EWS pop-up shell. Copy comes verbatim from SAFETY — never generated.
//   Tier 1: interrupts the check-in immediately, can't be dismissed without
//           acknowledging, tap-to-call buttons, "not an emergency service".
//   Tier 2: shown at the end of the area, offers a business-hours callback
//           and (unless S1/S6) an opt-in "share this with family".
//   Tier 3: gentle support numbers.
// Only the trigger id, tier, time, mode and the button pressed are stored.

type SafetyDialogProps = {
  event: SafetyEvent | null;
  mode: Mode;
  /** "results": re-opened from the results screen, so no stop/continue flow. */
  context: "check-in" | "results";
  onAction: (action: SafetyUserAction) => void;
  onToggleShare?: (share: boolean) => void;
  onContinue: () => void;
  onStopForNow?: () => void;
  onQuickExit?: () => void;
};

export function SafetyDialog({ event, mode, context, onAction, onToggleShare, onContinue, onStopForNow, onQuickExit }: SafetyDialogProps) {
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const card = event ? SAFETY[event.id] : null;

  const done = () => {
    setNotice(null);
    onContinue();
  };

  return (
    <>
      <EwsDialog
        open={Boolean(event) && !callbackOpen}
        onClose={done}
        dismissible={card?.tier !== 1}
        ariaLabel={card?.tier === 1 ? "Please read: support information" : "Support information"}
      >
        {event && card && (
          <div role="alert" className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <span
                className={`rounded-full px-4 py-1 text-[16px] leading-[22px] font-semibold ${
                  card.tier === 1 ? "bg-error-light text-error" : card.tier === 2 ? "bg-orange-line text-[#994613]" : "bg-border-hairline text-primary"
                }`}
              >
                {card.tier === 1 ? "◆ Please read" : card.tier === 2 ? "▲ Worth following up" : "Support numbers"}
              </span>
              {card.quickExit && onQuickExit && (
                <Button
                  variant="light"
                  onClick={() => {
                    onAction("exited");
                    onQuickExit();
                  }}
                >
                  ✕ Quick exit
                </Button>
              )}
            </div>

            <p className="text-[20px] leading-[30px] text-text-primary">{card.msg}</p>

            <div className="flex flex-col gap-3">
              {(card.buttons ?? [])
                // Proxy mode: the family member is already the support person.
                .filter((b) => !(b.kind === "notify" && mode === "proxy"))
                .filter((b) => !(b.kind === "continue_later" && context === "results"))
                .map((b) => {
                  if (b.kind === "call") {
                    return (
                      <Button key={b.label} href={`tel:${b.number}`} variant="tertiary" fullWidth onClick={() => onAction("called_number")}>
                        {b.label}
                      </Button>
                    );
                  }
                  if (b.kind === "notify") {
                    return (
                      <Button
                        key={b.label}
                        variant="light"
                        fullWidth
                        onClick={() => {
                          onAction("notified_contact");
                          // TODO(backend): trusted contacts (spec G, P4) don't
                          // exist yet — say so honestly instead of pretending a
                          // message went out.
                          setNotice("You haven’t added a trusted contact yet, so we couldn’t let anyone know. Please call them directly, or use one of the numbers above.");
                        }}
                      >
                        {b.label}
                      </Button>
                    );
                  }
                  if (b.kind === "callback") {
                    return (
                      <Button key={b.label} variant="light" fullWidth onClick={() => setCallbackOpen(true)}>
                        {b.label}
                      </Button>
                    );
                  }
                  return (
                    <Button key={b.label} variant="light" fullWidth onClick={onStopForNow}>
                      {b.label}
                    </Button>
                  );
                })}

              {card.tier === 2 && (
                <>
                  <Button variant="light" fullWidth onClick={() => setCallbackOpen(true)}>
                    Request a callback
                  </Button>
                  <p className="text-[16px] leading-[22px] text-text-tertiary">{CALLBACK_HOURS} (within 2 working days)</p>
                  {!card.hideFamily && onToggleShare && (
                    <label className="flex cursor-pointer items-center gap-3 text-[18px] leading-7 text-text-secondary">
                      <input
                        type="checkbox"
                        checked={event.share}
                        onChange={(e) => onToggleShare(e.target.checked)}
                        className="size-6 accent-primary"
                      />
                      Share this with family
                    </label>
                  )}
                </>
              )}
            </div>

            {notice && (
              <p role="status" className="rounded-card bg-bg-orange px-4 py-3 text-[16px] leading-[22px] text-text-secondary">
                {notice}
              </p>
            )}

            {card.tier === 1 && <p className="text-[16px] leading-[22px] font-semibold text-text-tertiary">{NOT_EMERGENCY}</p>}

            <div className="flex flex-col gap-3 border-t-[1.5px] border-border-hairline pt-5">
              <Button fullWidth onClick={done}>
                {context === "results" ? "Back to results" : "I understand – Continue"}
              </Button>
              {card.tier === 1 && context === "check-in" && onStopForNow && !card.buttons?.some((b) => b.kind === "continue_later") && (
                <Button variant="hyperlink" onClick={onStopForNow}>
                  Stop for now
                </Button>
              )}
            </div>
          </div>
        )}
      </EwsDialog>

      {event && card && (
        <CallbackDialog
          open={callbackOpen}
          onClose={() => setCallbackOpen(false)}
          onRequested={() => onAction("callback_requested")}
          category={card.tier === 1 ? "safety_tier1" : "safety_tier2"}
          safetyEventKey={event.key}
          isPrivate={card.buttons?.some((b) => b.kind === "callback" && b.private)}
        />
      )}
    </>
  );
}

export default SafetyDialog;
