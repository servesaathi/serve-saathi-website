// Vertical stepper for the provider onboarding flow. On lg+ it takes the
// slot the Sidebar occupies elsewhere (same dark-green gradient card, same
// 304px column) so onboarding reads as part of the same site; below lg it
// collapses to a "Step X of N" progress bar above the content.

type Props = {
  steps: string[];
  /** Index of the active step; steps.length means everything is complete. */
  current: number;
  /** Called for a completed step the user can jump back to. */
  onSelect?: (index: number) => void;
};

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="m3.5 8.5 3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StepRail({ steps, current, onSelect }: Props) {
  const shown = Math.min(current, steps.length - 1);
  const pct = Math.round((Math.min(current, steps.length) / steps.length) * 100);

  return (
    <>
      {/* Mobile / tablet */}
      <div className="px-6 pt-6 sm:px-10 lg:hidden">
        <div className="flex items-center justify-between text-[14px] leading-5">
          <span className="font-semibold text-tertiary">
            Step {shown + 1} of {steps.length}
          </span>
          <span className="text-text-secondary">{steps[shown]}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-orange-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Onboarding progress">
          <div className="h-full rounded-full bg-tertiary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Desktop rail */}
      <aside className="hidden w-[304px] shrink-0 lg:block" aria-label="Onboarding steps">
        <div className="sticky top-20 h-[calc(100dvh-5rem)] py-6 pl-6">
          <div
            className="flex h-full w-full flex-col gap-8 overflow-y-auto rounded-card border-r-[1.5px] border-primary-pressed px-6 pt-10 pb-6 shadow-[0_60px_45px_rgba(72,85,99,0.1)]"
            style={{ backgroundImage: "linear-gradient(146deg, var(--color-primary) 0%, var(--color-secondary) 62.5%)" }}
          >
            <div className="flex flex-col gap-1 px-4">
              <p className="text-[14px] leading-5 font-semibold tracking-wide text-tertiary uppercase">Provider onboarding</p>
              <p className="text-[16px] leading-[22px] text-white/80">Complete each step to list your facility.</p>
            </div>

            <ol className="flex flex-col gap-1.5">
              {steps.map((label, i) => {
                const done = i < current;
                const active = i === current;
                const clickable = done && !!onSelect && i > 0;
                const inner = (
                  <>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[14px] leading-5 font-semibold ${
                        active
                          ? "bg-tertiary text-white"
                          : done
                            ? "bg-white text-primary"
                            : "border border-white/40 text-white/70"
                      }`}
                    >
                      {done ? <CheckIcon className="size-4" /> : i + 1}
                    </span>
                    <span className="text-left text-[18px] leading-7">{label}</span>
                  </>
                );
                const cls = `flex w-full items-center gap-3 rounded-control py-2 pr-2 pl-3 ${
                  active ? "bg-bg-layout text-primary-pressed font-semibold" : done ? "text-white" : "text-white/70"
                }`;
                return (
                  <li key={`${i}-${label}`} aria-current={active ? "step" : undefined}>
                    {clickable ? (
                      <button
                        type="button"
                        onClick={() => onSelect(i)}
                        className={`${cls} hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </aside>
    </>
  );
}

export default StepRail;
