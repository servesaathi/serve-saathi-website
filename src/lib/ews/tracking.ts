// Longitudinal tracking rules (spec I): when the next check-in is due, which
// results the trend shows, and what changed since last time. Pure functions
// over completed check-ins so the backend can mirror them and the tests can
// pin them without storage.

import { DIMS, type DimBand, type DimId, type Mode, type OverallBand } from "./questionnaire.ts";
import type { EwsResult } from "./scoring.ts";

/** Full EWS every 90 days. */
export const REPEAT_DAYS = 90;
/** The routine reminder can be snoozed for 2 weeks. */
export const SNOOZE_DAYS = 14;
/** Trend shows at most one result per 7 days — the latest. */
export const TREND_WINDOW_DAYS = 7;

/** The fields tracking needs from a completed check-in. */
export type TrackedCheckIn = {
  id: string;
  mode: Mode;
  startedAt: string;
  /** YYYY-MM-DD. */
  completedOn?: string;
  result?: EwsResult;
};

const DAY = 86_400_000;
const dayNumber = (isoDate: string) => Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY);
const isoFromDay = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);

/** Today as YYYY-MM-DD in the viewer's own timezone. */
export function todayIso(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export const addDays = (isoDate: string, days: number) => isoFromDay(dayNumber(isoDate) + days);
export const daysBetween = (fromIso: string, toIso: string) => dayNumber(toIso) - dayNumber(fromIso);

/** Self and assisted answers form one line; family (proxy) answers another (spec I: never one line). */
export const lineOf = (mode: Mode) => (mode === "proxy" ? "proxy" : "own");

const newestFirst = <T extends TrackedCheckIn>(list: T[]) =>
  list
    .filter((a) => a.completedOn && a.result)
    .sort((a, b) => b.completedOn!.localeCompare(a.completedOn!) || b.startedAt.localeCompare(a.startedAt));

export type Reminder = {
  /** YYYY-MM-DD the next full check-in is suggested. */
  dueOn: string;
  /** Days until due; 0 or negative once it's due. */
  daysLeft: number;
  due: boolean;
};

/** Next routine check-in, from the latest completed one and any snooze. */
export function nextCheckIn(latestCompletedOn: string, today: string, snoozedUntil?: string | null): Reminder {
  let dueOn = addDays(latestCompletedOn, REPEAT_DAYS);
  if (snoozedUntil && snoozedUntil > dueOn) dueOn = snoozedUntil;
  const daysLeft = daysBetween(today, dueOn);
  return { dueOn, daysLeft, due: daysLeft <= 0 };
}

/**
 * Results the trend plots, oldest first: per line, a result is dropped when a
 * later one on the same line was completed less than 7 days after it.
 */
export function trendPoints<T extends TrackedCheckIn>(history: T[]): T[] {
  const lastKept: Record<string, string> = {};
  const kept: T[] = [];
  for (const a of newestFirst(history)) {
    const line = lineOf(a.mode);
    const later = lastKept[line];
    if (later && daysBetween(a.completedOn!, later) < TREND_WINDOW_DAYS) continue;
    lastKept[line] = a.completedOn!;
    kept.push(a);
  }
  return kept.reverse();
}

const DIM_RANK: Partial<Record<DimBand, number>> = { needs_attention: 0, closer_look: 1, going_well: 2 };
const OVERALL_RANK: Partial<Record<OverallBand, number>> = { several_support: 0, some_support: 1, mostly_one: 2, going_well: 3 };

export type DimChange = { dim: DimId; from: DimBand; to: DimBand; direction: "better" | "harder" };

export type Changes = {
  /** The check-in compared against (same line, at least 7 days earlier). */
  previous: TrackedCheckIn;
  dims: DimChange[];
  /** Spec I deterioration rule fired. */
  deteriorated: boolean;
};

/**
 * Band changes between the latest check-in and the previous one on the same
 * line. Score movement inside a band is never a change (spec I). Null when
 * there's nothing earlier to compare with.
 */
export function changesSinceLast(history: TrackedCheckIn[]): Changes | null {
  const latest = newestFirst(history)[0];
  if (!latest) return null;
  const line = lineOf(latest.mode);
  const points = trendPoints(history).filter((a) => lineOf(a.mode) === line);
  const previous = points.length > 1 ? points[points.length - 2] : null;
  if (!previous || points[points.length - 1].id !== latest.id) return null;

  const dims: DimChange[] = [];
  for (const d of DIMS) {
    const from = previous.result!.dims[d.id].band;
    const to = latest.result!.dims[d.id].band;
    const a = DIM_RANK[from];
    const b = DIM_RANK[to];
    if (a === undefined || b === undefined || a === b) continue;
    dims.push({ dim: d.id, from, to, direction: b > a ? "better" : "harder" });
  }

  const overallFrom = OVERALL_RANK[previous.result!.display];
  const overallTo = OVERALL_RANK[latest.result!.display];
  const deteriorated =
    dims.some((c) => c.to === "needs_attention") ||
    dims.filter((c) => c.direction === "harder").length >= 2 ||
    (overallFrom !== undefined && overallTo !== undefined && overallTo < overallFrom);

  return { previous, dims, deteriorated };
}
