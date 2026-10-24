import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDesign, designFrame, VERDICT_MAX } from "@/canvas/models/design-stepper";
import {
  chainRates,
  driver,
  estimateTail,
  estimateVerdict,
  NEW_LINK_STEPS,
  perSecond,
  READ_STEPS,
  waslaEstimate,
  YEAR_STEPS,
} from "@/canvas/models/wasla-estimate";
import { formatBytes, formatCount } from "@/canvas/models/envelope-estimate";
import {
  APP_SERVERS,
  CACHED_OPERATIONS,
  designNumbers,
  PARTITION_CHOICES,
  PEAK_OPERATIONS,
  timesPlanText,
  waslaDesign,
} from "@/canvas/models/wasla-design";
import {
  bigCount,
  collision,
  collisionValueText,
  collisionVerdict,
  extraPerSecondText,
  firstClash,
  LENGTHS,
  LINK_LADDER,
  LINK_SNAPS,
  linkFraction,
  linkFromFraction,
  oneInText,
  percentText,
  takenLabel,
} from "@/canvas/models/wasla-collision";
import {
  HIT_LADDER,
  hitFromFraction,
  MAX_NODES,
  missSpacing,
  msText,
  readPath,
  readPathValueText,
  readPathVerdict,
  stillMissDots,
} from "@/canvas/models/wasla-read-path";
import { sysdesignM20EstimatePlay } from "@/canvas/sysdesign-m20-estimate-play/data";
import { sysdesignM20DesignStepper } from "@/canvas/sysdesign-m20-design-stepper/data";
import { sysdesignM20CollisionPlay } from "@/canvas/sysdesign-m20-collision-play/data";
import { sysdesignM20HitRatePlay } from "@/canvas/sysdesign-m20-hit-rate-play/data";

const MAX = 38;

