import { describe, expect, it } from "vitest";
import {
  compareVectors,
  createSimulation,
  intervalsOverlap,
  lamportTick,
  readPhysical,
  roundUp,
  seededRandom,
  trueTimeNow,
} from "@buildment/learning-ui/canvas/sim/index";

describe("seeded random", () => {
  it("repeats the same run for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const runA = Array.from({ length: 5 }, () => a.next());
    expect(Array.from({ length: 5 }, () => b.next())).toEqual(runA);
    expect(seededRandom(43).next()).not.toBe(runA[0]);
  });

  it("stays inside its ranges", () => {
    const r = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const n = r.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
      const k = r.int(2, 4);
      expect([2, 3, 4]).toContain(k);
    }
  });
});

describe("simulation", () => {
  it("runs events in time order and breaks ties by schedule order", () => {
    const sim = createSimulation();
    const seen: string[] = [];
    sim.schedule(20, () => seen.push("b"));
    sim.schedule(10, () => seen.push("a"));
    sim.schedule(20, () => seen.push("c"));
    sim.runAll();
    expect(seen).toEqual(["a", "b", "c"]);
    expect(sim.now()).toBe(20);
  });

  it("lets an event schedule later events relative to now", () => {
    const sim = createSimulation();
    const times: number[] = [];
    sim.schedule(5, () => sim.after(10, () => times.push(sim.now())));
    sim.runAll();
    expect(times).toEqual([15]);
  });

  it("stops at runUntil and caps a runaway model", () => {
    const sim = createSimulation();
    let count = 0;
    const loop = () => {
      count++;
      sim.after(1, loop);
    };
    sim.schedule(0, loop);
    sim.runUntil(3);
    expect(count).toBe(4);
    expect(sim.runAll(50)).toBe(50);
  });
});

describe("clocks", () => {
  it("adds offset and drift to a physical clock", () => {
    expect(readPhysical({ offsetMs: 2, driftPpm: 0 }, 1000)).toBe(1002);
    // 100 ppm is 0.1 ms per second.
    expect(readPhysical({ offsetMs: 0, driftPpm: 100 }, 1000)).toBeCloseTo(1000.1);
  });

  it("returns a TrueTime range that always contains true time", () => {
    for (const error of [-4, -1, 0, 3, 4, 9]) {
      const range = trueTimeNow(100, error, 4);
      expect(range.earliest).toBeLessThanOrEqual(100);
      expect(range.latest).toBeGreaterThanOrEqual(100);
      expect(range.latest - range.earliest).toBe(8);
    }
    expect(trueTimeNow(100, 3, 0)).toEqual({ earliest: 100, latest: 100 });
  });

  it("detects overlapping ranges", () => {
    expect(intervalsOverlap({ earliest: 0, latest: 8 }, { earliest: 7, latest: 15 })).toBe(true);
    expect(intervalsOverlap({ earliest: 0, latest: 8 }, { earliest: 8.5, latest: 15 })).toBe(false);
  });

  it("ticks Lamport clocks and compares vector clocks", () => {
    expect(lamportTick(3)).toBe(4);
    expect(lamportTick(3, 7)).toBe(8);
    expect(compareVectors([1, 0], [1, 1])).toBe("before");
    expect(compareVectors([2, 1], [1, 1])).toBe("after");
    expect(compareVectors([1, 0], [0, 1])).toBe("concurrent");
    expect(compareVectors([1, 1], [1, 1, 0])).toBe("equal");
  });

  it("rounds an axis end up to a tidy number", () => {
    expect(roundUp(41)).toBe(50);
    expect(roundUp(0)).toBe(10);
    expect(roundUp(1201, 200)).toBe(1400);
  });
});
