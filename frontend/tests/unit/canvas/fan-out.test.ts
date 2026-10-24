import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  backendsFromFraction,
  backendsToFraction,
  clampBackends,
  fanOutFrame,
  fanOutVerdict,
  LOAD_PERIOD,
  pageLoad,
  slowChance,
  SLOW_MS,
  tallyLoads,
} from "@buildment/learning-ui/canvas/models/fan-out";
import { AREA, backendGrid, CARD_MAX } from "@buildment/learning-ui/canvas/models/fan-out-layout";
import { backendCells, TALLY, TALLY_COLS, TALLY_KEEP } from "@buildment/learning-ui/canvas/sysdesign-m2-fan-out-play/FanOutPlayCanvas";
import { sysdesignM2FanOutPlay } from "@buildment/learning-ui/canvas/sysdesign-m2-fan-out-play/data";

describe("fan-out odds", () => {
  it("matches the chapter: 1%, 10%, 18%, 39%, 63%", () => {
    expect(slowChance(1)).toBeCloseTo(0.01);
    expect(slowChance(10)).toBeCloseTo(0.096, 3);
    expect(slowChance(20)).toBeCloseTo(0.182, 3);
    expect(slowChance(50)).toBeCloseTo(0.395, 3);
    expect(slowChance(100)).toBeCloseTo(0.634, 3);
    expect(fanOutVerdict(100)).toMatchObject({ text: "63% of page loads hit a slow call", tone: "bad" });
    expect(fanOutVerdict(20)).toMatchObject({ percent: 18, tone: "warn" });
    expect(fanOutVerdict(1)).toMatchObject({ percent: 1, tone: "good" });
  });

  it("keeps every verdict within 38 characters", () => {
    for (let n = 1; n <= 100; n++) expect(fanOutVerdict(n).text.length).toBeLessThanOrEqual(38);
  });

  it("bounds n and maps the rail", () => {
    expect(clampBackends(0)).toBe(1);
    expect(clampBackends(500)).toBe(100);
    expect(clampBackends(Number.NaN)).toBe(20);
    expect(backendsFromFraction(backendsToFraction(21))).toBe(20);
    expect(backendsFromFraction(backendsToFraction(37))).toBe(37);
    expect(backendsFromFraction(0)).toBe(1);
    expect(backendsFromFraction(1)).toBe(100);
  });
});

describe("page loads", () => {
  it("is as slow as its slowest call", () => {
    for (let k = 0; k < 200; k++) {
      const load = pageLoad(30, k);
      expect(load.slow).toHaveLength(30);
      expect(load.pageMs).toBe(Math.max(...load.ms));
      expect(load.anySlow).toBe(load.pageMs === SLOW_MS);
    }
  });

  it("only adds chances to be slow when n grows", () => {
    for (let k = 0; k < 100; k++) {
      const small = pageLoad(10, k);
      const big = pageLoad(100, k);
      expect(big.slow.slice(0, 10)).toEqual(small.slow);
    }
  });

  it("lands near 1 - 0.99^n over many loads", () => {
    for (const n of [1, 20, 100]) {
      const t = tallyLoads(n, 0, 4999);
      expect(t.slow / 5000, `n = ${n}`).toBeCloseTo(slowChance(n), 1);
    }
  });

  it("tallies a range, skips interrupted loads, and keeps the last few", () => {
    const t = tallyLoads(20, 0, 19, [3, 4]);
    expect(t.fast + t.slow).toBe(18);
    expect(t.recent).toHaveLength(12);
    expect(tallyLoads(20, 0, -1)).toEqual({ fast: 0, slow: 0, recent: [] });
  });
});

describe("one load as motion", () => {
  const slowLoad = (() => {
    for (let k = 0; ; k++) if (pageLoad(20, k).anySlow) return pageLoad(20, k);
  })();
  const fastLoad = (() => {
    for (let k = 0; ; k++) if (!pageLoad(20, k).anySlow) return pageLoad(20, k);
  })();

  it("sends every call out, then brings fast replies back first", () => {
    const start = fanOutFrame(slowLoad, 0);
    expect(start.backCount).toBe(0);
    const mid = fanOutFrame(slowLoad, 1.4);
    expect(mid.ready).toBe(false);
    expect(mid.backCount).toBe(slowLoad.slow.filter((s) => !s).length);
    const end = fanOutFrame(slowLoad, LOAD_PERIOD);
    expect(end).toMatchObject({ ready: true, slowPage: true, pageMs: 1000 });
  });

  it("finishes a fast load early, and shows the finished load past the end", () => {
    expect(fanOutFrame(fastLoad, 1.3).ready).toBe(true);
    expect(fanOutFrame(fastLoad, Number.NaN).ready).toBe(true);
    expect(fanOutFrame(fastLoad, 1e6).ready).toBe(true);
  });

  it("lays out every n from 1 to 100 inside the panel, clear of each other", () => {
    const problems: string[] = [];
    for (let n = 1; n <= 100; n++) {
      const grid = backendGrid(n);
      if (grid.tiles.length !== n) problems.push(`n = ${n}: ${grid.tiles.length} tiles`);
      for (const c of grid.tiles) {
        if (c.x - grid.w / 2 < AREA.x0 || c.x + grid.w / 2 > AREA.x1 || c.y - grid.h / 2 < AREA.y0 || c.y + grid.h / 2 > AREA.y1) problems.push(`n = ${n}: a tile leaves the area`);
      }
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const a = grid.tiles[i];
          const b = grid.tiles[j];
          if (Math.abs(a.x - b.x) < grid.w + 2 && Math.abs(a.y - b.y) < grid.h + 2) problems.push(`n = ${n}: tiles ${i} and ${j} overlap`);
        }
    }
    expect(problems).toEqual([]);
  });

  it("draws cards with a reading for a few backends and bigger tiles than before for many", () => {
    expect(backendGrid(1)).toMatchObject({ card: true, cols: 1 });
    expect(backendGrid(CARD_MAX).card).toBe(true);
    expect(backendGrid(CARD_MAX + 1).card).toBe(false);
    expect(backendGrid(20).w).toBeGreaterThanOrEqual(26);
    expect(backendGrid(100).w).toBeGreaterThanOrEqual(14);
    expect(backendCells(100)).toHaveLength(100);
  });

  it("keeps the tally inside its card", () => {
    expect(TALLY.x + 12 + (TALLY_COLS - 1) * 14 + 10).toBeLessThanOrEqual(TALLY.x + TALLY.w);
    expect(TALLY.y + 30 + Math.ceil(TALLY_KEEP / TALLY_COLS) * 14).toBeLessThan(TALLY.y + TALLY.h - 22);
    expect(tallyLoads(20, 0, 99, [], TALLY_KEEP).recent).toHaveLength(TALLY_KEEP);
  });
});

describe("fan-out canvas renders on the server", () => {
  it("has the picture, the slider, the button and the limits fold", () => {
    const spec = sysdesignM2FanOutPlay;
    const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain('role="slider"');
    expect(html).toContain("Load the page");
    expect(html).toContain("18% of page loads hit a slow call");
    expect(html).not.toContain("NaN");
  });
});
