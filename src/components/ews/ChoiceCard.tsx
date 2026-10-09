"use client";

import Image from "next/image";

// "Select Input" with the orange "Checkbox Item Base" — Figma 3343:184051
// (pop-up, 16/12 padding) and 3344:201300 (full-screen question, 24 padding).
// Figma only draws the unselected state; selected keeps the same shape with a
// brand-green border and a filled orange box carrying the white check glyph
// already used by the Explore filters. Rendered as a radio so a single answer
// per question is announced correctly and arrow keys move between options.

type ChoiceCardProps = {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
  size?: "md" | "lg";
};

export function ChoiceCard({ name, value, label, checked, onSelect, size = "md" }: ChoiceCardProps) {
  return (
    <label
      className={`flex w-full cursor-pointer items-start justify-between gap-4 rounded-control border-[1.5px] bg-bg-base transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
        checked ? "border-primary" : "border-border-hairline hover:border-border-card"
      } ${size === "lg" ? "p-4 sm:p-6" : "px-4 py-3"}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span className={`flex-1 text-[18px] leading-7 ${checked ? "text-text-primary" : "text-text-muted"}`}>{label}</span>
      <span
        aria-hidden
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-control border-[1.5px] border-tertiary ${
          checked ? "bg-tertiary" : "bg-bg-base"
        }`}
      >
        {checked && <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={16} height={16} loading="eager" />}
      </span>
    </label>
  );
}

export default ChoiceCard;
