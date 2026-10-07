"use client";

import Image from "next/image";
import { useId } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { useCompareStore, type CompareItem } from "@/store/compare.store";
import { MAX_COMPARE } from "./data";

// "Compare" checkbox on the provider card (Figma 3316:43598) and the detail
// page header (3337:166111): 20px, 2px primary border, r=6; ticked = solid
// primary with a white check (Figma "Compare 1/2/3" frames).
export function CompareToggle({
  provider,
  labelClassName = "text-primary font-medium",
}: {
  provider: CompareItem;
  labelClassName?: string;
}) {
  const id = useId();
  const hydrated = useHydrated();
  const items = useCompareStore((s) => s.items);
  const toggle = useCompareStore((s) => s.toggle);

  const checked = hydrated && items.some((x) => x.id === provider.id);
  const full = hydrated && !checked && items.length >= MAX_COMPARE;

  return (
    <label
      htmlFor={id}
      title={full ? `You can compare up to ${MAX_COMPARE} providers` : undefined}
      className={`flex min-h-8 items-center gap-1 ${full ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={full}
        onChange={() => toggle(provider)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`flex size-5 items-center justify-center rounded-[6px] border-2 border-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
          checked ? "bg-primary" : "bg-bg-base"
        }`}
      >
        {checked && <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={10} height={10} />}
      </span>
      <span className={`text-[18px] leading-7 ${labelClassName}`}>Compare</span>
    </label>
  );
}

export default CompareToggle;
