import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as trace from "@buildment/learning-ui/canvas/sysdesign-m17-trace-request/model";
import { sysdesignM17TraceRequest } from "@buildment/learning-ui/canvas/sysdesign-m17-trace-request/data";
import * as slo from "@buildment/learning-ui/canvas/sysdesign-m17-slo-window/model";
import { sysdesignM17SloWindow } from "@buildment/learning-ui/canvas/sysdesign-m17-slo-window/data";
import * as burn from "@buildment/learning-ui/canvas/sysdesign-m17-burn-replay/model";
import { sysdesignM17BurnReplay } from "@buildment/learning-ui/canvas/sysdesign-m17-burn-replay/data";
import * as avg from "@buildment/learning-ui/canvas/sysdesign-m17-same-average/model";
import { sysdesignM17SameAverage } from "@buildment/learning-ui/canvas/sysdesign-m17-same-average/data";
import * as inc from "@buildment/learning-ui/canvas/sysdesign-m17-incident-stepper/model";
import { sysdesignM17IncidentStepper } from "@buildment/learning-ui/canvas/sysdesign-m17-incident-stepper/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("—");
  return html;
}

describe("17.2 trace request", () => {
  it("adds self times up to the whole order", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((i) => trace.selfTime("slow", i))).toEqual([7, 4, 2, 12, 5, 8, 742]);
    expect([0, 1, 2, 3, 4, 5, 6].map((i) => trace.selfTime("fast", i))).toEqual([3, 4, 2, 11, 4, 5, 66]);
    for (const o of ["slow", "fast"] as const) {
      expect([0, 1, 2, 3, 4, 5, 6].reduce((s, i) => s + trace.selfTime(o, i), 0)).toBe(trace.total(o));
    }
    expect(trace.total("slow")).toBe(780);
    expect(trace.total("fast")).toBe(95);
  });

  it("puts 95% of the slow order and 69% of the fast one in provider.charge", () => {
    expect(trace.percent("slow", trace.SLOW_ROW)).toBe(95);
    expect(trace.percent("fast", trace.SLOW_ROW)).toBe(69);
    expect(trace.total("slow") - trace.total("fast")).toBe(685);
    expect(trace.selfTime("slow", 6) - trace.selfTime("fast", 6)).toBe(676);
  });

  it("says the verdicts with the numbers filled in", () => {
    expect(trace.verdictFor("slow", null)).toEqual({ text: "Tap the span that holds the time", tone: "accent" });
    expect(trace.verdictFor("slow", 3)).toEqual({ text: "Only 12 of 780 ms are here", tone: "warn" });
    expect(trace.verdictFor("slow", 6)).toEqual({ text: "95% of the wait is in this call", tone: "good" });
    expect(trace.verdictFor("fast", 6)).toEqual({ text: "69% of 95 ms, and that is normal", tone: "good" });
    for (const o of ["slow", "fast"] as const) {
      for (let i = 0; i < 7; i++) expect(trace.verdictFor(o, i).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
  });

  it("nests every child inside its parent", () => {
    for (const o of ["slow", "fast"] as const) {
      const all = trace.spans(o);
      all.forEach((s) => {
        if (s.parent === null) return;
        expect(s.start).toBeGreaterThanOrEqual(all[s.parent].start);
        expect(s.end).toBeLessThanOrEqual(all[s.parent].end);
      });
    }
  });

  it("moves the selection with arrow keys", () => {
    expect(trace.moveRow(null, "ArrowDown")).toBe(0);
    expect(trace.moveRow(2, "ArrowDown")).toBe(3);
    expect(trace.moveRow(6, "ArrowDown")).toBe(6);
    expect(trace.moveRow(0, "ArrowUp")).toBe(0);
    expect(trace.moveRow(3, "End")).toBe(6);
    expect(trace.moveRow(3, "x")).toBeNull();
  });

  it("server-renders", () => {
    const html = renders(sysdesignM17TraceRequest);
    expect(html).toContain("provider.charge");
  });
});

