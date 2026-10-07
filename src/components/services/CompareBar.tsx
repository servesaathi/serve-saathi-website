"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { useCompareStore } from "@/store/compare.store";
import { MAX_COMPARE, getProvider } from "./data";

// "Compare Pop up Expand / Desktop" — Figma 3318:91331 (1 selected + 2
// dashed "Add" slots) / 3318:95038 (3 of 3). Sticks to the bottom of the
// viewport once at least one provider is ticked; the orange tab collapses it
// down to the header row ("Compare close", 3318:95076).
export function CompareBar() {
  const router = useRouter();
  const hydrated = useHydrated();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const [expanded, setExpanded] = useState(true);

  if (!hydrated || ids.length === 0) return null;

  const providers = ids.map(getProvider).filter((p) => p !== undefined);
  const emptySlots = Math.max(0, MAX_COMPARE - providers.length);
  const canCompare = providers.length >= 2;

  return (
    <>
    {/* Reserves room so the fixed tray never hides the last row / pagination. */}
    <div aria-hidden className={expanded ? "h-60" : "h-20"} />
    <div
      role="region"
      aria-label="Compare providers"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-6 rounded-t-card border-t border-border-hairline bg-bg-base px-3 py-4 drop-shadow-[0_-10px_10px_rgba(0,0,0,0.05)]"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse compare tray" : "Expand compare tray"}
        className="absolute -top-[13px] left-1/2 flex h-6 -translate-x-1/2 items-center justify-center rounded-card bg-orange-line px-5 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Image
          src="/icons/services/caret-down.svg"
          alt=""
          width={16}
          height={16}
          className={expanded ? "-scale-y-100" : ""}
        />
      </button>

      <div className="flex w-full flex-wrap items-center justify-center gap-x-[90px] gap-y-2">
        <p className="text-[18px] leading-7 text-text-secondary" aria-live="polite">
          Comparing {providers.length} of {MAX_COMPARE} items
        </p>
        <button
          type="button"
          disabled={!canCompare}
          title={canCompare ? undefined : "Pick at least 2 providers to compare"}
          onClick={() => router.push(`/services/compare?ids=${providers.map((p) => p.id).join(",")}`)}
          className="flex h-8 w-32 items-center justify-center rounded-control bg-secondary text-[14px] leading-5 text-white transition-colors hover:bg-[#0d250f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          Compare
        </button>
      </div>

      {expanded && (
        <ul className="flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
          {providers.map((p) => (
            <li key={p.id} className="relative flex w-[100px] flex-col gap-2">
              <div
                className="relative h-[100px] w-full overflow-hidden"
                style={{ background: p.logoBackground ?? "white" }}
              >
                <Image
                  src={p.logo ?? "/images/services/provider-photo-1.jpg"}
                  alt=""
                  fill
                  sizes="100px"
                  className={p.logo ? "object-contain" : "object-cover"}
                />
              </div>
              <p className="w-full text-center text-[16px] leading-5 text-text-secondary">{p.name}</p>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.name} from compare`}
                className="absolute -top-2.5 left-[90px] flex size-5 items-center justify-center rounded-full bg-bg-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Image src="/icons/services/close-circle-sm.svg" alt="" width={20} height={20} />
              </button>
            </li>
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <li
              key={`empty-${i}`}
              aria-label="Empty compare slot — tick Compare on another provider"
              className="flex size-[100px] items-center justify-center border-2 border-dashed border-[#d2d1d1] bg-[rgba(210,209,209,0.1)]"
            >
              <Image src="/icons/services/add.svg" alt="" width={24} height={24} />
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}

export default CompareBar;
