import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as zones from "@/canvas/sysdesign-m19-add-zones/model";
import { sysdesignM19AddZones } from "@/canvas/sysdesign-m19-add-zones/data";
import * as cells from "@/canvas/sysdesign-m19-cells/model";
import { sysdesignM19Cells } from "@/canvas/sysdesign-m19-cells/data";
import * as failure from "@/canvas/sysdesign-m19-failure-time/model";
import { sysdesignM19FailureTime } from "@/canvas/sysdesign-m19-failure-time/data";
import * as region from "@/canvas/sysdesign-m19-fail-region/model";
import { sysdesignM19FailRegion } from "@/canvas/sysdesign-m19-fail-region/data";
import * as route from "@/canvas/sysdesign-m19-route-users/model";
import { sysdesignM19RouteUsers } from "@/canvas/sysdesign-m19-route-users/data";
import * as latency from "@/canvas/sysdesign-m19-write-latency/model";
import { sysdesignM19WriteLatency } from "@/canvas/sysdesign-m19-write-latency/data";
import { keyLayout, stepStarts, stepTotal, type BarStep } from "@/canvas/primitives/svg-step-bar";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("\u2014");
  return html;
}

describe("19.2 add zones", () => {
  // n, availability (3 decimals), downtime minutes, hours, capacity multiple
  const table: [number, string, number, string, string][] = [
    [1, "99.850%", 788, "13.1 h", "1.00"],
    [2, "99.950%", 263, "4.4 h", "2.00"],
    [3, "99.950%", 263, "4.4 h", "1.50"],
    [4, "99.950%", 263, "4.4 h", "1.33"],
  ];
  it.each(table)("%i zones: %s, %i min, %s, capacity %s x peak", (n, avail, mins, hours, cap) => {
    expect(zones.formatAvailability(zones.availability(n))).toBe(avail);
    expect(Math.round(zones.downtimeMinutes(n))).toBe(mins);
    expect(zones.formatHours(zones.downtimeMinutes(n))).toBe(hours);
    expect(zones.capacityMultiple(n).toFixed(2)).toBe(cap);
  });

  it("n = 2 shows 99.9499% to four decimals and the gain stops after two zones", () => {
    expect((zones.availability(2) * 100).toFixed(4)).toBe("99.9499");
    expect(Math.round(zones.downtimeMinutes(3))).toBe(Math.round(zones.SHARED_DOWNTIME_MINUTES));
    expect(Math.round(zones.downtimeMinutes(4))).toBe(Math.round(zones.SHARED_DOWNTIME_MINUTES));
  });

  it("loads: 100% on a live zone after one failure, and overloaded after two", () => {
    expect(zones.loadShare(3, 0)).toBeCloseTo(2 / 3);
    expect(zones.loadShare(3, 1)).toBe(1);
    expect(zones.loadShare(4, 1)).toBe(1);
    expect(zones.loadShare(3, 2)).toBe(2);
    expect(zones.loadShare(1, 0)).toBe(1);
    expect(zones.loadShare(2, 2)).toBeNull();
    expect(zones.appDown(1, 1, false)).toBe(true);
    expect(zones.appDown(2, 1, false)).toBe(false);
    expect(zones.appDown(3, 1, false)).toBe(false);
    expect(zones.appDown(3, 2, false)).toBe(true);
    expect(zones.appDown(4, 0, true)).toBe(true);
  });

  it("counts only the zones that exist", () => {
    expect(zones.failedCount(2, [false, true, true, true])).toBe(1);
    expect(zones.failedCount(4, [true, true, false, false])).toBe(2);
  });

  it("verdicts match the spec and stay within 38 characters", () => {
    const texts: Record<string, string> = {};
    for (const n of zones.ZONE_COUNTS) {
      for (let f = 0; f <= n; f++) for (const bad of [false, true]) {
        const v = zones.verdictFor(n, f, bad);
        expect(v.text.length).toBeLessThanOrEqual(VERDICT_MAX);
        texts[`${n}-${f}-${bad}`] = v.text;
      }
    }
    expect(texts["1-0-false"]).toBe("One zone: any zone fault is an outage");
    expect(texts["2-0-false"]).toBe("Survives a zone; costs 2.00 x capacity");
    expect(texts["3-0-false"]).toBe("Survives a zone for 1.50 x capacity");
    expect(texts["4-0-false"]).toBe("A 4th zone adds cost, not uptime");
    expect(texts["1-1-false"]).toBe("Zone down: the app is down");
    expect(texts["3-1-false"]).toBe("Zone down: the others carry the load");
    expect(texts["4-1-true"]).toBe("Same bug everywhere: all zones down");
  });

  it("renders", () => {
    const html = renders(sysdesignM19AddZones);
    expect(html).toContain("Survives a zone for 1.50 x capacity");
    expect(html).toContain("Bad release to all zones");
    expect(html).toContain("263 min");
  });
});

