import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as storm from "@/canvas/sysdesign-m16-retry-storm/model";
import { sysdesignM16RetryStorm } from "@/canvas/sysdesign-m16-retry-storm/data";
import * as herd from "@/canvas/sysdesign-m16-jitter-herd/model";
import { sysdesignM16JitterHerd } from "@/canvas/sysdesign-m16-jitter-herd/data";
import * as breaker from "@/canvas/sysdesign-m16-breaker-play/model";
import { sysdesignM16BreakerPlay } from "@/canvas/sysdesign-m16-breaker-play/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("—");
  return html;
}

describe("16.4 retry storm", () => {
  // retries, rule, recovered at, peak attempts, queue at 60 s
  const table: [number, storm.Rule, number | null, number, number][] = [
    [0, "now", 20, 80, 0],
    [0, "jitter", 20, 80, 0],
    [0, "budget", 20, 80, 0],
    [1, "now", null, 160, 3517],
    [2, "now", null, 240, 7696],
    [3, "now", null, 320, 11787],
    [1, "jitter", null, 160, 3504],
    [2, "jitter", null, 240, 7637],
    [3, "jitter", null, 320, 11609],
    [1, "budget", 27, 92, 0],
    [2, "budget", 27, 92, 0],
    [3, "budget", 27, 92, 0],
  ];
  it.each(table)("%i retries, %s: recovered %s, peak %i, queue %i", (retries, rule, recovered, peak, queue) => {
    const run = storm.runStorm(retries, rule);
    expect(run.recoveredAt).toBe(recovered);
    expect(Math.round(run.peakAttempts)).toBe(peak);
    expect(Math.round(run.queueAtEnd)).toBe(queue);
  });

  it("peaks the queue of the budget run at 286", () => {
    expect(Math.round(storm.runStorm(3, "budget").peakQueue)).toBe(286);
  });

  it("gives the goodput of the spec at 5 second steps", () => {
    const at = (run: storm.Run, t: number) => Math.round(run.rows.find((r) => r.t === t)!.good);
    expect([5, 10, 15, 20, 25].map((t) => at(storm.runStorm(0, "now"), t))).toEqual([80, 0, 0, 100, 80]);
    const stuck = storm.runStorm(3, "now");
    expect(at(stuck, 5)).toBe(80);
    for (const t of [10, 20, 30, 40, 50, 60]) expect(at(stuck, t)).toBe(0);
    expect(Math.round(stuck.rows.find((r) => r.t === 30)!.attempts)).toBe(320);
    expect([5, 10, 25, 30, 35].map((t) => at(storm.runStorm(3, "budget"), t))).toEqual([80, 0, 0, 100, 80]);
  });

  it("says the three verdicts and reads the rail", () => {
    expect(storm.verdictFor(storm.runStorm(0, "now"))).toEqual({ text: "Back to normal 10 s after the blip", tone: "good" });
    expect(storm.verdictFor(storm.runStorm(3, "now"))).toEqual({ text: "Still down a minute later", tone: "bad" });
    expect(storm.verdictFor(storm.runStorm(3, "budget"))).toEqual({ text: "Back 17 s after the blip", tone: "good" });
    expect(storm.valueText(storm.runStorm(3, "now"))).toBe("3 retries, system still down after 60 seconds");
    for (const r of storm.RETRY_STOPS) for (const rule of storm.RULES) expect(storm.verdictFor(storm.runStorm(r, rule.id)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("server-renders", () => {
    renders(sysdesignM16RetryStorm);
  });
});

describe("16.4 jitter herd", () => {
  // retries, wait, peak, calls, served, gave up, served by 10 s, by 20 s
  const table: [number, herd.Wait, number, number, number, number, number, number][] = [
    [6, "now", 1000, 4900, 700, 300, 700, 700],
    [6, "backoff", 1000, 4500, 600, 0, 400, 500],
    [6, "jitter", 1000, 3020, 1000, 0, 844, 995],
    [2, "backoff", 1000, 2700, 300, 700, 300, 300],
    [2, "jitter", 1000, 2616, 692, 308, 692, 692],
    [4, "jitter", 1000, 3019, 999, 1, 843, 994],
    [8, "backoff", 1000, 4500, 600, 0, 400, 500],
    [8, "jitter", 1000, 3020, 1000, 0, 844, 995],
  ];
  it.each(table)("%i retries, %s", (retries, wait, peak, calls, served, gaveUp, by10, by20) => {
    const h = herd.herd(retries, wait);
    expect([h.peak, h.calls, h.served, h.gaveUp, h.servedBy[9], h.servedBy[19]].map(Math.round)).toEqual([peak, calls, served, gaveUp, by10, by20]);
  });

  it("gives the arrivals per second of the spec for 6 retries", () => {
    const row = (wait: herd.Wait) => herd.herd(6, wait).arrivals.slice(0, 20).map(Math.round);
    expect(row("now")).toEqual([1000, 900, 800, 700, 600, 500, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(row("backoff")).toEqual([1000, 900, 0, 800, 0, 0, 0, 700, 0, 0, 0, 0, 0, 0, 0, 600, 0, 0, 0, 0]);
    expect(row("jitter")).toEqual([1000, 450, 538, 188, 199, 210, 136, 48, 48, 48, 48, 39, 29, 17, 6, 3, 3, 3, 3, 3]);
  });

  it("says the verdicts with the number filled in", () => {
    expect(herd.verdictFor(herd.herd(6, "backoff"))).toEqual({ text: "Waves of 900, 800, 700: lockstep", tone: "bad" });
    expect(herd.verdictFor(herd.herd(6, "now"))).toEqual({ text: "Only 700 of 1,000 served", tone: "warn" });
    const jitter = herd.verdictFor(herd.herd(6, "jitter"));
    expect(jitter.tone).toBe("good");
    expect(jitter.text).toMatch(/^All 1,000 served by \d+ s$/);
    expect(herd.allServedBy(herd.herd(6, "jitter"))!).toBeLessThanOrEqual(40);
    expect(herd.verdictFor(herd.herd(2, "jitter"))).toEqual({ text: "Only 692 of 1,000 served", tone: "warn" });
    expect(herd.verdictFor(herd.herd(4, "jitter")).text).toBe("999 of 1,000 served");
    for (const r of herd.RETRY_STOPS) for (const w of herd.WAITS) expect(herd.verdictFor(herd.herd(r, w.id)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("describes the strip in words", () => {
    const text = herd.textAlternative(herd.herd(6, "backoff"));
    expect(text).toContain("Peak 1,000");
    expect(text).toContain("600 of 1,000 clients served");
  });

  it("server-renders", () => {
    renders(sysdesignM16JitterHerd);
  });
});

describe("16.5 breaker play", () => {
  it("reproduces the scripted run of the chapter", () => {
    const run = breaker.scriptedRun();
    expect(run.openedAt).toEqual([5700, 16_000, 26_300]);
    expect(run.halfOpenAt).toEqual([15_700, 26_000, 36_300]);
    expect(run.closedAt).toBe(36_340);
    expect([run.callsInOutage, run.reachedInOutage, run.refused, run.total]).toEqual([300, 9, 304, 600]);
  });

  it("follows the contract of chapter 16.7 with a fake clock", () => {
    let t = 0;
    const br = breaker.createBreaker({ failureThreshold: 3, openMs: 1000, now: () => t });
    br.recordFailure();
    br.recordFailure();
    br.recordSuccess();
    br.recordFailure();
    br.recordFailure();
    expect(br.state()).toBe("closed");
    t = 120;
    br.recordFailure();
    expect(br.state()).toBe("open");
    t = 1119;
    expect(br.state()).toBe("open");
    expect(br.allowRequest()).toBe(false);
    t = 1120;
    expect(br.state()).toBe("half-open");
    expect(br.allowRequest()).toBe(true);
    t = 1121;
    expect(br.allowRequest()).toBe(false);
    t = 1150;
    br.recordFailure();
    t = 2149;
    expect(br.state()).toBe("open");
    t = 2150;
    expect(br.state()).toBe("half-open");
    expect(br.allowRequest()).toBe(true);
    br.recordSuccess();
    expect(br.state()).toBe("closed");
    br.recordFailure();
    br.recordFailure();
    expect(br.state()).toBe("closed");
  });

  it("ignores a late success while open and refuses bad settings", () => {
    const br = breaker.createBreaker({ failureThreshold: 2, openMs: 1000, now: () => 0 });
    br.recordFailure();
    br.recordFailure();
    br.recordSuccess();
    expect(br.state()).toBe("open");
    expect(() => breaker.createBreaker({ failureThreshold: 0 })).toThrow(RangeError);
    expect(() => breaker.createBreaker({ failureThreshold: 2.5 })).toThrow(RangeError);
    expect(() => breaker.createBreaker({ openMs: 0 })).toThrow(RangeError);
  });

  it("starts with a full strip of working calls", () => {
    expect(breaker.INITIAL_SIM.dots).toHaveLength(breaker.DOT_COUNT);
    expect(breaker.INITIAL_SIM.dots.every((d) => d.kind === "ok")).toBe(true);
    expect(breaker.verdictFor(breaker.INITIAL_SIM)).toEqual({ text: "Closed: calls go through", tone: "good" });
  });

  it("walks the verdicts through an outage", () => {
    let sim = breaker.toggleBroken(breaker.INITIAL_SIM);
    sim = breaker.advance(sim, sim.t + 1500);
    expect(breaker.verdictFor(sim)).toEqual({ text: "Open: no calls reach Picks", tone: "warn" });
    expect(sim.dots.some((d) => d.kind === "refused")).toBe(true);
    // The wait ends at 16.8 s; stop while the probe is out.
    sim = breaker.advance(sim, 16_900);
    expect(breaker.verdictFor(sim)).toEqual({ text: "Half-open: one probe call", tone: "accent" });
    sim = breaker.advance(breaker.toggleBroken(sim), sim.t + 12_000);
    expect(breaker.state(sim)).toBe("closed");
    expect(breaker.verdictFor(sim).text).toMatch(/^\d+ of \d+ calls reached Picks$/);
  });

  it("says Picks is back while the breaker still waits", () => {
    let sim = breaker.toggleBroken(breaker.INITIAL_SIM);
    sim = breaker.toggleBroken(breaker.advance(sim, sim.t + 2000));
    expect(breaker.verdictFor(sim)).toEqual({ text: "Picks is back; waiting to probe", tone: "warn" });
  });

  it("keeps every verdict within 38 characters", () => {
    let sim = breaker.toggleBroken(breaker.INITIAL_SIM);
    for (let i = 0; i < 400; i++) {
      sim = breaker.advance(sim, sim.t + 200);
      if (i === 150) sim = breaker.toggleBroken(sim);
      expect(breaker.verdictFor(sim).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
  });

  it("server-renders", () => {
    expect(renders(sysdesignM16BreakerPlay)).toContain("Picks: healthy, press to break it");
  });
});
