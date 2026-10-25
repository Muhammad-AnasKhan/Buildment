import { describe, expect, it } from "vitest";
import type { ComponentKind } from "@/lab/catalog";
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

const node = (id: string, kind: ComponentKind, props: Record<string, number | string> = {}) => ({ id, kind, x: 0, y: 0, props });
const chain = (nodes: ReturnType<typeof node>[], pairs: [string, string][]): Board => ({
  nodes,
  edges: pairs.map(([from, to]) => ({ from, to })),
});

describe("runTieredModel: component configurations", () => {
  it("autoscales instances to hold the target utilisation", () => {
    const b = chain(
      [node("c", "client"), node("lb", "aws-alb"), node("asg", "aws-ec2-asg", { size: "m5.large", autoscale: 1, minCount: 2, maxCount: 20, targetUtil: 0.5 })],
      [["c", "lb"], ["lb", "asg"]],
    );
    const asg = runTieredModel(b, 8000, {}).tiers.find((t) => t.id === "asg")!;
    expect(asg.units).toBe(10); // m5.large serves 1,600/s; at 50% that is 800/s each
    expect(asg.utilisation).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("runs hot once autoscaling reaches its max", () => {
    const b = chain(
      [node("c", "client"), node("lb", "aws-alb"), node("asg", "aws-ec2-asg", { size: "m5.large", autoscale: 1, minCount: 2, maxCount: 4, targetUtil: 0.5 })],
      [["c", "lb"], ["lb", "asg"]],
    );
    const asg = runTieredModel(b, 8000, {}).tiers.find((t) => t.id === "asg")!;
    expect(asg.units).toBe(4);
    expect(asg.utilisation).toBeCloseTo(8000 / 6400, 5);
  });

  it("charges managed services per request", () => {
    const b = chain([node("c", "client"), node("gw", "aws-api-gateway", { apiType: "REST" })], [["c", "gw"]]);
    const low = runTieredModel(b, 100, {}).costPerHour;
    const high = runTieredModel(b, 1000, {}).costPerHour;
    expect(high).toBeGreaterThan(low);
    expect(high).toBeCloseTo(12.6, 1); // 3.6M requests an hour at $3.50 per million
  });

  it("drops traffic above a rate limit and protects what sits behind it", () => {
    const b = chain([node("c", "client"), node("rl", "rate-limiter", { limit: 500 }), node("app", "app-server")], [["c", "rl"], ["rl", "app"]]);
    const r = runTieredModel(b, 1000, {});
    expect(r.dropped).toBeCloseTo(500, 5);
    expect(r.edgeFlows["rl>app"]).toBeCloseTo(500, 5);
  });

  it("throttles Lambda beyond concurrency divided by duration", () => {
    const b = chain(
      [node("c", "client"), node("gw", "aws-api-gateway"), node("fn", "aws-lambda", { concurrency: 10, durationMs: 100 })],
      [["c", "gw"], ["gw", "fn"]],
    );
    expect(runTieredModel(b, 300, {}).dropped).toBeCloseTo(200, 5); // at most 10 x 1000 / 100 = 100/s
  });

  it("lets a queue absorb work: slow workers build a backlog instead of capping requests", () => {
    const b = chain(
      [node("c", "client"), node("app", "app-server", { count: 4 }), node("q", "queue"), node("w", "worker", { count: 1, size: "compute-small" })],
      [["c", "app"], ["app", "q"], ["q", "w"]],
    );
    const r = runTieredModel(b, 4000, {});
    expect(r.backlog).toBeCloseTo(1600, 5); // one worker takes 2,400/s of the 4,000/s
    expect(r.capacityCeiling).toBeGreaterThanOrEqual(4000);
  });

  it("is more available spread across two zones than in one", () => {
    const mk = (zones: number) => chain([node("c", "client"), node("app", "app-server", { count: 2, azs: zones })], [["c", "app"]]);
    expect(runTieredModel(mk(2), 1000, {}).availability).toBeGreaterThan(runTieredModel(mk(1), 1000, {}).availability);
  });

  it("spreads reads across read replicas", () => {
    const mk = (replicas: number) =>
      chain([node("c", "client"), node("app", "app-server", { count: 4 }), node("db", "database", { replicas, readRatio: 0.8 })], [["c", "app"], ["app", "db"]]);
    const without = runTieredModel(mk(0), 2000, {}).tiers.find((t) => t.id === "db")!.utilisation;
    const withTwo = runTieredModel(mk(2), 2000, {}).tiers.find((t) => t.id === "db")!.utilisation;
    expect(withTwo).toBeLessThan(without);
  });

  it("lets CDN hits shield the origin", () => {
    const b = chain(
      [node("c", "client"), node("cf", "aws-cloudfront", { hitRate: 0.9 }), node("lb", "aws-alb"), node("app", "aws-ec2-asg")],
      [["c", "cf"], ["cf", "lb"], ["lb", "app"]],
    );
    expect(runTieredModel(b, 10_000, {}).edgeFlows["cf>lb"]).toBeCloseTo(1000, 5);
  });
});
