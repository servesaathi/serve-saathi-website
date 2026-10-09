// Unit tests for the EWS scoring + flow rules (spec C, D, E, L.3).
// Run with `npm run test:ews` — Node's built-in runner strips the TS types,
// so there's no test framework dependency.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { areaProfile, dimItems, focusAreas, headline, isVisible, s8Applies, triggerFor, type FlowContext } from "./flow.ts";
import { DIMS, ITEMS, SAFETY, itemById, type Answers, type Item, type SafetyId } from "./questionnaire.ts";
import { computeResult, scoreDim } from "./scoring.ts";

// Spec section D's worked example (also the demo's "Fill example").
const WORKED_EXAMPLE: Answers = {
  ADL1: "easy", ADL2: "diff", ADL3: "none",
  NUT1: "bit", NUT2: "no", NUT3: "mostly", NUT4: "no",
  MED0: "yes", MED1: "rarely", MED2: "very", MED3: "no",
  HOM1: "more", HOM1b: "no", HOM2: "mostly", HOM3: "notalways",
  SOC1: "week", SOC2: "some", SOC3: "far",
  COG1: "never", COG2: "little", COG3: "brief",
  EMO1: "rarely", EMO2: "most", EMO3: "some",
  FIN1: "partly", FIN2: "some", FIN3: "notsure",
};

// Seven areas at 67 (6 of 9, no 0 points) and FIN at 56 → internal 65.
const MID: Answers = {
  MED0: "yes",
  ADL1: "diff", ADL2: "diff", ADL3: "yes",
  NUT1: "bit", NUT2: "notsure", NUT3: "mostly",
  MED1: "sometimes", MED2: "fairly", MED3: "once",
  HOM1: "nearly", HOM2: "mostly", HOM3: "usually",
  SOC1: "week", SOC2: "some", SOC3: "far",
  COG1: "occ", COG2: "little", COG3: "brief",
  EMO1: "some", EMO2: "some", EMO3: "some",
  FIN1: "partly", FIN2: "some", FIN3: "notsure", // 2+2+1 = 56
};

/** Every scored item in every dimension answered with its best (3-point) option. */
const allBest = (): Answers => {
  const a: Answers = { MED0: "yes" };
  for (const i of ITEMS) if (i.scored) a[i.id] = i.options.find((x) => x.points === 3)!.code;
  return a;
};

