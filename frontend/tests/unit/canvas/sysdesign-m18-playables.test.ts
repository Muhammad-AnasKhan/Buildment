import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as iso from "@/canvas/sysdesign-m18-isolation-layers/model";
import { sysdesignM18IsolationLayers } from "@/canvas/sysdesign-m18-isolation-layers/data";
import * as cache from "@/canvas/sysdesign-m18-layer-cache/model";
import { sysdesignM18LayerCache } from "@/canvas/sysdesign-m18-layer-cache/data";
import * as cluster from "@/canvas/sysdesign-m18-cluster-play/model";
import { sysdesignM18ClusterPlay } from "@/canvas/sysdesign-m18-cluster-play/data";
import * as pipe from "@/canvas/sysdesign-m18-pipeline-step/model";
import { sysdesignM18PipelineStep } from "@/canvas/sysdesign-m18-pipeline-step/data";
import * as canary from "@/canvas/sysdesign-m18-canary-blast/model";
import { sysdesignM18CanaryBlast } from "@/canvas/sysdesign-m18-canary-blast/data";
import * as cloud from "@/canvas/sysdesign-m18-cloud-explorer/model";
import { sysdesignM18CloudExplorer } from "@/canvas/sysdesign-m18-cloud-explorer/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("\u2014");
  expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  return html;
}

