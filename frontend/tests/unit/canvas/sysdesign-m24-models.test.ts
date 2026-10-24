import { describe, expect, it } from "vitest";
import {
  bandwidthText,
  chainRates,
  driver,
  DRIVER_STEPS,
  estimateTail,
  estimateVerdict,
  GAP_STEPS,
  perSecond,
  RIDER_STEPS,
  safarEstimate,
} from "@buildment/learning-ui/canvas/models/safar-estimate";
import { formatBytes } from "@buildment/learning-ui/canvas/models/envelope-estimate";
import {
  boxMetres,
  boxSizeText,
  cellOf,
  gridFor,
  lengthText,
  MAX_LETTERS,
  nestedBoxes,
  pickKind,
  zoomVerdict,
} from "@buildment/learning-ui/canvas/models/geohash-zoom";
import {
  BOX,
  cellEdge,
  clampPoint,
  costText,
  DRIVERS,
  driverLabel,
  edgeVerdict,
  LETTER_STEPS,
  MODES,
  RADIUS_STEPS,
  RIDER_START,
  ringsToReach,
  viewFor,
  type Mode,
} from "@buildment/learning-ui/canvas/models/cell-edge";
import {
  countIn,
  CROWD_STOPS,
  crowdDots,
  fixedGridFullest,
  fixedGridWarns,
  LIMIT_STEPS,
  quadtree,
  quadVerdict,
  scatter,
  valueText as quadValueText,
} from "@buildment/learning-ui/canvas/models/quadtree-split";
import {
  DRIVER_STEPS as LOAD_DRIVERS,
  GAP_STEPS as LOAD_GAPS,
  iconSplit,
  laneDotsPerSecond,
  MAX_ICONS,
  updateLoad,
  updateVerdict,
  valueText as loadValueText,
} from "@buildment/learning-ui/canvas/models/safar-update-load";
import {
  D1_MAX,
  D1_MIN,
  kmText,
  match,
  matchVerdict,
  minutesText,
  savingText,
  tripProgress,
  valueText as matchValueText,
} from "@buildment/learning-ui/canvas/models/batch-match";

const MAX = 38;

