import Image from "next/image";

// "Card View" (Today's Progress) — Figma node 3344:339631. `completed`/
// `total` drive both the headline and the step bar; no tasks API exists
// yet, so the dashboard page passes in the same static 1-of-9 the design
// shows.
export function ProgressCard({ completed, total }: { completed: number; total: number }) {
  const steps = Array.from({ length: total }, (_, i) => i < completed);

  return (
    <div className="flex flex-1 flex-col justify-between gap-6 rounded-card bg-bg-base p-6">
      <div className="flex w-full flex-wrap items-start justify-center gap-10">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-serif text-[24px] leading-8 text-text-secondary">Today&rsquo;s Progress</p>
          <p className="text-[40px] leading-[60px] font-semibold text-text-primary">
            {completed} of {total} tasks
          </p>
        </div>
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#1c4b1e]">
          <Image src="/icons/homepage/dash-progress-calendar.svg" alt="" width={24} height={24} aria-hidden />
        </span>
      </div>
      <div className="flex w-full items-center gap-0.5">
        {steps.map((done, i) => (
          <span key={i} className={`h-2 flex-1 ${done ? "bg-tertiary" : "bg-[#ffc8a5]"}`} />
        ))}
      </div>
      <p className="text-[18px] leading-7 text-text-tertiary">A little Progress goes to a long way.</p>
    </div>
  );
}

export default ProgressCard;
