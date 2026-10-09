"use client";

import { useState } from "react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { Button } from "@/components/ui/Button";
import { deleteAssessment, type Assessment, type SafetyEvent } from "@/lib/ews/ewsService";
import { optionLabel, questionText } from "@/lib/ews/flow";
import { DISCLAIMER, ITEMS, SAFETY, WHEN_PROFESSIONAL, WHEN_URGENT, type DimId } from "@/lib/ews/questionnaire";
import { AreaList } from "./AreaList";
import { CallbackDialog } from "./CallbackDialog";
import { EwsDialog } from "./EwsDialog";
import { OverallScoreCard } from "./OverallScoreCard";
import { SafetyDialog } from "./SafetyDialog";
import { ScoreTrend } from "./ScoreTrend";

// "03a_Homepage / Elder Wellbieng Score Overview" (3344:305666) and its
// "Overview Expand" state (3344:332779), for a user who has a result.
// Built from Figma's layout with spec F's required content added: safety
// support pinned at the top when a Tier 1/2 card fired, the "not a medical
// test" line with who answered, when-to-get-help sections and the fixed
// disclaimer. Figma's "Specialist add-on assessment" cards (₹749 · Book now)
// are not built — ServeSaathi is discovery-only.

type OverviewProps = {
  userId: string;
  latest: Assessment;
  history: Assessment[];
  onRetake: () => void;
  onDeleted: () => void;
};

export function Overview({ userId, latest, history, onRetake, onDeleted }: OverviewProps) {
  const result = latest.result!;
  const [reopened, setReopened] = useState<SafetyEvent | null>(null);
  const [callbackDim, setCallbackDim] = useState<DimId | null>(null);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const shown = latest.events.filter((e) => e.tier <= 2);
  const answeredBy = latest.proxy ? `your ${latest.proxy.relationship}, about ${latest.proxy.elderName}` : "you";
  const completed = new Date(`${latest.completedOn}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-10 py-10">
      <div className="flex flex-col gap-2">
        <DashboardGreeting title="Your Wellbeing View" subtitle="Here’s how your Wellbeing is looking today." />
        <p className="text-[16px] leading-[22px] text-text-tertiary">
          This is a check-in, not a medical test. Completed {completed} · Answered by {answeredBy}
        </p>
      </div>

      {shown.length > 0 && (
        <section aria-labelledby="ews-support" className="flex flex-col gap-3 rounded-card border-l-4 border-tertiary bg-bg-orange px-6 py-5">
          <h2 id="ews-support" className="text-[20px] leading-7 font-semibold text-text-primary">
            Support information shown during your check-in
          </h2>
          <ul className="flex flex-col gap-2">
            {shown.map((e) => (
              <li key={e.key} className="flex flex-wrap items-center justify-between gap-2 text-[18px] leading-7 text-text-secondary">
                <span>{SAFETY[e.id].short}</span>
                <Button variant="hyperlink" onClick={() => setReopened(e)}>
                  See again
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        <OverallScoreCard assessment={latest} onRetake={onRetake} />
        <ScoreTrend history={history} />
      </div>

      <section aria-labelledby="ews-areas" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 id="ews-areas" className="text-[22px] leading-8 font-semibold text-text-primary">
            Eight areas, one picture
          </h2>
          <p className="text-[18px] leading-7 text-text-secondary">Expand an area to see what we noticed and where to find support</p>
        </div>
        <AreaList result={result} onRequestCallback={setCallbackDim} />
      </section>

      <section aria-label="When to get help" className="flex flex-col gap-3">
        <details className="rounded-card bg-bg-base px-6 py-4">
          <summary className="cursor-pointer text-[18px] leading-7 font-semibold text-text-primary">When to talk to a professional</summary>
          <p className="pt-2 text-[18px] leading-7 text-text-secondary">{WHEN_PROFESSIONAL}</p>
        </details>
        <details className="rounded-card bg-bg-base px-6 py-4">
          <summary className="cursor-pointer text-[18px] leading-7 font-semibold text-text-primary">When to get urgent help</summary>
          <p className="pt-2 text-[18px] leading-7 text-text-secondary">{WHEN_URGENT}</p>
        </details>
      </section>

      <div className="flex flex-wrap gap-4">
        <Button variant="light" onClick={() => setAnswersOpen(true)}>
          See my answers
        </Button>
        <Button variant="hyperlink" onClick={() => setConfirmDelete(true)}>
          Delete this check-in
        </Button>
      </div>

      <p className="border-t-[1.5px] border-border-hairline pt-6 text-[16px] leading-[22px] text-text-tertiary">{DISCLAIMER}</p>

      <SafetyDialog event={reopened} mode={latest.mode} context="results" onAction={() => {}} onContinue={() => setReopened(null)} />

      <CallbackDialog
        open={callbackDim !== null}
        onClose={() => setCallbackDim(null)}
        category="area_support"
        dim={callbackDim ?? undefined}
      />

      <EwsDialog open={answersOpen} onClose={() => setAnswersOpen(false)} title="See my answers">
        <AnswersList assessment={latest} />
      </EwsDialog>

      <EwsDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this check-in?" size="sm">
        <p className="text-[18px] leading-7 text-text-secondary">
          Your answers and results from {completed} will be removed. This can’t be undone.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            variant="destructive"
            fullWidth
            onClick={async () => {
              await deleteAssessment(userId, latest.id);
              setConfirmDelete(false);
              onDeleted();
            }}
          >
            Delete
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
        </div>
      </EwsDialog>
    </div>
  );
}

function AnswersList({ assessment }: { assessment: Assessment }) {
  const elderName = assessment.proxy?.elderName ?? "";
  const rows = ITEMS.filter((i) => assessment.answers[i.id] !== undefined);
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-card bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-secondary">
        🔒 Private answers are never shown back — not even to you.
      </p>
      <dl className="flex flex-col divide-y divide-border-hairline">
        {rows.map((i) => (
          <div key={i.id} className="flex flex-col gap-1 py-3">
            <dt className="text-[16px] leading-[22px] text-text-tertiary">{questionText(i, assessment.mode, elderName)}</dt>
            <dd className="text-[18px] leading-7 font-semibold text-text-primary">{optionLabel(i, assessment.answers[i.id], assessment.mode)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default Overview;
