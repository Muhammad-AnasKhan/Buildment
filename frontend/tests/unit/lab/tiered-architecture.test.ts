import { describe, expect, it } from "vitest";
import type { Board } from "@/lab/types";
import { runTieredModel } from "@/lab/tiered-architecture";

const TARGETS = { rps: 5000, p99Ms: 200, availability: 0.999, budgetPerHour: 2 };

function board(appCount: number, cacheHit: number): Board {
  return {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 1, y: 0, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 2, y: 0, props: { size: "compute-small", count: appCount } },
      { id: "cache", kind: "cache", x: 3, y: 0, props: { size: "memory-small", hitRate: cacheHit } },
      { id: "db", kind: "database", x: 4, y: 0, props: { size: "memory-medium", replicas: 1 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "cache" },
      { from: "app", to: "db" },
    ],
  };
}

describe("runTieredModel", () => {
  it("computes app-tier capacity and utilisation from size and count", () => {
    const r = runTieredModel(board(2, 0.8), 1000, TARGETS);
    const app = r.tiers.find((t) => t.id === "app");
    expect(app?.capacity).toBe(4800);
    expect(app?.utilisation).toBeCloseTo(1000 / 4800, 3);
  });

  it("keeps p99 finite under overload and fails the rps target", () => {
    const r = runTieredModel(board(2, 0.8), 20000, TARGETS);
    expect(Number.isFinite(r.p99Ms)).toBe(true);
    expect(r.pass.rps).toBe(false);
  });

  it("sends zero load to the database when the cache always hits", () => {
    const r = runTieredModel(board(2, 1), 4000, TARGETS);
    const db = r.tiers.find((t) => t.id === "db");
    expect(db?.utilisation).toBe(0);
  });

  it("returns a result rather than throwing when there is no app tier", () => {
    const b: Board = { nodes: [{ id: "client", kind: "client", x: 0, y: 0 }], edges: [] };
    expect(() => runTieredModel(b, 1000, TARGETS)).not.toThrow();
  });

  it("lowers app utilisation when app servers are added", () => {
    const two = runTieredModel(board(2, 0.8), 4000, TARGETS).tiers.find((t) => t.id === "app");
    const four = runTieredModel(board(4, 0.8), 4000, TARGETS).tiers.find((t) => t.id === "app");
    expect(four!.utilisation).toBeLessThan(two!.utilisation);
  });
});
