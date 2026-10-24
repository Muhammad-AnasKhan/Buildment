import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDesign, designFrame, VERDICT_MAX } from "@buildment/learning-ui/canvas/models/design-stepper";
import {
  chainRates,
  crawlEstimate,
  driver,
  estimateTail,
  estimateVerdict,
  mbitText,
  PAGE_STEPS,
  rate,
  SIZE_STEPS,
  sitesText,
  terabytes,
  WAIT_STEPS,
} from "@buildment/learning-ui/canvas/models/crawl-estimate";
import {
  checksRounded,
  checksText,
  crawlDesign,
  gbText as shardGb,
  LINK_CHECKS,
  MACHINES,
  MACHINES_CACHED,
  shardNumbers,
  shardVerdict,
  SHARD_CHOICES,
  TIMES_TOO_SLOW,
  WRITE_MB_PER_SECOND,
} from "@buildment/learning-ui/canvas/models/crawl-design";
import {
  CAPACITY,
  daysText,
  hostRate,
  hostValueText,
  hostVerdict,
  laneRate,
  lanesFor,
  SITE_STEPS,
  slotsFill,
  stopFraction,
  WAIT_STEPS as HOST_WAITS,
} from "@buildment/learning-ui/canvas/models/crawl-host-rate";
import {
  GAPS,
  gapText,
  KINDS,
  MAX_MARKS,
  percent,
  recrawl,
  recrawlValueText,
  recrawlVerdict,
  strip,
  visitsText,
} from "@buildment/learning-ui/canvas/models/crawl-recrawl";
import {
  barShares,
  bitsText,
  bloomPlan,
  bloomRates,
  bloomTail,
  bloomVerdict,
  ERROR_STEPS,
  errorText,
  gbText,
  sizeText,
  skippedText,
  URL_STEPS,
} from "@buildment/learning-ui/canvas/models/crawl-bloom";
import { sysdesignM26EstimatePlay } from "@buildment/learning-ui/canvas/sysdesign-m26-estimate-play/data";
import { sysdesignM26DesignStepper } from "@buildment/learning-ui/canvas/sysdesign-m26-design-stepper/data";
import { sysdesignM26HostRatePlay } from "@buildment/learning-ui/canvas/sysdesign-m26-host-rate-play/data";
import { sysdesignM26RecrawlPlay } from "@buildment/learning-ui/canvas/sysdesign-m26-recrawl-play/data";
import { sysdesignM26BloomPlay } from "@buildment/learning-ui/canvas/sysdesign-m26-bloom-play/data";

const MAX = 38;

