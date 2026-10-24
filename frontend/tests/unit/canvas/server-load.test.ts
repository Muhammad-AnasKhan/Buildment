import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ladderStep } from "@/canvas/primitives/picture-slider";
import { curvePath, queueDots, QUEUE_CAP } from "@/canvas/primitives/traffic-playground";
import {
  arrivalsFromFraction,
  arrivalsToFraction,
  clampArrivals,
  clampStudents,
  flowDots,
  flowDotsPerSecond,
  formatMs,
  kneePlay,
  launchDay,
  loadTimeLabel,
  MAX_FLOW_DOTS,
  serverLoad,
  STUDENT_LADDER,
  studentsFromFraction,
  studentsToFraction,
  timeAtBusy,
  twoFigures,
} from "@/canvas/models/server-load";
import { sysdesignM1LaunchDay } from "@/canvas/sysdesign-m1-launch-day/data";
import { sysdesignM2KneePlay } from "@/canvas/sysdesign-m2-knee-play/data";

describe("M/M/1 server load", () => {
  it("matches the chapters' numbers", () => {
    expect(serverLoad(50).timeMs).toBeCloseTo(20);
    expect(serverLoad(50).inside).toBeCloseTo(1);
    expect(serverLoad(90).timeMs).toBeCloseTo(100);
    expect(serverLoad(90).inside).toBeCloseTo(9);
    expect(serverLoad(99).timeMs).toBeCloseTo(1000);
    expect(serverLoad(99).inside).toBeCloseTo(99);
    expect(serverLoad(5).timeMs).toBeCloseTo(10.526, 2);
  });

  it("obeys Little's law at every steady point", () => {
    for (let a = 1; a < 100; a++) {
      const l = serverLoad(a);
      expect(l.inside, `${a}/s`).toBeCloseTo(a * (l.timeMs / 1000), 9);
    }
  });

  it("has no steady state at or past 100%, and the line grows by the excess", () => {
    expect(serverLoad(100)).toMatchObject({ steady: false, growthPerSec: 0, timeMs: Infinity });
    expect(serverLoad(500)).toMatchObject({ steady: false, growthPerSec: 400 });
    expect(loadTimeLabel(serverLoad(500))).toBe("line grows 400/s");
    expect(loadTimeLabel(serverLoad(100))).toBe("no limit");
    expect(loadTimeLabel(serverLoad(90))).toBe("100 ms");
  });

  it("guards bad input", () => {
    expect(serverLoad(Number.NaN)).toMatchObject({ arrivals: 0, busy: 0, steady: true });
    expect(serverLoad(-5).busy).toBe(0);
    expect(serverLoad(50, 0).busy).toBe(0.5);
    expect(timeAtBusy(1)).toBe(Infinity);
  });

  it("halving the spare capacity doubles the wait (the honest form of the knee)", () => {
    expect(serverLoad(95).timeMs / serverLoad(90).timeMs).toBeCloseTo(2);
    expect(serverLoad(90).timeMs / serverLoad(80).timeMs).toBeCloseTo(2);
    // "Every 5% past 80% doubles the wait" would be false: 80% to 85% is only x1.33.
    expect(serverLoad(85).timeMs / serverLoad(80).timeMs).toBeCloseTo(4 / 3);
  });
});

describe("1.1 launch day", () => {
  it("keeps the chapter's table", () => {
    expect(launchDay(100)).toMatchObject({ arrivals: 5, busy: 0.05, tone: "good", verdict: "Fast: the server is mostly idle" });
    expect(formatMs(launchDay(100).timeMs)).toBe("10.5 ms");
    expect(launchDay(1000)).toMatchObject({ busy: 0.5, tone: "good" });
    expect(formatMs(launchDay(1000).timeMs)).toBe("20 ms");
    expect(launchDay(1800)).toMatchObject({ tone: "warn", verdict: "Slower: requests wait in line" });
    expect(formatMs(launchDay(1800).timeMs)).toBe("100 ms");
    expect(launchDay(10_000)).toMatchObject({ arrivals: 500, busy: 5, growthPerSec: 400, tone: "bad", verdict: "Overloaded: pages time out" });
  });

  it("keeps every verdict within 38 characters", () => {
    for (const s of STUDENT_LADDER) expect(launchDay(s).verdict.length).toBeLessThanOrEqual(38);
    for (let a = 10; a <= 120; a++) expect(kneePlay(a).verdict.length).toBeLessThanOrEqual(38);
  });

  it("maps the log rail both ways and snaps to the chapter's rows", () => {
    expect(studentsToFraction(10)).toBe(0);
    expect(studentsToFraction(100_000)).toBe(1);
    for (const s of [100, 1000, 1800, 10_000]) expect(studentsFromFraction(studentsToFraction(s))).toBe(s);
    expect(studentsFromFraction(studentsToFraction(1830))).toBe(1800);
    expect(studentsFromFraction(studentsToFraction(1900))).toBe(1900);
    expect(studentsFromFraction(-1)).toBe(10);
    expect(studentsFromFraction(2)).toBe(100_000);
    expect(studentsFromFraction(Number.NaN)).toBe(1000);
    expect(clampStudents(Number.NaN)).toBe(1000);
    expect(clampStudents(1e9)).toBe(100_000);
  });

  it("grows the crowd with the count", () => {
    expect(launchDay(10).crowd).toBe(3);
    expect(launchDay(100_000).crowd).toBeLessThanOrEqual(60);
    let prev = 0;
    for (const s of STUDENT_LADDER) {
      expect(launchDay(s).crowd).toBeGreaterThanOrEqual(prev);
      prev = launchDay(s).crowd;
    }
  });
});

