import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DISTANCES,
  PROTOCOLS,
  firstByteMs,
  formatMs,
  handshakeVerdict,
  segmentsOf,
  tripCount,
  tripPhase,
} from "@/canvas/models/handshake-cost";
import {
  RESOLVERS,
  TIME_LADDER,
  TTL_STEPS,
  copyAge,
  formatDuration,
  pctFromFraction,
  resolversOnNew,
  spreadVerdict,
  sweepPct,
  switchTime,
  timeAtPct,
} from "@/canvas/models/ttl-spread";
import {
  FILES,
  VERSIONS,
  delayedFiles,
  fileTones,
  finishMs,
  flightAt,
  lossVerdict,
  networkMs,
  timelines,
  usableTimes,
  type VersionId,
} from "@/canvas/models/loss-compare";
import {
  POLL_STEPS,
  USER_LADDER,
  WAYS,
  costTone,
  dotRate,
  formatDelay,
  realtimeVerdict,
  usersFromFraction,
  usersToFraction,
  wayCost,
} from "@/canvas/models/realtime-cost";
import {
  B_LADDER,
  SHARES,
  bFromFraction,
  blockFrame,
  blockVerdict,
  callSeconds,
  loopBusy,
  loopCeiling,
  poolCeiling,
  type Mode,
} from "@/canvas/models/blocking-call";
import { ladderStep } from "@/canvas/primitives/picture-slider";
import { sysdesignM3HandshakeCost } from "@/canvas/sysdesign-m3-handshake-cost/data";
import { sysdesignM3TtlSpread } from "@/canvas/sysdesign-m3-ttl-spread/data";
import { sysdesignM3LossToggle } from "@/canvas/sysdesign-m3-loss-toggle/data";
import { sysdesignM3ChatFourWays } from "@/canvas/sysdesign-m3-chat-four-ways/data";
import { sysdesignM3BlockingCall } from "@/canvas/sysdesign-m3-blocking-call/data";

const MAX_VERDICT = 38;

