import Image from "next/image";
import Link from "next/link";
import type { Assessment } from "@/lib/ews/ewsService";
import { areaProfile, headline, overallShort } from "@/lib/ews/flow";
import { BANDS, DIMS } from "@/lib/ews/questionnaire";
import { DIM_TONE } from "./tone";

// "Your Overall Score" — Figma "Sample Report" card (3344:332806). Shows the
// internal score as "N out of 100" because the user chose to follow Figma here
// (2026-10-09), against the spec's band-only recommendation — the band words,
// spec headline and area profile sit beside it so the number is never the
// only thing on screen. The radial chart is Figma's static illustration.

export function relativeDay(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(`${isoDate}T00:00:00`).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

type OverallScoreCardProps = {
  assessment: Assessment;
  onRetake: () => void;
};

export function OverallScoreCard({ assessment, onRetake }: OverallScoreCardProps) {
  const result = assessment.result!;
  // Figma lists the four areas pulling the score down, lowest first.
  const lowest = DIMS.filter((d) => result.dims[d.id].score != null && result.dims[d.id].band !== "going_well")
    .sort((a, b) => result.dims[a.id].score! - result.dims[b.id].score!)
    .slice(0, 4);

  return (
    <section aria-labelledby="ews-overall" className="flex flex-1 flex-col gap-4 rounded-card bg-bg-base px-6 pt-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ews-overall" className="font-serif text-[24px] leading-8 text-text-secondary">
          Your Overall Score
        </h2>
        <p className="text-[16px] leading-5 text-text-muted italic">Last assessed {relativeDay(assessment.completedOn!)}</p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center">
          <Image src="/icons/ews/radial-chart.svg" alt="" width={132} height={132} />
          <p className="text-[16px] leading-[22px] font-semibold text-tertiary">
            {result.internal != null ? `${result.internal} out of 100` : "Not enough answers"}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-[24px] leading-8 font-semibold text-tertiary">{overallShort(result)}</p>
          <p className="text-[16px] leading-[22px] text-text-secondary">{headline(result, assessment.proxy?.relationship)}</p>
          <p className="text-[16px] leading-[22px] text-text-tertiary">{areaProfile(result)}</p>
          <div className="flex gap-4 pt-4">
            <Link
              href="/elder-wellbeing-score/plan"
              className="flex h-12 flex-1 items-center justify-center rounded-control border-[1.35px] border-border-card bg-border-hairline px-4 text-center text-[16px] leading-[22px] font-semibold text-primary-pressed hover:bg-[#c5dcc6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View Care Plan
            </Link>
            <button
              type="button"
              onClick={onRetake}
              className="flex h-12 flex-1 items-center justify-center rounded-control bg-secondary px-4 text-[16px] leading-[22px] font-semibold text-white hover:bg-[#0d250f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Retake
            </button>
          </div>
        </div>
      </div>

      {lowest.length > 0 && (
        <ul className="flex flex-col gap-1 border-t-[1.5px] border-border-hairline pt-4">
          {lowest.map((d) => {
            const r = result.dims[d.id];
            const tone = DIM_TONE[r.band];
            return (
              <li key={d.id} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-[18px] leading-7 text-text-secondary">
                  <Image src={tone.icon} alt="" width={24} height={24} />
                  {d.name}
                </span>
                <span className={`text-[18px] leading-7 font-semibold ${tone.number}`}>
                  <span className="sr-only">{BANDS[r.band].label}, </span>
                  {r.score}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default OverallScoreCard;
