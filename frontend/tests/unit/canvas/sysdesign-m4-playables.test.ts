import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BALANCER_PRICE, busyTone, cheapestSurviving, clampCount, COUNT, countFromFraction, countToFraction, DEMAND, fleet, SIZES } from "@/canvas/models/fleet-sizing";
import { MODES, sessionLoss, STUDENTS, type SessionState } from "@/canvas/models/session-loss";
import { addEvent, detectionTime, failoverAt, settledAt, type FailEvent } from "@/canvas/models/failover";
import {
  ALIKE_MS,
  clampLoad,
  leastConnectionsPick,
  LOAD,
  loadFromFraction,
  loadToFraction,
  PICKERS,
  QUICK_MS,
  race,
  raceVerdict,
  requestStream,
  REQUESTS,
  SLOW_MS,
  twoChoicesPick,
} from "@/canvas/models/balancer-race";
import { BOOT_LADDER, bootFromFraction, bootToFraction, clampBoot, spikeAt, spikeRun, spikeVerdict, startFleet } from "@/canvas/models/autoscale-gap";
import { sysdesignM4InstancePicker } from "@/canvas/sysdesign-m4-instance-picker/data";
import { sysdesignM4KillServer } from "@/canvas/sysdesign-m4-kill-server/data";
import { sysdesignM4FailoverPlay } from "@/canvas/sysdesign-m4-failover-play/data";
import { sysdesignM4AlgorithmRace } from "@/canvas/sysdesign-m4-algorithm-race/data";
import { sysdesignM4SpikePlay } from "@/canvas/sysdesign-m4-spike-play/data";

const MAX_VERDICT = 38;

describe("fleet sizing (4.2 instance picker)", () => {
  const cell = (size: string, n: number) => fleet(size, n);

  it("matches the spec's check points", () => {
    const eight = cell("small", 8);
    expect(Math.round(eight.busy * 100)).toBe(63);
    expect(Math.round(eight.busyAfter * 100)).toBe(71);
    expect(eight.cost).toBe(0.85);
    const five = cell("medium", 5);
    expect([Math.round(five.busy * 100), Math.round(five.busyAfter * 100), five.cost]).toEqual([50, 63, 1.05]);
    const three = cell("large", 3);
    expect([Math.round(three.busy * 100), Math.round(three.busyAfter * 100), three.cost]).toEqual([42, 63, 1.25]);
    const one = cell("xlarge", 1);
    expect([Math.round(one.busy * 100), one.cost, one.busyAfter]).toEqual([63, 0.8, Infinity]);
    expect(Math.round(cell("small", 7).busyAfter * 100)).toBe(83);
    expect(Math.round(cell("large", 2).busyAfter * 100)).toBe(125);
  });

  it("charges for the balancer only when there is more than one server", () => {
    expect(fleet("small", 1).cost).toBe(0.1);
    expect(fleet("small", 2).cost).toBe(0.2 + BALANCER_PRICE);
  });

  it("gives the spec's verdict for each case", () => {
    expect(cell("small", 4).verdict).toBe("Too small: 500/s will not fit");
    expect(cell("xlarge", 1).verdict).toBe("One server: one failure takes all");
    expect(cell("large", 2).verdict).toBe("Fits, but one failure overloads it");
    expect(cell("small", 7).verdict).toBe("Survives one failure, near the knee");
    expect(cell("small", 8).verdict).toBe("Survives one failure: N+1 at 80%");
    expect(cell("medium", 5).verdict).toBe("Survives one failure: N+1 at 80%");
    // exactly 100% after a failure still fits; exactly 80% is the N+1 line
    expect(cell("small", 6).busyAfter).toBe(1);
    expect(cell("small", 6).verdict).toBe("Survives one failure, near the knee");
    expect(cell("medium", 4).busyAfter).toBeCloseTo(500 / 600);
  });

  it("keeps every verdict to 38 characters and every value finite where it is shown", () => {
    for (const s of SIZES) {
      for (let n = COUNT.min; n <= COUNT.max; n++) {
        const f = fleet(s.id, n);
        expect(f.verdict.length, f.verdict).toBeLessThanOrEqual(MAX_VERDICT);
        expect(Number.isFinite(f.busy)).toBe(true);
        expect(Number.isFinite(f.cost)).toBe(true);
      }
    }
  });

  it("finds that small servers give the cheapest surviving fleet", () => {
    const winners = SIZES.map((s) => cheapestSurviving(s.id));
    const best = winners.filter((w) => w !== null).sort((a, b) => a!.cost - b!.cost)[0]!;
    expect(best.size.id).toBe("small");
    expect(best.count).toBe(8);
    expect(best.cost).toBe(0.85);
    const big = cheapestSurviving("xlarge")!;
    expect([big.count, big.cost]).toEqual([2, 1.65]);
    expect(winners.map((w) => w!.cost)).toEqual([0.85, 1.05, 1.25, 1.65]);
  });

  it("clamps the count, maps the rail both ways and picks card tones", () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(99)).toBe(8);
    expect(clampCount(Number.NaN)).toBe(COUNT.default);
    expect(countFromFraction(countToFraction(5))).toBe(5);
    expect(countFromFraction(-1)).toBe(1);
    expect(countFromFraction(2)).toBe(8);
    expect(busyTone(0.5)).toBe("good");
    expect(busyTone(0.8)).toBe("good");
    expect(busyTone(0.9)).toBe("warn");
    expect(busyTone(1.25)).toBe("bad");
    expect(DEMAND).toBe(500);
  });
});

