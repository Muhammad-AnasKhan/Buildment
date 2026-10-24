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

  it("serves nothing when the database is not linked into the request path", () => {
    const b = board(2, 0.8);
    b.edges = b.edges.filter((e) => e.to !== "db");
    const r = runTieredModel(b, 1000, TARGETS);
    expect(r.capacityCeiling).toBe(0);
    expect(r.tiers.find((t) => t.id === "db")?.reachable).toBe(false);
    expect(r.pass.rps).toBe(false);
  });

  it("takes the system down when the only load balancer is down", () => {
    const b = board(2, 0.8);
    b.nodes = b.nodes.map((n) => (n.id === "lb" ? { ...n, props: { ...n.props, down: 1 } } : n));
    const r = runTieredModel(b, 1000, TARGETS);
    expect(r.tiers.find((t) => t.id === "lb")?.down).toBe(true);
    expect(r.capacityCeiling).toBe(0);
    expect(r.availability).toBe(0);
    expect(r.allPass).toBe(false);
  });

  it("splits load across parallel load balancers", () => {
    const single = runTieredModel(board(2, 0.8), 1000, TARGETS).tiers.find((t) => t.id === "lb")!.utilisation;
    const b = board(2, 0.8);
    b.nodes.push({ id: "lb2", kind: "load-balancer", x: 1, y: 1, props: { size: "general-small", zones: 1 } });
    b.edges.push({ from: "client", to: "lb2" }, { from: "lb2", to: "app" });
    const r = runTieredModel(b, 1000, TARGETS);
    expect(r.tiers.find((t) => t.id === "lb")!.utilisation).toBeCloseTo(single / 2, 5);
  });

  it("keeps serving through a redundant load balancer when one is down", () => {
    const b = board(2, 0.8);
    b.nodes.push({ id: "lb2", kind: "load-balancer", x: 1, y: 1, props: { size: "general-small", zones: 1 } });
    b.edges.push({ from: "client", to: "lb2" }, { from: "lb2", to: "app" });
    b.nodes = b.nodes.map((n) => (n.id === "lb" ? { ...n, props: { ...n.props, down: 1 } } : n));
    const r = runTieredModel(b, 1000, TARGETS);
    expect(r.capacityCeiling).toBeGreaterThan(0);
    expect(r.failure).toBeUndefined();
    expect(r.tiers.find((t) => t.id === "lb2")!.utilisation).toBeCloseTo(1000 / 1600, 5);
  });

  it("reports the request rate carried by each live link", () => {
    const r = runTieredModel(board(2, 0.8), 1000, TARGETS);
    expect(r.edgeFlows["client>lb"]).toBeCloseTo(1000, 5);
    expect(r.edgeFlows["app>cache"]).toBeCloseTo(1000, 5);
    expect(r.edgeFlows["app>db"]).toBeCloseTo(200, 5);
  });

  it("names the down component in the failure", () => {
    const b = board(2, 0.8);
    b.nodes = b.nodes.map((n) => (n.id === "app" ? { ...n, props: { ...n.props, down: 1 } } : n));
    const r = runTieredModel(b, 1000, TARGETS);
    expect(r.failure).toContain("App server");
  });
});
