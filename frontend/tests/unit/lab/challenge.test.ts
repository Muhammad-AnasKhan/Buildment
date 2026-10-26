import { describe, expect, it } from "vitest";
import { challengeFor, followChain, runChallenge } from "@buildment/learning-ui/labs/challenge";
import { hldVisualUrlShortener as spec } from "@buildment/learning-ui/labs/hld-visual-url-shortener/data";
import { hldM4ThreeTiers } from "@buildment/learning-ui/labs/hld-m4-three-tiers/data";
import { runTieredModel } from "@buildment/learning-ui/labs/tiered-architecture";
import type { Board, BoardNode } from "@buildment/learning-ui/labs/types";
import { validateChallenge, validateLabSpec } from "@buildment/learning-ui/labs/types";

type Over = Record<string, Record<string, number | string>>;

/**
 * The reference design recorded in the lab's spec.md: three load balancer zones,
 * three app servers in two zones, a cache at 95% hits, a database with a standby
 * and one read replica, and a queue with two batching workers.
 */
function reference(over: Over = {}, drop: string[] = []): Board {
  const p = (id: string, props: Record<string, number | string>) => ({ ...props, ...(over[id] ?? {}) });
  const nodes: BoardNode[] = [
    { id: "client", kind: "client", x: 0, y: 0 },
    { id: "lb", kind: "load-balancer", x: 0, y: 0, props: p("lb", { size: "general-small", zones: 3 }) },
    { id: "app", kind: "app-server", x: 0, y: 0, props: p("app", { size: "compute-small", count: 3, azs: 2 }) },
    { id: "cache", kind: "cache", x: 0, y: 0, props: p("cache", { size: "memory-small", count: 1, hitRate: 0.95, azs: 2 }) },
    { id: "db", kind: "database", x: 0, y: 0, props: p("db", { size: "memory-medium", replicas: 1, readRatio: 0.99, multiAz: 1 }) },
    { id: "q", kind: "queue", x: 0, y: 0, props: p("q", {}) },
    { id: "w", kind: "worker", x: 0, y: 0, props: p("w", { size: "compute-small", count: 2, batchSize: 500 }) },
  ];
  const links: [string, string][] = [["client", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"], ["app", "q"], ["q", "w"], ["w", "db"]];
  return {
    nodes: nodes.filter((n) => !drop.includes(n.id)),
    edges: links.filter(([a, b]) => !drop.includes(a) && !drop.includes(b)).map(([from, to]) => ({ from, to })),
  };
}

const failed = (board: Board) => runChallenge(spec, board, 3000).checks.filter((c) => !c.pass).map((c) => c.id).sort();

describe("the URL shortener challenge", () => {
  it("is a valid lab spec with a valid challenge", () => {
    expect(validateLabSpec(spec)).toEqual([]);
    expect(validateChallenge(spec.challenge!)).toEqual([]);
    expect(spec.challenge!.checks.filter((c) => c.kind === "functional")).toHaveLength(3);
  });

  it("passes every check with the reference design", () => {
    const report = runChallenge(spec, reference(), 3000);
    expect(report.allPass).toBe(true);
    expect(report.total).toBe(11);
    expect(report.phases.map((p) => p.id)).toEqual(["steady", "lose-app", "lose-cache", "lose-worker"]);
  });

  it("fails the starting board on capacity, redundancy and speed, with a reason for each", () => {
    const start: Board = { nodes: spec.startingBoard!.nodes, edges: spec.startingBoard!.edges };
    const report = runChallenge(spec, start, 3000);
    expect(report.allPass).toBe(false);
    const byId = Object.fromEntries(report.checks.map((c) => [c.id, c]));
    expect(byId.shorten!.pass).toBe(true);
    expect(byId.redirect!.pass).toBe(true);
    // No queue: each redirect writes its click inline, so counting works but loads the database.
    expect(byId.count!.pass).toBe(true);
    expect(byId.count!.measured).toMatch(/inline/);
    expect(byId["worker-dies"]!.measured).toMatch(/no worker to lose/);
    expect(byId["app-dies"]!.pass).toBe(false);
    expect(byId.capacity!.pass).toBe(false);
    for (const c of report.checks.filter((c) => !c.pass)) expect(c.reason).toBeTruthy();
  });

  it("fails the right checks when one part is left out", () => {
    expect(failed(reference({ db: { replicas: 0 } }))).toEqual(["cache-dies", "cache-dies-p99"]);
    expect(failed(reference({ w: { count: 1 } }))).toEqual(["worker-dies"]);
    expect(failed(reference({ w: { batchSize: 1 } }))).toContain("p99");
    expect(failed(reference({ app: { count: 2 } }))).toEqual(expect.arrayContaining(["app-dies", "p99"]));
    expect(failed(reference({ lb: { zones: 1 } }))).toEqual(expect.arrayContaining(["capacity", "p99"]));
    expect(failed(reference({}, ["w"]))).toEqual(["count", "worker-dies"]);
    // Counting inline puts 3,000 writes a second on the primary: it works only with a far bigger database.
    expect(failed(reference({}, ["q", "w"]))).toEqual(["app-dies", "cache-dies", "cache-dies-p99", "capacity", "p99"]);
    expect(failed(reference({ db: { size: "memory-xlarge" } }, ["q", "w"]))).toEqual(["cost"]);
    expect(failed(reference({}, ["cache"]))).toEqual(["p99"]);
  });

  it("fails the cost check on an oversized design", () => {
    const big = reference({ app: { size: "compute-xlarge", count: 4 }, db: { size: "memory-xlarge", replicas: 3 } });
    const cost = runChallenge(spec, big, 3000).checks.find((c) => c.id === "cost")!;
    expect(cost.pass).toBe(false);
    expect(cost.reason).toMatch(/costs the most/);
  });

  it("says when a fault names a part the design does not have", () => {
    const report = runChallenge(spec, reference({}, ["cache"]), 3000);
    const phase = report.phases.find((p) => p.id === "lose-cache")!;
    expect(phase.applicable).toBe(false);
    expect(phase.missing).toBe("cache");
    expect(report.checks.find((c) => c.id === "cache-dies")!.measured).toMatch(/no cache to lose/);
  });

  it("reports the worker outage as a backlog and how long it takes to drain", () => {
    const drain = runChallenge(spec, reference(), 3000).checks.find((c) => c.id === "worker-dies")!;
    expect(drain.measured).toMatch(/180,000 clicks waiting, all counted after \d+ s/);
    const never = runChallenge(spec, reference({ w: { count: 1 } }), 3000).checks.find((c) => c.id === "worker-dies")!;
    expect(never.measured).toMatch(/never all counted/);
  });

  it("takes one app server out of a fleet of three, not the whole tier", () => {
    const phase = runChallenge(spec, reference(), 3000).phases.find((p) => p.id === "lose-app")!;
    expect(phase.hit).toEqual(["app"]);
    expect(phase.result.tiers.find((t) => t.id === "app")!.units).toBe(2);
    expect(phase.board.nodes.find((n) => n.id === "app")!.props!.down).toBeUndefined();
  });
});

describe("functional paths", () => {
  it("follows the chain through a load balancer and names what it found", () => {
    const { trail, missing } = followChain(reference(), ["client", "compute", "queue", "worker", "database"]);
    expect(missing).toBeUndefined();
    expect(trail).toEqual(["Client", "App server", "Queue", "Worker", "Database"]);
  });

  it("stops at the first missing role", () => {
    const { trail, missing } = followChain(reference({}, ["w"]), ["client", "compute", "queue", "worker", "database"]);
    expect(missing).toBe("worker");
    expect(trail).toEqual(["Client", "App server", "Queue"]);
  });

  it("ignores a component that is down", () => {
    const { missing } = followChain(reference({ db: { down: 1 } }), ["client", "compute", "database"]);
    expect(missing).toBe("database");
  });
});

describe("labs without an authored challenge", () => {
  it("score on their targets, as non-functional checks", () => {
    const challenge = challengeFor(hldM4ThreeTiers);
    expect(challenge.checks.map((c) => c.id)).toEqual(["capacity", "p99", "availability", "cost"]);
    expect(challenge.checks.every((c) => c.kind === "non-functional")).toBe(true);
    const report = runChallenge(hldM4ThreeTiers, { nodes: hldM4ThreeTiers.startingBoard!.nodes, edges: hldM4ThreeTiers.startingBoard!.edges }, 10_000);
    expect(report.phases).toHaveLength(1);
    expect(report.total).toBe(4);
  });
});

describe("challenge validation", () => {
  it("rejects repeated ids, unknown scenarios and a challenge with no functional check", () => {
    const bad = validateChallenge({
      peakLoad: 100,
      scenarios: [{ id: "x", title: "x", story: "x", faults: [{ type: "down", role: "cache" }] }, { id: "x", title: "y", story: "y", faults: [] }],
      checks: [{ type: "metric", id: "a", kind: "non-functional", label: "a", scenario: "nope", metric: "p99", op: "<=", value: 1 }],
    });
    expect(bad.join("|")).toMatch(/repeated or reserved/);
    expect(bad.join("|")).toMatch(/has no fault/);
    expect(bad.join("|")).toMatch(/unknown scenario/);
    expect(bad.join("|")).toMatch(/at least one functional/);
  });
});

describe("inline click writes", () => {
  it("add one write a second per redirect to the database, on top of the cache misses", () => {
    const b = reference({}, ["q", "w"]);
    const off = runTieredModel(b, 3000, {});
    const on = runTieredModel(b, 3000, {}, { inlineWrites: true });
    expect(on.edgeFlows["app>db"]! - off.edgeFlows["app>db"]!).toBeCloseTo(3000, 5);
    expect(on.tiers.find((t) => t.id === "db")!.utilisation).toBeGreaterThan(1);
    expect(off.tiers.find((t) => t.id === "db")!.utilisation).toBeLessThan(0.1);
  });
});

describe("worker batching", () => {
  it("cuts the writes the database sees by the batch size", () => {
    const writes = (batch: number) => runTieredModel(reference({ w: { batchSize: batch } }), 3000, {}).edgeFlows["w>db"]!;
    expect(writes(1)).toBeCloseTo(3000, 5);
    expect(writes(500)).toBeCloseTo(6, 5);
  });

  it("says the consumers are down, not missing, when the worker is down", () => {
    const r = runTieredModel(reference({ w: { down: 1 } }), 3000, {});
    expect(r.tiers.find((t) => t.id === "q")!.note).toMatch(/consumers down/);
    const unlinked = runTieredModel(reference({}, ["w"]), 3000, {});
    expect(unlinked.tiers.find((t) => t.id === "q")!.note).toBe("no consumers linked");
  });
});