describe("session loss (4.3 kill a server)", () => {
  const state = (mode: SessionState["mode"], down: number[] = [], storeDown = false): SessionState => ({
    mode,
    down: [0, 1, 2, 3].map((i) => down.includes(i)),
    storeDown,
  });

  it("in memory, 3 requests in 4 miss their session", () => {
    const r = sessionLoss(state("memory"));
    expect(r.verdict).toBe("Every 3 in 4 requests miss a session");
    expect(r.miss).toEqual([3, 4]);
    expect(r.loggedOut).toBe(0);
    expect(sessionLoss(state("memory", [0])).verdict).toBe("Every 2 in 3 requests miss a session");
  });

  it("sticky loses a server's 300 students, 300 per server killed", () => {
    expect(sessionLoss(state("sticky")).verdict).toBe("Each server down: its users log out");
    expect(sessionLoss(state("sticky", [1])).loggedOut).toBe(300);
    expect(sessionLoss(state("sticky", [1])).verdict).toBe("Sticky: 300 students logged out");
    expect(sessionLoss(state("sticky", [0, 2])).loggedOut).toBe(600);
    expect(sessionLoss(state("sticky", [0, 1, 2, 3])).loggedOut).toBe(STUDENTS);
  });

  it("a shared store loses nobody until the store itself dies", () => {
    expect(sessionLoss(state("store", [2])).loggedOut).toBe(0);
    expect(sessionLoss(state("store", [2])).verdict).toBe("Shared store: nobody logged out");
    expect(sessionLoss(state("store", [0, 1, 2])).loggedOut).toBe(0);
    expect(sessionLoss(state("store", [], true)).loggedOut).toBe(1200);
    expect(sessionLoss(state("store", [], true)).verdict).toBe("Store down: all 1,200 logged out");
  });

  it("ignores a dead store outside the shared-store mode", () => {
    expect(sessionLoss(state("sticky", [], true)).loggedOut).toBe(0);
  });

  it("keeps every verdict to 38 characters", () => {
    for (const m of MODES) {
      for (let mask = 0; mask < 16; mask++) {
        for (const storeDown of [false, true]) {
          const down = [0, 1, 2, 3].filter((i) => mask & (1 << i));
          const r = sessionLoss(state(m.id, down, storeDown));
          expect(r.verdict.length, r.verdict).toBeLessThanOrEqual(MAX_VERDICT);
          expect(r.loggedOut + r.loggedIn).toBe(STUDENTS);
        }
      }
    }
  });
});

