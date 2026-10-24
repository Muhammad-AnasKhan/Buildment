import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compareRungs, formatCount as ladderCount, formatHuman, formatReal, humanSeconds, logPosition, nearestRung, raceFrame, roundTripAt, RACE_TRIP_S } from "@/canvas/models/latency-ladder";
import {
  availabilityVerdict,
  chainAvailability,
  formatAvailability,
  formatDowntime,
  parallelAvailability,
  redDays,
  seriesAvailability,
  spreadDay,
} from "@/canvas/models/availability";
import { drivingNumber, envelopeVerdict, estimateEnvelope, flowRate, formatBits, formatBytes, formatCount, sig3, stepValue } from "@/canvas/models/envelope-estimate";
import { LATENCY_RUNGS, sysdesignM2LatencyLadder } from "@/canvas/sysdesign-m2-latency-ladder/data";
import { SADA_ESTIMATE, sysdesignM2Estimator } from "@/canvas/sysdesign-m2-estimator/data";
import { AVAILABILITY_PARTS, sysdesignM2AvailabilityBuilder } from "@/canvas/sysdesign-m2-availability-builder/data";

const rung = (id: string) => LATENCY_RUNGS.find((r) => r.id === id)!;

describe("latency ladder model", () => {
  it("turns nanoseconds into the chapter's human times", () => {
    const human = (id: string) => formatHuman(humanSeconds(rung(id).ns));
    expect(human("l1")).toBe("1 second");
    expect(human("memory")).toBe("1.7 minutes");
    expect(human("switch")).toBe("2.8 hours");
    expect(human("ssd")).toBe("1.2 days");
    expect(human("region")).toBe("2.9 days");
    expect(human("redis")).toBe("5.8 days");
    expect(human("disk")).toBe("3.8 months");
    expect(human("atlantic")).toBe("2.5 years");
    expect(human("asia")).toBe("5.1 years");
    expect(formatReal(250_000)).toBe("250 µs");
    expect(formatReal(160_000_000)).toBe("160 ms");
  });

  it("counts the slow rung in the fast one, whichever order they are tapped", () => {
    const a = compareRungs(rung("memory"), rung("asia"));
    const b = compareRungs(rung("asia"), rung("memory"));
    expect(a.ratio).toBe(1_600_000);
    expect(a.verdict).toBe("Asia trip = 1.6 million memory reads");
    expect(b.verdict).toBe(a.verdict);
    expect(compareRungs(rung("region"), rung("ssd")).verdict).toBe("Region trip = 2.5 SSD reads");
    expect(compareRungs(rung("ssd"), rung("ssd")).same).toBe(true);
    expect(ladderCount(160_000_000)).toBe("160 million");
  });

  it("keeps every verdict to 38 characters", () => {
    for (const a of LATENCY_RUNGS) for (const b of LATENCY_RUNGS) {
      const v = compareRungs(a, b).verdict;
      expect(v.length, v).toBeLessThanOrEqual(38);
    }
  });

  it("places rungs in order on the log ruler and snaps to the nearest", () => {
    const ps = LATENCY_RUNGS.map((r) => logPosition(r.ns, 1, 1e9));
    for (let i = 1; i < ps.length; i++) expect(ps[i]).toBeGreaterThan(ps[i - 1]);
    expect(ps[0]).toBe(0);
    expect(nearestRung(0.23, LATENCY_RUNGS, 1, 1e9).id).toBe("memory");
    expect(nearestRung(2, LATENCY_RUNGS, 1, 1e9).id).toBe("asia");
    expect(logPosition(0, 1, 10)).toBe(0);
  });

  it("runs the race: the count reaches the ratio when the slow trip ends", () => {
    const cmp = compareRungs(rung("memory"), rung("asia"));
    const half = raceFrame(RACE_TRIP_S / 2, cmp);
    expect(half.progress).toBeCloseTo(0.5);
    expect(half.count).toBeCloseTo(800_000);
    expect(half.humanElapsed).toBeCloseTo(80_000_000);
    const end = raceFrame(0, cmp, true);
    expect(end.count).toBe(1_600_000);
    expect(end.holding).toBe(true);
    expect(formatHuman(end.humanElapsed)).toBe("5.1 years");
    expect(raceFrame(Number.NaN, cmp).progress).toBe(1);
    expect(roundTripAt(0)).toBe(0);
    expect(roundTripAt(0.5)).toBe(1);
    expect(roundTripAt(1)).toBe(0);
  });
});