describe("handshake cost model (3.2)", () => {
  it("counts round trips for each way to start a connection", () => {
    expect(PROTOCOLS.map((p) => [p.id, tripCount(p.id)])).toEqual([
      ["tcp", 2],
      ["tls13", 3],
      ["quic", 2],
      ["zero-rtt", 1],
      ["reused", 1],
    ]);
  });

  it("multiplies the count by the round trip at each distance", () => {
    expect(DISTANCES.map((d) => firstByteMs("tls13", d.id))).toEqual([0.75, 180, 240, 480]);
    expect(DISTANCES.map((d) => firstByteMs("quic", d.id))).toEqual([0.5, 120, 160, 320]);
    expect(firstByteMs("reused", "asia")).toBe(160);
    expect(firstByteMs("zero-rtt", "asia")).toBe(160);
    expect(firstByteMs("tcp", "asia")).toBe(320);
  });

  it("lays one segment per round trip end to end, ending with the request", () => {
    const segs = segmentsOf("tls13", "asia");
    expect(segs.map((s) => s.label)).toEqual(["TCP", "TLS", "request"]);
    expect(segs.map((s) => s.start)).toEqual([0, 160, 320]);
    expect(segs.reduce((a, s) => a + s.ms, 0)).toBe(480);
    for (const p of PROTOCOLS) expect(p.trips[p.trips.length - 1]).toBe("request");
  });

  it("formats milliseconds the way the chapter writes them", () => {
    expect(formatMs(0.25)).toBe("0.25 ms");
    expect(formatMs(0.75)).toBe("0.75 ms");
    expect(formatMs(160)).toBe("160 ms");
  });

  it("says the chapter's verdicts, each within 38 characters", () => {
    expect(handshakeVerdict("tls13", "asia").text).toBe("TCP+TLS: 3 round trips, 480 ms");
    expect(handshakeVerdict("quic", "asia").text).toBe("QUIC saves one round trip: 160 ms");
    expect(handshakeVerdict("reused", "asia").text).toBe("Reused: 1 round trip, 160 ms");
    expect(handshakeVerdict("zero-rtt", "asia").text).toBe("0-RTT: safe-to-repeat requests only");
    expect(handshakeVerdict("tls13", "same").text).toBe("Same region: under 1 ms, any way");
    for (const p of PROTOCOLS) for (const d of DISTANCES) expect(handshakeVerdict(p.id, d.id).text.length, `${p.id} ${d.id}`).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("plays one round trip after another, then rests", () => {
    expect(tripPhase(0, 3)).toEqual({ trip: 0, progress: 0 });
    expect(tripPhase(1.1, 3).trip).toBe(1);
    expect(tripPhase(2.5, 3).trip).toBe(2);
    expect(tripPhase(3.3 + 0.5, 3).trip).toBeNull();
    expect(tripPhase(Number.NaN, 3).trip).toBeNull();
  });
});

describe("TTL spread model (3.3)", () => {
  it("ages the copies evenly across the TTL and switches each at TTL minus its age", () => {
    expect(copyAge(0, 3600)).toBeCloseTo(90);
    expect(copyAge(19, 3600)).toBeCloseTo(3510);
    for (let i = 0; i < RESOLVERS; i++) expect(switchTime(i, 3600) + copyAge(i, 3600)).toBeCloseTo(3600);
  });

  it("matches the chapter's worked values for a 3,600 second TTL", () => {
    expect(resolversOnNew(3600, 0)).toBe(0);
    expect(resolversOnNew(3600, 600)).toBe(3);
    expect(resolversOnNew(3600, 1800)).toBe(10);
    expect(resolversOnNew(3600, 3600)).toBe(20);
    expect(resolversOnNew(3600, 7200)).toBe(20);
  });

  it("follows min(1, t / TTL) within one resolver for every TTL step", () => {
    for (const step of TTL_STEPS.filter((s) => s.seconds > 0)) {
      for (let pct = 0; pct <= 120; pct++) {
        const t = timeAtPct(step.seconds, pct);
        const expected = Math.min(1, t / step.seconds) * RESOLVERS;
        expect(Math.abs(resolversOnNew(step.seconds, t) - expected), `${step.chip} ${pct}%`).toBeLessThanOrEqual(0.5 + 1e-9);
      }
    }
  });

  it("never loses a resolver once it has moved", () => {
    let last = 0;
    for (const pct of TIME_LADDER) {
      const n = resolversOnNew(300, timeAtPct(300, pct));
      expect(n).toBeGreaterThanOrEqual(last);
      last = n;
    }
  });

  it("gives every resolver the change at once when the TTL is 0", () => {
    expect(resolversOnNew(0, 0)).toBe(20);
    expect(spreadVerdict(0, 20).text).toBe("TTL 0: every lookup gets the change");
  });

  it("says the verdicts within 38 characters", () => {
    expect(spreadVerdict(3600, 20).text).toBe("All 20 on the new address");
    expect(spreadVerdict(3600, 7).text).toBe("13 of 20 still on the old address");
    expect(spreadVerdict(86_400, 5).text).toBe("1-day TTL: up to a day to move");
    for (const s of TTL_STEPS) for (let n = 0; n <= RESOLVERS; n++) expect(spreadVerdict(s.seconds, n).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("snaps the rail to the TTL and formats times", () => {
    expect(pctFromFraction(100 / 120)).toBe(100);
    expect(pctFromFraction(0)).toBe(0);
    expect(pctFromFraction(1)).toBe(120);
    expect(formatDuration(600)).toBe("10 min");
    expect(formatDuration(45)).toBe("45 s");
    expect(formatDuration(3600 * 1.2)).toBe("72 min");
    expect(formatDuration(86_400 * 1.2)).toBe("28.8 h");
  });

  it("sweeps the clock from 0 to the end of the rail and rests", () => {
    expect(sweepPct(0)).toBe(0);
    expect(sweepPct(4.5)).toBeGreaterThan(40);
    expect(sweepPct(8)).toBe(120);
    expect(sweepPct(0.8 + 6.5 + 2.2)).toBe(0);
  });
});

describe("loss comparison model (3.4)", () => {
  const times = (v: VersionId, drop: number | null) => usableTimes(v, drop);

  it("matches the chapter with no drop", () => {
    expect(times("h1", null)).toEqual([80, 160, 240]);
    expect(times("h2", null)).toEqual([80, 80, 80]);
    expect(times("h3", null)).toEqual([80, 80, 80]);
  });

  it("delays the right files when a is dropped", () => {
    expect(times("h1", 0)).toEqual([160, 240, 320]);
    expect(times("h2", 0)).toEqual([160, 160, 160]);
    expect(times("h3", 0)).toEqual([160, 80, 80]);
  });

  it("delays the right files when b or c is dropped", () => {
    expect(times("h1", 1)).toEqual([80, 240, 320]);
    expect(times("h1", 2)).toEqual([80, 160, 320]);
    expect(times("h2", 2)).toEqual([160, 160, 160]);
    expect(times("h3", 1)).toEqual([80, 160, 80]);
    expect(times("h3", 2)).toEqual([80, 80, 160]);
  });

  it("holds the files that arrived on HTTP/2 only, until the resend comes", () => {
    const h2 = timelines("h2", 0);
    expect(h2.map((t) => t.heldFromMs)).toEqual([null, 80, 80]);
    expect(timelines("h3", 0).every((t) => t.heldFromMs === null)).toBe(true);
    expect(timelines("h1", 0).every((t) => t.heldFromMs === null)).toBe(true);
    expect(timelines("h2", null).every((t) => t.heldFromMs === null)).toBe(true);
  });

  it("resends one round trip after the loss", () => {
    for (const v of ["h1", "h2", "h3"] as const) {
      for (let k = 0; k < 3; k++) {
        const flights = timelines(v, k)[k].flights;
        expect(flights).toHaveLength(2);
        expect(flights[0].lost).toBe(true);
        expect(flights[1].toMs - flights[0].toMs).toBe(80);
      }
    }
  });

  it("reports which files the loss delayed, and how to tone them", () => {
    expect(delayedFiles("h3", 1)).toEqual([false, true, false]);
    expect(delayedFiles("h2", 1)).toEqual([true, true, true]);
    expect(delayedFiles("h1", 0)).toEqual([true, true, true]);
    expect(delayedFiles("h1", 2)).toEqual([false, false, true]);
    expect(fileTones("h2", 0)).toEqual(["warn", "bad", "bad"]);
    expect(fileTones("h3", 0)).toEqual(["warn", "good", "good"]);
    expect(fileTones("h2", null)).toEqual(["good", "good", "good"]);
  });

  it("says the verdicts within 38 characters", () => {
    expect(lossVerdict("h2", null).text).toBe("No loss: all 3 in 80 ms");
    expect(lossVerdict("h2", 0).text).toBe("HTTP/2: 1 loss delays all 3 files");
    expect(lossVerdict("h3", 1).text).toBe("HTTP/3: only b waits, 160 ms");
    expect(lossVerdict("h1", 0).text).toBe("HTTP/1.1: a and those behind it wait");
    for (const v of VERSIONS) for (const d of [null, 0, 1, 2]) expect(lossVerdict(v.id, d).text.length, `${v.id} ${d}`).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("moves a packet along its lane and drops a lost one part way", () => {
    const [first, resend] = timelines("h3", 0)[0].flights;
    expect(flightAt(first, 0)).toEqual({ phase: "before" });
    expect(flightAt(first, 60).phase).toBe("flying");
    expect(flightAt(first, 70).phase).toBe("falling");
    expect(flightAt(first, 100).phase).toBe("after");
    expect(flightAt(resend, 160)).toEqual({ phase: "after", pos: 1 });
    const ok = timelines("h3", null)[0].flights[0];
    expect(flightAt(ok, 80)).toEqual({ phase: "after", pos: 1 });
  });

  it("loops the network clock inside the run, and ends on the final frame for a bad clock", () => {
    for (const s of [0, 1.5, 7, 40, 1e6]) {
      const ms = networkMs(s, "h2", 0);
      expect(ms).toBeGreaterThanOrEqual(24);
      expect(ms).toBeLessThan(finishMs("h2", 0) + 120 + 1e-9);
    }
    expect(networkMs(Number.NaN, "h2", 0)).toBe(finishMs("h2", 0) + 120);
    expect(FILES).toEqual(["a", "b", "c"]);
  });
});

describe("real-time cost model (3.5)", () => {
  it("matches the chapter's check at 10,000 users polling every 5 seconds", () => {
    const polling = wayCost("polling", 10_000, 5);
    expect(polling.reqPerSec).toBe(2000);
    expect(polling.delayMs).toBe(2500);
    expect(polling.open).toBe(0);
    const long = wayCost("long", 10_000, 5);
    expect(Math.round(long.reqPerSec)).toBe(667);
    expect(long.open).toBe(10_000);
    expect(long.delayMs).toBe(40);
  });

  it("gives SSE and WebSocket the same cost, with two-way only on the WebSocket", () => {
    const sse = wayCost("sse", 10_000, 5);
    const ws = wayCost("ws", 10_000, 5);
    expect(sse.reqPerSec).toBe(0);
    expect(sse.open).toBe(10_000);
    expect({ ...ws, twoWay: false }).toEqual(sse);
    expect(ws.twoWay).toBe(true);
    expect(sse.twoWay).toBe(false);
  });

  it("polls faster for less delay and more requests", () => {
    const delays = POLL_STEPS.map((p) => wayCost("polling", 1000, p).delayMs);
    const requests = POLL_STEPS.map((p) => wayCost("polling", 1000, p).reqPerSec);
    expect(delays).toEqual([500, 2500, 15_000, 30_000]);
    expect([...requests].reverse()).toEqual([...requests].sort((a, b) => a - b));
  });

  it("says the verdicts within 38 characters, for every user count and poll interval", () => {
    expect(realtimeVerdict("polling", 10_000, 5).text).toBe("Polling 5 s: 2,000 req/s, 2.5 s late");
    expect(realtimeVerdict("long", 10_000, 5).text).toBe("Long poll: 10,000 open, 667 req/s");
    expect(realtimeVerdict("polling", 100_000, 1).text).toBe("Polling 1 s: 100k req/s, 500 ms late");
    expect(realtimeVerdict("sse", 10_000, 5).text).toBe("SSE: 10,000 open, almost no requests");
    expect(realtimeVerdict("ws", 10_000, 5).text).toBe("WebSocket: same, plus two-way");
    for (const w of WAYS) for (const n of USER_LADDER) for (const p of POLL_STEPS) expect(realtimeVerdict(w.id, n, p).text.length, `${w.id} ${n} ${p}`).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("formats delays and tones the cost", () => {
    expect(formatDelay(40)).toBe("40 ms");
    expect(formatDelay(2500)).toBe("2.5 s");
    expect(formatDelay(30_000)).toBe("30 s");
    expect(costTone(wayCost("polling", 1000, 60))).toBe("good");
    expect(costTone(wayCost("polling", 10_000, 5))).toBe("warn");
    expect(costTone(wayCost("sse", 100_000, 5))).toBe("bad");
  });

  it("puts the users rail on a log scale that snaps to 1,000, 10,000 and 100,000", () => {
    expect(usersToFraction(100)).toBe(0);
    expect(usersToFraction(100_000)).toBe(1);
    for (const v of [1000, 10_000, 100_000]) expect(usersFromFraction(usersToFraction(v))).toBe(v);
    expect(usersFromFraction(Number.NaN)).toBe(10_000);
    expect(dotRate(0)).toBe(0);
    expect(dotRate(2000)).toBeGreaterThan(dotRate(17));
    expect(dotRate(1e9)).toBe(7);
  });
});

describe("blocking call model (3.6)", () => {
  it("matches the chapter's ceilings", () => {
    expect(loopCeiling(0, 0)).toBe(1000);
    expect(Math.round(loopCeiling(0.01, 200))).toBe(333);
    expect(Math.round(loopCeiling(0.05, 200))).toBe(91);
    expect(Math.round(poolCeiling(0, 0))).toBe(157);
    expect(Math.round(poolCeiling(0.01, 200))).toBe(151);
  });

  it("keeps the event loop under 100% busy unless blocking is both common and long", () => {
    expect(loopBusy(0, 0)).toBeCloseTo(0.1);
    expect(loopBusy(0.01, 200)).toBeCloseTo(0.3);
    expect(loopBusy(0.05, 200)).toBeCloseTo(1.1);
    expect(loopBusy(0.05, 100)).toBeCloseTo(0.6);
  });

  it("drops the loop's ceiling far below the pool's flat one as B grows, and the pool's barely moves", () => {
    expect(loopCeiling(0.05, 200)).toBeLessThan(poolCeiling(0.05, 200));
    expect(loopCeiling(0.05, 20)).toBeGreaterThan(poolCeiling(0.05, 20));
    expect(poolCeiling(0.05, 200) / poolCeiling(0, 0)).toBeGreaterThan(0.8);
  });

  it("says the verdicts within 38 characters", () => {
    expect(blockVerdict("loop", 0.01, 200).text).toBe("Loop blocked 200 ms: all requests wait");
    expect(blockVerdict("loop", 0.05, 200).text).toBe("Ceiling falls to 91 requests/s");
    expect(blockVerdict("loop", 0, 200).text).toBe("No blocking: loop ceiling 1,000/s");
    expect(blockVerdict("pool", 0.01, 200).text).toBe("Pool: 1 of 8 threads stuck");
    expect(blockVerdict("pool", 0, 0).text).toBe("Pool tops out near 157 requests/s");
    for (const mode of ["loop", "pool"] as Mode[]) for (const s of SHARES) for (const b of B_LADDER) expect(blockVerdict(mode, s.value, b).text.length, `${mode} ${s.value} ${b}`).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("snaps B to 0, 20, 100 and 200 and steps by 10 with the arrow keys", () => {
    expect(bFromFraction(0)).toBe(0);
    expect(bFromFraction(0.1)).toBe(20);
    expect(bFromFraction(0.5)).toBe(100);
    expect(bFromFraction(1)).toBe(200);
    expect(bFromFraction(0.3)).toBe(60);
    expect(ladderStep(B_LADDER, 100, "ArrowRight")).toBe(110);
    expect(ladderStep(B_LADDER, 100, "ArrowLeft")).toBe(90);
    expect(ladderStep(B_LADDER, 100, "End")).toBe(200);
  });

  it("shows no slow call when nothing blocks, and a line in front of the loop while one runs", () => {
    expect(blockFrame(5, "loop", 0, 200, false)).toMatchObject({ active: false, queue: 0, stuck: null });
    expect(blockFrame(5, "loop", 0.01, 0, false).active).toBe(false);
    const calm = blockFrame(0.2, "loop", 0.01, 200, false);
    expect(calm).toMatchObject({ active: false, queue: 0 });
    const d = callSeconds(200);
    const mid = blockFrame(0.7 + d * 0.9, "loop", 0.01, 200, false);
    expect(mid.active).toBe(true);
    expect(mid.queue).toBeGreaterThan(2);
    expect(mid.queue).toBeLessThanOrEqual(5);
    expect(blockFrame(0.7 + d + 1, "loop", 0.01, 200, false).queue).toBe(0);
  });

  it("sticks one thread of the pool, never more, and keeps the line empty", () => {
    const frame = blockFrame(0.7 + callSeconds(200) / 2, "pool", 0.01, 200, false);
    expect(frame.active).toBe(true);
    expect(frame.stuck).not.toBeNull();
    expect(frame.stuck!).toBeGreaterThanOrEqual(0);
    expect(frame.stuck!).toBeLessThan(8);
    expect(frame.queue).toBe(0);
  });

  it("keeps the line full when the arrivals are more than the loop can do", () => {
    for (const s of [0, 1.3, 2.9, 7.1]) expect(blockFrame(s, "loop", 0.05, 200, false)).toMatchObject({ active: true, queue: 5, overloaded: true });
    expect(blockFrame(0, "pool", 0.05, 200, false).overloaded).toBe(false);
  });

  it("freezes on a mid-call frame when motion is reduced", () => {
    const still = blockFrame(123, "loop", 0.01, 200, true);
    expect(still.active).toBe(true);
    expect(still.progress).toBeCloseTo(0.6);
    expect(blockFrame(999, "loop", 0.01, 200, true)).toEqual(still);
  });
});

describe("the playable canvases render on the server", () => {
  const cases = [
    ["handshake cost", sysdesignM3HandshakeCost],
    ["ttl spread", sysdesignM3TtlSpread],
    ["loss toggle", sysdesignM3LossToggle],
    ["chat four ways", sysdesignM3ChatFourWays],
    ["blocking call", sysdesignM3BlockingCall],
  ] as const;

  for (const [name, spec] of cases) {
    it(`draws ${name} as an svg that states its limits`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}["';]/);
      expect(html).not.toContain("foreignObject");
      expect(spec.limits.length).toBeGreaterThan(20);
      expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toContain(String.fromCharCode(0x2014));
    });
  }

  it("shows the default picture of each canvas", () => {
    const html = (spec: (typeof cases)[number][1]) => renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
    expect(html(sysdesignM3HandshakeCost)).toContain("TCP+TLS: 3 round trips, 480 ms");
    expect(html(sysdesignM3TtlSpread)).toContain("20 of 20 still on the old address");
    expect(html(sysdesignM3LossToggle)).toContain("HTTP/2: 1 loss delays all 3 files");
    expect(html(sysdesignM3ChatFourWays)).toContain("Polling 5 s: 2,000 req/s, 2.5 s late");
    expect(html(sysdesignM3BlockingCall)).toContain("Loop blocked 200 ms: all requests wait");
  });
});
