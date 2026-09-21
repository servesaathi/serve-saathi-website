"use client";

import { useState } from "react";

// "Care Plan - Care View" checkbox row — Figma node 3344:339671. Local
// checked state only (no tasks API to persist completion to yet).
export function TaskCard({ title, time, detail }: { title: string; time: string; detail: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex w-full items-start gap-4 rounded-card border-l-4 border-primary bg-bg-base px-4 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={title}
        onClick={() => setChecked((v) => !v)}
        className={`mt-2 flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-tertiary ${
          checked ? "bg-tertiary" : "bg-bg-base"
        }`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex w-full items-start justify-between gap-4">
          <p className="text-[16px] leading-[22px] font-semibold text-text-secondary">{title}</p>
          <span className="shrink-0 rounded-full bg-orange-line px-4 py-0.5 text-[13px] leading-[17px] text-[#994613]">
            {time}
          </span>
        </div>
        <p className="text-[16px] leading-[22px] text-text-tertiary">{detail}</p>
      </div>
    </div>
  );
}

export default TaskCard;