describe("scoreDim — dimension bands (spec C)", () => {
  it("Going well at 78 (7 of 9 points)", () => {
    const r = scoreDim("NUT", { NUT1: "bit", NUT2: "no", NUT3: "mostly" });
    assert.equal(r.score, 78);
    assert.equal(r.band, "going_well");
    assert.equal(r.override, null);
  });

  it("Worth a closer look between 40 and 74 (67, 44)", () => {
    assert.equal(scoreDim("SOC", { SOC1: "week", SOC2: "some", SOC3: "far" }).band, "closer_look"); // 67
    const r = scoreDim("SOC", { SOC1: "few", SOC2: "often", SOC3: "far" }); // 1+1+2 = 4/9
    assert.equal(r.score, 44);
    assert.equal(r.band, "closer_look");
  });

  it("Needs attention below 40 (33) without any key item", () => {
    const r = scoreDim("COG", { COG1: "often", COG2: "noticeably", COG3: "several" }); // 1+1+1
    assert.equal(r.score, 33);
    assert.equal(r.band, "needs_attention");
    assert.equal(r.override, null);
  });

  it("uses round(sum / (3 × answered) × 100)", () => {
    assert.equal(scoreDim("EMO", { EMO1: "rarely", EMO2: "most", EMO3: "some" }).score, 89); // 8/9
    assert.equal(scoreDim("EMO", { EMO1: "some", EMO2: "some" }).score, 67); // 4/6 — 2 answered
  });

  it("is insufficient with fewer than 2 scored answers", () => {
    assert.equal(scoreDim("ADL", {}).band, "insufficient");
    assert.equal(scoreDim("ADL", { ADL1: "easy" }).band, "insufficient");
    const r = scoreDim("ADL", { ADL1: "easy", ADL2: "prefer", ADL3: "prefer" });
    assert.equal(r.band, "insufficient");
    assert.equal(r.score, null);
    assert.equal(r.itemsAnswered, 1);
  });

  it("drops Prefer not to say / skipped answers but scores the rest", () => {
    const r = scoreDim("FIN", { FIN1: "yes", FIN2: "skip", FIN3: "no" });
    assert.equal(r.itemsAnswered, 2);
    assert.equal(r.score, 100);
    assert.equal(r.band, "going_well");
  });

  it("MED is not_applicable when MED0 = no, whatever else is set", () => {
    assert.deepEqual(scoreDim("MED", { MED0: "no", MED1: "often", MED2: "notatall" }), {
      band: "not_applicable", score: null, override: null, itemsAnswered: 0,
    });
  });

  it("unscored safety/gate items never contribute points", () => {
    const r = scoreDim("NUT", { NUT1: "same", NUT2: "no", NUT3: "yes", NUT4: "today" });
    assert.equal(r.itemsAnswered, 3);
    assert.equal(r.score, 100);
  });

  describe("key-item override → Needs attention", () => {
    const cases: [string, Answers][] = [
      ["ADL3 = No", { ADL1: "easy", ADL2: "easy", ADL3: "no" }],
      ["NUT1 = Hardly eating", { NUT1: "hardly", NUT2: "no", NUT3: "yes" }],
      ["NUT2 = Yes, a lot", { NUT1: "same", NUT2: "lot", NUT3: "yes" }],
      ["MED3 = happening now", { MED0: "yes", MED1: "rarely", MED2: "very", MED3: "now" }],
      ["HOM1 = Fell more than once", { HOM1: "more", HOM2: "very", HOM3: "always" }],
      ["HOM3 = No", { HOM1: "no", HOM2: "very", HOM3: "no" }],
      ["SOC3 = No", { SOC1: "most", SOC2: "rarely", SOC3: "no" }],
      ["COG2 = Much worse", { COG1: "never", COG2: "much", COG3: "no" }],
      ["EMO1 = Almost every day", { EMO1: "almost", EMO2: "most", EMO3: "rarely" }],
      ["EMO2 = Not at all", { EMO1: "rarely", EMO2: "notatall", EMO3: "rarely" }],
      ["FIN3 = Yes, in the past", { FIN1: "yes", FIN2: "most", FIN3: "past" }],
      ["FIN3 = Yes, happening now", { FIN1: "yes", FIN2: "most", FIN3: "now" }],
    ];
    for (const [name, answers] of cases) {
      it(name, () => {
        const dim = itemById(Object.keys(answers).find((k) => k !== "MED0")!)!.dim;
        const r = scoreDim(dim, answers);
        assert.equal(r.score, 67, "6 of 9 points would otherwise be Worth a closer look");
        assert.equal(r.band, "needs_attention");
        assert.equal(r.override, "key_item");
      });
    }

    it("a 0-point answer that is not a key item does not force Needs attention", () => {
      const r = scoreDim("ADL", { ADL1: "most", ADL2: "easy", ADL3: "none" }); // 0+3+3
      assert.equal(r.band, "closer_look");
      assert.equal(r.override, null);
    });
  });

  it("floor rule: any 0-point answer caps the band at Worth a closer look", () => {
    // Unreachable with the v1.0 bank (≤3 items per dimension), so exercise it
    // with a synthetic 4-item dimension: 3+3+3+0 = 9/12 = 75.
    const bank: Item[] = [1, 2, 3, 4].map((n) => ({
      id: `X${n}`,
      dim: "ADL",
      scored: true,
      text: "",
      options: [{ code: "good", label: "", points: 3 }, { code: "zero", label: "", points: 0 }],
    }));
    const r = scoreDim("ADL", { X1: "good", X2: "good", X3: "good", X4: "zero" }, bank);
    assert.equal(r.score, 75);
    assert.equal(r.band, "closer_look");
    assert.equal(r.override, "floor");
    // Without the 0 the same score band would be Going well.
    assert.equal(scoreDim("ADL", { X1: "good", X2: "good", X3: "good" }, bank).band, "going_well");
  });

  it("key item wins over the floor rule", () => {
    const bank: Item[] = [1, 2, 3, 4].map((n) => ({
      id: `X${n}`,
      dim: "ADL",
      scored: true,
      text: "",
      options: [{ code: "good", label: "", points: 3 }, { code: "zero", label: "", points: 0, key: true }],
    }));
    const r = scoreDim("ADL", { X1: "good", X2: "good", X3: "good", X4: "zero" }, bank);
    assert.equal(r.band, "needs_attention");
    assert.equal(r.override, "key_item");
  });
});