describe("2.5 knee", () => {
  it("writes Little's law with live numbers that multiply out", () => {
    expect(kneePlay(90).little).toBe("9 = 90/s × 0.1 s");
    expect(kneePlay(50).little).toBe("1 = 50/s × 0.02 s");
    expect(kneePlay(99).little).toBe("99 = 99/s × 1 s");
    expect(kneePlay(10).little).toBe("0.11 = 10/s × 0.011 s");
    expect(kneePlay(100).little).toBe("no steady state");
    expect(twoFigures(1000)).toBe("1,000");
  });

  it("names the knee and the wall", () => {
    expect(kneePlay(30).verdict).toBe("Calm: requests rarely wait");
    expect(kneePlay(60).verdict).toBe("Fine: a short line forms");
    expect(kneePlay(90)).toMatchObject({ verdict: "Past the knee: the wait explodes", tone: "warn" });
    expect(kneePlay(99).tone).toBe("bad");
    expect(kneePlay(110)).toMatchObject({ verdict: "Over 100%: the line never ends", growthPerSec: 10 });
  });

  it("maps the rail and snaps to 50 and 90", () => {
    expect(arrivalsFromFraction(arrivalsToFraction(51))).toBe(50);
    expect(arrivalsFromFraction(arrivalsToFraction(89))).toBe(90);
    expect(arrivalsFromFraction(arrivalsToFraction(99))).toBe(99);
    expect(arrivalsFromFraction(arrivalsToFraction(100))).toBe(100);
    expect(clampArrivals(500)).toBe(120);
  });
});

describe("traffic motion", () => {
  it("draws more dots as the server gets busier, and caps them", () => {
    expect(flowDotsPerSecond(0)).toBe(0);
    expect(flowDotsPerSecond(0.05)).toBeLessThan(flowDotsPerSecond(0.5));
    expect(flowDotsPerSecond(0.5)).toBeLessThan(flowDotsPerSecond(0.9));
    expect(flowDotsPerSecond(50)).toBe(MAX_FLOW_DOTS);
  });

  it("keeps the dot stream near the asked rate, in flight between 0 and 1", () => {
    const count = (rate: number) => {
      let total = 0;
      for (let s = 0; s < 200; s += 1.1) total += flowDots(s, rate, 1.1).length;
      return total / 182;
    };
    expect(count(2)).toBeGreaterThan(1.4);
    expect(count(2)).toBeLessThan(2.6);
    expect(count(8)).toBeGreaterThan(count(2) * 2.5);
    for (const d of flowDots(12.3, 6)) {
      expect(d.progress).toBeGreaterThanOrEqual(0);
      expect(d.progress).toBeLessThanOrEqual(1);
    }
    expect(flowDots(1e6, 5).length).toBeGreaterThan(0);
    expect(flowDots(Number.NaN, 5)).toEqual([]);
  });

  it("shows the line from the model, and grows it to full past 100%", () => {
    expect(queueDots(0.05, false, 0, false)).toEqual({ count: 0, more: false, full: false });
    expect(queueDots(9, false, 0, false).count).toBe(9);
    expect(queueDots(99, false, 0, false)).toMatchObject({ count: QUEUE_CAP, more: true });
    expect(queueDots(Infinity, true, 0, false).count).toBeLessThan(QUEUE_CAP);
    expect(queueDots(Infinity, true, 10, false)).toMatchObject({ count: QUEUE_CAP, full: true });
    expect(queueDots(Infinity, true, 0, true)).toMatchObject({ count: QUEUE_CAP, full: true });
  });

  it("draws the curve as a path that stops at the top of the plot", () => {
    const d = curvePath((b) => timeAtBusy(b), 1, 200);
    expect(d.startsWith("M")).toBe(true);
    expect(d).not.toContain("NaN");
    expect(d).not.toContain("Infinity");
  });

  it("walks a slider ladder with the arrow, page and edge keys", () => {
    expect(ladderStep(STUDENT_LADDER, 1000, "ArrowRight")).toBe(1500);
    expect(ladderStep(STUDENT_LADDER, 1000, "ArrowLeft")).toBe(500);
    expect(ladderStep(STUDENT_LADDER, 1234, "ArrowLeft")).toBe(1000);
    expect(ladderStep(STUDENT_LADDER, 1234, "ArrowUp")).toBe(1500);
    expect(ladderStep(STUDENT_LADDER, 100_000, "ArrowRight")).toBe(100_000);
    expect(ladderStep(STUDENT_LADDER, 10, "Home")).toBe(10);
    expect(ladderStep(STUDENT_LADDER, 10, "End")).toBe(100_000);
    expect(ladderStep(STUDENT_LADDER, 10, "Tab")).toBeNull();
  });
});

describe("launch day and knee canvases render on the server", () => {
  for (const spec of [sysdesignM1LaunchDay, sysdesignM2KneePlay]) {
    it(spec.title, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits })).replaceAll("<!-- -->", "");
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).toContain('role="slider"');
      expect(html).not.toContain("NaN");
    });
  }
});