describe("m26 estimate model (26.1)", () => {
  const row = (pages: number, sizeKb: number, wait: number) => crawlEstimate({ pages, sizeKb, wait });

  it("matches the spec's table", () => {
    const base = row(2e9, 100, 1);
    expect(base.perSecond).toBeCloseTo(771.6, 1);
    expect(Math.round(base.mbit)).toBe(617);
    expect(Math.round(base.sites)).toBe(772);
    expect(Math.round(base.inFlight)).toBe(386);
    expect(Math.round(base.linkChecks)).toBe(38_580);
    expect(base.storedTb).toBe(50);

    const small = row(0.5e9, 100, 1);
    expect(small.perSecond).toBeCloseTo(192.9, 1);
    expect(Math.round(small.mbit)).toBe(154);
    expect(Math.round(small.sites)).toBe(193);
    expect(Math.round(small.inFlight)).toBe(96);
    expect(Math.round(small.linkChecks)).toBe(9_645);
    expect(small.storedTb).toBe(12.5);

    const big = row(10e9, 100, 1);
    expect(big.perSecond).toBeCloseTo(3858, 0);
    expect(Math.round(big.mbit)).toBe(3_086);
    expect(Math.round(big.sites)).toBe(3_858);
    expect(Math.round(big.inFlight)).toBe(1_929);
    expect(Math.round(big.linkChecks)).toBe(192_901);
    expect(big.storedTb).toBe(250);

    expect(Math.round(row(2e9, 500, 1).mbit)).toBe(3_086);
    expect(row(2e9, 500, 1).storedTb).toBe(250);
    expect(Math.round(row(10e9, 500, 1).mbit)).toBe(15_432);
    expect(row(10e9, 500, 1).storedTb).toBe(1_250);
    expect(Math.round(row(2e9, 100, 5).sites)).toBe(3_858);
    expect(Math.round(row(2e9, 100, 0.5).sites)).toBe(386);
    const tiny = row(0.5e9, 20, 0.5);
    expect(Math.round(tiny.mbit)).toBe(31);
    expect(Math.round(tiny.sites)).toBe(96);
    expect(tiny.storedTb).toBe(2.5);
  });

  it("rings in the spec's order", () => {
    expect(driver(row(2e9, 100, 1))).toBe("sites");
    expect(driver(row(0.5e9, 100, 1))).toBe("sites");
    expect(driver(row(10e9, 100, 1))).toBe("sites");
    expect(driver(row(2e9, 500, 1))).toBe("sites");
    expect(driver(row(10e9, 500, 1))).toBe("bandwidth");
    expect(driver(row(2e9, 100, 5))).toBe("sites");
    expect(driver(row(2e9, 100, 0.5))).toBe("sites");
    expect(driver(row(0.5e9, 20, 0.5))).toBe("none");
    // Storage only drives it when sites stay under 100 and storage reaches 20 TB.
    expect(driver({ ...row(0.5e9, 20, 0.5), storedTb: 20 })).toBe("storage");
  });

  it("writes the numbers the way the picture shows them", () => {
    const base = row(2e9, 100, 1);
    expect(rate(base.perSecond)).toBe("772 /s");
    expect(mbitText(base.mbit)).toBe("617 Mbit/s");
    expect(sitesText(base.sites)).toBe("772 sites");
    expect(rate(base.linkChecks)).toBe("38,580 /s");
    expect(terabytes(base.storedTb)).toBe("50 TB");
    expect(terabytes(12.5)).toBe("12.5 TB");
    expect(terabytes(2.5)).toBe("2.5 TB");
    expect(terabytes(1250)).toBe("1,250 TB");
    expect(estimateTail(base)).toContain("772 pages a second");
  });

  it("gives four verdicts of 38 characters or fewer across every input", () => {
    expect(estimateVerdict(row(10e9, 500, 1))).toEqual({ text: "Bandwidth drives it: spread the load", tone: "warn" });
    expect(estimateVerdict(row(2e9, 100, 1))).toEqual({ text: "Politeness: need many sites at once", tone: "warn" });
    expect(estimateVerdict({ ...row(0.5e9, 20, 0.5), storedTb: 20 })).toEqual({ text: "Storage drives it: plan the disks", tone: "warn" });
    expect(estimateVerdict(row(0.5e9, 20, 0.5))).toEqual({ text: "One machine could crawl this", tone: "good" });
    const seen = new Set<string>();
    for (const n of PAGE_STEPS) for (const s of SIZE_STEPS) for (const w of WAIT_STEPS) {
      const v = estimateVerdict(row(n, s, w));
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  it("flows faster for bigger values", () => {
    const small = chainRates(row(0.5e9, 20, 0.5));
    const big = chainRates(row(10e9, 500, 5));
    expect(big.sites).toBeGreaterThan(small.sites);
    expect(big.mbit).toBeGreaterThan(small.mbit);
    expect(big.stored).toBeGreaterThan(small.stored);
  });
});

describe("m26 design model (26.2)", () => {
  it("draws every step cleanly for each shard count", () => {
    for (const k of SHARD_CHOICES) expect(checkDesign(crawlDesign(k)), `k = ${k}`).toEqual([]);
  });

  it("has the five steps of the spec", () => {
    expect(crawlDesign().steps.map((s) => s.title)).toEqual(["One fetcher", "Many in flight", "DNS cache", "Shards", "Storage"]);
  });

  it("matches the spec's numbers", () => {
    expect(TIMES_TOO_SLOW).toBe(386);
    expect(MACHINES).toBe(8);
    expect(MACHINES_CACHED).toBe(7);
    expect(Math.round(LINK_CHECKS)).toBe(38_580);
    expect(shardNumbers(4).gb).toBe(6);
    expect(Math.round(shardNumbers(4).checks)).toBe(9_645);
    expect(shardNumbers(8).gb).toBe(3);
    expect(Math.round(shardNumbers(8).checks)).toBe(4_823);
    expect(shardNumbers(16).gb).toBe(1.5);
    expect(Math.round(shardNumbers(16).checks)).toBe(2_411);
    expect(WRITE_MB_PER_SECOND).toBeCloseTo(19.3, 1);
    expect(shardGb(1.5)).toBe("1.5 GB");
    expect(checksText(shardNumbers(8).checks)).toBe("4,823");
    expect(checksRounded(shardNumbers(8).checks)).toBe("4,800");
  });

  it("gives the spec's verdicts, each 38 characters or fewer", () => {
    const verdicts = [0, 1, 2, 3, 4].map((i) => designFrame(crawlDesign(8), i).verdict);
    expect(verdicts.map((v) => v.text)).toEqual([
      "One fetcher: 386 times too slow",
      "8 machines carry 772 pages a second",
      "DNS cache: 7 machines, fewer lookups",
      "8 shards: 3 GB and 4,800 checks each",
      "Pages to object storage: 50 TB/month",
    ]);
    expect(verdicts.map((v) => v.tone)).toEqual(["bad", "good", "good", "good", "good"]);
    expect(shardVerdict(4)).toEqual({ text: "4 shards: 6 GB and 9,600 checks each", tone: "warn" });
    expect(shardVerdict(16)).toEqual({ text: "16 shards: 1.5 GB and 2,400 each", tone: "good" });
    for (const k of SHARD_CHOICES) for (let s = 0; s < 5; s++) expect(designFrame(crawlDesign(k), s).verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("shows the machines, the shard pill and the storage pill on the right cards", () => {
    const pill = (step: number, id: string, k = 8) => designFrame(crawlDesign(k), step).actors.find((a) => a.id === id)?.status?.text;
    expect(pill(0, "fetch")).toBe("2 pages/s");
    expect(pill(1, "fetch")).toBe("8 machines");
    expect(pill(2, "fetch")).toBe("7 machines");
    expect(pill(3, "frontier", 4)).toBe("6 GB each");
    expect(pill(3, "frontier", 8)).toBe("3 GB each");
    expect(pill(3, "frontier", 16)).toBe("1.5 GB each");
    expect(pill(4, "store")).toBe("50 TB/month");
    expect(designFrame(crawlDesign(8), 3).tags.find((t) => t.id === "checks")?.text).toBe("4,823 checks/s");
    // The cache arrives in step 3 and the lookup link to the resolver is replaced.
    expect(designFrame(crawlDesign(8), 1).actors.some((a) => a.id === "cache")).toBe(false);
    expect(designFrame(crawlDesign(8), 2).actors.some((a) => a.id === "cache")).toBe(true);
    expect(designFrame(crawlDesign(8), 2).links.some((l) => l.id === "fetch-dns")).toBe(false);
  });
});

describe("m26 host rate model (26.3)", () => {
  const speed = (sites: number, wait: number) => hostRate(sites, wait);

  it("matches the spec's table", () => {
    const rows: [number, number, number, string, number, number][] = [
      [20, 1, 20, "sites", 772, 11.6],
      [100, 1, 100, "sites", 772, 11.6],
      [772, 1, 772, "sites", 772, 11.6],
      [1000, 1, 1000, "sites", 772, 11.6],
      [3000, 1, 2000, "slots", 772, 11.6],
      [1000, 5, 200, "sites", 3858, 57.9],
      [772, 5, 154, "sites", 3858, 57.9],
      [1000, 0.5, 2000, "both", 386, 5.8],
      [20, 2, 10, "sites", 1543, 23.1],
      [10_000, 5, 2000, "both", 3858, 57.9],
    ];
    for (const [sites, wait, expected, limit, needed, days] of rows) {
      const r = speed(sites, wait);
      expect(Math.round(r.speed), `${sites} sites, ${wait} s`).toBe(expected);
      expect(r.limit, `${sites} sites, ${wait} s`).toBe(limit);
      expect(Math.round(r.sitesNeeded)).toBe(needed);
      expect(Number(r.bigSiteDays.toFixed(1))).toBe(days);
      expect(daysText(r.bigSiteDays)).toBe(`${days} days`);
    }
    expect(CAPACITY).toBe(2000);
  });

  it("gives the spec's verdicts, each 38 characters or fewer", () => {
    expect(hostVerdict(speed(20, 1))).toEqual({ text: "Too few sites: 20 pages a second", tone: "bad" });
    expect(hostVerdict(speed(300, 1))).toEqual({ text: "Too few sites: 300 pages a second", tone: "bad" });
    expect(hostVerdict(speed(100, 0.5)).tone).toBe("bad");
    expect(hostVerdict(speed(1000, 2))).toEqual({ text: "Short of 772: 500 pages a second", tone: "warn" });
    expect(hostVerdict(speed(772, 1))).toEqual({ text: "Enough sites: 772 pages a second", tone: "good" });
    expect(hostVerdict(speed(1000, 1))).toEqual({ text: "Enough sites: 1,000 pages a second", tone: "good" });
    expect(hostVerdict(speed(3000, 1))).toEqual({ text: "Slots are the limit: 2,000 a second", tone: "good" });
    expect(hostVerdict(speed(1000, 0.5))).toEqual({ text: "Slots are the limit: 2,000 a second", tone: "good" });
    for (const s of SITE_STEPS) for (const w of HOST_WAITS) expect(hostVerdict(speed(s, w)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("draws at most 24 lanes, slows them when slots are the limit and fills the bar to the speed", () => {
    expect(lanesFor(10)).toBe(10);
    expect(lanesFor(772)).toBe(24);
    expect(laneRate(speed(20, 2))).toBe(0.5);
    expect(laneRate(speed(3000, 1))).toBeCloseTo(2 / 3, 5);
    expect(slotsFill(speed(20, 1))).toBeCloseTo(0.01, 5);
    expect(slotsFill(speed(3000, 1))).toBe(1);
    expect(stopFraction(SITE_STEPS, 10)).toBe(0);
    expect(stopFraction(SITE_STEPS, 10_000)).toBe(1);
    expect(hostValueText(speed(20, 1))).toBe("20 sites, 1 second wait, 20 pages a second, limited by sites");
    expect(hostValueText(speed(3000, 5))).toContain("limited by sites");
  });
});

describe("m26 recrawl model (26.3)", () => {
  const share = (kind: number, gap: number) => {
    const r = recrawl(KINDS[kind].perDay, GAPS[gap]);
    return [percent(r.fresh), percent(r.wasted)];
  };

  it("matches the spec's table of fresh and wasted percent", () => {
    const table: number[][][] = [
      // News, then product, then old article; one pair per gap from 1 hour to 90 days.
      [[88, 78], [63, 37], [32, 5], [17, 0], [6, 0], [2, 0], [1, 0], [1, 0], [0, 0]],
      [[100, 99], [99, 98], [97, 93], [93, 87], [81, 65], [63, 37], [43, 14], [23, 1], [8, 0]],
      [[100, 100], [100, 100], [100, 99], [99, 99], [98, 97], [96, 93], [93, 86], [85, 72], [63, 37]],
    ];
    table.forEach((pairs, kind) => pairs.forEach((expected, gap) => expect(share(kind, gap), `${KINDS[kind].id} gap ${gap}`).toEqual(expected)));
  });

  it("counts visits for 10 million pages", () => {
    const visits = GAPS.map((g) => recrawl(6, g).visitsPerDay);
    expect(visits.map(visitsText)).toEqual(["240 million", "60 million", "20 million", "10 million", "3.3 million", "1.4 million", "0.71 million", "0.33 million", "0.11 million"]);
    expect(recrawl(6, 30).visitsPerMonth).toBe(1);
  });

  it("gives the spec's verdicts", () => {
    const verdict = (kind: number, gap: number) => recrawlVerdict(recrawl(KINDS[kind].perDay, GAPS[gap]));
    expect(verdict(0, 0)).toEqual({ text: "Most visits find nothing new", tone: "warn" });
    expect(verdict(1, 3)).toEqual({ text: "Most visits find nothing new", tone: "warn" });
    expect(verdict(0, 2)).toEqual({ text: "Stale most of the time", tone: "bad" });
    expect(verdict(0, 3)).toEqual({ text: "Stale most of the time", tone: "bad" });
    expect(verdict(0, 1)).toEqual({ text: "Fresh enough, little wasted", tone: "good" });
    expect(verdict(1, 5)).toEqual({ text: "Fresh enough, little wasted", tone: "good" });
    expect(verdict(2, 8)).toEqual({ text: "Fresh enough, little wasted", tone: "good" });
    for (const k of KINDS) for (const g of GAPS) expect(recrawlVerdict(recrawl(k.perDay, g)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("depends only on change rate times the gap", () => {
    const a = recrawl(6, 1 / 24);
    const b = recrawl(1 / 7, 7 / 6 / 24 / 6);
    expect(a.product).toBeCloseTo(0.25, 5);
    expect(recrawl(2, 1).fresh).toBeCloseTo(recrawl(1, 2).fresh, 10);
    expect(recrawl(2, 1).wasted).toBeCloseTo(recrawl(1, 2).wasted, 10);
    expect(b.product).toBeGreaterThan(0);
  });

  it("draws a deterministic strip with at most 48 marks a row", () => {
    for (const k of KINDS) for (const g of GAPS) {
      const s = strip(k.perDay, g);
      expect(s.visits.length).toBeLessThanOrEqual(MAX_MARKS);
      expect(s.changes.length).toBeLessThanOrEqual(MAX_MARKS);
      expect(s.visits.length).toBeGreaterThanOrEqual(8);
      expect(s.changes.length).toBeGreaterThanOrEqual(2);
      for (const t of [...s.visits, ...s.changes]) {
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThanOrEqual(s.days);
      }
      expect(strip(k.perDay, g)).toEqual(s);
    }
    expect(strip(6, 1 / 24).changes.length).toBe(2);
    expect(strip(6, 1 / 24).visits.length).toBe(10);
    expect(strip(6, 3).denseChanges).toBe(true);
  });

  it("writes the gap and the slider text", () => {
    expect(GAPS.map(gapText)).toEqual(["1 hour", "4 hours", "12 hours", "1 day", "3 days", "7 days", "14 days", "30 days", "90 days"]);
    expect(recrawlValueText("news", recrawl(6, 1))).toBe("News front page, visit every 1 day, fresh 17 percent, wasted 0 percent");
  });
});

describe("m26 bloom model (26.4)", () => {
  it("matches the spec's table", () => {
    const rows: [number, number, number, number, number, number, number, number][] = [
      [20e9, 0.01, 9.59, 7, 24.0, 160, 2000, 1e7],
      [20e9, 0.1, 4.79, 3, 12.0, 160, 2000, 1e8],
      [20e9, 0.001, 14.38, 10, 35.9, 160, 2000, 1e6],
      [20e9, 0.0001, 19.17, 13, 47.9, 160, 2000, 1e5],
      [1e9, 0.01, 9.59, 7, 1.2, 8, 100, 1e7],
      [100e9, 0.01, 9.59, 7, 119.8, 800, 10_000, 1e7],
      [100e9, 0.0001, 19.17, 13, 239.6, 800, 10_000, 1e5],
    ];
    for (const [urls, error, bits, k, bloom, exact, strings, skipped] of rows) {
      const p = bloomPlan(urls, error);
      expect(p.bitsPerUrl, `${urls} ${error}`).toBeCloseTo(bits, 2);
      expect(p.hashes).toBe(k);
      expect(p.bloomGb).toBeCloseTo(bloom, 1);
      expect(p.exactGb).toBeCloseTo(exact, 6);
      expect(p.stringsGb).toBeCloseTo(strings, 6);
      expect(p.skippedPerBillion).toBeCloseTo(skipped, 3);
    }
  });

  it("writes the numbers the way the picture shows them", () => {
    const p = bloomPlan(20e9, 0.01);
    expect(bitsText(p.bitsPerUrl)).toBe("9.6 bits");
    expect(gbText(p.bloomGb)).toBe("24 GB");
    expect(gbText(1.2)).toBe("1.2 GB");
    expect(gbText(239.6)).toBe("240 GB");
    expect(sizeText(p.stringsGb)).toBe("2 TB");
    expect(sizeText(160)).toBe("160 GB");
    expect(sizeText(100)).toBe("100 GB");
    expect(errorText(0.1)).toBe("10%");
    expect(errorText(0.0001)).toBe("0.01%");
    expect(skippedText(1e7)).toBe("10 million");
    expect(skippedText(1e5)).toBe("100,000");
    expect(bloomTail(p)).toBe("20 billion URLs, 1 percent error, 24 gigabytes for a Bloom filter against 160 for exact fingerprints");
  });

  it("gives the spec's verdicts, each 38 characters or fewer, across every input", () => {
    expect(bloomVerdict(bloomPlan(20e9, 0.1))).toEqual({ text: "Small, but 1 in 10 new URLs lost", tone: "warn" });
    expect(bloomVerdict(bloomPlan(20e9, 0.01))).toEqual({ text: "Bloom: 24 GB instead of 160 GB", tone: "good" });
    expect(bloomVerdict(bloomPlan(20e9, 0.001))).toEqual({ text: "36 GB, only 1 in 1,000 URLs lost", tone: "good" });
    expect(bloomVerdict(bloomPlan(20e9, 0.0001))).toEqual({ text: "48 GB, 1 in 10,000 URLs lost", tone: "good" });
    expect(bloomVerdict(bloomPlan(1e9, 0.01)).text).toBe("Bloom: 1.2 GB instead of 8 GB");
    for (const u of URL_STEPS) for (const e of ERROR_STEPS) expect(bloomVerdict(bloomPlan(u, e)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("costs about 4.8 more bits per URL for each 10 times lower error", () => {
    const bits = ERROR_STEPS.map((e) => bloomPlan(20e9, e).bitsPerUrl);
    for (let i = 1; i < bits.length; i++) expect(bits[i] - bits[i - 1]).toBeCloseTo(4.79, 1);
  });

  it("scales the bars on one scale and flows faster for more memory", () => {
    const s = barShares(bloomPlan(20e9, 0.01));
    expect(s.strings).toBe(1);
    expect(s.exact).toBeCloseTo(0.08, 5);
    expect(s.bloom).toBeCloseTo(0.012, 3);
    expect(bloomRates(bloomPlan(100e9, 0.0001)).memory).toBeGreaterThan(bloomRates(bloomPlan(1e9, 0.1)).memory);
  });
});

describe("m26 playable canvases", () => {
  const specs = [sysdesignM26EstimatePlay, sysdesignM26DesignStepper, sysdesignM26HostRatePlay, sysdesignM26RecrawlPlay, sysdesignM26BloomPlay];

  it("are custom canvases with a title, a purpose and honest limits", () => {
    for (const spec of specs) {
      expect(spec.kind).toBe("custom");
      expect(spec.title.length).toBeGreaterThan(0);
      expect(spec.purpose.length).toBeGreaterThan(20);
      expect(spec.limits.length).toBeGreaterThan(80);
      expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toMatch(/—/);
    }
  });

  it("render on the server with a picture and the limits fold", () => {
    for (const spec of specs) {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html, spec.title).toContain("<svg");
      expect(html, spec.title).toContain("What this picture leaves out");
    }
  });

  it("show the course defaults at the start", () => {
    const text = (spec: (typeof specs)[number]) =>
      renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits })).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(text(sysdesignM26EstimatePlay)).toContain("Politeness: need many sites at once");
    expect(text(sysdesignM26DesignStepper)).toContain("One fetcher: 386 times too slow");
    expect(text(sysdesignM26HostRatePlay)).toContain("Too few sites: 20 pages a second");
    expect(text(sysdesignM26RecrawlPlay)).toContain("Stale most of the time");
    expect(text(sysdesignM26BloomPlay)).toContain("Bloom: 24 GB instead of 160 GB");
  });
});