describe("availability model", () => {
  it("multiplies a chain and the chapter's numbers come out", () => {
    expect(seriesAvailability([])).toBe(1);
    expect(seriesAvailability([0.999, 0.999, 0.999])).toBeCloseTo(0.997003, 6);
    expect(parallelAvailability(0.999, 2)).toBeCloseTo(0.999999, 9);
    expect(parallelAvailability(0.999, 0)).toBe(0);
    expect(parallelAvailability(0.99, 2)).toBeCloseTo(0.9999, 9);
  });

  it("matches the chapter: 99.79% and 18 hours, then 99.89% and 9.6 hours, then 99.99%", () => {
    const parts = AVAILABILITY_PARTS.map((p) => ({ ...p }));
    const base = chainAvailability(parts);
    expect(availabilityVerdict(base).text).toBe("99.79%: 18 hours down a year");
    expect(base.weakest?.id).toBe("db");
    const twoApps = chainAvailability(parts.map((p) => (p.id === "app" ? { ...p, copies: 2 } : p)));
    expect(availabilityVerdict(twoApps).text).toBe("99.89%: 9.6 hours down a year");
    const twoDbs = chainAvailability(parts.map((p) => (p.id === "app" || p.id === "db" ? { ...p, copies: 2 } : p)));
    expect(formatAvailability(twoDbs.availability)).toBe("99.99%");
    expect(twoDbs.weakest?.id).toBe("lb");
    const three = chainAvailability([0, 1, 2].map((i) => ({ id: `p${i}`, name: "x", availability: 0.999, copies: 1 })));
    expect(availabilityVerdict(three).text).toBe("99.7%: 26 hours down a year");
    expect(availabilityVerdict(three).tone).toBe("bad");
  });

  it("formats nines and downtime without rounding up to 100%", () => {
    expect(formatAvailability(0.999999)).toBe("99.9999%");
    expect(formatAvailability(0.9999999999)).not.toBe("100%");
    expect(formatAvailability(1)).toBe("100%");
    expect(formatDowntime(0.009)).toBe("32 seconds");
    expect(formatDowntime(0.88)).toBe("53 minutes");
    expect(formatDowntime(87.6)).toBe("3.7 days");
    expect(formatDowntime(1)).toBe("1 hour");
  });

  it("keeps every verdict to 38 characters, for every mix of copies", () => {
    const counts = [0, 1, 2, 3];
    for (const a of counts) for (const b of counts) for (const c of counts) for (const d of counts) {
      const parts = AVAILABILITY_PARTS.map((p, i) => ({ ...p, copies: [a, b, c, d][i] }));
      const v = availabilityVerdict(chainAvailability(parts)).text;
      expect(v.length, v).toBeLessThanOrEqual(38);
    }
  });

  it("draws red days that add up to the chain's downtime, worst part first", () => {
    const result = chainAvailability(AVAILABILITY_PARTS);
    const days = redDays(result);
    const total = days.reduce((s, d) => s + d.fraction, 0) * 24;
    expect(total).toBeCloseTo(result.downHours, 6);
    expect(new Set(days.map((d) => d.day)).size).toBe(days.length);
    for (const d of days) expect(d.day).toBeGreaterThanOrEqual(0);
    expect(redDays(chainAvailability([]))).toEqual([]);
    expect(new Set(Array.from({ length: 365 }, (_, i) => spreadDay(i))).size).toBe(365);
  });
});

describe("envelope estimate model", () => {
  const r = estimateEnvelope(SADA_ESTIMATE.start);

  it("reproduces Sada's chapter numbers", () => {
    expect(r.requestsPerDay).toBe(20_000_000);
    expect(formatCount(r.averagePerSecond)).toBe("231");
    expect(formatCount(r.peakPerSecond)).toBe("694");
    expect(formatBytes(r.storedPerDayBytes)).toBe("20 GB");
    expect(formatBytes(r.storedPerYearBytes)).toBe("21.9 TB");
    expect(formatBytes(r.sentPerDayBytes)).toBe("2 TB");
    expect(formatBits(r.averageBitsPerSecond)).toBe("185 Mbit/s");
    expect(formatBits(r.peakBitsPerSecond)).toBe("556 Mbit/s");
  });

  it("names storage as the driving number at the start, and requests when notes are tiny", () => {
    expect(drivingNumber(r, SADA_ESTIMATE.limits).key).toBe("storage");
    expect(envelopeVerdict(r, SADA_ESTIMATE.limits).text).toBe("21.9 TB a year: more than one disk");
    const small = estimateEnvelope({ ...SADA_ESTIMATE.start, itemBytes: 10_000, users: 10_000_000 });
    expect(envelopeVerdict(small, SADA_ESTIMATE.limits).text).toBe("Peak 6,940/s: one server will not do");
  });

  it("keeps every verdict to 38 characters across all inputs", () => {
    const s = SADA_ESTIMATE.steps;
    for (const users of s.users) for (const requestsPerUser of s.requestsPerUser) for (const peakFactor of s.peakFactor) for (const itemBytes of s.itemBytes) {
      const v = envelopeVerdict(estimateEnvelope({ ...SADA_ESTIMATE.start, users, requestsPerUser, peakFactor, itemBytes }), SADA_ESTIMATE.limits);
      expect(v.text.length, v.text).toBeLessThanOrEqual(38);
    }
  });

  it("rounds to three figures and steps through allowed values", () => {
    expect(sig3(173_611)).toBe("174,000");
    expect(sig3(7.3)).toBe("7.3");
    expect(sig3(0)).toBe("0");
    expect(formatCount(1e9)).toBe("1 billion");
    expect(stepValue([1, 2, 5], 2, 1)).toBe(5);
    expect(stepValue([1, 2, 5], 5, 1)).toBe(5);
    expect(stepValue([1, 2, 5], 3, -1)).toBe(1);
    expect(flowRate(1)).toBeCloseTo(1.4);
    expect(flowRate(1e9)).toBe(6);
    expect(flowRate(0)).toBe(0.3);
    const zero = estimateEnvelope({ ...SADA_ESTIMATE.start, users: Number.NaN });
    expect(zero.peakPerSecond).toBe(0);
  });
});

describe("Module 2 playables render on the server", () => {
  for (const spec of [sysdesignM2LatencyLadder, sysdesignM2Estimator, sysdesignM2AvailabilityBuilder]) {
    it(spec.title, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/="NaN"|>NaN</);
      expect(html).not.toMatch(/—/);
    });
  }

  it("has no em dashes in the words learners read", () => {
    for (const spec of [sysdesignM2LatencyLadder, sysdesignM2Estimator, sysdesignM2AvailabilityBuilder]) {
      expect(`${spec.title} ${spec.purpose} ${spec.limits}`).not.toMatch(/—/);
    }
  });
});
