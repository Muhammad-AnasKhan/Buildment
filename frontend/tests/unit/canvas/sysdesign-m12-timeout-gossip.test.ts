import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  GAP_COUNT,
  TIMEOUT,
  TIMEOUT_LADDER,
  TIMEOUT_SNAPS,
  beatGaps,
  falseAlarmChance,
  falseAlarmsPerHour,
  formatAlarms,
  lateGaps,
  noticeAfterMs,
  timeoutFromFraction,
  timeoutToFraction,
  timeoutValueText,
  timeoutVerdict,
} from "@/canvas/models/failure-timeout";
import {
  DEFAULT_FANOUT,
  DEFAULT_SIZE,
  FANOUTS,
  SIZES,
  dotCount,
  dotOrder,
  gossipValueText,
  gossipVerdict,
  informedAt,
  informedCurve,
  litDots,
  messagesPerNode,
  messagesPerRound,
  railFraction,
  railValue,
  roundsToAll,
  roundsToHalf,
  suspicionRounds,
} from "@/canvas/models/gossip-spread";
import { ladderStep } from "@/canvas/primitives/picture-slider";
import { sysdesignM12TimeoutSlider } from "@/canvas/sysdesign-m12-timeout-slider/data";
import { sysdesignM12GossipSpread } from "@/canvas/sysdesign-m12-gossip-spread/data";

const DASH = String.fromCharCode(0x2014);

describe("12.2 timeout slider model", () => {
  it("matches the spec table for false alarms an hour and the time to notice a crash", () => {
    const rows: [number, number, number][] = [
      [900, 3535.8, 440],
      [1000, 1800, 540],
      [1050, 340, 590],
      [1100, 64.2, 640],
      [1150, 12.1, 690],
      [1200, 2.29, 740],
      [1300, 0.08, 840],
      [1500, 0.0001, 1040],
      [2000, 0, 1540],
    ];
    for (const [t, perHour, notice] of rows) {
      expect(falseAlarmsPerHour(t)).toBeCloseTo(perHour, perHour >= 100 ? 0 : perHour >= 1 ? 1 : perHour >= 0.01 ? 1 : 4);
      expect(noticeAfterMs(t)).toBe(notice);
    }
  });

  it("is continuous at the beat interval and falls steeply, then flattens", () => {
    expect(falseAlarmChance(1000)).toBeCloseTo(0.5, 12);
    expect(falseAlarmChance(999.999)).toBeCloseTo(0.5, 4);
    const drop1 = falseAlarmsPerHour(1000) - falseAlarmsPerHour(1100);
    const drop2 = falseAlarmsPerHour(1100) - falseAlarmsPerHour(1200);
    const drop3 = falseAlarmsPerHour(1200) - falseAlarmsPerHour(1300);
    expect(drop1).toBeGreaterThan(drop2);
    expect(drop2).toBeGreaterThan(drop3);
    for (let t = TIMEOUT.min; t <= TIMEOUT.max; t += TIMEOUT.step) {
      expect(Number.isFinite(falseAlarmsPerHour(t))).toBe(true);
      expect(falseAlarmsPerHour(t)).toBeGreaterThanOrEqual(0);
    }
  });

  it("has a rail of whole steps with the snap points on it and a default of 1,100 ms", () => {
    expect(TIMEOUT.default).toBe(1100);
    expect(TIMEOUT_LADDER[0]).toBe(900);
    expect(TIMEOUT_LADDER[TIMEOUT_LADDER.length - 1]).toBe(2000);
    for (const s of TIMEOUT_SNAPS) expect(TIMEOUT_LADDER).toContain(s);
    expect(ladderStep(TIMEOUT_LADDER, 1100, "ArrowRight")).toBe(1110);
    expect(ladderStep(TIMEOUT_LADDER, 1100, "ArrowLeft")).toBe(1090);
    expect(ladderStep(TIMEOUT_LADDER, 1100, "PageUp")).toBe(1200);
    expect(ladderStep(TIMEOUT_LADDER, 1100, "PageDown")).toBe(1000);
    expect(timeoutFromFraction(0)).toBe(900);
    expect(timeoutFromFraction(1)).toBe(2000);
    expect(timeoutFromFraction(timeoutToFraction(1100))).toBe(1100);
    expect(timeoutFromFraction(NaN)).toBe(900);
    // A drag near a snap point lands on it; a drag between them keeps its 10 ms step.
    expect(timeoutFromFraction((1052 - 900) / 1100)).toBe(1050);
    expect(timeoutFromFraction((1070 - 900) / 1100)).toBe(1070);
  });

  it("draws 40 fixed gaps around 1,000 ms, the same every time", () => {
    const gaps = beatGaps();
    expect(gaps).toHaveLength(GAP_COUNT);
    expect(beatGaps()).toEqual(gaps);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    expect(mean).toBeGreaterThan(940);
    expect(mean).toBeLessThan(1060);
    expect(Math.max(...gaps)).toBeLessThan(1350);
    expect(Math.min(...gaps)).toBeGreaterThan(850);
    expect(lateGaps(900)).toBeGreaterThan(30);
    expect(lateGaps(2000)).toBe(0);
    expect(lateGaps(1100)).toBeLessThanOrEqual(lateGaps(1000));
  });

  it("keeps every verdict at 38 characters or fewer and picks the right tone", () => {
    for (let t = TIMEOUT.min; t <= TIMEOUT.max; t += TIMEOUT.step) expect(timeoutVerdict(t).text.length).toBeLessThanOrEqual(38);
    expect(timeoutVerdict(1050)).toEqual({ text: "340 false alarms an hour", tone: "bad" });
    expect(timeoutVerdict(900).text).toBe("3,536 false alarms an hour");
    expect(timeoutVerdict(1200)).toEqual({ text: "About 2 false alarms an hour", tone: "warn" });
    expect(timeoutVerdict(1300)).toEqual({ text: "Calm: a crash is seen in 840 ms", tone: "good" });
    expect(timeoutVerdict(2000).text).toBe("Calm: a crash is seen in 1,540 ms");
  });

  it("formats alarm counts and the slider's spoken value", () => {
    expect(formatAlarms(0)).toBe("0");
    expect(formatAlarms(6e-12)).toBe("0");
    expect(formatAlarms(0.0001039)).toBe("0.0001");
    expect(formatAlarms(0.0817)).toBe("0.08");
    expect(formatAlarms(2.29)).toBe("2.3");
    expect(formatAlarms(64.2)).toBe("64");
    expect(formatAlarms(1800)).toBe("1,800");
    expect(timeoutValueText(1100)).toBe("timeout 1,100 ms, 64 false alarms an hour, a crash seen after 640 ms");
  });
});

