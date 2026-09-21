import Image from "next/image";

// "Wellbeing Score / Sample Report" — Figma node 3344:339432. Reuses the
// same radial-chart asset as the marketing Elder Wellbeing Score page's
// SampleReport — no per-user score API exists yet, so this renders the
// design's sample values as static content (TODO: swap for the user's real
// composite score once that endpoint exists).
export function ScoreCard() {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-card bg-bg-base px-6 pt-4 pb-6">
      <div className="flex w-full items-center justify-between">
        <p className="font-serif text-[24px] leading-8 text-text-secondary">Your Overall Score</p>
        <p className="text-[16px] leading-5 text-text-tertiary italic">Last assessed 3 days ago</p>
      </div>
      <div className="flex w-full items-start justify-center gap-6">
        <div className="flex flex-col items-center">
          <Image src="/icons/homepage/ewbs-radial-chart.svg" alt="" width={132} height={132} />
          <p className="text-[16px] leading-[22px] font-semibold text-tertiary">68 out of 100</p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-[24px] leading-8 font-semibold text-tertiary">Looking steady</p>
          <p className="text-[16px] leading-5 text-text-secondary">
            Your care signals are in a good place. Keep the rhythm going.
          </p>
          <div className="flex items-start gap-4 pt-4">
            <a
              href="/care-plan"
              className="flex h-12 flex-1 items-center justify-center rounded-control border-[1.35px] border-border-card bg-[#d5e5d6] px-4 text-[16px] font-medium text-primary-pressed"
            >
              View Care Plan
            </a>
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center rounded-control bg-secondary px-4 text-[16px] font-medium text-white"
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
