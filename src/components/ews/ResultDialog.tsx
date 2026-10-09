"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Assessment } from "@/lib/ews/ewsService";
import { headline, overallShort } from "@/lib/ews/flow";
import { EwsDialog } from "./EwsDialog";

// Shown once the last answer is in — Figma "Full Welbeing Score - Pop up"
// (3344:322339): serif title, the smiling-flower illustration, a band chip,
// one line of copy and a single CTA. The design's "LOW RISK" chip becomes the
// spec's overall band words (spec F bans "risk" language), and "Unlock to view
// full assessment score" becomes a plain link to the dashboard — nothing is
// locked or paid.

export const OVERALL_TONE = {
  going_well: "bg-border-hairline text-primary",
  mostly_one: "bg-border-hairline text-primary",
  some_support: "bg-orange-line text-[#994613]",
  several_support: "bg-orange-line text-[#994613]",
  insufficient: "bg-bg-base text-text-tertiary",
} as const;

type ResultDialogProps = {
  assessment: Assessment | null;
  onView: () => void;
};

export function ResultDialog({ assessment, onView }: ResultDialogProps) {
  const result = assessment?.result;
  return (
    <EwsDialog open={Boolean(result)} onClose={onView} title="Here’s your wellbeing picture" titleSize="lg" dismissible={false}>
      {result && (
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Image src="/icons/ews/estimate-flower.svg" alt="" width={119} height={119} />
            <p className={`rounded-full px-[34px] py-2 text-[18px] leading-7 font-semibold ${OVERALL_TONE[result.display]}`}>
              {overallShort(result)}
            </p>
            <p className="text-[18px] leading-7 text-text-secondary">
              {headline(result, assessment.proxy?.relationship)} This is a check-in, not a medical test.
            </p>
          </div>
          <Button fullWidth onClick={onView}>
            View my wellbeing overview
          </Button>
        </div>
      )}
    </EwsDialog>
  );
}

export default ResultDialog;