describe("19.2 cells", () => {
  it.each([
    [1, 100, 1],
    [2, 50, 1],
    [4, 25, 1],
    [10, 10, 7],
  ])("%i cells: %i customers affected, poison customer in cell %i", (n, affected, cell) => {
    expect(cells.affectedCount(n)).toBe(affected);
    expect(cells.cellOf(cells.POISON_CUSTOMER, n)).toBe(cell);
    expect(cells.affectedCustomers(n).every((c) => cells.cellOf(c, n) === cell)).toBe(true);
    expect(cells.affectedCount(n)).toBe(cells.CUSTOMERS / n);
  });

  it("deals customers out in turn, so cells are interleaved", () => {
    expect([1, 2, 3, 4, 5].map((c) => cells.cellOf(c, 4))).toEqual([1, 2, 3, 4, 1]);
    expect(cells.cellOf(100, 10)).toBe(10);
    expect(cells.gridSpot(1)).toEqual({ row: 0, col: 0 });
    expect(cells.gridSpot(37)).toEqual({ row: 3, col: 6 });
    expect(cells.gridSpot(100)).toEqual({ row: 9, col: 9 });
  });

  it("verdicts and the growing counter", () => {
    expect(cells.verdictFor(4, false).text).toBe("Tap the poison customer");
    expect(cells.verdictFor(1, true).text).toBe("100% of customers affected");
    expect(cells.verdictFor(2, true).text).toBe("50% of customers affected");
    expect(cells.verdictFor(4, true).text).toBe("25% of customers affected");
    expect(cells.verdictFor(10, true).text).toBe("10% of customers affected");
    for (const n of cells.CELL_COUNTS) for (const sent of [false, true]) expect(cells.verdictFor(n, sent).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    expect(cells.turnedCount(25, 0)).toBe(0);
    expect(cells.turnedCount(25, 0.2)).toBe(9);
    expect(cells.turnedCount(25, 5)).toBe(25);
  });

  it("renders", () => {
    const html = renders(sysdesignM19Cells);
    expect(html).toContain("Tap the poison customer");
    expect(html).toContain("cell router");
  });
});

describe("19.3 failure time", () => {
  it("copy-back is 67 minutes", () => {
    expect(failure.COPY_BACK_MIN).toBe(67);
  });

  it.each([
    ["nightly", 12, 77],
    ["nightly", 24, 77],
    ["log", 12, 149],
    ["log", 24, 221],
    ["log", 0, 77],
    ["copy", 12, 11],
    ["copy", 0, 11],
    ["copy", 24, 11],
  ] as const)("%s at h = %f: back in %i min", (mode, h, back) => {
    expect(failure.recoverMinutes(mode, h)).toBe(back);
  });

  it("log mode replays 6 minutes per hour; copy mode promotes then switches", () => {
    expect(failure.stepsFor("log", 12).map((s) => [s.id, s.minutes])).toEqual([["copy-back", 67], ["replay", 72], ["switch", 10]]);
    expect(failure.stepsFor("copy", 5).map((s) => [s.id, s.minutes])).toEqual([["promote", 1], ["switch", 10]]);
    expect(failure.stepsFor("nightly", 3).map((s) => s.id)).toEqual(["copy-back", "switch"]);
  });

  it("data lost follows the mode", () => {
    expect(failure.lostMinutes("nightly", 12)).toBe(720);
    expect(failure.lostMinutes("log", 12)).toBe(5);
    expect(failure.lostMinutes("log", 0.5)).toBe(5);
    expect(failure.lostMinutes("copy", 12)).toBeCloseTo(1 / 60);
    expect(failure.lostWrites()).toBe(300);
  });

  it("verdicts match the spec", () => {
    expect(failure.verdictFor("nightly", 12).text).toBe("12 h lost; back in 77 min");
    expect(failure.verdictFor("nightly", 12.5).text).toBe("12.5 h lost; back in 77 min");
    expect(failure.verdictFor("log", 12).text).toBe("5 min lost at most; back in 149 min");
    expect(failure.verdictFor("copy", 12).text).toBe("1 s lost; back in 11 min");
    expect(failure.verdictFor("nightly", 0).text).toBe("Nothing lost yet; back in 77 min");
    for (const mode of ["nightly", "log", "copy"] as const) for (let h = 0; h <= 24; h += 0.5) expect(failure.verdictFor(mode, h).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("snaps to the half hour and shows the clock time", () => {
    expect(failure.snapHours(12.1)).toBe(12);
    expect(failure.snapHours(12.3)).toBe(12.5);
    expect(failure.snapHours(-3)).toBe(0);
    expect(failure.snapHours(99)).toBe(24);
    expect(failure.clockTime(12)).toBe("14:00");
    expect(failure.clockTime(12.5)).toBe("14:30");
    expect(failure.clockTime(0)).toBe("02:00");
    expect(failure.clockTime(24)).toBe("02:00");
  });

  it("renders", () => {
    const html = renders(sysdesignM19FailureTime);
    expect(html).toContain("12 h lost; back in 77 min");
    expect(html).toContain("Nightly backup only");
  });
});

describe("19.4 fail a region", () => {
  it.each([
    ["backup", 109.5, 110, 1.1],
    ["pilot", 23.5, 24, 1.2],
    ["warm", 13.5, 14, 1.5],
    ["active", 2.5, 3, 2.0],
  ] as const)("%s: down %f (about %i), cost %f", (id, exact, rounded, cost) => {
    const rung = region.RUNGS.find((r) => r.id === id)!;
    expect(region.downMinutes(rung)).toBe(exact);
    expect(region.roundedDown(rung)).toBe(rounded);
    expect(rung.cost).toBe(cost);
  });

  it("writes lost: up to an hour, 300, 300 and 150", () => {
    expect(region.RUNGS.map((r) => r.lost)).toEqual(["hour", 300, 300, 150]);
    expect(region.RUNGS.map((r) => region.lostText(r))).toEqual(["writes lost: up to 1 h", "writes lost: 300", "writes lost: 300", "writes at risk: 150"]);
  });

  it("down time falls and cost rises down the ladder", () => {
    const downs = region.RUNGS.map((r) => region.downMinutes(r));
    const costs = region.RUNGS.map((r) => r.cost);
    expect([...downs].sort((a, b) => b - a)).toEqual(downs);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
  });

  it("what runs in Region B per rung", () => {
    expect(region.RUNGS.map((r) => [r.data, r.app])).toEqual([["backups", "none"], ["live copy", "off"], ["live copy", "small"], ["live copy", "full"]]);
    expect(region.usersOnA(region.RUNGS[3])).toBe(6);
    expect(region.usersOnA(region.RUNGS[0])).toBe(12);
  });

  it("verdicts match the spec", () => {
    const [b, p, w, a] = region.RUNGS;
    expect(region.verdictFor(w, false).text).toBe("Pick a plan, then fail Region A");
    expect(region.verdictFor(b, true).text).toBe("Down about 110 min; up to 1 h lost");
    expect(region.verdictFor(p, true).text).toBe("Down about 24 min; 300 writes lost");
    expect(region.verdictFor(w, true).text).toBe("Down about 14 min; 300 writes lost");
    expect(region.verdictFor(a, true).text).toBe("A's users back in 3 min; 150 at risk");
    for (const r of region.RUNGS) for (const f of [false, true]) expect(region.verdictFor(r, f).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("renders", () => {
    const html = renders(sysdesignM19FailRegion);
    expect(html).toContain("Pick a plan, then fail Region A");
    expect(html).toContain("Fail Region A");
  });
});

describe("19.5 route users", () => {
  const none = new Set<route.RegionId>();
  const eu = new Set<route.RegionId>(["eu"]);
  const na = new Set<route.RegionId>(["na"]);
  const both = new Set<route.RegionId>(["eu", "na"]);

  it("dark time is 90 s plus the TTL, or 90 s for anycast", () => {
    expect(route.darkSeconds("latency", 60)).toBe(150);
    expect(route.darkSeconds("latency", 300)).toBe(390);
    expect(route.darkSeconds("failover", 60)).toBe(150);
    expect(route.darkSeconds("location", 300)).toBe(390);
    expect(route.darkSeconds("anycast", 60)).toBe(90);
    expect(route.darkSeconds("anycast", 300)).toBe(90);
  });

  it("homes while both regions are healthy", () => {
    const homes = (p: route.PolicyId) => route.GROUPS.map((g) => route.homeRegion(p, g.id));
    expect(homes("latency")).toEqual(["eu", "na", "eu"]);
    expect(homes("location")).toEqual(["eu", "na", "eu"]);
    expect(homes("anycast")).toEqual(["eu", "na", "eu"]);
    expect(homes("failover")).toEqual(["eu", "eu", "eu"]);
  });

  it("latency, EU West fails: Europe and Singapore are dark, then use NA East", () => {
    expect(route.affectedGroups("latency", eu)).toEqual(["europe", "asia"]);
    expect(route.groupState("latency", 60, eu, "europe", 0)).toEqual({ kind: "dark", region: "eu" });
    expect(route.groupState("latency", 60, eu, "europe", 149)).toEqual({ kind: "dark", region: "eu" });
    expect(route.groupState("latency", 60, eu, "europe", 150)).toEqual({ kind: "moved", region: "na" });
    expect(route.groupState("latency", 300, eu, "asia", 389)).toEqual({ kind: "dark", region: "eu" });
    expect(route.groupState("latency", 300, eu, "asia", 390)).toEqual({ kind: "moved", region: "na" });
    expect(route.groupState("latency", 60, eu, "na", 0)).toEqual({ kind: "ok", region: "na" });
  });

  it("failover: NA East fails and nobody moves; EU West fails and everybody does", () => {
    expect(route.affectedGroups("failover", na)).toEqual([]);
    expect(route.affectedGroups("failover", eu)).toEqual(["europe", "na", "asia"]);
    expect(route.groupState("failover", 60, na, "europe", 0)).toEqual({ kind: "ok", region: "eu" });
    expect(route.groupState("failover", 60, eu, "na", 150)).toEqual({ kind: "moved", region: "na" });
  });

  it("anycast moves after 90 s", () => {
    expect(route.groupState("anycast", 300, eu, "europe", 89)).toEqual({ kind: "dark", region: "eu" });
    expect(route.groupState("anycast", 300, eu, "europe", 90)).toEqual({ kind: "moved", region: "na" });
  });

  it("with both regions failed nobody has a region", () => {
    expect(route.groupState("latency", 60, both, "europe", Infinity)).toEqual({ kind: "none" });
  });

  it("the survivor serves the groups that moved", () => {
    const at = (s: number) => route.GROUPS.map((g) => ({ id: g.id, state: route.groupState("latency", 60, eu, g.id, s) }));
    expect(route.served(at(0), "na")).toBe(1);
    expect(route.served(at(0), "eu")).toBe(0);
    expect(route.served(at(150), "na")).toBe(3);
  });

  it("verdicts match the spec", () => {
    expect(route.verdictFor("latency", 60, none).text).toBe("Pick a policy, then fail a region");
    expect(route.verdictFor("latency", 60, eu).text).toBe("Europe reaches NA East after 150 s");
    expect(route.verdictFor("latency", 300, eu).text).toBe("Europe reaches NA East after 390 s");
    expect(route.verdictFor("anycast", 60, eu).text).toBe("Moved after 90 s; no cache to wait");
    expect(route.verdictFor("failover", 60, na).text).toBe("Nobody was on it; no one moves");
    expect(route.verdictFor("failover", 60, eu).text).toBe("Everyone reaches NA East after 150 s");
    expect(route.verdictFor("latency", 60, na).text).toBe("NA East reaches EU West after 150 s");
    for (const p of route.POLICIES) for (const ttl of route.TTLS) for (const set of [none, eu, na, both]) expect(route.verdictFor(p.id, ttl, set).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    expect(route.verdictFor("latency", 60, both).text).toBe("No region left to route to");
  });

  it("round trips: 80 ms to the other region, 160 ms from Singapore, 'farther' for the missing figure", () => {
    expect(route.tripText("europe", "na").text).toBe("80 ms");
    expect(route.tripText("na", "eu").text).toBe("80 ms");
    expect(route.tripText("asia", "eu").text).toBe("160 ms");
    expect(route.tripText("asia", "na")).toEqual({ text: "farther", ms: null });
  });

  it("renders", () => {
    const html = renders(sysdesignM19RouteUsers);
    expect(html).toContain("Pick a policy, then fail a region");
    expect(html).toContain("Anycast");
    expect(html).toContain("TTL 300 s");
  });
});

describe("19.6 write latency", () => {
  const rounded = (d: latency.DesignId, r: latency.RegionId) => latency.formatMs(latency.writeMs(d, r));

  it("the nine numbers", () => {
    expect(latency.writeMs("one", "nae")).toBeCloseTo(0.55);
    expect(latency.writeMs("one", "naw")).toBeCloseTo(60.55);
    expect(latency.writeMs("one", "eu")).toBeCloseTo(80.55);
    for (const r of ["nae", "naw", "eu"] as const) expect(latency.writeMs("home", r)).toBeCloseTo(0.55);
    expect(latency.writeMs("global", "nae")).toBeCloseTo(60.55);
    expect(latency.writeMs("global", "naw")).toBeCloseTo(60.55);
    expect(latency.writeMs("global", "eu")).toBeCloseTo(80.55);
  });

  it("matches the table in chapter 19.6 (NA East / NA West / EU West)", () => {
    expect(["nae", "naw", "eu"].map((r) => rounded("one", r as latency.RegionId))).toEqual(["0.6 ms", "61 ms", "81 ms"]);
    expect(["nae", "naw", "eu"].map((r) => rounded("home", r as latency.RegionId))).toEqual(["0.6 ms", "0.6 ms", "0.6 ms"]);
    expect(["nae", "naw", "eu"].map((r) => rounded("global", r as latency.RegionId))).toEqual(["61 ms", "61 ms", "81 ms"]);
  });

  it("leaders and the nearest other copy", () => {
    expect(latency.leaderOf("one", "eu")).toBe("nae");
    expect(latency.leaderOf("home", "eu")).toBe("eu");
    expect(latency.leaderOf("global", "naw")).toBe("naw");
    expect(latency.nearestOther("eu")).toBe("nae");
    expect(latency.nearestOther("naw")).toBe("nae");
    expect(latency.nearestOther("nae")).toBe("naw");
  });

  it("round trips: only the two in the course table", () => {
    expect(latency.roundTrip("nae", "naw")).toBe(60);
    expect(latency.roundTrip("naw", "nae")).toBe(60);
    expect(latency.roundTrip("eu", "nae")).toBe(80);
    expect(latency.roundTrip("naw", "eu")).toBeNull();
    expect(latency.roundTrip("eu", "eu")).toBe(0);
  });

  it("residency: only the home region design keeps EU rows in the EU", () => {
    expect(latency.euRowsStayInEu("one")).toBe(false);
    expect(latency.euRowsStayInEu("home")).toBe(true);
    expect(latency.euRowsStayInEu("global")).toBe(false);
  });

  it("verdicts match the spec", () => {
    expect(latency.verdictFor("one", "nae").text).toBe("0.6 ms: leader is next door");
    expect(latency.verdictFor("one", "naw").text).toBe("61 ms: trip to the NA East leader");
    expect(latency.verdictFor("one", "eu").text).toBe("81 ms: trip to the NA East leader");
    for (const r of ["nae", "naw", "eu"] as const) expect(latency.verdictFor("home", r).text).toBe("0.6 ms: data lives where you are");
    expect(latency.verdictFor("global", "nae").text).toBe("61 ms: nearest other copy is NA West");
    expect(latency.verdictFor("global", "naw").text).toBe("61 ms: nearest other copy is NA East");
    expect(latency.verdictFor("global", "eu").text).toBe("81 ms: nearest other copy is NA East");
    for (const d of latency.DESIGNS) for (const r of latency.REGIONS) expect(latency.verdictFor(d.id, r.id).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("the messages of one write, in order", () => {
    expect(latency.legsFor("one", "eu").map((l) => [l.from, l.to, l.kind])).toEqual([["eu", "nae", "write"], ["nae", "eu", "reply"]]);
    expect(latency.legsFor("home", "eu")).toEqual([]);
    // The global database's leader is in the customer's region, so the write itself never travels.
    expect(latency.legsFor("global", "eu").map((l) => [l.from, l.to, l.kind])).toEqual([["eu", "nae", "copy"], ["nae", "eu", "ack"]]);
    expect(latency.legsFor("global", "nae").map((l) => [l.from, l.to])).toEqual([["nae", "naw"], ["naw", "nae"]]);
  });

  it("the picture's loop: ring starts when the request arrives and ends before the reply", () => {
    const local = latency.writeSchedule("home", "eu");
    expect(local.ringStart).toBe(0);
    expect(local.beats.map((b) => b.kind)).toEqual(["work", "hold"]);
    const far = latency.writeSchedule("one", "eu");
    expect(far.ringStart).toBeCloseTo(latency.LEG_SECONDS);
    expect(far.ringEnd).toBeCloseTo(latency.LEG_SECONDS + latency.WORK_SECONDS);
    expect(far.total).toBeGreaterThan(far.ringEnd + latency.LEG_SECONDS);
    const global = latency.writeSchedule("global", "eu");
    expect(global.ringStart).toBe(0);
    expect(global.ringEnd).toBeCloseTo(latency.WORK_SECONDS + 2 * latency.LEG_SECONDS);
  });

  it("renders", () => {
    const html = renders(sysdesignM19WriteLatency);
    expect(html).toContain("81 ms: trip to the NA East leader");
    expect(html).toContain("EU rows stay in the EU: no");
    expect(html).toContain("Write: 81 ms");
  });
});

describe("step bar", () => {
  const steps: BarStep[] = [
    { id: "a", label: "copy back", amount: 67, tone: "accent" },
    { id: "b", label: "replay", amount: 72, tone: "warn" },
    { id: "c", label: "switch over", amount: 10, tone: "neutral" },
  ];
  it("adds the steps up and places each after the last", () => {
    expect(stepTotal(steps)).toBe(149);
    expect(stepStarts(steps)).toEqual([0, 67, 139]);
  });
  it("lays the key out in rows that stay inside the width", () => {
    const wide = keyLayout(steps, "min", 24, 396);
    expect(wide.map((k) => k.text)).toEqual(["copy back 67 min", "replay 72 min", "switch over 10 min"]);
    const narrow = keyLayout(steps, "min", 24, 200);
    expect(Math.max(...narrow.map((k) => k.row))).toBeGreaterThan(0);
  });
});
