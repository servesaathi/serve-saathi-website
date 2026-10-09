// Which questions show, how they're worded, and which safety cards they
// raise — spec L.3 conditional rules C-1…C-10, ported from the demo's
// visible()/commit()/endDim(). Pure functions; UI state lives elsewhere.

import {
  BANDS,
  DIMS,
  HEADLINES,
  ITEMS,
  OVERALL_SHORT,
  PREFER,
  SAFETY,
  SKIP,
  dimById,
  type Answers,
  type DimId,
  type Item,
  type Mode,
  type SafetyId,
} from "./questionnaire.ts";
import type { EwsResult } from "./scoring.ts";

export type FlowContext = {
  mode: Mode;
  /** Self mode only: the elder confirmed they are answering on their own. */
  privateOk: boolean;
  /** Answers used by `show` rules (standard store + in-memory restricted). */
  answers: Answers;
};

/** C-1, C-2 (private items), C-3…C-7 (show rules). */
export function isVisible(item: Item, ctx: FlowContext): boolean {
  const { mode, privateOk, answers } = ctx;
  if (item.who === "self" && mode !== "self") return false;
  if (item.who === "proxy" && mode !== "proxy") return false;
  if (item.privateOnly && !(mode === "self" && privateOk)) return false;
  if (item.selfPrivate && mode !== "proxy" && !(mode === "self" && privateOk)) return false;
  if (item.show && !item.show(answers)) return false;
  return true;
}

export const dimItems = (dim: DimId, ctx: FlowContext): Item[] =>
  ITEMS.filter((i) => i.dim === dim && isVisible(i, ctx));

const fillName = (s: string, elderName: string) => s.replace(/\{n\}/g, elderName);

export function questionText(item: Item, mode: Mode, elderName: string): string {
  return fillName(mode === "proxy" && item.proxyText ? item.proxyText : item.text, elderName);
}

export function optionLabel(item: Item, code: string, mode: Mode): string {
  if (code === PREFER) return mode === "proxy" ? "Not sure" : "Prefer not to say";
  if (code === SKIP) return "Skipped";
  const option = item.options.find((x) => x.code === code);
  if (!option) return "";
  return mode === "proxy" && option.proxyLabel ? option.proxyLabel : option.label;
}

/**
 * The extra non-scored choice under the options: "Prefer not to say" (self)
 * or "Not sure" (proxy) on every required item; "Skip this question" on
 * optional items that opt out of it.
 */
export function extraChoice(item: Item, mode: Mode): { code: string; label: string } | null {
  if (item.noPrefer) return item.optional ? { code: SKIP, label: "Skip this question" } : null;
  return { code: PREFER, label: mode === "proxy" ? "Not sure" : "Prefer not to say" };
}

export function triggerFor(item: Item, code: string): SafetyId | null {
  return item.options.find((x) => x.code === code)?.trigger ?? null;
}

/** S8 — a combination rule checked once, at the end of the last dimension. */
export function s8Applies(answers: Answers): boolean {
  return answers.ADL3 === "no" && (answers.SOC3 === "no" || answers.HOM3 === "no");
}

/** Overall headline with the proxy prefix and the mostly_one area name (spec D). */
export function headline(result: EwsResult, proxyRelationship?: string): string {
  let h = HEADLINES[result.display];
  if (result.display === "mostly_one" && result.attn[0]) h += `: ${dimById(result.attn[0]).name}.`;
  if (proxyRelationship) h = `Based on what your ${proxyRelationship} shared… ` + h.charAt(0).toLowerCase() + h.slice(1);
  return h;
}

export const overallShort = (result: EwsResult) => OVERALL_SHORT[result.display];

/** "5 areas going well · 2 worth a closer look · 1 needs attention". */
export function areaProfile(result: EwsResult): string {
  const count = (band: keyof typeof BANDS) => DIMS.filter((d) => result.dims[d.id].band === band).length;
  const parts: [number, string, string][] = [
    [count("going_well"), "going well", "going well"],
    [count("closer_look"), "worth a closer look", "worth a closer look"],
    [count("needs_attention"), "needs attention", "need attention"],
  ];
  return parts
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? "area" : "areas"} ${n === 1 ? one : many}`)
    .join(" · ");
}

/** Up to 3 focus areas: Needs attention first, then Worth a closer look (spec F). */
export function focusAreas(result: EwsResult): DimId[] {
  return [
    ...DIMS.filter((d) => result.dims[d.id].band === "needs_attention"),
    ...DIMS.filter((d) => result.dims[d.id].band === "closer_look"),
  ]
    .slice(0, 3)
    .map((d) => d.id);
}

export const safetyTier = (id: SafetyId) => SAFETY[id].tier;