describe("computeResult — overall (spec D)", () => {
  it("reproduces the spec's worked example", () => {
    const r = computeResult(WORKED_EXAMPLE);
    const scores = Object.fromEntries(DIMS.map((d) => [d.id, r.dims[d.id].score]));
    assert.deepEqual(scores, { ADL: 89, NUT: 78, MED: 100, HOM: 33, SOC: 67, COG: 78, EMO: 89, FIN: 56 });
    assert.equal(r.internal, 75); // mean 73.75 → nearest 5
    assert.equal(r.base, "going_well");
    assert.equal(r.display, "mostly_one");
    assert.deepEqual(r.attn, ["HOM"]);
    assert.equal(headline(r), "Mostly going well, with one area that needs attention: Home Safety & Environment.");
  });

  it("is insufficient with fewer than 6 scored dimensions", () => {
    const a: Answers = { ...allBest(), COG1: "prefer", COG2: "prefer", EMO1: "prefer", EMO2: "prefer", MED0: "no" };
    const r = computeResult(a); // MED n/a + COG, EMO insufficient → 5 scored
    assert.equal(r.dimsScored, 5);
    assert.equal(r.internal, null);
    assert.equal(r.base, "insufficient");
    assert.equal(r.display, "insufficient");
    assert.equal(headline(r), "We need a few more answers to show an overall picture.");
  });

  it("produces a result with exactly 6 scored dimensions", () => {
    const a: Answers = { ...allBest(), COG1: "prefer", COG2: "prefer" , MED0: "no" };
    const r = computeResult(a);
    assert.equal(r.dimsScored, 6);
    assert.equal(r.internal, 100);
    assert.equal(r.display, "going_well");
  });

  it("excludes not_applicable MED from the mean", () => {
    const r = computeResult({ ...allBest(), MED0: "no" });
    assert.equal(r.dims.MED.band, "not_applicable");
    assert.equal(r.dimsScored, 7);
    assert.equal(r.internal, 100);
  });

  it("base bands: ≥75 going_well, ≥50 some_support, else several_support", () => {
    assert.equal(computeResult(allBest()).base, "going_well");

    const r = computeResult(MID);
    assert.equal(r.internal, 65); // (67×7 + 56) / 8 = 65.6 → 65
    assert.equal(r.base, "some_support");
    assert.equal(r.display, "some_support");
    assert.deepEqual(r.attn, []);

    // All eight at 33 → several_support (no key items involved).
    const low: Answers = {
      MED0: "yes",
      ADL1: "some", ADL2: "some", ADL3: "sometimes",
      NUT1: "much", NUT2: "little", NUT3: "forget",
      MED1: "often", MED2: "notvery", MED3: "more",
      HOM1: "once", HOM2: "some", HOM3: "notalways",
      SOC1: "few", SOC2: "often", SOC3: "notsure",
      COG1: "often", COG2: "noticeably", COG3: "several",
      EMO1: "most", EMO2: "rarely", EMO3: "most",
      FIN1: "notreally", FIN2: "thinking", FIN3: "notsure",
    };
    const l = computeResult(low);
    assert.equal(l.internal, 35);
    assert.equal(l.base, "several_support");
    assert.equal(l.display, "several_support");
  });

  it("rounds the mean to the nearest 5 (internal score is a multiple of 5)", () => {
    const r = computeResult(WORKED_EXAMPLE);
    assert.equal(r.internal! % 5, 0);
  });

  it("1 area needs attention + going_well base → mostly_one", () => {
    const r = computeResult({ ...allBest(), SOC3: "no" });
    assert.equal(r.base, "going_well");
    assert.equal(r.display, "mostly_one");
    assert.deepEqual(r.attn, ["SOC"]);
  });

  it("2 areas need attention + going_well base → some_support", () => {
    const r = computeResult({ ...allBest(), SOC3: "no", HOM3: "no" });
    assert.equal(r.base, "going_well");
    assert.equal(r.display, "some_support");
  });

  it("≥3 areas need attention → several_support regardless of the average", () => {
    const r = computeResult({ ...allBest(), SOC3: "no", HOM3: "no", ADL3: "no" });
    assert.ok(r.internal! >= 75, "average alone would be going_well");
    assert.equal(r.base, "going_well");
    assert.equal(r.display, "several_support");
  });

  it("needs-attention areas never upgrade a lower base band", () => {
    // MID scores 67 in seven areas and 56 in FIN → base some_support.
    const one = computeResult({ ...MID, ADL1: "easy", ADL2: "easy", ADL3: "no" }); // 3+3+0, key
    assert.deepEqual(one.attn, ["ADL"]);
    assert.equal(one.base, "some_support");
    assert.equal(one.display, "some_support", "mostly_one only applies to a going_well base");

    const two = computeResult({ ...MID, ADL1: "easy", ADL2: "easy", ADL3: "no", SOC1: "most", SOC2: "rarely", SOC3: "no" });
    assert.equal(two.attn.length, 2);
    assert.equal(two.base, "some_support");
    assert.equal(two.display, "some_support");
  });

  it("safety-only answers never change the result", () => {
    const base = computeResult(WORKED_EXAMPLE);
    const withTriggers = computeResult({ ...WORKED_EXAMPLE, NUT4: "today", HOM1b: "now", COG3b: "sudden", MED4: "quite" });
    assert.deepEqual(withTriggers, base);
  });

  it("proxy results are prefixed with who shared them", () => {
    const r = computeResult(allBest());
    assert.equal(headline(r, "daughter"), "Based on what your daughter shared… overall, things are going well.");
  });

  it("area profile and focus areas follow spec F", () => {
    const r = computeResult(WORKED_EXAMPLE);
    assert.equal(areaProfile(r), "5 areas going well · 2 areas worth a closer look · 1 area needs attention");
    assert.deepEqual(focusAreas(r), ["HOM", "SOC", "FIN"]);
  });
});