describe("12.8 gossip spread model", () => {
  it("matches the spec table of rounds for every size and fanout", () => {
    const table: Record<number, [number, number, number]> = {
      7: [5, 3, 3],
      16: [7, 5, 4],
      100: [12, 7, 6],
      1000: [18, 11, 8],
      10000: [24, 14, 11],
    };
    for (const n of SIZES) FANOUTS.forEach((f, i) => expect(roundsToAll(n, f), `${n} nodes, fanout ${f}`).toBe(table[n][i]));
  });

  it("matches the spec curve for 1,000 nodes with fanout 1", () => {
    const curve = informedCurve(1000, 1).map((x) => Math.round(x));
    expect(curve).toEqual([1, 2, 4, 8, 16, 31, 61, 117, 215, 367, 562, 751, 882, 951, 981, 993, 997, 999, 1000]);
    expect(roundsToHalf(1000, 1)).toBe(10);
  });

  it("grows by a hundred times in size with about 12 more rounds, and a bigger fanout cuts the rounds", () => {
    expect(roundsToAll(10000, 1) - roundsToAll(100, 1)).toBe(12);
    for (const n of SIZES) {
      expect(roundsToAll(n, 2)).toBeLessThan(roundsToAll(n, 1));
      expect(roundsToAll(n, 3)).toBeLessThanOrEqual(roundsToAll(n, 2));
    }
  });

  it("handles the smallest and the largest cluster without NaN", () => {
    for (const n of [2, 3, 7, 10000, 100000]) for (const f of FANOUTS) {
      const curve = informedCurve(n, f);
      expect(curve.every((x) => Number.isFinite(x) && x >= 1 && x <= n)).toBe(true);
      expect(curve.length - 1).toBeGreaterThan(0);
    }
    expect(informedCurve(2, 1)[0]).toBe(1);
  });

  it("works out the false-suspicion time as the spread to half plus the spread of the correction", () => {
    expect(suspicionRounds(1000, 1)).toBe(28);
    expect(suspicionRounds(1000, 1)).toBe(roundsToHalf(1000, 1) + roundsToAll(1000, 1));
    for (const n of SIZES) for (const f of FANOUTS) expect(suspicionRounds(n, f)).toBeLessThanOrEqual(40);
  });

  it("counts messages and interpolates the playhead", () => {
    expect(messagesPerNode(3)).toBe(3);
    expect(messagesPerRound(215, 2)).toBe(430);
    const curve = informedCurve(1000, 1);
    expect(informedAt(curve, 0)).toBe(1);
    expect(informedAt(curve, -3)).toBe(1);
    expect(informedAt(curve, 4)).toBeCloseTo(curve[4], 9);
    expect(informedAt(curve, 4.5)).toBeCloseTo((curve[4] + curve[5]) / 2, 9);
    expect(informedAt(curve, 999)).toBe(curve[curve.length - 1]);
  });

  it("lights sample dots: at least one at the start, all only when everyone knows", () => {
    expect(dotCount(7)).toBe(7);
    expect(dotCount(10000)).toBe(49);
    expect(litDots(1, 10000, 49, false)).toBe(1);
    expect(litDots(9999.7, 10000, 49, false)).toBe(48);
    expect(litDots(10000, 10000, 49, true)).toBe(49);
    expect(litDots(500, 1000, 49, false)).toBe(24);
    const order = dotOrder(49);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 49 }, (_, i) => i));
  });

  it("maps the rails: log spacing for size, even spacing for fanout, snapped to the rungs", () => {
    expect(DEFAULT_SIZE).toBe(100);
    expect(DEFAULT_FANOUT).toBe(1);
    expect(railFraction(SIZES, 7, true)).toBe(0);
    expect(railFraction(SIZES, 10000, true)).toBe(1);
    expect(railFraction(FANOUTS, 2, false)).toBeCloseTo(0.5, 12);
    for (const n of SIZES) expect(railValue(SIZES, railFraction(SIZES, n, true), true)).toBe(n);
    for (const f of FANOUTS) expect(railValue(FANOUTS, railFraction(FANOUTS, f, false), false)).toBe(f);
    expect(railValue(SIZES, NaN, true)).toBe(7);
    expect(railValue(SIZES, 5, true)).toBe(10000);
    expect(ladderStep(SIZES, 100, "ArrowRight")).toBe(1000);
    expect(ladderStep(FANOUTS, 3, "ArrowRight")).toBe(3);
  });

  it("keeps verdicts at 38 characters or fewer and reads the slider values aloud", () => {
    for (const n of SIZES) for (const f of FANOUTS) for (const s of [false, true]) for (const done of [false, true]) {
      expect(gossipVerdict(n, f, s, done).text.length).toBeLessThanOrEqual(38);
    }
    expect(gossipVerdict(1000, 1, false, false)).toEqual({ text: "1,000 nodes hear it in 18 rounds", tone: "good" });
    expect(gossipVerdict(1000, 1, true, false)).toEqual({ text: "A false rumor spreads just as fast", tone: "warn" });
    expect(gossipVerdict(1000, 1, true, true)).toEqual({ text: "Correction done after about 28 rounds", tone: "good" });
    expect(gossipValueText(1000, 1)).toBe("1,000 nodes, fanout 1, 18 rounds");
  });
});

describe("12.2 and 12.8 canvases", () => {
  const specs = [sysdesignM12TimeoutSlider, sysdesignM12GossipSpread];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture, its slider and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain('role="slider"');
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("shows the default verdicts and slider text on first render", () => {
    const t = renderToString(createElement(sysdesignM12TimeoutSlider.component, { title: "t", purpose: "p", limits: "l" }));
    expect(t).toContain("timeout 1,100 ms, 64 false alarms an hour, a crash seen after 640 ms");
    const g = renderToString(createElement(sysdesignM12GossipSpread.component, { title: "t", purpose: "p", limits: "l" }));
    expect(g).toContain("100 nodes, fanout 1, 12 rounds");
    expect(g).toContain("Suspect a healthy node");
  });

  it("keeps the wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../src/canvas");
    const files = [
      ...["sysdesign-m12-timeout-slider", "sysdesign-m12-gossip-spread"].flatMap((d) =>
        fs.readdirSync(path.join(root, d)).filter((f) => /\.(tsx|ts|md)$/.test(f)).map((f) => path.join(root, d, f))
      ),
      path.join(root, "models/failure-timeout.ts"),
      path.join(root, "models/gossip-spread.ts"),
    ];
    expect(files).toHaveLength(8);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