describe("failover (4.4 fail a backend)", () => {
  const fail = (server: number, at: number): FailEvent => ({ at, server, kind: "fail" });

  it("starts with three servers at 60% each", () => {
    const s = failoverAt([], 10, 5);
    expect(s.busy).toEqual([0.6, 0.6, 0.6]);
    expect(s.verdict).toBe("All 3 up: each 60% busy");
    expect(s.failed).toBe(0);
  });

  it("counts 1,800 failed requests with 10 second checks and 360 with 2 second checks", () => {
    expect(detectionTime(10)).toBe(30);
    expect(failoverAt([fail(1, 0)], 10, 1000).failed).toBeCloseTo(1800);
    expect(failoverAt([fail(1, 0)], 2, 1000).failed).toBeCloseTo(360);
  });

  it("keeps sending to a dead server until the third failed check, then moves the load", () => {
    const before = failoverAt([fail(1, 0)], 10, 29);
    expect(before.status).toEqual(["up", "dead", "up"]);
    expect(before.verdict).toBe("Dead server still gets traffic");
    expect(before.busy[0]).toBeCloseTo(0.6);
    expect(before.failRate).toBeCloseTo(60);
    expect(before.checks).toBe(2);
    const after = failoverAt([fail(1, 0)], 10, 31);
    expect(after.status).toEqual(["up", "out", "up"]);
    expect(after.busy).toEqual([0.9, 0, 0.9]);
    expect(after.verdict).toBe("Out after checks: 2 at 90%");
    expect(after.failRate).toBe(0);
  });

  it("two failures leave one server with all 180 a second", () => {
    const s = failoverAt([fail(0, 0), fail(2, 1)], 2, 100);
    expect(s.status).toEqual(["out", "up", "out"]);
    expect(s.share[1]).toBe(180);
    expect(s.busy[1]).toBeCloseTo(1.8);
    expect(s.verdict).toBe("2 down: 1 server, 180/s, overloaded");
  });

  it("charges the second failure at the survivors' share while both are in rotation", () => {
    // Server 0 dead from 0, server 1 dead from 5, 2 second checks (6 s to remove).
    // 0..5: one dead of three = 60/s. 5..6: two dead of three = 120/s. 6..11: server 0 out, server 1 dead of two = 90/s.
    const s = failoverAt([fail(0, 0), fail(1, 5)], 2, 11);
    expect(s.failed).toBeCloseTo(60 * 5 + 120 * 1 + 90 * 5);
  });

  it("fails open when every server is out", () => {
    const s = failoverAt([fail(0, 0), fail(1, 0), fail(2, 0)], 2, 100);
    expect(s.failOpen).toBe(true);
    expect(s.verdict).toBe("No healthy server: fail open");
    expect(s.status).toEqual(["dead", "dead", "dead"]);
    expect(s.failRate).toBe(180);
    expect(s.share).toEqual([60, 60, 60]);
  });

  it("brings a server back at once and drops events that lie in the future", () => {
    const events = addEvent([fail(1, 0)], { at: 50, server: 1, kind: "restore" });
    const s = failoverAt(events, 10, 60);
    expect(s.status).toEqual(["up", "up", "up"]);
    expect(s.failed).toBeCloseTo(1800);
    expect(addEvent([fail(1, 0), { at: 40, server: 1, kind: "restore" }], fail(2, 10))).toEqual([fail(1, 0), fail(2, 10)]);
  });

  it("settles after the last removal, for the still picture", () => {
    const events = [fail(1, 3)];
    const s = failoverAt(events, 10, settledAt(events, 10));
    expect(s.status[1]).toBe("out");
  });

  it("keeps every verdict to 38 characters", () => {
    for (const interval of [2, 10]) {
      for (let mask = 0; mask < 8; mask++) {
        const events = [0, 1, 2].filter((i) => mask & (1 << i)).map((i) => fail(i, i));
        for (const now of [0, 4, 100]) expect(failoverAt(events, interval, now).verdict.length).toBeLessThanOrEqual(MAX_VERDICT);
      }
    }
  });
});

