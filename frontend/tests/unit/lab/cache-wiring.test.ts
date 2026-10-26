import { describe, expect, it } from "vitest";
import { canConnect } from "@buildment/learning-ui/labs/catalog";
import { runTieredModel } from "@buildment/learning-ui/labs/tiered-architecture";
import type { Board, BoardNode } from "@buildment/learning-ui/labs/types";

const nodes: BoardNode[] = [
  { id: "c", kind: "client", x: 0, y: 0 },
  { id: "lb", kind: "load-balancer", x: 0, y: 0, props: { size: "general-xlarge", zones: 3 } },
  { id: "app", kind: "app-server", x: 0, y: 0, props: { count: 4 } },
  { id: "cache", kind: "cache", x: 0, y: 0, props: { hitRate: 0.85, count: 2 } },
  { id: "db", kind: "database", x: 0, y: 0, props: { readRatio: 0.99, replicas: 1 } },
];
const link = (...pairs: [string, string][]): Board => ({ nodes, edges: pairs.map(([from, to]) => ({ from, to })) });

const aside = link(["c", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"]);
const readThrough = link(["c", "lb"], ["lb", "app"], ["app", "cache"], ["cache", "db"]);
const both = link(["c", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"], ["cache", "db"]);

describe("cache wiring", () => {
  it("lets a cache link to a database, and nothing else behind it", () => {
    expect(canConnect("cache", "database")).toBe(true);
    expect(canConnect("cache", "app-server")).toBe(false);
  });

  it("gives the database the same load in cache-aside and read-through: reads times one minus the hit rate", () => {
    for (const board of [aside, readThrough, both]) {
      const r = runTieredModel(board, 3000, {});
      const db = r.tiers.find((t) => t.id === "db")!;
      const into = Object.entries(r.edgeFlows).filter(([k]) => k.endsWith(">db")).reduce((s, [, v]) => s + v, 0);
      expect(into).toBeCloseTo(450, 5); // 3,000 x (1 - 0.85), counted once
      expect(db.utilisation).toBeCloseTo(runTieredModel(aside, 3000, {}).tiers.find((t) => t.id === "db")!.utilisation, 8);
      expect(r.edgeFlows["app>cache"]).toBeCloseTo(3000, 5);
    }
  });

  it("puts the misses on the app>db link in cache-aside and on the cache>db link in read-through", () => {
    expect(runTieredModel(aside, 3000, {}).edgeFlows["app>db"]).toBeCloseTo(450, 5);
    const rt = runTieredModel(readThrough, 3000, {});
    expect(rt.edgeFlows["cache>db"]).toBeCloseTo(450, 5);
    expect(rt.edgeFlows["app>db"]).toBeUndefined();
    const b = runTieredModel(both, 3000, {});
    expect(b.edgeFlows["cache>db"]).toBeCloseTo(450, 5);
    expect(b.edgeFlows["app>db"]).toBeUndefined();
  });

  it("adds inline click writes once, as their own labelled part, in every wiring", () => {
    for (const board of [aside, readThrough]) {
      const r = runTieredModel(board, 3000, {}, { inlineWrites: true });
      const key = board === aside ? "app>db" : "cache>db";
      expect(r.edgeFlows[key]).toBeCloseTo(3450, 5);
      expect(r.edgeParts[key]).toEqual(expect.arrayContaining([
        { label: "cache misses", rate: expect.closeTo(450, 5) },
        { label: expect.stringMatching(/^click writes/), rate: expect.closeTo(3000, 5) },
      ]));
    }
    const a = runTieredModel(aside, 3000, {}, { inlineWrites: true }).tiers.find((t) => t.id === "db")!.utilisation;
    const b = runTieredModel(readThrough, 3000, {}, { inlineWrites: true }).tiers.find((t) => t.id === "db")!.utilisation;
    expect(b).toBeCloseTo(a, 8);
  });

  it("labels the cache link with the hit ratio and reports what the cache did", () => {
    for (const board of [aside, readThrough]) {
      const r = runTieredModel(board, 3000, {});
      expect(r.edgeParts["app>cache"]![0]!.label).toMatch(/85% answered by the cache/);
      expect(r.tiers.find((t) => t.id === "cache")!.cacheStats).toEqual({ hitRate: 0.85, reads: 3000, hits: expect.closeTo(2550, 5), misses: expect.closeTo(450, 5) });
    }
  });

  it("sends the whole stream to the database when the cache dies in cache-aside, and fails through a read-through cache", () => {
    const down = (board: Board): Board => ({ ...board, nodes: board.nodes.map((n) => (n.id === "cache" ? { ...n, props: { ...n.props, down: 1 } } : n)) });
    expect(runTieredModel(down(aside), 3000, {}).edgeFlows["app>db"]).toBeCloseTo(3000, 5);
    // In read-through the cache sits in the path, so its death cuts the database off, and the board says so.
    expect(runTieredModel(down(readThrough), 3000, {}).failure).toMatch(/Cache is down/);
  });
});
