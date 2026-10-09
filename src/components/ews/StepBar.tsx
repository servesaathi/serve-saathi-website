// Segmented progress — Figma "Steps_Introduction" (3343:184036 / 3344:201281):
// 4px segments, 8px gap, brand orange for done/current, vivid-orange/200 for
// the rest, followed by an "N of M" label in brand green.

type StepBarProps = {
  current: number;
  total: number;
  /** Screen-reader description, e.g. "Area 3 of 8". */
  label?: string;
};

export function StepBar({ current, total, label }: StepBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={label ?? `Step ${current} of ${total}`}
        className="flex flex-1 items-center gap-2"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-[2px] ${i < current ? "bg-tertiary" : "bg-[#ffc8a5]"}`} />
        ))}
      </div>
      <p className="shrink-0 text-center text-[18px] leading-7 font-semibold text-primary">
        {current} of {total}
      </p>
    </div>
  );
}

export default StepBar;