describe("balancer race (4.5 four algorithms)", () => {
  it("uses the chapter's work times: a mean of 10 ms with 1 request in 20 twenty times slower", () => {
    expect(SLOW_MS / QUICK_MS).toBeCloseTo(20);
    expect((19 * QUICK_MS + SLOW_MS) / 20).toBeCloseTo(10);
    const slow = requestStream().slow.filter(Boolean).length;
    expect(slow / REQUESTS).toBeGreaterThan(0.04);
    expect(slow / REQUESTS).toBeLessThan(0.06);
  });

  it("picks by the exact rules of chapter 4.7", () => {
    // A5, B1, C4, D2 with the chapter's rolls: 0.1 then 0.9 picks A and D, and D wins.
    const active = [5, 1, 4, 2];
    expect(twoChoicesPick(active, 0.1, 0.9)).toBe(3);
    expect(twoChoicesPick(active, 0.6, 0.0)).toBe(2);
    expect(twoChoicesPick(active, 0.25, 0.5)).toBe(1);
    expect(twoChoicesPick([2, 2, 2, 2], 0.8, 0.1)).toBe(3); // a tie goes to the first pick
    expect(twoChoicesPick([7], 0.5, 0.5)).toBe(0);
    expect(leastConnectionsPick([3, 1, 1, 2])).toBe(1);
    expect(leastConnectionsPick([0, 0, 0, 0])).toBe(0);
  });

  it("gives the same numbers every time for the same seed", () => {
    const a = race(80);
    const b = race(80);
    expect(a).toBe(b); // remembered
    const fresh = PICKERS.map((p) => Math.round(race(81).runs[p.id].p99));
    expect(PICKERS.map((p) => Math.round(race(81).runs[p.id].p99))).toEqual(fresh);
  });

  it("pins the p99 figures at the rail's snap points", () => {
    const at = (load: number) => Object.fromEntries(PICKERS.map((p) => [p.id, Math.round(race(load).runs[p.id].p99)]));
    expect(at(50)).toEqual({ random: 240, roundRobin: 208, leastConnections: 106, twoChoices: 130 });
    expect(at(80)).toEqual({ random: 602, roundRobin: 413, leastConnections: 207, twoChoices: 255 });
    expect(at(95)).toEqual({ random: 1145, roundRobin: 1227, leastConnections: 425, twoChoices: 463 });
  });

  it("looks alike at low load, then queue-blind pickers bend first", () => {
    expect(raceVerdict(race(LOAD.min)).text).toBe("Low load: all four look alike");
    const spread = (l: number) => {
      const v = PICKERS.map((p) => race(l).runs[p.id].p99);
      return Math.max(...v) - Math.min(...v);
    };
    expect(spread(LOAD.min)).toBeLessThanOrEqual(ALIKE_MS);
    for (const l of [50, 80, 95]) {
      const r = race(l);
      expect(raceVerdict(r).text).toBe("Queue-blind pickers bend first");
      const queueAware = Math.max(r.runs.leastConnections.p99, r.runs.twoChoices.p99);
      const queueBlind = Math.min(r.runs.random.p99, r.runs.roundRobin.p99);
      expect(queueAware, `load ${l}`).toBeLessThan(queueBlind * 0.8);
    }
  });

  it("never lets p99 fall as load rises, for any picker, beyond a little noise", () => {
    for (const p of PICKERS) {
      let prev = 0;
      for (let l = 20; l <= 99; l += 10) {
        const v = race(l).runs[p.id].p99;
        expect(v, `${p.id} at ${l}`).toBeGreaterThanOrEqual(prev * 0.95);
        prev = v;
      }
    }
  });

  it("records snapshots whose lines add up, and never more than are shown", () => {
    const r = race(95).runs.roundRobin;
    expect(r.snapshots.length).toBeGreaterThan(40);
    for (const snap of r.snapshots) {
      expect(snap).toHaveLength(4);
      for (const q of snap) expect(q.slow.length).toBe(Math.min(q.length, 9));
    }
  });

  it("clamps the load and maps the rail both ways", () => {
    expect(clampLoad(5)).toBe(LOAD.min);
    expect(clampLoad(500)).toBe(LOAD.max);
    expect(clampLoad(Number.NaN)).toBe(LOAD.default);
    expect(loadFromFraction(loadToFraction(95))).toBe(95);
    expect(raceVerdict(race(99)).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("autoscaler gap (4.6 set the delay)", () => {
  const drops = (boot: number, target: number) => spikeRun(boot, target).totalDrops;

  it("sizes the starting fleet from the old load", () => {
    expect(startFleet(0.6)).toBe(5);
    expect(startFleet(0.8)).toBe(4);
  });

  it("reproduces every check number in the spec", () => {
    const table: [number, number, number][] = [
      [0, 1600, 4700],
      [30, 4500, 12000],
      [60, 7500, 21000],
      [90, 10500, 30000],
      [120, 13500, 39000],
      [180, 19500, 57000],
    ];
    for (const [boot, at60, at80] of table) {
      expect(drops(boot, 0.6), `${boot} s at 60%`).toBe(at60);
      expect(drops(boot, 0.8), `${boot} s at 80%`).toBe(at80);
    }
  });

  it("ends with 10 servers at a 60% target and 8 at 80%, with no boot time", () => {
    expect(spikeRun(0, 0.6).finalFleet).toBe(10);
    expect(spikeRun(0, 0.8).finalFleet).toBe(8);
  });

  it("never needs more than ten cards", () => {
    for (const boot of BOOT_LADDER) for (const t of [0.6, 0.8]) expect(spikeRun(boot, t).servers.length).toBeLessThanOrEqual(10);
  });

  it("follows the chapter's story at 90 seconds and 60%", () => {
    const run = spikeRun(90, 0.6);
    // The first check at 15 s asks for ceil(5 x 1 / 0.6) = 9, so 4 start and are ready at 105 s.
    const started = run.servers.filter((s) => s.startedAt === 15);
    expect(started).toHaveLength(4);
    expect(started.every((s) => s.readyAt === 105)).toBe(true);
    expect(run.dropsPerSecond[0]).toBe(100);
    expect(run.dropsPerSecond[104]).toBe(100);
    expect(run.dropsPerSecond[105]).toBe(0);
    expect(run.lastDropAt).toBe(104);
    const mid = spikeAt(run, 60);
    expect(mid).toMatchObject({ ready: 5, booting: 4, capacity: 500, dropsNow: 100, dropsSoFar: 6100 });
  });

  it("explains the 80% target: a saturated reading under-counts, so the fleet grows in two steps", () => {
    const run = spikeRun(90, 0.8);
    expect(run.servers.filter((s) => s.startedAt === 15)).toHaveLength(1); // ceil(4 / 0.8) = 5
    expect(run.servers.filter((s) => s.startedAt === 105)).toHaveLength(2); // then ceil(5 x 1 / 0.8) = 7
    expect(run.dropsPerSecond[0]).toBe(200);
    expect(run.dropsPerSecond[105]).toBe(100);
    expect(run.dropsPerSecond[195]).toBe(0);
  });

  it("a faster boot never drops more, and a lower target never drops more", () => {
    for (const t of [0.6, 0.8]) for (let i = 1; i < BOOT_LADDER.length; i++) expect(drops(BOOT_LADDER[i], t)).toBeGreaterThanOrEqual(drops(BOOT_LADDER[i - 1], t));
    for (const boot of BOOT_LADDER) expect(drops(boot, 0.6)).toBeLessThan(drops(boot, 0.8));
  });

  it("writes the verdict in 38 characters or fewer", () => {
    for (const boot of BOOT_LADDER) for (const t of [0.6, 0.8]) expect(spikeVerdict(spikeRun(boot, t)).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(spikeVerdict(spikeRun(90, 0.8)).text).toBe("Dropped 30,000 requests in the gap");
    expect(spikeVerdict(spikeRun(30, 0.6)).text).toBe("Dropped 4,500 requests in the gap");
    expect(spikeVerdict({ ...spikeRun(0, 0.6), totalDrops: 0 }).text).toBe("No spike drops: headroom covered it");
  });

  it("clamps and snaps the boot time", () => {
    expect(clampBoot(-5)).toBe(0);
    expect(clampBoot(44)).toBe(30);
    expect(clampBoot(400)).toBe(180);
    expect(clampBoot(Number.NaN)).toBe(90);
    expect(bootFromFraction(bootToFraction(120))).toBe(120);
    expect(bootFromFraction(0.5)).toBe(90);
  });
});

describe("the five canvases render on the server", () => {
  const specs = [
    ["instance picker", sysdesignM4InstancePicker],
    ["kill a server", sysdesignM4KillServer],
    ["failover play", sysdesignM4FailoverPlay],
    ["algorithm race", sysdesignM4AlgorithmRace],
    ["spike play", sysdesignM4SpikePlay],
  ] as const;

  for (const [name, spec] of specs) {
    it(`${name} draws an svg and the limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).toContain(spec.limits.slice(0, 40).replace(/&/g, "&amp;").replace(/'/g, "&#x27;"));
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    });
  }

  it("never uses an em dash in any text", () => {
    for (const [, spec] of specs) expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toContain("—");
  });
});
