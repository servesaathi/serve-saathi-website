// EWS scoring — spec sections C (dimension) and D (overall), pseudocode L.4.
// Ported from the demo's scoreDim()/computeResult() as pure functions over an
// answers map, so the same module can run on the server once the EWS
// endpoints exist. Safety triggers are evaluated separately (see flow.ts) and
// never change a score.

import { DIMS, ITEMS, type Answers, type DimBand, type DimId, type Item, type OverallBand } from "./questionnaire.ts";

export const DIM_GOING_WELL = 75;
export const DIM_CLOSER_LOOK = 40;
export const OVERALL_GOING_WELL = 75;
export const OVERALL_SOME_SUPPORT = 50;
export const MIN_ITEMS_PER_DIMENSION = 2;
export const MIN_DIMENSIONS_OVERALL = 6;

export type DimResult = {
  band: DimBand;
  /** 0–100, null when not_applicable / insufficient. */
  score: number | null;
  override: "floor" | "key_item" | null;
  itemsAnswered: number;
};

export type EwsResult = {
  dims: Record<DimId, DimResult>;
  /** Overall internal score, rounded to the nearest 5. Null below 6 scored dimensions. */
  internal: number | null;
  base: OverallBand;
  display: OverallBand;
  /** Dimensions in Needs attention, in questionnaire order. */
  attn: DimId[];
  dimsScored: number;
};

/**
 * `answers` holds option codes for every answered item, including FIN3 from
 * the restricted store — callers merge it in only for scoring and never
 * persist it alongside the standard answers.
 *
 * `items` defaults to the v1.0 bank. It's a parameter so tests can exercise
 * the floor rule, which v1.0 can't reach: with at most 3 items per dimension,
 * any 0-point answer already caps the score at 67 (below Going well).
 */
export function scoreDim(dim: DimId, answers: Answers, items: Item[] = ITEMS): DimResult {
  if (dim === "MED" && answers.MED0 === "no") {
    return { band: "not_applicable", score: null, override: null, itemsAnswered: 0 };
  }
  const points: number[] = [];
  let key = false;
  for (const item of items) {
    if (item.dim !== dim || !item.scored) continue;
    const option = item.options.find((x) => x.code === answers[item.id]);
    // "prefer" / "skip" / unanswered have no option (or null points) → dropped.
    if (!option || option.points == null) continue;
    points.push(option.points);
    if (option.key) key = true;
  }
  if (points.length < MIN_ITEMS_PER_DIMENSION) {
    return { band: "insufficient", score: null, override: null, itemsAnswered: points.length };
  }
  const score = Math.round((points.reduce((a, b) => a + b, 0) / (3 * points.length)) * 100);
  let band: DimBand = score >= DIM_GOING_WELL ? "going_well" : score >= DIM_CLOSER_LOOK ? "closer_look" : "needs_attention";
  let override: DimResult["override"] = null;
  if (points.includes(0) && band === "going_well") {
    band = "closer_look";
    override = "floor";
  }
  if (key) {
    band = "needs_attention";
    override = "key_item";
  }
  return { band, score, override, itemsAnswered: points.length };
}

export function computeResult(answers: Answers): EwsResult {
  const dims = {} as Record<DimId, DimResult>;
  for (const d of DIMS) dims[d.id] = scoreDim(d.id, answers);

  const scored = DIMS.filter((d) => dims[d.id].score != null);
  const attn = DIMS.filter((d) => dims[d.id].band === "needs_attention").map((d) => d.id);

  let internal: number | null = null;
  let base: OverallBand = "insufficient";
  let display: OverallBand = "insufficient";
  if (scored.length >= MIN_DIMENSIONS_OVERALL) {
    const mean = scored.reduce((sum, d) => sum + (dims[d.id].score as number), 0) / scored.length;
    internal = 5 * Math.round(mean / 5);
    base = internal >= OVERALL_GOING_WELL ? "going_well" : internal >= OVERALL_SOME_SUPPORT ? "some_support" : "several_support";
    display = base;
    if (attn.length >= 3) display = "several_support";
    else if (attn.length === 2 && base === "going_well") display = "some_support";
    else if (attn.length === 1 && base === "going_well") display = "mostly_one";
  }
  return { dims, internal, base, display, attn, dimsScored: scored.length };
}
