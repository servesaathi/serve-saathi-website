"use client";

import { useState } from "react";
import type { Assessment } from "@/lib/ews/ewsService";
import { overallShort } from "@/lib/ews/flow";
import { CHECK_IN_CYCLE, DETERIORATION, FIRST_CHECK_IN, TREND_GUARDRAIL, betterCopy, changedCopy, dimById } from "@/lib/ews/questionnaire";
import { changesSinceLast, lineOf, trendPoints, type Reminder } from "@/lib/ews/tracking";

// "Score trend" — Figma card beside the overall score (3344:332905): serif
// title, an orange 3M / 6M / 1Y segmented control, and a line of past
// overall scores with the "going well" zone shaded. Spec I rules applied:
// family-answered (proxy) check-ins get a hollow marker and are never joined
// into the same line as the elder's own; every trend view carries the
// "not a medical measurement" guardrail. Spec I tracking: one point per 7
// days (the latest), the 3-month cycle and next due date, and band-change
// messages only — movement inside a band is never called out.

const RANGES = [
  { id: "3M", months: 3 },
  { id: "6M", months: 6 },
  { id: "1Y", months: 12 },
] as const;

const W = 320;
const H = 140;
const PAD = { l: 8, r: 36, t: 8, b: 24 };
const y = (score: number) => PAD.t + (1 - score / 100) * (H - PAD.t - PAD.b);

const longDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

type ScoreTrendProps = { history: Assessment[]; reminder: Reminder };

export function ScoreTrend({ history, reminder }: ScoreTrendProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("6M");
  const [active, setActive] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const months = RANGES.find((r) => r.id === range)!.months;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  const tracked = trendPoints(history);
  const points = tracked.filter((a) => a.result!.internal != null && new Date(`${a.completedOn}T00:00:00`) >= from);
  const changes = changesSinceLast(history);

  const t0 = from.getTime();
  const span = now - t0 || 1;
  const x = (a: Assessment) => PAD.l + ((new Date(a.startedAt).getTime() - t0) / span) * (W - PAD.l - PAD.r);
  const own = points.filter((a) => lineOf(a.mode) === "own");
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
        {tracked.length < 2 && (
          <text x={(W - PAD.r + PAD.l) / 2} y={y(40)} textAnchor="middle" fontSize="11" fill="#615F5D">
            Your next check-in adds the second point
          </text>
        )}
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
            {longDate(selected.completedOn!)}
          </strong>{" "}
          · {selected.result!.internal} out of 100 · {overallShort(selected.result!)}
          {selected.mode === "proxy" && selected.proxy ? ` · answered by your ${selected.proxy.relationship}` : ""}
        </p>
      ) : (
        <p className="text-[16px] leading-[22px] text-text-secondary">No check-ins in this period.</p>
      )}
      {tracked.length === 1 && <p className="text-[16px] leading-[22px] text-text-secondary">{FIRST_CHECK_IN}</p>}

      {changes && (
        <div className="flex flex-col gap-2 border-t-[1.5px] border-border-hairline pt-4">
          <h3 className="text-[18px] leading-6 font-semibold text-text-primary">Since your check-in on {longDate(changes.previous.completedOn!)}</h3>
          {changes.dims.length === 0 ? (
            <p className="text-[16px] leading-[22px] text-text-secondary">No area has changed band since last time.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {changes.dims.map((c) => (
                <li key={c.dim} className="text-[16px] leading-[22px] text-text-secondary">
                  {c.direction === "better" ? betterCopy(dimById(c.dim).name) : changedCopy(dimById(c.dim).name)}
                </li>
              ))}
            </ul>
          )}
          {changes.deteriorated && <p className="text-[16px] leading-[22px] text-text-secondary">{DETERIORATION}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-card bg-bg-layout px-4 py-3">
        <p className="text-[16px] leading-[22px] font-semibold text-text-primary">
          {reminder.due ? "Your next check-in is due now" : `Next check-in suggested: ${longDate(reminder.dueOn)}`}
          {!reminder.due && <span className="font-normal text-text-tertiary"> · in {reminder.daysLeft} {reminder.daysLeft === 1 ? "day" : "days"}</span>}
        </p>
        <p className="text-[14px] leading-5 text-text-tertiary">{CHECK_IN_CYCLE}</p>
      </div>
      <p className="text-[14px] leading-5 text-text-muted">{TREND_GUARDRAIL}</p>
    </section>
  );
}

export default ScoreTrend;
