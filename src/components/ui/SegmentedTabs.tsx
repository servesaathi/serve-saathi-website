"use client";

// "Switch Label" segmented control — Figma node 2019:10537 (tabs.md `filled`
// variant). Orange track, 8px radius, ~44px tall. The active segment is a white
// pill with orange text; inactive segments are transparent with white text.

type Option<T extends string> = { value: T; label: string };

type SegmentedTabsProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "View",
  className = "",
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-2 rounded-card bg-tertiary p-2 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-[8px] px-4 py-1.5 text-[16px] leading-[22px] transition-colors ${
              active ? "bg-bg-base font-semibold text-tertiary" : "text-white hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