describe("conditional display (spec L.3)", () => {
  const ctx = (mode: FlowContext["mode"], privateOk: boolean, answers: Answers = {}): FlowContext => ({ mode, privateOk, answers });
  const ids = (dim: Parameters<typeof dimItems>[0], c: FlowContext) => dimItems(dim, c).map((i) => i.id);

  it("C-3/C-4: MED1–3 need MED0 = yes; MED4 needs a missed/unsure dose or MED3 = now", () => {
    assert.deepEqual(ids("MED", ctx("self", true, { MED0: "no" })), ["MED0"]);
    assert.deepEqual(ids("MED", ctx("self", true, { MED0: "yes", MED1: "rarely", MED3: "no" })), ["MED0", "MED1", "MED2", "MED3"]);
    for (const MED1 of ["sometimes", "often", "notsure"]) {
      assert.ok(ids("MED", ctx("self", true, { MED0: "yes", MED1 })).includes("MED4"), MED1);
    }
    assert.ok(ids("MED", ctx("self", true, { MED0: "yes", MED1: "rarely", MED3: "now" })).includes("MED4"));
  });

  it("C-5: HOM1b only after a fall", () => {
    assert.ok(!ids("HOM", ctx("self", true, { HOM1: "nearly" })).includes("HOM1b"));
    assert.ok(ids("HOM", ctx("self", true, { HOM1: "once" })).includes("HOM1b"));
    assert.ok(ids("HOM", ctx("self", true, { HOM1: "more" })).includes("HOM1b"));
  });

  it("C-6: COG3b after several/often confusion", () => {
    assert.ok(!ids("COG", ctx("self", true, { COG3: "brief" })).includes("COG3b"));
    assert.ok(ids("COG", ctx("proxy", false, { COG3: "often" })).includes("COG3b"));
  });

  it("C-7: EMO4 (self, private) / EMO4P (proxy) on low mood or loss of enjoyment", () => {
    const low = { EMO1: "most" };
    assert.ok(ids("EMO", ctx("self", true, low)).includes("EMO4"));
    assert.ok(ids("EMO", ctx("self", true, { EMO2: "notatall" })).includes("EMO4"));
    assert.ok(!ids("EMO", ctx("self", true, { EMO1: "some", EMO2: "some" })).includes("EMO4"));
    assert.ok(ids("EMO", ctx("proxy", false, low)).includes("EMO4P"));
    assert.ok(!ids("EMO", ctx("proxy", false, low)).includes("EMO4"));
  });

  it("C-1/C-2: private items hidden in assisted mode and when not alone", () => {
    const low = { EMO1: "almost" };
    for (const c of [ctx("assisted", false, low), ctx("self", false, low)]) {
      const visible = ITEMS.filter((i) => isVisible(i, c)).map((i) => i.id);
      for (const hidden of ["EMO4", "HOM4", "FIN3", "EMO4P", "HOM4P"]) assert.ok(!visible.includes(hidden), `${c.mode}: ${hidden}`);
    }
    const proxy = ITEMS.filter((i) => isVisible(i, ctx("proxy", false, low))).map((i) => i.id);
    assert.ok(proxy.includes("FIN3") && proxy.includes("HOM4P") && proxy.includes("EMO4P"));
    assert.ok(!proxy.includes("HOM4") && !proxy.includes("EMO4"));
    const alone = ITEMS.filter((i) => isVisible(i, ctx("self", true, low))).map((i) => i.id);
    assert.ok(alone.includes("FIN3") && alone.includes("HOM4") && alone.includes("EMO4"));
  });

  it("a full self check-in shows 26 always-on questions plus conditionals (spec B item count)", () => {
    const visible = (a: Answers) => DIMS.flatMap((d) => ids(d.id, ctx("self", true, a)));
    const quiet = visible({ ...allBest() });
    // 24 scored + MED0 + NUT4 + HOM4 (private self) = 27.
    assert.equal(quiet.length, 27);
  });
});

