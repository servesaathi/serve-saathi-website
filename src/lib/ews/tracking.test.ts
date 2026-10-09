// Unit tests for the EWS longitudinal tracking rules (spec I).
// Run with `npm run test:ews`.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DIMS, type DimBand, type DimId, type Mode, type OverallBand } from "./questionnaire.ts";
import type { EwsResult } from "./scoring.ts";
import { addDays, changesSinceLast, nextCheckIn, trendPoints, type TrackedCheckIn } from "./tracking.ts";

let seq = 0;
function checkIn(
  completedOn: string,
  opts: { mode?: Mode; display?: OverallBand; bands?: Partial<Record<DimId, DimBand>> } = {},
): TrackedCheckIn {
  const dims = Object.fromEntries(
    DIMS.map((d) => [d.id, { band: opts.bands?.[d.id] ?? "going_well", score: 80, override: null, itemsAnswered: 3 }]),
  ) as EwsResult["dims"];
  const display = opts.display ?? "going_well";
  return {
    id: `a${++seq}`,
    mode: opts.mode ?? "self",
    startedAt: `${completedOn}T10:00:00.000Z`,
    completedOn,
    result: { dims, internal: 80, base: display, display, attn: [], dimsScored: 8 },
  };
}

describe("nextCheckIn — routine follow-up every 90 days", () => {
  it("is due 90 days after the latest check-in", () => {
    const r = nextCheckIn("2026-10-10", "2026-10-10");
    assert.equal(r.dueOn, "2027-01-08");
    assert.equal(r.daysLeft, 90);
    assert.equal(r.due, false);
  });

  it("is due on and after the due date", () => {
    assert.equal(nextCheckIn("2026-07-01", "2026-09-29").due, true);
    assert.equal(nextCheckIn("2026-07-01", "2026-12-01").daysLeft, -63);
  });

  it("a snooze pushes the due date out, but never earlier", () => {
    const snoozed = addDays("2026-09-29", 14);
    assert.deepEqual(nextCheckIn("2026-07-01", "2026-09-29", snoozed), { dueOn: "2026-10-13", daysLeft: 14, due: false });
    assert.equal(nextCheckIn("2026-10-01", "2026-10-02", "2026-10-05").dueOn, "2026-12-30");
  });
});

describe("trendPoints — at most one result per 7 days", () => {
  it("keeps the latest of results less than 7 days apart, oldest first", () => {
    const a = checkIn("2026-07-01");
    const b = checkIn("2026-10-01");
    const c = checkIn("2026-10-05");
    assert.deepEqual(trendPoints([c, a, b]).map((x) => x.id), [a.id, c.id]);
  });

  it("keeps results exactly 7 days apart", () => {
    const a = checkIn("2026-10-01");
    const b = checkIn("2026-10-08");
    assert.equal(trendPoints([a, b]).length, 2);
  });

  it("thins self and family lines separately", () => {
    const self = checkIn("2026-10-01");
    const proxy = checkIn("2026-10-03", { mode: "proxy" });
    assert.equal(trendPoints([self, proxy]).length, 2);
  });
});

describe("changesSinceLast — only band changes count", () => {
  it("is null for the first check-in", () => {
    assert.equal(changesSinceLast([checkIn("2026-10-01")]), null);
  });

  it("reports a dimension moving between bands, in either direction", () => {
    const before = checkIn("2026-07-01", { bands: { SOC: "closer_look" } });
    const after = checkIn("2026-10-01", { bands: { NUT: "closer_look" } });
    const c = changesSinceLast([after, before])!;
    assert.deepEqual(
      c.dims.map((d) => [d.dim, d.direction]),
      [["NUT", "harder"], ["SOC", "better"]],
    );
    assert.equal(c.deteriorated, false);
  });

  it("ignores not-applicable and not-enough-info areas", () => {
    const before = checkIn("2026-07-01", { bands: { MED: "not_applicable" } });
    const after = checkIn("2026-10-01", { bands: { MED: "insufficient" } });
    assert.deepEqual(changesSinceLast([before, after])!.dims, []);
  });

  it("deterioration: any area drops to Needs attention", () => {
    const c = changesSinceLast([checkIn("2026-07-01"), checkIn("2026-10-01", { bands: { HOM: "needs_attention" } })])!;
    assert.equal(c.deteriorated, true);
  });

  it("deterioration: two areas drop one band", () => {
    const c = changesSinceLast([checkIn("2026-07-01"), checkIn("2026-10-01", { bands: { HOM: "closer_look", SOC: "closer_look" } })])!;
    assert.equal(c.deteriorated, true);
  });

  it("deterioration: overall drops a band", () => {
    const c = changesSinceLast([checkIn("2026-07-01"), checkIn("2026-10-01", { display: "mostly_one" })])!;
    assert.equal(c.dims.length, 0);
    assert.equal(c.deteriorated, true);
  });

  it("never compares a family-answered result with the elder's own", () => {
    assert.equal(changesSinceLast([checkIn("2026-07-01"), checkIn("2026-10-01", { mode: "proxy" })]), null);
  });

  it("compares against a check-in at least 7 days earlier", () => {
    const old = checkIn("2026-07-01", { bands: { SOC: "closer_look" } });
    const sameWeek = checkIn("2026-09-28", { bands: { SOC: "needs_attention" } });
    const latest = checkIn("2026-10-01");
    const c = changesSinceLast([old, sameWeek, latest])!;
    assert.equal(c.previous.id, old.id);
    assert.deepEqual(c.dims.map((d) => d.dim), ["SOC"]);
  });
});
