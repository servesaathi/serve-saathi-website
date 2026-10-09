"use client";

import { useState } from "react";
import type { Assessment } from "@/lib/ews/ewsService";
import { overallShort } from "@/lib/ews/flow";
import { FIRST_CHECK_IN, TREND_GUARDRAIL } from "@/lib/ews/questionnaire";

// "Score trend" — Figma card beside the overall score (3344:332905): serif
// title, an orange 3M / 6M / 1Y segmented control, and a line of past
// overall scores with the "going well" zone shaded. Spec I rules applied:
// family-answered (proxy) check-ins get a hollow marker and are never joined
// into the same line as the elder's own; every trend view carries the
// "not a medical measurement" guardrail.

const RANGES = [
  { id: "3M", months: 3 },
  { id: "6M", months: 6 },
  { id: "1Y", months: 12 },
] as const;

const W = 320;
const H = 140;
const PAD = { l: 8, r: 36, t: 8, b: 24 };
const y = (score: number) => PAD.t + (1 - score / 100) * (H - PAD.t - PAD.b);

type ScoreTrendProps = { history: Assessment[] };

export function ScoreTrend({ history }: ScoreTrendProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("6M");
  const [active, setActive] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const months = RANGES.find((r) => r.id === range)!.months;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  const points = history
    .filter((a) => a.result?.internal != null && new Date(`${a.completedOn}T00:00:00`) >= from)
    .sort((a, b) => a.completedOn!.localeCompare(b.completedOn!) || a.startedAt.localeCompare(b.startedAt));

  const t0 = from.getTime();
  const span = now - t0 || 1;
  const x = (a: Assessment) => PAD.l + ((new Date(a.startedAt).getTime() - t0) / span) * (W - PAD.l - PAD.r);
  const own = points.filter((a) => a.mode !== "proxy");
  const line = own.map((a, i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(a.result!.internal!).toFixed(1)}`).join(" ");
  const selected = points.find((a) => a.id === active) ?? points[points.length - 1];

  return (
    <section aria-labelledby="ews-trend" className="flex flex-1 flex-col gap-4 rounded-card bg-bg-base px-6 pt-4 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="ews-trend" className="font-serif text-[24px] leading-8 text-text-secondary">
            Score trend
          </h2>
          <p className="text-[16px] leading-5 text-text-tertiary">Tap a point for details</p>
        </div>
        <div role="group" aria-label="Time range" className="flex gap-1 rounded-control bg-tertiary p-1.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={`h-9 min-w-14 rounded-control px-3 text-[16px] leading-[22px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white ${
                range === r.id ? "bg-bg-base text-tertiary" : "text-white hover:bg-white/15"
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 text-[14px] leading-5 text-text-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-secondary" /> You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-secondary" /> Answered by family
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${points.length} check-in${points.length === 1 ? "" : "s"} in the last ${months} months`}>
        <rect x={PAD.l} y={y(100)} width={W - PAD.l - PAD.r} height={y(75) - y(100)} fill="#d5e5d6" opacity={0.6} />
        {[25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#d5e5d6" strokeDasharray="3 3" />
            <text x={W - PAD.r + 6} y={y(v) + 4} fontSize="10" fill="#787674">
              {v}
            </text>
          </g>
        ))}
        {own.length > 1 && <path d={line} fill="none" stroke="#2e7d32" strokeWidth={2.5} strokeLinejoin="round" />}
        {points.map((a) => {
          const proxy = a.mode === "proxy";
          return (
            <circle
              key={a.id}
              cx={x(a)}
              cy={y(a.result!.internal!)}
              r={selected?.id === a.id ? 7 : 5.5}
              fill={proxy ? "#fff" : "#123214"}
              stroke="#123214"
              strokeWidth={2}
              tabIndex={0}
              role="button"
              aria-label={`${a.completedOn}: ${a.result!.internal} out of 100${proxy ? ", answered by family" : ""}`}
              className="cursor-pointer outline-none focus-visible:stroke-tertiary"
              onClick={() => setActive(a.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(a.id)}
            />
          );
        })}
      </svg>

      {selected ? (
        <p className="text-[16px] leading-[22px] text-text-secondary">
          <strong className="text-text-primary">
            {new Date(`${selected.completedOn}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </strong>{" "}
          · {selected.result!.internal} out of 100 · {overallShort(selected.result!)}
          {selected.mode === "proxy" && selected.proxy ? ` · answered by your ${selected.proxy.relationship}` : ""}
        </p>
      ) : (
        <p className="text-[16px] leading-[22px] text-text-secondary">No check-ins in this period.</p>
      )}
      {history.length === 1 && <p className="text-[16px] leading-[22px] text-text-secondary">{FIRST_CHECK_IN}</p>}
      <p className="text-[14px] leading-5 text-text-muted">{TREND_GUARDRAIL}</p>
    </section>
  );
}

export default ScoreTrend;