describe("18.2 isolation layers", () => {
  const on = iso.ALL_ON;
  const table: [number, number, boolean, number][] = [
    [256, 1, false, 200],
    [128, 1, true, 200],
    [256, 0.5, false, 400],
    [256, 0.25, false, 800],
  ];
  it.each(table)("memory %i MB, CPU %f: killed %s, request %i ms", (mem, cpu, killed, ms) => {
    expect(iso.isKilled(mem)).toBe(killed);
    expect(iso.requestMs(cpu)).toBe(ms);
  });

  it("a CPU limit above one does not speed a single thread up", () => {
    expect(iso.requestMs(2)).toBe(200);
    expect(iso.requestMs(1.5)).toBe(200);
  });

  it("the limit is exact at 150 MB", () => {
    expect(iso.isKilled(144)).toBe(true);
    expect(iso.isKilled(150)).toBe(false);
    expect(iso.memoryUsed(64)).toBe(64);
    expect(iso.memoryUsed(256)).toBe(150);
  });

  it("each switch hides one kind of thing", () => {
    expect(iso.viewFor(on)).toEqual({ processes: 1, portFree: true, files: "image", name: "a1b2c3d4e5f6" });
    expect(iso.viewFor({ ...on, pid: false }).processes).toBe(212);
    expect(iso.viewFor({ ...on, net: false }).portFree).toBe(false);
    expect(iso.viewFor({ ...on, mnt: false }).files).toBe("host");
    expect(iso.viewFor({ ...on, host: false }).name).toBe("ops-server");
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    expect(iso.verdictFor(on, 256, 1).text).toBe("Isolated: it sees only itself");
    expect(iso.verdictFor({ ...on, pid: false }, 256, 1).text).toBe("It can see and signal host processes");
    expect(iso.verdictFor({ ...on, net: false }, 256, 1).text).toBe("Port 3000 clashes with the host");
    expect(iso.verdictFor({ ...on, mnt: false }, 256, 1).text).toBe("It can read the host's files");
    expect(iso.verdictFor({ ...on, host: false }, 256, 1).text).toBe("It sees the host's name");
    expect(iso.verdictFor(on, 128, 1).text).toBe("Over the memory limit: killed");
    expect(iso.verdictFor(on, 256, 0.5).text).toBe("CPU limit: slower, never killed");
    // Killed beats a switch that is off, which beats a CPU limit.
    expect(iso.verdictFor({ ...on, pid: false }, 128, 0.5).text).toBe("Over the memory limit: killed");
    expect(iso.verdictFor({ ...on, host: false }, 256, 0.5).text).toBe("It sees the host's name");
    for (let m = 0; m < 16; m++) {
      const sw = { pid: !!(m & 1), net: !!(m & 2), mnt: !!(m & 4), host: !!(m & 8) };
      for (const mem of [64, 128, 144, 256]) for (const cpu of iso.CPU_LADDER) expect(iso.verdictFor(sw, mem, cpu).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
  });

  it("rails snap to 16 MB and quarter CPUs, with 128, 256, 0.5 and 1 on a step", () => {
    expect(iso.memFromFraction(0)).toBe(64);
    expect(iso.memFromFraction(1)).toBe(512);
    expect(iso.memFromFraction(iso.memFraction(128))).toBe(128);
    expect(iso.memFromFraction(iso.memFraction(256))).toBe(256);
    expect(iso.cpuFromFraction(0)).toBe(0.25);
    expect(iso.cpuFromFraction(1)).toBe(2);
    expect(iso.cpuFromFraction(iso.cpuFraction(0.5))).toBe(0.5);
    expect(iso.cpuFromFraction(iso.cpuFraction(1))).toBe(1);
    expect(iso.memFromFraction(Number.NaN)).toBe(64);
    expect(iso.formatCpu(0.5)).toBe("0.5 CPU");
    expect(iso.formatCpu(2)).toBe("2 CPUs");
  });

  it("renders on the server", () => {
    renders(sysdesignM18IsolationLayers);
  });
});

describe("18.3 layer cache", () => {
  const table: [cache.OrderId, cache.FileId, string[], number][] = [
    ["A", "server", ["COPY . .", "RUN npm install", "CMD node server.js"], 83],
    ["B", "server", ["COPY server.js ./", "CMD node server.js"], 3],
    ["A", "package", ["COPY . .", "RUN npm install", "CMD node server.js"], 83],
    ["B", "package", ["COPY package*.json ./", "RUN npm ci", "COPY server.js ./", "CMD node server.js"], 84],
    ["A", "readme", [], 0],
    ["B", "readme", [], 0],
  ];
  it.each(table)("Dockerfile %s, %s changed", (order, file, rebuilt, tenths) => {
    expect(cache.rebuiltLabels(order, file)).toEqual(rebuilt);
    expect(cache.totalTenths(order, file)).toBe(tenths);
  });

  it("FROM is always cached and the install is the slow layer", () => {
    for (const order of ["A", "B"] as const) {
      for (const f of cache.FILES) expect(cache.rebuiltFlags(order, f.id)[0]).toBe(false);
      expect(Math.max(...cache.layersOf(order).map((l) => l.tenths))).toBe(80);
    }
    expect(cache.layersOf("A")).toHaveLength(4);
    expect(cache.layersOf("B")).toHaveLength(5);
  });

  it("formats seconds", () => {
    expect(cache.formatTenths(83)).toBe("8.3 s");
    expect(cache.formatTenths(3)).toBe("0.3 s");
    expect(cache.formatTenths(0)).toBe("0 s");
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    expect(cache.verdictFor("B", "server").text).toBe("Only the last copy step runs");
    expect(cache.verdictFor("A", "server").text).toBe("Everything after the copy reruns");
    expect(cache.verdictFor("B", "package").text).toBe("Install reruns: dependencies changed");
    expect(cache.verdictFor("A", "readme").text).toBe("Nothing changed: all layers cached");
    for (const o of ["A", "B"] as const) for (const f of cache.FILES) expect(cache.verdictFor(o, f.id).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("renders on the server", () => {
    renders(sysdesignM18LayerCache);
  });
});

describe("18.4 cluster play", () => {
  it("starts on target: 3 ready pods at 180 requests a second are 60% busy", () => {
    const s = cluster.initSim();
    expect(cluster.servingCount(s)).toBe(3);
    expect(cluster.cpuOf(s)).toBe(60);
    expect(cluster.droppedOf(s)).toBe(0);
    expect(cluster.verdictFor(s).text).toBe("On target: 60% busy");
    expect(cluster.desiredNow(s)).toBe(3);
  });

  it("a killed pod leaves 2 ready (90%), and the replacement is ready after about 3.5 seconds", () => {
    let s = cluster.killPod(cluster.initSim(), 1);
    expect(cluster.servingCount(s)).toBe(2);
    expect(cluster.cpuOf(s)).toBe(90);
    expect(cluster.verdictFor(s).text).toBe("One pod short: the rest take its load");
    s = cluster.advance(s, 0.6);
    expect(s.pods[0].state).toBe("starting");
    expect(s.pods[0].origin).toBe("replace");
    expect(s.pods).toHaveLength(3);
    s = cluster.advance(s, 2.5);
    expect(cluster.servingCount(s)).toBe(2);
    s = cluster.advance(s, 1);
    expect(cluster.servingCount(s)).toBe(3);
    expect(cluster.cpuOf(s)).toBe(60);
  });

  it("a failed probe keeps the pod running but takes it out of the Service", () => {
    let s = cluster.toggleProbe(cluster.initSim(), 2);
    expect(s.pods.every((p) => p.state === "running")).toBe(true);
    expect(cluster.servingCount(s)).toBe(2);
    expect(cluster.cpuOf(s)).toBe(90);
    expect(cluster.verdictFor(s).text).toBe("Alive but not ready: no traffic");
    s = cluster.toggleProbe(s, 2);
    expect(cluster.servingCount(s)).toBe(3);
    expect(cluster.cpuOf(s)).toBe(60);
  });

  it("load 300 with the autoscaler: 100%, wants 5, then 60% once five are ready", () => {
    let s = cluster.setAuto(cluster.setLoad(cluster.initSim(), 300), true);
    expect(cluster.cpuOf(s)).toBe(100);
    expect(cluster.droppedOf(s)).toBe(0);
    expect(cluster.desiredNow(s)).toBe(5);
    s = cluster.advance(s, 3);
    expect(s.replicas).toBe(5);
    expect(s.pods.filter((p) => p.state === "starting")).toHaveLength(2);
    expect(cluster.verdictFor(s).text).toBe("Scaling: new pods are not ready yet");
    s = cluster.advance(s, 3);
    expect(cluster.servingCount(s)).toBe(5);
    expect(cluster.cpuOf(s)).toBe(60);
    expect(s.replicas).toBe(5);
  });

  it("load 600 with the autoscaler: 100% and 300 dropped, then 5 pods are still not enough and it asks for 8", () => {
    let s = cluster.setAuto(cluster.setLoad(cluster.initSim(), 600), true);
    expect(cluster.cpuOf(s)).toBe(100);
    expect(cluster.droppedOf(s)).toBe(300);
    expect(cluster.desiredNow(s)).toBe(5);
    expect(cluster.verdictFor(s).text).toBe("Over capacity: requests dropped");
    s = cluster.advance(s, 3);
    expect(s.replicas).toBe(5);
    s = cluster.advance(s, 3);
    expect(cluster.servingCount(s)).toBe(5);
    expect(cluster.cpuOf(s)).toBe(100);
    expect(cluster.droppedOf(s)).toBe(100);
    expect(s.replicas).toBe(8);
    expect(cluster.advance(s, 3).pods).toHaveLength(8);
    s = cluster.settle(s);
    expect(cluster.servingCount(s)).toBe(8);
    expect(cluster.droppedOf(s)).toBe(0);
    expect(cluster.cpuOf(s)).toBe(75);
  });

  it("ignores a reading within 10% of the target and scales on a bigger one", () => {
    const at = (load: number) => cluster.setAuto(cluster.setLoad(cluster.initSim(), load), true);
    expect(cluster.desiredNow(at(190))).toBe(3);
    expect(cluster.desiredNow(at(200))).toBe(4);
    expect(cluster.desiredNow(at(120))).toBe(2);
  });

  it("scales down only after the window of lower readings", () => {
    let s = cluster.settle(cluster.setAuto(cluster.setLoad(cluster.initSim(), 600), true));
    expect(s.pods).toHaveLength(8);
    s = cluster.setLoad(s, 180);
    expect(cluster.cpuOf(s)).toBe(22.5);
    expect(cluster.desiredNow(s)).toBe(3);
    s = cluster.advance(s, 3);
    s = cluster.advance(s, 3);
    expect(s.pods).toHaveLength(8);
    s = cluster.advance(s, 3);
    expect(s.pods).toHaveLength(3);
    expect(cluster.cpuOf(s)).toBe(60);
  });

  it("never goes below 2 or above 8 pods", () => {
    const s = cluster.settle(cluster.setAuto(cluster.setLoad(cluster.initSim(), 20), true));
    expect(s.pods).toHaveLength(2);
    expect(cluster.desiredNow(cluster.setLoad(s, 600))).toBeLessThanOrEqual(8);
  });

  it("with the autoscaler off, nothing scales", () => {
    const s = cluster.advance(cluster.setLoad(cluster.initSim(), 600), 20);
    expect(s.pods).toHaveLength(3);
    expect(cluster.verdictFor(s).text).toBe("Over capacity: requests dropped");
  });

  it("settle ends with every pod running", () => {
    const s = cluster.settle(cluster.killPod(cluster.killPod(cluster.initSim(), 1), 2));
    expect(s.pods.every((p) => p.state === "running")).toBe(true);
    expect(cluster.servingCount(s)).toBe(3);
  });

  it("a rail position gives a load in steps of 20", () => {
    expect(cluster.loadFromFraction(0)).toBe(0);
    expect(cluster.loadFromFraction(1)).toBe(600);
    expect(cluster.loadFromFraction(cluster.loadFraction(180))).toBe(180);
    expect(cluster.loadFromFraction(Number.NaN)).toBe(0);
  });

  it("every verdict stays within 38 characters", () => {
    for (const load of cluster.LOAD_LADDER) {
      for (const auto of [false, true]) {
        const base = cluster.setAuto(cluster.setLoad(cluster.initSim(), load), auto);
        for (const s of [base, cluster.killPod(base, 1), cluster.toggleProbe(base, 1), cluster.advance(cluster.killPod(base, 1), 1), cluster.advance(base, 3)]) {
          expect(cluster.verdictFor(s).text.length).toBeLessThanOrEqual(VERDICT_MAX);
        }
      }
    }
  });

  it("renders on the server", () => {
    renders(sysdesignM18ClusterPlay);
  });
});

describe("18.5 pipeline step", () => {
  const none = pipe.STAGES.map(() => false);
  const breakAt = (i: number) => pipe.STAGES.map((_, k) => k === i);
  const table: [string, boolean[], number, string, string][] = [
    ["none", none, 504, "50.4 s", "8 min 24 s"],
    ["lint", breakAt(0), 2, "0.2 s", "2 s"],
    ["service tests", breakAt(1), 30, "3.0 s", "30 s"],
    ["smoke test", breakAt(3), 474, "47.4 s", "7 min 54 s"],
    ["size gate", breakAt(4), 484, "48.4 s", "8 min 4 s"],
  ];
  it.each(table)("broken stage: %s", (_name, broken, tenths, laptop, runner) => {
    expect(pipe.knownTenths(broken)).toBe(tenths);
    expect(pipe.formatTime(tenths, "laptop")).toBe(laptop);
    expect(pipe.formatTime(tenths, "runner")).toBe(runner);
  });

  it("a red stage stops the pipeline and skips every later stage", () => {
    const broken = breakAt(2);
    expect(pipe.statusesOf(6, broken)).toEqual(["pass", "pass", "fail", "skipped", "skipped", "skipped"]);
    // Before the commit gets there, the red stage has not stopped anything yet.
    expect(pipe.statusesOf(2, broken)).toEqual(["pass", "pass", "pending", "pending", "pending", "pending"]);
    expect(pipe.statusesOf(3, broken)).toEqual(["pass", "pass", "fail", "skipped", "skipped", "skipped"]);
    expect(pipe.elapsedTenths(3, broken)).toBe(410);
    expect(pipe.elapsedTenths(6, broken)).toBe(410);
  });

  it("the first red stage wins when several are broken", () => {
    const broken = [false, true, false, true, false, false];
    expect(pipe.knownTenths(broken)).toBe(30);
    expect(pipe.stopIndex(6, broken)).toBe(1);
  });

  it("steps one stage at a time, then starts again", () => {
    let at = 0;
    const seen: number[] = [];
    for (let i = 0; i < 8; i++) {
      at = pipe.nextAt(at, none);
      seen.push(at);
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 0, 1]);
    expect(pipe.nextAt(1, breakAt(0))).toBe(0);
    expect(pipe.nextAt(1, breakAt(2))).toBe(2);
    expect(pipe.nextAt(3, breakAt(2))).toBe(0);
  });

  it("the token sits at the last stage it went through", () => {
    expect(pipe.tokenSlot(0, none)).toBe(-1);
    expect(pipe.tokenSlot(3, none)).toBe(2);
    expect(pipe.tokenSlot(6, none)).toBe(5);
    expect(pipe.tokenSlot(6, breakAt(1))).toBe(1);
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    expect(pipe.verdictFor(6, none, "laptop").text).toBe("All gates passed: ready to ship");
    expect(pipe.verdictFor(1, breakAt(0), "laptop").text).toBe("Cheap check first: known at once");
    expect(pipe.verdictFor(6, breakAt(3), "laptop").text).toBe("Red at smoke: known in 47.4 s");
    expect(pipe.verdictFor(6, breakAt(3), "runner").text).toBe("Red at smoke: known in 7 min 54 s");
    expect(pipe.verdictFor(0, none, "laptop").text).toBe("Commit waiting: press Step to begin");
    for (let red = -1; red < pipe.STAGE_COUNT; red++) {
      for (let at = 0; at <= pipe.STAGE_COUNT; at++) for (const scale of ["laptop", "runner"] as const) expect(pipe.verdictFor(at, red < 0 ? none : breakAt(red), scale).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
  });

  it("renders on the server", () => {
    renders(sysdesignM18PipelineStep);
  });
});

describe("18.6 canary blast", () => {
  // share %, bug %, failures a minute, minutes, requests exposed, dashboard %
  const table: [number, number, number, number, number, number][] = [
    [5, 20, 30, 1, 150, 1.19],
    [5, 2, 3, 10, 1500, 0.29],
    [1, 5, 1.5, 20, 600, 0.248],
    [25, 20, 150, 0.2, 150, 5.15],
  ];
  it.each(table)("share %i%%, bug %i%%", (s, e, perMin, minutes, exposed, dash) => {
    expect(canary.failuresPerMin(s, e)).toBeCloseTo(perMin, 9);
    expect(canary.minutesToAlert(s, e)).toBeCloseTo(minutes, 9);
    expect(canary.requestsExposed(e)).toBeCloseTo(exposed, 9);
    expect(canary.dashboardRate(s, e)).toBeCloseTo(dash, 9);
  });

  it("requests exposed equal R x s x minutes", () => {
    for (const [s, e] of [[5, 20], [10, 5], [30, 2]]) {
      expect(canary.canaryRequestsPerMin(s) * canary.minutesToAlert(s, e)).toBeCloseTo(canary.requestsExposed(e), 9);
    }
  });

  it("formats the numbers", () => {
    expect(canary.formatMinutes(0.2)).toBe("12 s");
    expect(canary.formatMinutes(1)).toBe("1.0 min");
    expect(canary.formatMinutes(10)).toBe("10 min");
    expect(canary.formatMinutes(20)).toBe("20 min");
    expect(canary.formatPercent(canary.dashboardRate(5, 2))).toBe("0.29%");
    expect(canary.formatPercent(canary.dashboardRate(25, 20))).toBe("5.15%");
    expect(canary.formatPercent(canary.dashboardRate(1, 5))).toBe("0.25%");
    expect(canary.formatPercent(canary.dashboardRate(5, 20))).toBe("1.19%");
    expect(canary.formatCount(1500)).toBe("1,500");
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    expect(canary.verdictFor(5, 2).text).toBe("Bug hidden in the average");
    expect(canary.verdictFor(1, 1).text).toBe("Slow to see: raise the share");
    expect(canary.verdictFor(25, 20).text).toBe("Fast alert, but 1 in 4 users on it");
    expect(canary.verdictFor(5, 20).text).toBe("Small share, quick alert");
    for (let s = canary.SHARE_MIN; s <= canary.SHARE_MAX; s++) for (let e = canary.BUG_MIN; e <= canary.BUG_MAX; e++) expect(canary.verdictFor(s, e).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("the rails snap near 5, 10 and 25 (share) and 5 and 20 (bug), and reach both ends", () => {
    const share = (v: number) => canary.railToValue(canary.valueToRail(v, canary.SHARE_MIN, canary.SHARE_MAX), canary.SHARE_MIN, canary.SHARE_MAX, canary.SHARE_SNAPS);
    for (const v of [1, 5, 10, 25, 50]) expect(share(v)).toBe(v);
    expect(canary.railToValue(0, 1, 50, canary.SHARE_SNAPS)).toBe(1);
    expect(canary.railToValue(1, 1, 50, canary.SHARE_SNAPS)).toBe(50);
    expect(canary.railToValue(canary.valueToRail(4, 1, 50), 1, 50, canary.SHARE_SNAPS)).toBe(5);
    expect(canary.railToValue(canary.valueToRail(21, 1, 50), 1, 50, canary.BUG_SNAPS)).toBe(20);
    expect(canary.railToValue(canary.valueToRail(2, 1, 50), 1, 50, canary.BUG_SNAPS)).toBe(2);
    expect(canary.railToValue(Number.NaN, 1, 50, [])).toBe(1);
  });

  it("the pile loop is watchable and holds full at the end", () => {
    expect(canary.pileSeconds(0.2)).toBeGreaterThan(1.5);
    expect(canary.pileSeconds(100)).toBeLessThan(14);
    const d = canary.pileSeconds(1);
    expect(canary.pileProgress(0, d)).toBe(0);
    expect(canary.pileProgress(d, d)).toBe(1);
    expect(canary.pileProgress(d + 1, d)).toBe(1);
    expect(canary.pileProgress(d + 2.01, d)).toBeLessThan(0.01);
  });

  it("the crowd draw is repeatable and sends about the share to the canary", () => {
    expect(canary.unit(3, 7)).toBe(canary.unit(3, 7));
    let hits = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (canary.unit(i % 12, Math.floor(i / 12)) < 0.25) hits++;
    expect(hits / n).toBeGreaterThan(0.2);
    expect(hits / n).toBeLessThan(0.3);
  });

  it("renders on the server", () => {
    renders(sysdesignM18CanaryBlast);
  });
});

describe("18.7 cloud explorer", () => {
  it("has six needs and eight blocks", () => {
    expect(cloud.NEEDS).toHaveLength(6);
    expect(cloud.BLOCKS).toHaveLength(8);
  });

  const fits: [cloud.NeedId, cloud.BlockId, cloud.BlockId][] = [
    ["api", "containers", "vm"],
    ["photo", "function", "containers"],
    ["exports", "object", "block"],
    ["notes", "db", "vm"],
    ["emails", "queue", "db"],
    ["reads", "cache", "db"],
  ];
  it.each(fits)("%s: best %s, acceptable %s, the rest wrong", (need, best, ok) => {
    for (const b of cloud.BLOCKS) {
      const expected = b.id === best ? "best" : b.id === ok ? "ok" : "wrong";
      expect(cloud.fitOf(need, b.id)).toBe(expected);
    }
  });

  it("every wrong pick has its own reason of 56 characters or fewer", () => {
    for (const n of cloud.NEEDS) {
      for (const b of cloud.BLOCKS) {
        const reason = cloud.reasonOf(n.id, b.id);
        expect(reason.length).toBeGreaterThan(10);
        expect(reason.length).toBeLessThanOrEqual(56);
        expect(reason).not.toBe("Wrong shape for this need");
        expect(reason).not.toContain("\u2014");
      }
    }
  });

  it("the example reasons from the spec are there", () => {
    expect(cloud.reasonOf("api", "function")).toBe("Per-request billing costs more at steady load");
    expect(cloud.reasonOf("photo", "vm")).toBe("Paid all day for 20 seconds of work");
    expect(cloud.reasonOf("exports", "cache")).toBe("Loses data and costs more per GB");
    expect(cloud.reasonOf("emails", "cache")).toBe("A restart loses the jobs");
  });

  it("prices: 2 TB is $40 on objects and $200 on a disk; a photo is under $1 on a function and $29 on a machine", () => {
    expect(cloud.priceOf("exports", "object")?.usd).toBe(40);
    expect(cloud.priceOf("exports", "block")?.usd).toBe(200);
    expect(cloud.priceOf("photo", "function")?.usd).toBeLessThan(1);
    expect(cloud.priceOf("photo", "vm")?.usd).toBeCloseTo(28.8, 9);
    expect(cloud.formatUsd(cloud.priceOf("photo", "vm")?.usd ?? 0)).toBe("$29");
    expect(cloud.formatUsd(cloud.priceOf("photo", "function")?.usd ?? 0)).toBe("$0.01");
    expect(cloud.formatUsd(cloud.priceOf("exports", "object")?.usd ?? 0)).toBe("$40");
  });

  it("a function costs more than containers for a steady API", () => {
    const fn = cloud.priceOf("api", "function")?.usd ?? 0;
    const containers = cloud.priceOf("api", "containers")?.usd ?? 0;
    expect(containers).toBeCloseTo(72, 9);
    expect(fn).toBeGreaterThan(containers * 5);
  });

  it("a block that cannot do the job has no price", () => {
    expect(cloud.priceOf("api", "object")).toBeNull();
    expect(cloud.priceOf("notes", "queue")).toBeNull();
    for (const [need, best, ok] of fits) {
      expect(cloud.priceOf(need, best)).not.toBeNull();
      expect(cloud.priceOf(need, ok)).not.toBeNull();
    }
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    expect(cloud.verdictFor("best").text).toBe("Best fit for this load");
    expect(cloud.verdictFor("ok").text).toBe("Works, but costs more or needs work");
    expect(cloud.verdictFor("wrong").text).toBe("Wrong shape for this need");
    for (const f of ["best", "ok", "wrong", null] as const) expect(cloud.verdictFor(f).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("renders on the server", () => {
    renders(sysdesignM18CloudExplorer);
  });
});
