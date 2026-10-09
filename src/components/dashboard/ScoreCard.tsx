"use client";

import Image from "next/image";
import Link from "next/link";
import { START_HREF } from "@/components/ews/StartCheckInButtons";
import { relativeDay } from "@/components/ews/OverallScoreCard";
import { Button } from "@/components/ui/Button";
import { headline, overallShort } from "@/lib/ews/flow";
import { DIMS } from "@/lib/ews/questionnaire";
import { useEws } from "@/lib/ews/useEws";

// "Wellbeing Score / Sample Report" — Figma node 3344:339432, on /dashboard.
// Reads the signed-in user's latest EWS result (ewsService — localStorage
// until GET /ews/results/latest exists). With no result it says so and offers
// the check-in, instead of showing the design's sample "68".
export function ScoreCard() {
  const ews = useEws();
  const latest = ews.status === "ready" ? ews.latest : null;
  const draft = ews.status === "ready" ? ews.draft : null;
  const result = latest?.result;

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-card bg-bg-base px-6 pt-4 pb-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <p className="font-serif text-[24px] leading-8 text-text-secondary">Your Overall Score</p>
        {latest?.completedOn && (
          <p className="text-[16px] leading-5 text-text-tertiary italic">Last assessed {relativeDay(latest.completedOn)}</p>
        )}
      </div>

      {ews.status === "loading" ? (
        <div className="min-h-[180px]" aria-busy="true" />
      ) : result ? (
        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center">
            <Image src="/icons/ews/radial-chart.svg" alt="" width={132} height={132} />
            <p className="text-[16px] leading-[22px] font-semibold text-tertiary">
              {result.internal != null ? `${result.internal} out of 100` : "Not enough answers"}
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[24px] leading-8 font-semibold text-tertiary">{overallShort(result)}</p>
            <p className="text-[16px] leading-5 text-text-secondary">{headline(result, latest.proxy?.relationship)}</p>
            <div className="flex items-start gap-4 pt-4">
              <Link
                href="/elder-wellbeing-score/plan"
                className="flex h-12 flex-1 items-center justify-center rounded-control border-[1.35px] border-border-card bg-border-hairline px-4 text-[16px] font-semibold text-primary-pressed"
              >
                View Care Plan
              </Link>
              <Link
                href="/elder-wellbeing-score"
                className="flex h-12 flex-1 items-center justify-center rounded-control bg-secondary px-4 text-[16px] font-semibold text-white"
              >
                See details
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-[24px] leading-8 font-semibold text-tertiary">You don’t have a scorecard yet</p>
          <p className="text-[16px] leading-[22px] text-text-secondary">
            A simple 10-minute check-in about daily life, home, health habits and more. It shows which areas are going well and
            where support might help. It is not a medical test.
          </p>
          {draft ? (
            <>
              <Button href="/elder-wellbeing-score/check-in">Continue my check-in</Button>
              <p className="text-[14px] leading-5 text-text-tertiary">
                {Math.min(draft.progress.dimIdx, DIMS.length)} of {DIMS.length} areas done · saved for 7 days
              </p>
            </>
          ) : (
            <Button href={START_HREF}>Start my check-in</Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ScoreCard;
