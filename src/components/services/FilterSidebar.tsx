"use client";

import Image from "next/image";
import { useState } from "react";
import { Select } from "@/components/ui/Select";

// Figma node 3316:43526 "Fiter by - Services". Every group here is a
// single-select pill list (visually a checkbox, behaves like a radio group)
// — no providers API exists yet to actually filter against, so selecting a
// pill only updates local UI state. TODO: wire to a real filter/search call
// once the catalog API exists.

type PillGroupProps = {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
};

function PillGroup({ label, options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-[16px] leading-[22px] font-semibold text-text-primary">
        {label} <span className="text-error">*</span>
      </p>
      <div className="flex w-full flex-col gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`flex w-full items-center justify-between rounded-control border-[1.5px] px-4 py-3 text-left text-[16px] leading-[22px] ${
                selected
                  ? "border-tertiary bg-bg-orange text-text-secondary"
                  : "border-border-hairline bg-bg-base text-text-tertiary"
              }`}
            >
              {option}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] ${
                  selected ? "bg-tertiary" : "border-[1.5px] border-tertiary bg-bg-base"
                }`}
              >
                {selected && (
                  <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={12} height={12} aria-hidden />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FACILITY_TYPE_OPTIONS = [{ value: "care-facilities", label: "Care Facilities" }];
const RATINGS_OPTIONS = ["24/7 Care", "On-demand", "Day Care", "Part time"];
const BUDGET_OPTIONS = ["Under ₹20,000", "₹20,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"];
const URGENCY_OPTIONS = ["Today", "Just exploring", "This week"];
const SERVICE_TYPE_OPTIONS = ["24/7 Care", "On-demand", "Day Care", "Part time"];
const LANGUAGE_OPTIONS = ["Hindi", "English"];

export function FilterSidebar() {
  const [ratings, setRatings] = useState("On-demand");
  const [budget, setBudget] = useState("₹20,000 - ₹50,000");
  const [urgency, setUrgency] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState("24/7 Care");
  const [language, setLanguage] = useState("English");

  return (
    <div className="flex w-[220px] shrink-0 flex-col gap-6">
      <p className="text-[24px] leading-8 font-semibold text-primary uppercase">Filter by</p>

      <Select
        label="Find Type of Facilities"
        requiredMark
        options={FACILITY_TYPE_OPTIONS}
        defaultValue="care-facilities"
      />
      <Select label="Search Each Facilities" requiredMark options={[]} placeholder="Search" />

      <PillGroup label="Ratings" options={RATINGS_OPTIONS} value={ratings} onChange={setRatings} />
      <PillGroup label="Monthly Budget Range" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
      <PillGroup label="Urgency" options={URGENCY_OPTIONS} value={urgency} onChange={setUrgency} />
      <PillGroup label="Type of Service" options={SERVICE_TYPE_OPTIONS} value={serviceType} onChange={setServiceType} />
      <PillGroup label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />
    </div>
  );
}

export default FilterSidebar;