describe("m24 estimate model (24.1)", () => {
  const row = (drivers: number, gap: number, riders: number) => safarEstimate({ drivers, gap, riders });

  it("matches the spec's table", () => {
    const base = row(1_000_000, 4, 200_000);
    expect(base.reportsPerSecond).toBe(250_000);
    expect(base.bandwidthBytes).toBe(12_500_000);
    expect(base.searchesPerSecond).toBe(40_000);
    expect(base.memoryBytes).toBe(100_000_000);
    expect(Math.round(base.requestsPerSecond)).toBe(579);

    expect(row(100_000, 4, 200_000).reportsPerSecond).toBe(25_000);
    expect(row(100_000, 4, 200_000).bandwidthBytes).toBe(1_250_000);
    expect(row(100_000, 4, 200_000).memoryBytes).toBe(10_000_000);
    expect(row(2_000_000, 4, 200_000).reportsPerSecond).toBe(500_000);
    expect(row(2_000_000, 4, 200_000).bandwidthBytes).toBe(25_000_000);
    expect(row(2_000_000, 4, 200_000).memoryBytes).toBe(200_000_000);
    expect(row(1_000_000, 1, 200_000).reportsPerSecond).toBe(1_000_000);
    expect(row(1_000_000, 1, 200_000).bandwidthBytes).toBe(50_000_000);
    expect(Math.round(row(1_000_000, 15, 200_000).reportsPerSecond)).toBe(66_667);
    expect(row(250_000, 8, 50_000).reportsPerSecond).toBe(31_250);
    expect(row(250_000, 8, 50_000).searchesPerSecond).toBe(10_000);
    expect(row(250_000, 8, 50_000).memoryBytes).toBe(25_000_000);
    expect(row(1_000_000, 4, 500_000).searchesPerSecond).toBe(100_000);
  });

  it("writes the numbers the way the picture shows them", () => {
    const base = row(1_000_000, 4, 200_000);
    expect(perSecond(base.reportsPerSecond)).toBe("250,000 /s");
    expect(bandwidthText(base.bandwidthBytes)).toBe("12.5 MB/s");
    expect(perSecond(base.searchesPerSecond)).toBe("40,000 /s");
    expect(perSecond(base.requestsPerSecond)).toBe("579 /s");
    expect(formatBytes(base.memoryBytes)).toBe("100 MB");
    expect(estimateTail(base, { drivers: 1_000_000, gap: 4, riders: 200_000 })).toBe(
      "1 million drivers, a report every 4 seconds, 250,000 reports a second, 40,000 searches a second"
    );
  });

  it("rings reports, then searches, else nothing", () => {
    expect(driver(row(1_000_000, 4, 200_000))).toBe("reports");
    expect(driver(row(100_000, 4, 200_000))).toBe("searches");
    expect(driver(row(250_000, 8, 50_000))).toBe("reports");
    expect(driver(row(100_000, 15, 50_000))).toBe("searches");
    expect(driver(row(100_000, 15, 50_000))).not.toBe("reports");
  });

  it("gives the four verdicts, each 38 characters or fewer, across every input", () => {
    expect(estimateVerdict(row(1_000_000, 4, 200_000))).toEqual({ text: "Updates drive it: keep them in memory", tone: "warn" });
    expect(estimateVerdict(row(100_000, 4, 200_000))).toEqual({ text: "Searches drive it: cache the map", tone: "warn" });
    expect(estimateVerdict(row(100_000, 15, 50_000)).text).toBe("Searches drive it: cache the map");
    expect(estimateVerdict({ reportsPerSecond: 100, bandwidthBytes: 0, searchesPerSecond: 100, requestsPerSecond: 579, memoryBytes: 0 })).toEqual({
      text: "One database could serve this",
      tone: "good",
    });
    expect(estimateVerdict({ reportsPerSecond: 5_000, bandwidthBytes: 0, searchesPerSecond: 5_000, requestsPerSecond: 579, memoryBytes: 0 })).toEqual({
      text: "Busy, but a few servers can do it",
      tone: "warn",
    });
    const seen = new Set<string>();
    for (const d of DRIVER_STEPS) for (const g of GAP_STEPS) for (const r of RIDER_STEPS) {
      const v = estimateVerdict(row(d, g, r));
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it("flows faster for bigger values", () => {
    const small = chainRates(row(100_000, 15, 50_000));
    const big = chainRates(row(2_000_000, 1, 500_000));
    expect(big.reports).toBeGreaterThan(small.reports);
    expect(big.memory).toBeGreaterThan(small.memory);
    expect(big.searches).toBeGreaterThan(small.searches);
  });
});

describe("m24 geohash model (24.2 beat 2)", () => {
  it("builds the odd-letter grid of the spec: 8 columns by 4 rows", () => {
    const g = gridFor(1);
    expect(g.cols).toBe(8);
    expect(g.rows).toBe(4);
    expect(g.letters.map((r) => r.join(" "))).toEqual(["b c f g u v y z", "8 9 d e s t w x", "2 3 6 7 k m q r", "0 1 4 5 h j n p"]);
    expect(gridFor(3).letters).toEqual(g.letters);
    expect(gridFor(7).letters).toEqual(g.letters);
  });

  it("builds the even-letter grid of the spec: 4 columns by 8 rows", () => {
    const g = gridFor(2);
    expect(g.cols).toBe(4);
    expect(g.rows).toBe(8);
    expect(g.letters.map((r) => r.join(" "))).toEqual(["p r x z", "n q w y", "j m t v", "h k s u", "5 7 e g", "4 6 d f", "1 3 9 c", "0 2 8 b"]);
    expect(gridFor(4).letters).toEqual(g.letters);
    expect(gridFor(6).letters).toEqual(g.letters);
  });

  it("uses every letter of the alphabet once in each grid", () => {
    for (const p of [1, 2]) expect(gridFor(p).letters.flat().sort().join("")).toBe("0123456789bcdefghjkmnpqrstuvwxyz");
  });

  it("agrees with a hand-made geohash: 42.6, -5.6 is ezs42", () => {
    // Walk the code through the grids: each letter must sit where the halving puts it.
    let lonLo = -180;
    let lonHi = 180;
    let latLo = -90;
    let latHi = 90;
    const lat = 42.6;
    const lon = -5.6;
    const path: string[] = [];
    for (let position = 1; position <= 5; position++) {
      const g = gridFor(position);
      const col = Math.min(g.cols - 1, Math.floor(((lon - lonLo) / (lonHi - lonLo)) * g.cols));
      const rowFromSouth = Math.min(g.rows - 1, Math.floor(((lat - latLo) / (latHi - latLo)) * g.rows));
      path.push(g.letters[g.rows - 1 - rowFromSouth][col]);
      const w = (lonHi - lonLo) / g.cols;
      const h = (latHi - latLo) / g.rows;
      lonLo += col * w;
      lonHi = lonLo + w;
      latLo += rowFromSouth * h;
      latHi = latLo + h;
    }
    expect(path.join("")).toBe("ezs42");
  });

  it("has the box sizes of the spec", () => {
    const km = (n: number) => Math.round(boxMetres(n).width / 1000);
    expect(Math.round(boxMetres(1).width / 1000)).toBe(5004);
    expect(Math.round(boxMetres(1).height / 1000)).toBe(5004);
    expect(km(2)).toBe(1251);
    expect(Math.round(boxMetres(2).height / 1000)).toBe(625);
    expect(km(3)).toBe(156);
    expect(Math.round(boxMetres(3).height / 1000)).toBe(156);
    expect((boxMetres(4).width / 1000).toFixed(1)).toBe("39.1");
    expect((boxMetres(4).height / 1000).toFixed(1)).toBe("19.5");
    expect((boxMetres(5).width / 1000).toFixed(2)).toBe("4.89");
    expect((boxMetres(6).width / 1000).toFixed(2)).toBe("1.22");
    expect((boxMetres(6).height / 1000).toFixed(2)).toBe("0.61");
    expect(Math.round(boxMetres(7).width)).toBe(153);
    expect(Math.round(boxMetres(7).height)).toBe(153);
  });

  it("writes the size line", () => {
    expect(boxSizeText(0)).toBe("the whole world");
    expect(boxSizeText(1)).toBe("5,004 km by 5,004 km");
    expect(boxSizeText(2)).toBe("1,251 km by 625 km");
    expect(boxSizeText(4)).toBe("39.1 km by 19.5 km");
    expect(boxSizeText(5)).toBe("4.9 km by 4.9 km");
    expect(boxSizeText(6)).toBe("1.2 km by 0.6 km");
    expect(boxSizeText(7)).toBe("153 m by 153 m");
    expect(lengthText(611)).toBe("0.6 km");
    expect(lengthText(400)).toBe("400 m");
  });

  it("finds where a letter sits", () => {
    expect(cellOf(1, "s")).toEqual({ col: 4, row: 1, cols: 8, rows: 4 });
    expect(cellOf(2, "0")).toEqual({ col: 0, row: 7, cols: 4, rows: 8 });
    expect(cellOf(1, "a")).toBeNull();
    expect(MAX_LETTERS).toBe(7);
  });

  it("calls the picks and keeps verdicts short", () => {
    expect(pickKind(null, 2, "s")).toBe("zoom");
    expect(pickKind({ position: 2, letter: "s" }, 2, "s")).toBe("zoom");
    expect(pickKind({ position: 2, letter: "s" }, 2, "t")).toBe("branch");
    expect(pickKind({ position: 2, letter: "s" }, 3, "t")).toBe("zoom");
    for (const k of ["start", "zoom", "branch"] as const) expect(zoomVerdict(k).text.length).toBeLessThanOrEqual(MAX);
    expect(zoomVerdict("zoom")).toEqual({ text: "Longer code, smaller box", tone: "good" });
  });

  it("nests one box inside the last", () => {
    const rects = nestedBoxes(["s", "t", "q"], 100, 50);
    expect(rects).toHaveLength(4);
    for (let i = 1; i < rects.length; i++) {
      const a = rects[i - 1];
      const b = rects[i];
      expect(b.x).toBeGreaterThanOrEqual(a.x - 1e-9);
      expect(b.y).toBeGreaterThanOrEqual(a.y - 1e-9);
      expect(b.x + b.w).toBeLessThanOrEqual(a.x + a.w + 1e-9);
      expect(b.y + b.h).toBeLessThanOrEqual(a.y + a.h + 1e-9);
    }
  });
});

describe("m24 cell-edge model (24.2 beat 3)", () => {
  const names = (r: ReturnType<typeof cellEdge>, status: string) => r.drivers.filter((d) => d.status === status).map((d) => d.id);
  const at = (letters: number, radius: number, mode: Mode, rider = RIDER_START) => cellEdge(rider, letters, radius, mode);

  it("agrees with the geohash box sizes", () => {
    for (const n of LETTER_STEPS) {
      // The spec states 4,887 m for 5 letters; the bit counts give 4,886.4. Within a metre.
      expect(Math.abs(BOX[n].w - boxMetres(n).width)).toBeLessThan(1);
      expect(Math.abs(BOX[n].h - boxMetres(n).height)).toBeLessThan(1);
    }
  });

  it("counts the rings to reach", () => {
    expect(ringsToReach(5, 1000)).toBe(1);
    expect(ringsToReach(6, 500)).toBe(1);
    expect(ringsToReach(6, 1000)).toBe(2);
    expect(ringsToReach(6, 2000)).toBe(4);
    expect(ringsToReach(7, 500)).toBe(4);
    expect(ringsToReach(7, 1000)).toBe(7);
  });

  it("matches the spec's table for the starting rider", () => {
    // 5 letters, 1 km
    expect(names(at(5, 1000, "own"), "missed")).toEqual(["D1", "D4"]);
    expect(names(at(5, 1000, "nine"), "found")).toEqual(["D1", "D2", "D4"]);
    expect(names(at(5, 1000, "reach"), "found")).toEqual(["D1", "D2", "D4"]);
    expect(at(5, 1000, "reach").boxesRead).toBe(9);
    // 6 letters, 0.5 km
    expect(names(at(6, 500, "own"), "missed")).toEqual(["D1"]);
    expect(names(at(6, 500, "nine"), "found")).toEqual(["D1", "D2"]);
    expect(at(6, 500, "reach").boxesRead).toBe(9);
    // 6 letters, 1 km
    expect(names(at(6, 1000, "own"), "missed")).toEqual(["D1", "D4"]);
    expect(names(at(6, 1000, "nine"), "found")).toEqual(["D1", "D2", "D4"]);
    expect(at(6, 1000, "reach").boxesRead).toBe(25);
    expect(names(at(6, 1000, "reach"), "found")).toEqual(["D1", "D2", "D4"]);
    // 7 letters, 0.5 km
    expect(names(at(7, 500, "own"), "missed")).toEqual(["D1", "D2"]);
    expect(names(at(7, 500, "nine"), "found")).toEqual(["D1"]);
    expect(names(at(7, 500, "nine"), "missed")).toEqual(["D2"]);
    expect(names(at(7, 500, "reach"), "found")).toEqual(["D1", "D2"]);
    expect(at(7, 500, "reach").boxesRead).toBe(81);
  });

  it("matches the spec's table for a rider dragged north to 600 m", () => {
    const rider = { x: -15, y: 600 };
    expect(names(at(6, 1000, "nine", rider), "found")).toEqual(["D1", "D2", "D4"]);
    expect(names(at(6, 1000, "nine", rider), "missed")).toEqual(["D3"]);
    expect(at(6, 1000, "nine", rider).drivers[2].metres).toBeCloseTo(990, 5);
    expect(names(at(6, 1000, "reach", rider), "found")).toEqual(["D1", "D2", "D3", "D4"]);
    expect(at(6, 1000, "reach", rider).boxesRead).toBe(25);
    expect(names(at(6, 2000, "nine", rider), "missed")).toEqual(["D3"]);
    expect(names(at(6, 2000, "reach", rider), "found")).toEqual(["D1", "D2", "D3", "D4", "D5"].filter((id) => id !== "D5"));
    expect(at(6, 2000, "reach", rider).boxesRead).toBe(81);
    expect(names(at(5, 1000, "nine", rider), "found")).toEqual(["D1", "D2", "D3", "D4"]);
    expect(at(5, 1000, "nine", rider).boxesRead).toBe(9);
  });

  it("costs the rings to reach the way the chapter does", () => {
    const five = at(5, 1000, "reach");
    expect(five.areaKm2).toBeCloseTo(214.95, 1);
    expect(five.driversToMeasure).toBe(21_500);
    const six = at(6, 1000, "reach");
    expect(six.boxesRead).toBe(25);
    expect(six.areaKm2).toBeCloseTo(18.67, 1);
    expect(six.driversToMeasure).toBe(1_870);
    const seven = at(7, 1000, "reach");
    expect(seven.boxesRead).toBe(225);
    expect(seven.areaKm2).toBeCloseTo(5.27, 1);
    expect(seven.driversToMeasure).toBe(530);
    expect(costText(five)).toBe("9 boxes read, 21,500 drivers to measure");
    expect(costText(at(5, 1000, "own"))).toBe("1 box read, 2,390 drivers to measure");
  });

  it("gives the three verdicts, each 38 characters or fewer", () => {
    expect(edgeVerdict(at(6, 1000, "own"))).toEqual({ text: "Missed a driver across the edge", tone: "bad" });
    expect(edgeVerdict(at(6, 1000, "reach"))).toEqual({ text: "All drivers in range were found", tone: "good" });
    expect(edgeVerdict(at(5, 1000, "reach"))).toEqual({ text: "Found, but a very big box to scan", tone: "warn" });
    for (const l of LETTER_STEPS) for (const r of RADIUS_STEPS) for (const m of MODES) {
      expect(edgeVerdict(at(l, r, m.id)).text.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("reaching the radius never misses a driver in the circle, wherever the rider stands in the box", () => {
    for (const l of LETTER_STEPS) for (const r of RADIUS_STEPS) {
      const { w, h } = BOX[l];
      for (const fx of [0.02, 0.5, 0.98]) for (const fy of [0.02, 0.5, 0.98]) {
        const start = { x: -w * fx, y: h * fy };
        expect(names(cellEdge(start, l, r, "reach"), "missed"), `${l} letters, ${r} m, ${fx},${fy}`).toEqual([]);
      }
    }
  });

  it("labels every driver in words", () => {
    const r = at(6, 1000, "own");
    expect(driverLabel(r.drivers[0])).toBe("D1 missed, 30 m");
    expect(driverLabel(r.drivers[1])).toBe("D2 found, 400 m");
    expect(driverLabel(r.drivers[2])).toBe("D3 outside the circle, 1.6 km");
    expect(DRIVERS).toHaveLength(5);
  });

  it("fits the view around the box and the circle", () => {
    for (const l of LETTER_STEPS) for (const r of RADIUS_STEPS) {
      const v = viewFor(l, r, 396, 200);
      expect(v.x0).toBeLessThan(-r);
      expect(v.x1).toBeGreaterThan(r * 0 + 0);
      expect((v.x1 - v.x0) * v.scale).toBeCloseTo(396, 3);
      expect(v.y1 - v.y0).toBeGreaterThan(0);
      const c = clampPoint({ x: -1e9, y: 1e9 }, v);
      expect(c.x).toBe(v.x0);
      expect(c.y).toBe(v.y1);
    }
  });
});

describe("m24 quadtree model (24.2 beat 5)", () => {
  const row = (crowd: number, limit: number) => {
    const q = quadtree(crowd, limit);
    return [q.boxes, q.fullest, q.levels];
  };

  it("matches the spec's table", () => {
    expect(row(0, 500)).toEqual([1, 40, 0]);
    expect(row(0, 100)).toEqual([1, 40, 0]);
    expect(row(100, 500)).toEqual([1, 140, 0]);
    expect(row(100, 100)).toEqual([10, 26, 3]);
    expect(row(500, 500)).toEqual([10, 126, 3]);
    expect(row(500, 100)).toEqual([22, 31, 4]);
    expect(row(1_000, 500)).toEqual([10, 251, 3]);
    expect(row(1_000, 100)).toEqual([22, 63, 4]);
    expect(row(3_000, 500)).toEqual([22, 188, 4]);
    expect(row(3_000, 100)).toEqual([70, 47, 5]);
    expect(row(6_000, 500)).toEqual([22, 375, 4]);
    expect(row(6_000, 100)).toEqual([70, 94, 5]);
  });

  it("keeps every driver: the boxes hold the whole city and the whole crowd", () => {
    for (const crowd of CROWD_STOPS) for (const limit of LIMIT_STEPS) {
      const q = quadtree(crowd, limit);
      expect(q.leaves.reduce((s, l) => s + l.count, 0)).toBeCloseTo(40 + crowd, 6);
      expect(q.leaves.reduce((s, l) => s + 1 / 4 ** l.level, 0)).toBeCloseTo(1, 9);
    }
  });

  it("never holds more than the limit unless it ran out of levels", () => {
    for (const crowd of CROWD_STOPS) for (const limit of LIMIT_STEPS) {
      const q = quadtree(crowd, limit);
      if (q.levels < 12) for (const l of q.leaves) expect(l.count).toBeLessThanOrEqual(limit);
    }
  });

  it("puts the crowd in the north-west square", () => {
    expect(countIn(2, 0, 0, 1000)).toBeCloseTo(1002.5, 9);
    expect(countIn(2, 1, 0, 1000)).toBeCloseTo(2.5, 9);
    expect(countIn(1, 0, 0, 1000)).toBeCloseTo(1010, 9);
    expect(countIn(1, 1, 1, 1000)).toBeCloseTo(10, 9);
  });

  it("shows the fixed grid against the quadtree", () => {
    expect(fixedGridFullest(3_000)).toBe(3_040);
    expect(fixedGridWarns(1_000)).toBe(true);
    expect(fixedGridWarns(500)).toBe(false);
    const q = quadtree(3_000, 500);
    expect(quadValueText(3_000, q)).toBe("3,000 drivers in the stadium, 22 boxes, fullest 188");
  });

  it("gives short verdicts", () => {
    expect(quadVerdict(0, quadtree(0, 500)).text).toBe("Quiet city: one box is enough");
    expect(quadVerdict(100, quadtree(100, 500)).text).toBe("Below the limit: still one box");
    expect(quadVerdict(3_000, quadtree(3_000, 500)).text).toBe("Dense places split deeper");
    for (const crowd of CROWD_STOPS) for (const limit of LIMIT_STEPS) {
      expect(quadVerdict(crowd, quadtree(crowd, limit)).text.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("scatters the same dots every time, inside the square", () => {
    expect(scatter(5)).toEqual(scatter(5));
    for (const p of scatter(120)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(1);
    }
    expect(crowdDots(0)).toBe(0);
    expect(crowdDots(6_000)).toBeGreaterThan(crowdDots(100));
  });
});

describe("m24 update-load model (24.3 beat 3)", () => {
  const row = (drivers: number, gap: number) => {
    const r = updateLoad(drivers, gap);
    return [Math.round(r.reports), r.diskNodes, r.memoryNodes];
  };

  it("matches the spec's table", () => {
    expect(row(100_000, 4)).toEqual([25_000, 10, 1]);
    expect(row(250_000, 4)).toEqual([62_500, 25, 2]);
    expect(row(500_000, 4)).toEqual([125_000, 50, 3]);
    expect(row(1_000_000, 4)).toEqual([250_000, 100, 5]);
    expect(row(1_000_000, 1)).toEqual([1_000_000, 400, 20]);
    expect(row(1_000_000, 2)).toEqual([500_000, 200, 10]);
    expect(row(1_000_000, 8)).toEqual([125_000, 50, 3]);
    expect(row(1_000_000, 15)).toEqual([66_667, 27, 2]);
    expect(row(2_000_000, 4)).toEqual([500_000, 200, 10]);
  });

  it("halving the gap doubles the nodes", () => {
    for (const g of [2, 4, 8]) {
      const slow = updateLoad(1_000_000, g * 2);
      const fast = updateLoad(1_000_000, g);
      expect(fast.diskNodes).toBe(slow.diskNodes * 2);
    }
  });

  it("gives the four verdicts, each 38 characters or fewer", () => {
    expect(updateVerdict(updateLoad(1_000_000, 4), "disk")).toEqual({ text: "100 disk nodes for old data", tone: "bad" });
    expect(updateVerdict(updateLoad(1_000_000, 15), "disk").text).toBe("27 disk nodes for old data");
    expect(updateVerdict(updateLoad(100_000, 15), "disk")).toEqual({ text: "Disk handles it, at a high price", tone: "warn" });
    expect(updateVerdict(updateLoad(1_000_000, 4), "memory")).toEqual({ text: "Memory: 5 nodes carry it", tone: "good" });
    expect(updateVerdict(updateLoad(100_000, 15), "memory").text).toBe("Memory: 1 node carries it");
    expect(updateVerdict(updateLoad(1_000_000, 1), "memory")).toEqual({ text: "Even memory needs 20 nodes", tone: "warn" });
    expect(updateVerdict(updateLoad(2_000_000, 4), "memory")).toEqual({ text: "Memory: 10 nodes carry it", tone: "good" });
    for (const d of LOAD_DRIVERS) for (const g of LOAD_GAPS) for (const s of ["disk", "memory"] as const) {
      expect(updateVerdict(updateLoad(d, g), s).text.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("splits icons from the rest", () => {
    expect(iconSplit(5)).toEqual({ shown: 5, more: 0 });
    expect(iconSplit(100)).toEqual({ shown: MAX_ICONS, more: 80 });
    expect(iconSplit(20)).toEqual({ shown: 20, more: 0 });
  });

  it("flows faster for more reports", () => {
    expect(laneDotsPerSecond(1_000_000)).toBeGreaterThan(laneDotsPerSecond(25_000));
    expect(laneDotsPerSecond(0)).toBe(0);
  });

  it("writes the value text", () => {
    expect(loadValueText(1_000_000, 4, "disk")).toBe("1,000,000 drivers, a report every 4 seconds: 250,000 reports a second, 100 nodes on disk database");
    expect(loadValueText(100_000, 1, "memory")).toContain("1 second:");
  });
});

describe("m24 batch-match model (24.4 beat 5)", () => {
  it("matches the spec's table", () => {
    const rows: [number, string, string, string][] = [
      [1, "1.6 km", "1.4 km", "0.2 km"],
      [2, "1.7 km", "1.3 km", "0.4 km"],
      [3, "1.8 km", "1.2 km", "0.6 km"],
      [4, "1.9 km", "1.1 km", "0.8 km"],
      [5, "2.0 km", "1.0 km", "1.0 km"],
      [6, "0.9 km", "0.9 km", "0.0 km"],
      [7, "0.8 km", "0.8 km", "0.0 km"],
      [8, "0.7 km", "0.7 km", "0.0 km"],
      [9, "0.6 km", "0.6 km", "0.0 km"],
    ];
    for (const [d1, one, both, saved] of rows) {
      const r = match(d1);
      expect(kmText(r.one.totalTenths), `one by one at ${d1}`).toBe(one);
      expect(kmText(r.both.totalTenths), `together at ${d1}`).toBe(both);
      expect(kmText(r.savedTenths), `saved at ${d1}`).toBe(saved);
    }
  });

  it("pairs the way the chapter says at 0.4 km", () => {
    const r = match(4);
    expect(r.one.pairs.map((p) => `${p.rider}${p.driver}`)).toEqual(["A1", "B2"]);
    expect(r.one.pairs.map((p) => p.tenths)).toEqual([4, 15]);
    expect(r.both.pairs.map((p) => `${p.rider}${p.driver}`)).toEqual(["A2", "B1"]);
    expect(r.both.pairs.map((p) => p.tenths)).toEqual([5, 6]);
  });

  it("never does worse together", () => {
    for (let d = D1_MIN; d <= D1_MAX; d++) expect(match(d).savedTenths).toBeGreaterThanOrEqual(0);
  });

  it("turns the saving into minutes at 30 km/h", () => {
    expect(minutesText(8)).toBe("1.6 min");
    expect(minutesText(2)).toBe("0.4 min");
    expect(savingText(match(4), "together")).toBe("0.8 km saved, 1.6 min");
    expect(savingText(match(4), "one")).toBe("Together saves 0.8 km, 1.6 min");
    expect(savingText(match(7), "one")).toBe("No saving here");
  });

  it("gives the three verdicts, each 38 characters or fewer", () => {
    expect(matchVerdict(match(4), "one")).toEqual({ text: "One by one wastes 0.8 km", tone: "bad" });
    expect(matchVerdict(match(4), "together")).toEqual({ text: "Together: 1.1 km in total", tone: "good" });
    expect(matchVerdict(match(7), "one")).toEqual({ text: "Same pairing either way", tone: "good" });
    expect(matchVerdict(match(7), "together")).toEqual({ text: "Same pairing either way", tone: "good" });
    for (let d = D1_MIN; d <= D1_MAX; d++) for (const m of ["one", "together"] as const) {
      expect(matchVerdict(match(d), m).text.length).toBeLessThanOrEqual(MAX);
      expect(savingText(match(d), m).length).toBeLessThanOrEqual(40);
    }
  });

  it("drives the cars to their riders and rests on the arrived picture", () => {
    const m = match(4);
    expect(tripProgress(0, "one", m.one)).toEqual([1, 1]);
    expect(tripProgress(0, "together", m.both)).toEqual([1, 1]);
    // One by one: after the arrived hold, the first pair drives while the second waits.
    let sawFirstMoving = false;
    for (let s = 0; s < 20; s += 0.1) {
      const [a, b] = tripProgress(s, "one", m.one);
      if (a > 0 && a < 1) {
        sawFirstMoving = true;
        expect(b).toBeLessThanOrEqual(0);
      }
    }
    expect(sawFirstMoving).toBe(true);
    // Together: both drive at once.
    let both = false;
    for (let s = 0; s < 20; s += 0.1) {
      const [a, b] = tripProgress(s, "together", m.both);
      if (a > 0 && a < 1 && b > 0 && b < 1) both = true;
    }
    expect(both).toBe(true);
  });

  it("writes the slider text", () => {
    expect(matchValueText(4, match(4))).toBe("Driver 1 at 0.4 km, one by one 1.9 km, together 1.1 km");
  });
});