describe("17.3 SLO window", () => {
  // target, then minutes for 7, 28, 30, 90 days, then bad requests per million
  const table: [number, string[], number][] = [
    [9900, ["100.8", "403.2", "432", "1,296"], 10000],
    [9950, ["50.4", "201.6", "216", "648"], 5000],
    [9990, ["10.1", "40.3", "43.2", "129.6"], 1000],
    [9995, ["5.0", "20.2", "21.6", "64.8"], 500],
    [9999, ["1.0", "4.0", "4.3", "13.0"], 100],
  ];
  it.each(table)("target %i matches the chapter table", (target, minutes, perMillion) => {
    expect(slo.WINDOWS.map((d) => slo.formatMinutes(slo.allowedMinutes(target, d)))).toEqual(minutes);
    expect(slo.badPerMillion(target)).toBe(perMillion);
  });

  it("shows 43.2 minutes by default and cuts the allowance ten times per nine", () => {
    expect(slo.formatMinutes(slo.allowedMinutes(slo.TARGET_DEFAULT, slo.WINDOW_DEFAULT))).toBe("43.2");
    expect(slo.allowedMinutes(9990, 30) / slo.allowedMinutes(9999, 30)).toBeCloseTo(10, 9);
  });

  it("says whether the 25 minute outage fits, with the leftover filled in", () => {
    expect(slo.verdictFor(9990, 30)).toEqual({ text: "A 25 min outage leaves 18 min", tone: "warn" });
    expect(slo.verdictFor(9990, 90)).toEqual({ text: "A 25 min outage leaves 105 min", tone: "good" });
    expect(slo.verdictFor(9900, 90)).toEqual({ text: "A 25 min outage leaves 1,271 min", tone: "good" });
    expect(slo.verdictFor(9995, 30)).toEqual({ text: "A 25 min outage busts the budget", tone: "bad" });
    expect(slo.verdictFor(9999, 7).tone).toBe("bad");
    for (const t of slo.TARGETS) for (const d of slo.WINDOWS) expect(slo.verdictFor(t, d).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("never draws the sliver under 3 units and gives the slider text", () => {
    expect(slo.sliverWidth(9999, 380)).toBe(3);
    expect(slo.sliverWidth(9900, 380)).toBeCloseTo(3.8, 9);
    expect(slo.valueText(9990, 30)).toBe("target 99.9 percent, 43.2 bad minutes in 30 days");
    expect(slo.targetText(9995)).toBe("99.95");
    expect(slo.targetText(9900)).toBe("99");
  });

  it("server-renders", () => {
    const html = renders(sysdesignM17SloWindow);
    expect(html).toContain("43.2");
    expect(html).toContain("1,000");
  });
});

describe("17.4 burn replay", () => {
  const outage = burn.incidentOf("outage");
  const leak = burn.incidentOf("leak");
  const blip = burn.incidentOf("blip");

  it("pages the outage with the fast alert at minute 17 and clears at 34", () => {
    const r = burn.resultOf("fast", outage);
    expect([r.page, r.clears]).toEqual([17, 34]);
    expect(r.bad).toBeCloseTo(0.85, 9);
    expect(burn.pctText(r.share ?? 0)).toBe("2");
  });

  it("pages the leak with the slow alert at minute 173 and clears at 316", () => {
    const r = burn.resultOf("slow", leak);
    expect([r.page, r.clears]).toEqual([173, 316]);
    expect(burn.pctText(r.share ?? 0)).toBe("4.8");
  });

  it("pages the naive alert at once and clears it late", () => {
    expect(burn.resultOf("naive", blip)).toMatchObject({ page: 1, clears: 8 });
    expect(burn.resultOf("naive", outage)).toMatchObject({ page: 1, clears: 35 });
    expect(burn.resultOf("naive", leak)).toMatchObject({ page: 1, clears: 305 });
  });

  it("never pages the burn alerts for the blip, the slow one for the outage, the fast one for the leak", () => {
    expect(burn.resultOf("fast", blip).page).toBeNull();
    expect(burn.resultOf("slow", blip).page).toBeNull();
    expect(burn.resultOf("slow", outage).page).toBeNull();
    expect(burn.resultOf("fast", leak).page).toBeNull();
  });

  it("matches the peak burn rates of the chapter", () => {
    const peak = (i: burn.Incident, w: number) => Math.round(burn.peakBurn(i, w) * 10 + 1e-6) / 10;
    expect([peak(blip, 60), peak(outage, 60), peak(leak, 60)]).toEqual([4.5, 25.3, 12]);
    expect([peak(blip, 360), peak(outage, 360), peak(leak, 360)]).toEqual([1.2, 4.6, 10.1]);
  });

  it("has a budget of 43.2 bad minutes", () => {
    expect(burn.BUDGET_MIN).toBeCloseTo(43.2, 9);
    expect(burn.budgetShare(burn.badMinutes(leak, 300))).toBeCloseTo(3.6 / 43.2, 9);
    expect(burn.badMinutes(outage, 100)).toBeCloseTo(1.5, 9);
  });

  const all = { naive: true, fast: true, slow: true };
  const only = (a: burn.AlertId) => ({ naive: a === "naive", fast: a === "fast", slow: a === "slow" });
  const none = { naive: false, fast: false, slow: false };

  it("says the verdicts", () => {
    expect(burn.verdictFor("blip", only("naive"))).toEqual({ text: "Paged for a 3 minute blip", tone: "bad" });
    expect(burn.verdictFor("blip", { naive: false, fast: true, slow: true })).toEqual({ text: "Blip ignored; budget barely touched", tone: "good" });
    expect(burn.verdictFor("outage", all)).toEqual({ text: "Paged at minute 17; 2% of budget gone", tone: "good" });
    expect(burn.verdictFor("leak", { naive: false, fast: false, slow: true })).toEqual({ text: "Leak found at minute 173; 4.8% gone", tone: "good" });
    expect(burn.verdictFor("leak", only("fast"))).toEqual({ text: "The slow leak was never paged", tone: "bad" });
    expect(burn.verdictFor("outage", only("slow"))).toEqual({ text: "The outage was never paged", tone: "bad" });
    expect(burn.verdictFor("outage", only("naive")).tone).toBe("warn");
    expect(burn.verdictFor("outage", none).tone).toBe("bad");
  });

  it("keeps every verdict within 38 characters", () => {
    const tries = [all, none, only("naive"), only("fast"), only("slow"), { naive: false, fast: true, slow: true }];
    for (const i of burn.INCIDENTS) for (const on of tries) expect(burn.verdictFor(i.id, on).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("describes the rail position and steps with keys", () => {
    expect(burn.scrubText(outage, 17, all)).toBe("minute 17, 1 hour burn 14.5, naive and fast alerts firing");
    expect(burn.scrubText(outage, 17, only("fast"))).toBe("minute 17, 1 hour burn 14.5, fast alert firing");
    expect(burn.scrubKey(5, "ArrowRight", 120)).toBe(6);
    expect(burn.scrubKey(5, "PageUp", 120)).toBe(15);
    expect(burn.scrubKey(115, "PageUp", 120)).toBe(120);
    expect(burn.scrubKey(3, "PageDown", 120)).toBe(0);
    expect(burn.scrubKey(3, "q", 120)).toBeNull();
  });

  it("server-renders", () => {
    const html = renders(sysdesignM17BurnReplay);
    expect(html).toContain("plus about 27 false pages a day");
  });
});

describe("17.5 same average", () => {
  it("gives both services the same average and the chapter's percentiles", () => {
    expect(avg.sum(avg.A)).toBe(2400);
    expect(avg.sum(avg.B)).toBe(2400);
    expect([avg.average(avg.A), avg.average(avg.B)]).toEqual([120, 120]);
    expect([avg.percentile(avg.A, 0.5), avg.percentile(avg.B, 0.5)]).toEqual([120, 50]);
    expect([avg.percentile(avg.A, 0.95), avg.percentile(avg.B, 0.95)]).toEqual([144, 700]);
    expect([avg.percentile(avg.A, 0.99), avg.percentile(avg.B, 0.99)]).toEqual([150, 810]);
  });

  it("shows the wrong and the right combined p99", () => {
    expect(avg.merged()).toHaveLength(40);
    expect(avg.averagedP99()).toBe(480);
    expect(avg.mergedP99()).toBe(810);
    expect(avg.average(avg.merged())).toBe(120);
  });

  it("checks the target of p99 under 300 ms", () => {
    expect(avg.meetsTarget(avg.A)).toBe(true);
    expect(avg.meetsTarget(avg.B)).toBe(false);
    expect(avg.slowTone("average", false)).toBe("warn");
    expect(avg.slowTone("p50", false)).toBe("warn");
    expect(avg.slowTone("p99", false)).toBe("bad");
  });

  it("says the verdicts", () => {
    expect(avg.verdictFor("average", false, "average")).toEqual({ text: "Average: A and B look the same", tone: "warn" });
    expect(avg.verdictFor("p50", false, "average")).toEqual({ text: "p50: B even looks better than A", tone: "warn" });
    expect(avg.verdictFor("p99", false, "average")).toEqual({ text: "p99: B has users waiting 810 ms", tone: "good" });
    expect(avg.verdictFor("p99", true, "average")).toEqual({ text: "Averaged p99 says 480; truth is 810", tone: "bad" });
    expect(avg.verdictFor("p99", true, "merge")).toEqual({ text: "Merged requests: p99 is 810", tone: "good" });
    for (const s of avg.STATS) for (const c of [false, true]) for (const m of avg.MODES) expect(avg.verdictFor(s.id, c, m.id).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("server-renders", () => {
    const html = renders(sysdesignM17SameAverage);
    expect(html).toContain("target: p99 under 300 ms");
  });
});

describe("17.6 incident stepper", () => {
  it("finishes in 9 minutes with no wrong pick", () => {
    let play = inc.start();
    expect(inc.verdictFor(play).text).toBe("Page at 19:27: choose a move");
    const said: string[] = [];
    for (let i = 0; i < inc.STEPS.length; i++) {
      play = inc.pick(play, "better");
      said.push(inc.verdictFor(play).text);
    }
    expect(said.slice(0, 4)).toEqual(["Acknowledged; the team knows", "One lead, one hand on the system", "Rolled back: errors fall to 0%", "Verified before the all-clear"]);
    expect(inc.finished(play)).toBe(true);
    expect(inc.verdictFor(play)).toEqual({ text: "Errors gone 9 minutes after the page", tone: "good" });
    expect(inc.errorsGone(play)).toBe(36);
    expect(inc.timeText(36)).toBe("19:36");
    expect(inc.timeText(inc.allClear(play) ?? 0)).toBe("19:51");
    expect(inc.minutesToClear(play)).toBe(9);
  });

  it("costs 5 minutes for a wrong pick and lets the learner pick again", () => {
    let play = inc.start();
    play = inc.pick(play, "worse");
    expect(play.done).toBe(0);
    expect(inc.verdictFor(play)).toEqual({ text: "Errors rose while you waited; +5 min", tone: "warn" });
    expect(inc.clockText(play)).toBe("19:32 (+5)");
    // A second tap on the same wrong choice changes nothing.
    expect(inc.pick(play, "worse")).toEqual(play);
    play = inc.pick(play, "better");
    expect(play.done).toBe(1);
    expect(inc.clock(play)).toBe(29 + 5);
    expect(inc.penalty(play)).toBe(5);
  });

  it("moves the end of the errors by the wrong picks before the rollback only", () => {
    let play = inc.start();
    play = inc.pick(play, "worse"); // step 1
    play = inc.pick(play, "better");
    play = inc.pick(play, "better");
    play = inc.pick(play, "better"); // rollback chosen
    expect(inc.errorsGone(play)).toBe(41);
    expect(inc.rollbackDone(play)).toBe(38);
    play = inc.pick(play, "worse"); // step 4 wrong: the errors are already gone
    expect(inc.errorsGone(play)).toBe(41);
    play = inc.pick(play, "better");
    play = inc.pick(play, "better");
    expect(inc.finished(play)).toBe(true);
    expect(inc.verdictFor(play)).toEqual({ text: "Resolved, but wrong picks cost time", tone: "warn" });
    expect(inc.allClear(play)).toBe(51 + 10);
    expect(inc.summaryLines(play)[1]).toBe("2 wrong picks, 10 min lost");
  });

  it("keeps every verdict and cost within 38 characters and the better slots mixed", () => {
    for (const s of inc.STEPS) {
      expect(s.verdict.length).toBeLessThanOrEqual(VERDICT_MAX);
      expect(s.worse.cost.length).toBeLessThanOrEqual(VERDICT_MAX);
      expect(s.worse.cost.endsWith("+5 min")).toBe(true);
    }
    expect(inc.PERFECT_VERDICT.length).toBeLessThanOrEqual(VERDICT_MAX);
    expect(inc.SLOW_VERDICT.length).toBeLessThanOrEqual(VERDICT_MAX);
    expect(new Set(inc.STEPS.map((s) => s.betterSlot)).size).toBe(2);
  });

  it("shows next day at the last step", () => {
    let play = inc.start();
    for (let i = 0; i < 4; i++) play = inc.pick(play, "better");
    expect(inc.clockText(play)).toBe("next day");
  });

  it("server-renders", () => {
    const html = renders(sysdesignM17IncidentStepper);
    expect(html).toContain("Acknowledge and tell the team channel");
  });
});
