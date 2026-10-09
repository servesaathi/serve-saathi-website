"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { EwsResult } from "@/lib/ews/scoring";
import { BANDS, COPY, DIMS, type DimId } from "@/lib/ews/questionnaire";
import { DIM_TONE } from "./tone";

// "Nine dimensions, one pictures" accordion — Figma 3344:332988 (collapsed
// rows) and its expanded "Report" panel (3344:333424). Eight rows, one per
// spec area. Expanded:
//   - "What we noticed" → the spec's plain-language line for the area's band
//     (spec C), never individual answers.
//   - "Clinical recommendations" → "Suggested next steps" from spec C; the EWS
//     isn't a clinical assessment, so it doesn't claim to be one.
//   - "Recommended Service ₹749 / Book now" → "Find support": discovery only
//     (no prices, no booking) — a link into Explore Services and a callback.

type AreaListProps = {
  result: EwsResult;
  onRequestCallback: (dim: DimId) => void;
};

export function AreaList({ result, onRequestCallback }: AreaListProps) {
  // Open the first focus area by default, like Figma's expanded frame.
  const firstFocus = DIMS.find((d) => result.dims[d.id].band === "needs_attention" || result.dims[d.id].band === "closer_look");
  const [open, setOpen] = useState<DimId | null>(firstFocus?.id ?? null);

  return (
    <ul className="flex flex-col overflow-hidden rounded-card bg-bg-base">
      {DIMS.map((d) => (
        <AreaRow
          key={d.id}
          dim={d.id}
          result={result}
          open={open === d.id}
          onToggle={() => setOpen(open === d.id ? null : d.id)}
          onRequestCallback={() => onRequestCallback(d.id)}
        />
      ))}
    </ul>
  );
}

function AreaRow({
  dim,
  result,
  open,
  onToggle,
  onRequestCallback,
}: {
  dim: DimId;
  result: EwsResult;
  open: boolean;
  onToggle: () => void;
  onRequestCallback: () => void;
}) {
  const panelId = useId();
  const d = DIMS.find((x) => x.id === dim)!;
  const r = result.dims[dim];
  const tone = DIM_TONE[r.band];
  const copy = COPY[dim];
  const scored = r.band !== "not_applicable" && r.band !== "insufficient";
  const noticed =
    r.band === "not_applicable"
      ? "No regular medicines reported."
      : r.band === "insufficient"
        ? "We need a few more answers in this area to show how it’s going."
        : copy[r.band];
  const directory = copy.resources.find((x) => x.startsWith("Directory"));
  const otherHelp = copy.resources.filter((x) => x !== directory);

  return (
    <li className="border-b border-border-hairline last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-bg-layout/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-9"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-card p-2 ${tone.tile}`}>
              <Image src={tone.icon} alt="" width={30} height={30} className={tone.muted ? "opacity-40 grayscale" : ""} />
            </span>
            <span className="text-[18px] leading-6 font-semibold text-text-secondary">{d.name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-4 sm:gap-8">
            <span className={`hidden items-center gap-2 rounded-full px-4 py-1 text-[18px] leading-7 font-semibold sm:flex ${tone.chip}`}>
              <span aria-hidden>{BANDS[r.band].mark}</span>
              {BANDS[r.band].label}
            </span>
            <span className="flex w-[72px] items-center justify-between gap-2">
              <span className={`text-[22px] leading-[30px] font-semibold ${tone.number}`}>
                <span className="sr-only">{BANDS[r.band].label}, score </span>
                {r.score ?? "–"}
              </span>
              <Image src="/icons/ews/chevron-down.svg" alt="" width={22} height={22} className={`transition-transform ${open ? "-scale-y-100" : ""}`} />
            </span>
          </span>
        </button>
      </h3>

      {open && (
        <div id={panelId} className="flex flex-col gap-6 border-t border-border-hairline px-4 py-6 sm:px-10 lg:flex-row lg:gap-10">
          <div className="flex flex-1 flex-col gap-4">
            {/* Band word visible on mobile, where the row chip is hidden. */}
            <span className={`flex items-center gap-2 self-start rounded-full px-4 py-1 text-[16px] leading-[22px] font-semibold sm:hidden ${tone.chip}`}>
              <span aria-hidden>{BANDS[r.band].mark}</span>
              {BANDS[r.band].label}
            </span>
            <div className="flex flex-col gap-0.5 text-text-secondary">
              <p className="text-[16px] leading-5 font-semibold uppercase">What we noticed</p>
              <p className="text-[18px] leading-7">{noticed}</p>
            </div>
            {scored && r.band !== "going_well" && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[16px] leading-5 font-semibold text-primary uppercase">Suggested next steps</p>
                <ul className="list-disc pl-7 text-[18px] leading-7 text-text-secondary">
                  {copy.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {scored && r.band !== "going_well" && (
            <div className="flex flex-1 flex-col gap-3 rounded-card bg-bg-orange p-6">
              <p className="text-[16px] leading-5 font-semibold text-[#994613] uppercase">Find support</p>
              <p className="text-[18px] leading-7 font-semibold text-text-primary">Things that can help</p>
              <ul className="list-disc pl-6 text-[18px] leading-7 text-text-secondary">
                {otherHelp.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {directory && <p className="text-[16px] leading-[22px] text-text-tertiary">{directory}</p>}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button href="/services" fullWidth>
                  Explore services
                </Button>
                <Button variant="light" fullWidth onClick={onRequestCallback}>
                  Request a callback
                </Button>
              </div>
              <p className="text-[14px] leading-5 text-text-muted">
                Listings are for discovery only – Serve Saathi does not endorse providers.
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default AreaList;