describe("m20 estimate model (20.1)", () => {
  const row = (newLinks: number, reads: number, years: number) => waslaEstimate({ newLinks, reads, years });

  it("matches the spec's table", () => {
    const base = row(500e6, 100, 5);
    expect(base.createsPerSecond).toBeCloseTo(192.9, 1);
    expect(Math.round(base.peakPerSecond)).toBe(96_451);
    expect(base.linksStored).toBe(30e9);
    expect(base.storageBytes).toBe(9e12);

    expect(row(100e6, 100, 5).createsPerSecond).toBeCloseTo(38.6, 1);
    expect(Math.round(row(100e6, 100, 5).peakPerSecond)).toBe(19_290);
    expect(row(100e6, 100, 5).storageBytes).toBe(1.8e12);
    expect(row(2e9, 100, 5).createsPerSecond).toBeCloseTo(771.6, 1);
    expect(Math.round(row(2e9, 100, 5).peakPerSecond)).toBe(385_802);
    expect(row(2e9, 100, 5).storageBytes).toBe(36e12);
    expect(Math.round(row(500e6, 10, 5).peakPerSecond)).toBe(9_645);
    expect(Math.round(row(500e6, 1000, 5).peakPerSecond)).toBe(964_506);
    expect(row(500e6, 100, 1).storageBytes).toBe(1.8e12);
    expect(row(500e6, 100, 10).linksStored).toBe(60e9);
    expect(row(500e6, 100, 10).storageBytes).toBe(18e12);
    const small = row(100e6, 10, 1);
    expect(small.createsPerSecond).toBeCloseTo(38.6, 1);
    expect(Math.round(small.peakPerSecond)).toBe(1_929);
    expect(small.linksStored).toBe(1.2e9);
    expect(small.storageBytes).toBe(360e9);
  });

  it("writes the numbers the way the picture shows them", () => {
    const base = row(500e6, 100, 5);
    expect(perSecond(base.createsPerSecond)).toBe("193 /s");
    expect(perSecond(base.averagePerSecond)).toBe("19,300 /s");
    expect(perSecond(base.peakPerSecond)).toBe("96,500 /s");
    expect(formatCount(base.linksStored)).toBe("30 billion");
    expect(formatBytes(base.storageBytes)).toBe("9 TB");
    expect(estimateTail(base)).toBe("193 creates a second, 96,451 redirects a second at peak, 9 terabytes");
  });

  it("rings the peak card first, then storage, else nothing", () => {
    expect(driver(row(500e6, 100, 5))).toBe("peak");
    expect(driver(row(500e6, 10, 5))).toBe("peak");
    expect(driver(row(100e6, 10, 10))).toBe("none");
    expect(driver(row(100e6, 10, 1))).toBe("none");
    // Peak just under 2,500 and storage at 5 TB or more.
    const storage = { ...row(100e6, 10, 1), peakPerSecond: 2_499 };
    expect(driver({ ...storage, storageBytes: 5e12 })).toBe("storage");
  });

  it("gives the four verdicts, each 38 characters or fewer, across every input", () => {
    expect(estimateVerdict(row(500e6, 100, 5))).toEqual({ text: "Reads drive it: a cache is a must", tone: "warn" });
    expect(estimateVerdict(row(500e6, 10, 5))).toEqual({ text: "Reads matter: a cache helps a lot", tone: "warn" });
    expect(estimateVerdict({ ...row(100e6, 10, 1), storageBytes: 6e12 })).toEqual({ text: "Storage drives it: spread the data", tone: "warn" });
    expect(estimateVerdict(row(100e6, 10, 1))).toEqual({ text: "One database could serve this", tone: "good" });
    const seen = new Set<string>();
    for (const n of NEW_LINK_STEPS) for (const rd of READ_STEPS) for (const y of YEAR_STEPS) {
      const v = estimateVerdict(row(n, rd, y));
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  it("flows faster for bigger values", () => {
    const small = chainRates(row(100e6, 10, 1));
    const big = chainRates(row(2e9, 1000, 10));
    expect(big.peak).toBeGreaterThan(small.peak);
    expect(big.storage).toBeGreaterThan(small.storage);
  });
});

describe("m20 design model (20.2)", () => {
  it("draws every step cleanly for each partition count", () => {
    for (const k of PARTITION_CHOICES) expect(checkDesign(waslaDesign(k)), `k = ${k}`).toEqual([]);
  });

  it("has the five steps of the spec", () => {
    expect(waslaDesign().steps.map((s) => s.title)).toEqual(["One box", "App servers", "Cache", "Partitions", "Counting"]);
  });

  it("matches the spec's numbers", () => {
    expect(PEAK_OPERATIONS).toBe(101_000);
    expect(APP_SERVERS).toBe(20);
    expect(CACHED_OPERATIONS).toBe(11_000);
    expect(designNumbers(1, 5).timesPlan).toBeCloseTo(40.4, 1);
    expect(designNumbers(2, 5).timesPlan).toBeCloseTo(40.4, 1);
    expect(designNumbers(3, 5).timesPlan).toBeCloseTo(4.4, 1);
    expect(Math.round(designNumbers(4, 3).perPartition)).toBe(3_667);
    expect(designNumbers(4, 3).partitionPercent).toBe(147);
    expect(designNumbers(4, 5).perPartition).toBe(2_200);
    expect(designNumbers(4, 5).partitionPercent).toBe(88);
    expect(designNumbers(4, 8).perPartition).toBe(1_375);
    expect(designNumbers(4, 8).partitionPercent).toBe(55);
    expect(designNumbers(5, 5).partitionPercent).toBe(88);
    expect(timesPlanText(40.4)).toBe("40x its plan");
    expect(timesPlanText(4.4)).toBe("4.4x its plan");
  });

  it("shows the spec's verdicts and pills", () => {
    const text = (k: number, step: number) => designFrame(waslaDesign(k), step).verdict;
    expect(text(5, 0)).toEqual({ text: "Database at 40 times its plan", tone: "bad" });
    expect(text(5, 1)).toEqual({ text: "Apps cope, database still 40x over", tone: "bad" });
    expect(text(5, 2)).toEqual({ text: "Cache: database now 4.4 times plan", tone: "warn" });
    expect(text(5, 3)).toEqual({ text: "5 partitions: each at 88% of plan", tone: "good" });
    expect(text(3, 3)).toEqual({ text: "3 partitions: each at 147% of plan", tone: "bad" });
    expect(text(8, 3)).toEqual({ text: "8 partitions: each at 55% of plan", tone: "good" });
    expect(text(5, 4)).toEqual({ text: "Counting leaves the redirect path", tone: "good" });
    for (const k of PARTITION_CHOICES) for (let s = 0; s < 5; s++) expect(designFrame(waslaDesign(k), s).verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
    const pill = (k: number, step: number, id: string) => designFrame(waslaDesign(k), step).actors.find((a) => a.id === id)?.status?.text;
    expect(pill(5, 0, "apps")).toBe("40x its plan");
    expect(pill(5, 1, "apps")).toBe("20 servers");
    expect(pill(5, 1, "db")).toBe("40x its plan");
    expect(pill(5, 2, "db")).toBe("4.4x its plan");
    expect(pill(3, 3, "db")).toBe("147% of plan");
    expect(pill(3, 4, "db")).toBe("147% of plan");
  });

  it("keeps what earlier steps added and adds the queue and counter last", () => {
    const design = waslaDesign(5);
    const last = designFrame(design, 4);
    const ids = last.actors.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(["browsers", "apps", "cache", "db", "queue", "counter"]));
    expect(designFrame(design, 3).actors.map((a) => a.id)).not.toContain("queue");
    expect(designFrame(design, 2).links.map((l) => l.id)).not.toContain("apps-db");
    // Nine in ten requests turn back at the cache, one goes on to the database.
    const flows = designFrame(design, 2).flows;
    expect(flows.filter((f) => f.ids.at(-1) === "cache")).toHaveLength(9);
    expect(flows.filter((f) => f.ids.at(-1) === "db")).toHaveLength(1);
    expect(last.flows.some((f) => f.ids.join() === "apps,queue,counter")).toBe(true);
  });
});

describe("m20 collision model (20.3)", () => {
  const share = (L: number, n: number) => collision(L, n).share;

  it("matches the spec's table of codes and first clashes", () => {
    expect(bigCount(62 ** 4)).toBe("14.8 million");
    expect(bigCount(62 ** 5)).toBe("916 million");
    expect(bigCount(62 ** 6)).toBe("56.8 billion");
    expect(bigCount(62 ** 7)).toBe("3.52 trillion");
    expect(bigCount(62 ** 8)).toBe("218 trillion");
    expect(bigCount(62 ** 9)).toBe("13.5 quadrillion");
    expect(Math.round(firstClash(4))).toBe(4_818);
    expect(Math.round(firstClash(5))).toBe(37_934);
    expect(Math.round(firstClash(6))).toBe(298_696);
    expect(firstClash(7) / 1e6).toBeCloseTo(2.4, 1);
    expect(firstClash(8) / 1e6).toBeCloseTo(18.5, 1);
    expect(firstClash(9) / 1e6).toBeCloseTo(145.8, 1);
  });

  it("matches the spec's shares taken", () => {
    expect(percentText(share(4, 1e6))).toBe("6.8%");
    expect(collision(4, 1e8).full).toBe(true);
    expect(percentText(share(5, 1e6))).toBe("0.11%");
    expect(percentText(share(5, 1e8))).toBe("11%");
    expect(collision(5, 1e9).full).toBe(true);
    expect(percentText(share(6, 1e6))).toBe("0.0018%");
    expect(percentText(share(6, 1e8))).toBe("0.18%");
    expect(percentText(share(6, 1e9))).toBe("1.8%");
    expect(percentText(share(6, 3e10))).toBe("53%");
    expect(percentText(share(7, 1e6))).toBe("0.000028%");
    expect(percentText(share(7, 1e8))).toBe("0.0028%");
    expect(percentText(share(7, 1e9))).toBe("0.028%");
    expect(percentText(share(7, 3e10))).toBe("0.85%");
    expect(percentText(share(8, 1e8))).toBe("0.000046%");
    expect(percentText(share(8, 3e10))).toBe("0.014%");
    expect(percentText(share(9, 1e9))).toBe("0.0000074%");
    expect(percentText(share(9, 3e10))).toBe("0.00022%");
    expect(takenLabel(collision(8, 1e6))).toBe("almost none taken");
    expect(takenLabel(collision(9, 1e8))).toBe("almost none taken");
  });

  it("matches the spec's retries", () => {
    const six = collision(6, 3e10);
    expect(six.extraPerCreate).toBeCloseTo(1.12, 1);
    expect(six.oneIn).toBe(2);
    const seven = collision(7, 3e10);
    expect(seven.extraPerCreate).toBeCloseTo(0.0086, 4);
    expect(seven.oneIn).toBe(117);
    expect(oneInText(seven)).toBe("1 in 117");
    expect(extraPerSecondText(seven)).toBe("1.66 /s");
    expect(collision(8, 3e10).oneIn).toBe(7_278);
    expect(oneInText(collision(8, 3e10))).toBe("1 in 7,278");
    expect(oneInText(collision(4, 1e8))).toBe("none free");
    expect(extraPerSecondText(collision(4, 1e8))).toBe("endless");
  });

  it("gives the verdicts, each 38 characters or fewer, for every length and snap", () => {
    expect(collisionVerdict(collision(4, 1e8))).toEqual({ text: "More links than codes", tone: "bad" });
    expect(collisionVerdict(collision(6, 3e10))).toEqual({ text: "1 create in 2 must retry", tone: "bad" });
    expect(collisionVerdict(collision(6, 1e9))).toEqual({ text: "1 create in 57 must retry", tone: "warn" });
    expect(collisionVerdict(collision(7, 3e10))).toEqual({ text: "Clashes are rare; a retry covers it", tone: "good" });
    for (const L of LENGTHS) for (const n of [...LINK_LADDER, 4_321, 3.4e9]) {
      const v = collisionVerdict(collision(L, n));
      expect(v.text.length, `${L} ${n}: ${v.text}`).toBeLessThanOrEqual(MAX);
    }
  });

  it("reads out the value on both rails", () => {
    expect(collisionValueText(collision(7, 3e10))).toBe("7 characters, 30 billion links, 0.85 percent of codes taken, 1 create in 117 retries");
    expect(collisionValueText(collision(4, 1e8))).toBe("4 characters, 100 million links, more links than codes");
  });

  it("maps the log rail both ways and snaps near the chapter's points", () => {
    expect(linkFraction(1_000)).toBe(0);
    expect(linkFraction(3e10)).toBe(1);
    for (const s of LINK_SNAPS) expect(linkFromFraction(linkFraction(s))).toBe(s);
    expect(linkFromFraction(0)).toBe(1_000);
    expect(linkFromFraction(1)).toBe(3e10);
    // Away from a snap point the value is rounded to two figures.
    const mid = linkFromFraction(0.5);
    expect(mid).toBeGreaterThan(1e6);
    expect(mid).toBeLessThan(1e8);
    expect(String(mid).replace(/0+$/, "").replace(".", "").length).toBeLessThanOrEqual(2);
    const f = linkFraction(2.4e6);
    expect(f).toBeGreaterThan(linkFraction(1e6));
    expect(f).toBeLessThan(linkFraction(1e8));
  });
});

describe("m20 hit rate model (20.4)", () => {
  it("matches the spec's table", () => {
    const rows: [number, string, string, number, number][] = [
      [0, "3.05", "3.05", 101_000, 41],
      [50, "1.80", "3.05", 51_000, 21],
      [80, "1.05", "3.05", 21_000, 9],
      [90, "0.80", "3.05", 11_000, 5],
      [95, "0.68", "3.05", 6_000, 3],
      [98, "0.60", "3.05", 3_000, 2],
      [99, "0.58", "0.55", 2_000, 1],
    ];
    for (const [h, avg, p99, ops, nodes] of rows) {
      const r = readPath(h);
      expect(msText(r.averageMs), `average at ${h}`).toBe(avg);
      expect(msText(r.p99Ms), `p99 at ${h}`).toBe(p99);
      expect(r.operations, `operations at ${h}`).toBe(ops);
      expect(r.nodes, `nodes at ${h}`).toBe(nodes);
    }
    expect(MAX_NODES).toBe(41);
  });

  it("keeps p99 at the miss time until 99 and never rounds 21,000 up to 9 nodes by mistake", () => {
    for (let h = 0; h < 99; h++) expect(readPath(h).p99Ms).toBe(3.05);
    expect(readPath(99).p99Ms).toBe(0.55);
    expect(readPath(80).nodes).toBe(9);
    expect(readPath(120).hit).toBe(99);
    expect(readPath(-5).hit).toBe(0);
  });

  it("gives the three verdicts, each 38 characters or fewer", () => {
    expect(readPathVerdict(readPath(0))).toEqual({ text: "41 database nodes for misses", tone: "bad" });
    expect(readPathVerdict(readPath(80))).toEqual({ text: "9 database nodes for misses", tone: "warn" });
    expect(readPathVerdict(readPath(90))).toEqual({ text: "Fast on average, p99 pays a miss", tone: "warn" });
    expect(readPathVerdict(readPath(98))).toEqual({ text: "Fast on average, p99 pays a miss", tone: "warn" });
    expect(readPathVerdict(readPath(99))).toEqual({ text: "p99 is now the cache time", tone: "good" });
    for (const h of HIT_LADDER) expect(readPathVerdict(readPath(h)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("reads out the rail value", () => {
    expect(readPathValueText(readPath(90))).toBe("90 percent hits, average 0.80 ms, p99 3.05 ms, 11,000 database operations a second, 5 nodes");
    expect(readPathValueText(readPath(99))).toContain("1 node");
  });

  it("snaps a drag to the chapter's points and walks every percent with the keys", () => {
    expect(hitFromFraction(0.9 / 0.99 + 0.003)).toBe(90);
    expect(hitFromFraction(0.5)).toBe(50);
    expect(hitFromFraction(0)).toBe(0);
    expect(hitFromFraction(1)).toBe(99);
    expect(HIT_LADDER[0]).toBe(0);
    expect(HIT_LADDER.at(-1)).toBe(99);
    expect(HIT_LADDER).toHaveLength(100);
  });

  it("sends fewer dots to the database as the hit rate rises", () => {
    expect(missSpacing(0, 16)).toBe(16);
    expect(missSpacing(90, 16)).toBeCloseTo(160, 5);
    expect(missSpacing(99, 16)).toBeCloseTo(1600, 5);
    expect(stillMissDots(0)).toBe(6);
    expect(stillMissDots(90)).toBe(1);
    expect(stillMissDots(99)).toBe(0);
  });
});

describe("m20 playable canvases render on the server", () => {
  const specs = [sysdesignM20EstimatePlay, sysdesignM20DesignStepper, sysdesignM20CollisionPlay, sysdesignM20HitRatePlay];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
    }
  });

  it("shows the starting verdicts", () => {
    expect(html(sysdesignM20EstimatePlay)).toContain("Reads drive it: a cache is a must");
    expect(html(sysdesignM20DesignStepper)).toContain("Database at 40 times its plan");
    expect(html(sysdesignM20CollisionPlay)).toContain("1 create in 2 must retry");
    expect(html(sysdesignM20HitRatePlay)).toContain("Fast on average, p99 pays a miss");
  });

  it("puts a slider on every drag and a button on every tap", () => {
    expect((html(sysdesignM20EstimatePlay).match(/role="slider"/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((html(sysdesignM20CollisionPlay).match(/role="slider"/g) ?? []).length).toBe(2);
    expect((html(sysdesignM20HitRatePlay).match(/role="slider"/g) ?? []).length).toBe(1);
    const stepper = html(sysdesignM20DesignStepper);
    expect((stepper.match(/aria-current="step"/g) ?? []).length).toBe(1);
    expect(stepper).toContain("Back");
    expect(stepper).toContain("Next");
  });

  it("gives the estimate sliders the spec's value text", () => {
    expect(html(sysdesignM20EstimatePlay)).toContain("500 million new links a month, 193 creates a second, 96,451 redirects a second at peak, 9 terabytes");
  });

  it("gives the rails the spec's value text", () => {
    expect(html(sysdesignM20CollisionPlay)).toContain("6 characters, 30 billion links, 53 percent of codes taken, 1 create in 2 retries");
    expect(html(sysdesignM20HitRatePlay)).toContain("90 percent hits, average 0.80 ms, p99 3.05 ms, 11,000 database operations a second, 5 nodes");
  });
});