describe("safety triggers (spec E)", () => {
  const expected: [string, string, SafetyId][] = [
    ["EMO4", "sometimes", "S1"], ["EMO4", "often", "S1"], ["EMO4P", "yes", "S1"],
    ["COG3b", "sudden", "S2A"], ["COG3b", "notsure", "S2B"],
    ["HOM1b", "now", "S3A"], ["HOM1b", "oknow", "S3B"],
    ["MED4", "quite", "S4A"], ["MED4", "little", "S4B"],
    ["NUT4", "today", "S5A"], ["NUT4", "several", "S5B"],
    ["HOM4", "yes", "S6"], ["HOM4P", "yes", "S6"],
    ["FIN3", "now", "S7"], ["FIN3", "past", "S7B"],
    ["EMO4", "pns", "GENTLE"], ["HOM4", "pns", "GENTLE"], ["EMO4P", "pns", "GENTLE"], ["HOM4P", "pns", "GENTLE"],
  ];
  for (const [item, code, id] of expected) {
    it(`${item} = ${code} → ${id} (tier ${SAFETY[id].tier})`, () => {
      assert.equal(triggerFor(itemById(item)!, code), id);
    });
  }

  it("safe answers raise nothing", () => {
    for (const [item, code] of [["EMO4", "no"], ["COG3b", "gradual"], ["HOM1b", "no"], ["MED4", "no"], ["NUT4", "once"], ["HOM4", "safe"], ["FIN3", "no"]]) {
      assert.equal(triggerFor(itemById(item)!, code), null, item);
    }
  });

  it("tiers: S1, S2A, S3A, S4A, S5A, S6, S7 interrupt (1); S2B–S8 follow up (2); GENTLE is 3", () => {
    const tier1 = ["S1", "S2A", "S3A", "S4A", "S5A", "S6", "S7"] as SafetyId[];
    const tier2 = ["S2B", "S3B", "S4B", "S5B", "S7B", "S8"] as SafetyId[];
    for (const id of tier1) assert.equal(SAFETY[id].tier, 1, id);
    for (const id of tier2) assert.equal(SAFETY[id].tier, 2, id);
    assert.equal(SAFETY.GENTLE.tier, 3);
  });

  it("tier 1 cards carry tap-to-call numbers from the approved list", () => {
    const approved = new Set(["14416", "108", "112", "14567", "1930"]);
    for (const [id, card] of Object.entries(SAFETY)) {
      for (const b of card.buttons ?? []) if (b.kind === "call") assert.ok(approved.has(b.number!), `${id}: ${b.number}`);
    }
  });

  it("S6 never notifies anyone and offers a quick exit; S1/S6 hidden from family", () => {
    assert.ok(SAFETY.S6.noNotify && SAFETY.S6.quickExit);
    assert.ok(!SAFETY.S6.buttons!.some((b) => b.kind === "notify"));
    assert.ok(SAFETY.S1.hideFamily && SAFETY.S6.hideFamily);
  });

  it("S8: ADL3 = No and (SOC3 = No or HOM3 = No)", () => {
    assert.ok(s8Applies({ ADL3: "no", SOC3: "no" }));
    assert.ok(s8Applies({ ADL3: "no", HOM3: "no" }));
    assert.ok(!s8Applies({ ADL3: "no", SOC3: "far", HOM3: "usually" }));
    assert.ok(!s8Applies({ ADL3: "sometimes", SOC3: "no", HOM3: "no" }));
  });
});
