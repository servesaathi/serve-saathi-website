"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { DIMS } from "@/lib/ews/questionnaire";
import { useEws } from "@/lib/ews/useEws";

// CTAs on the Elder Wellbeing Score page (Hero + closing CTA), previously
// inert. Signed out → log in first, then come back with the setup pop-up
// open. Signed in → open the set-up pop-up (?start=1, handled by EwsHome).
// An unfinished check-in turns the primary CTA into "Continue my check-in".
// Figma's "Take 2-min quick check" label isn't used: the spec check-in takes
// about 10 minutes, and promising 2 to this audience would mislead.

export const START_HREF = "/elder-wellbeing-score?start=1";

export function StartCheckInButtons() {
  const ews = useEws();
  const signedOut = ews.status === "signed_out";
  const startHref = signedOut ? `/login?next=${encodeURIComponent(START_HREF)}` : START_HREF;
  const draft = ews.status === "ready" ? ews.draft : null;
  const arrow = <Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />;

  if (draft) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/elder-wellbeing-score/check-in" rightIcon={arrow}>
            Continue my check-in
          </Button>
          <Button href={START_HREF} variant="secondary">
            Start again
          </Button>
        </div>
        <p className="text-[16px] leading-[22px] text-text-tertiary">
          {Math.min(draft.progress.dimIdx, DIMS.length)} of {DIMS.length} areas done · saved for 7 days
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button href={startHref} rightIcon={arrow}>
        Start my check-in
      </Button>
      <Button href="#sample-report" variant="secondary">
        See a sample report
      </Button>
    </div>
  );
}

export default StartCheckInButtons;
