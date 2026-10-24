import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { alongRoute, checkMap, cutOff, edgeFraction, effectsOf, failedLinks, linkKey, mapLinks, stopIndex } from "@buildment/learning-ui/canvas/models/block-map";
import { MAP_CARD_H, MAP_CARD_W } from "@buildment/learning-ui/canvas/primitives/block-map";
import { DAFTAR_BLOCKS, DAFTAR_EXTRA_LINKS, sysdesignM1BlockMap } from "@buildment/learning-ui/canvas/sysdesign-m1-block-map/data";

const links = mapLinks(DAFTAR_BLOCKS, DAFTAR_EXTRA_LINKS);
const keys = (pairs: [string, string][]) => new Set(pairs.map(([a, b]) => linkKey(a, b)));

describe("block map model", () => {
  it("draws each path step once, plus the extra links", () => {
    expect(links).toHaveLength(11);
    expect(keys(links).has(linkKey("files", "workers"))).toBe(true);
    expect(keys(links).has(linkKey("app", "cache"))).toBe(true);
  });

  it("cuts off only the cache when the cache breaks, and fails only its link", () => {
    expect([...cutOff(DAFTAR_BLOCKS, "cache")]).toEqual(["cache"]);
    expect(failedLinks(DAFTAR_BLOCKS, links, "cache")).toEqual(keys([["app", "cache"]]));
  });

  it("takes everything but the phones down when DNS breaks", () => {
    const off = cutOff(DAFTAR_BLOCKS, "dns");
    expect(off.size).toBe(DAFTAR_BLOCKS.length - 1);
    expect(off.has("students")).toBe(false);
    expect(failedLinks(DAFTAR_BLOCKS, links, "dns").size).toBe(links.length);
  });

  it("cuts off the workers when the queue or file storage breaks", () => {
    expect(cutOff(DAFTAR_BLOCKS, "queue")).toEqual(new Set(["queue", "workers"]));
    expect(failedLinks(DAFTAR_BLOCKS, links, "queue")).toEqual(keys([["app", "queue"], ["queue", "workers"]]));
    expect(cutOff(DAFTAR_BLOCKS, "files")).toEqual(new Set(["files", "workers"]));
    expect(failedLinks(DAFTAR_BLOCKS, links, "files")).toEqual(keys([["app", "files"], ["workers", "files"], ["queue", "workers"]]));
  });

  it("treats no break and an unknown id as nothing broken", () => {
    expect(cutOff(DAFTAR_BLOCKS, null).size).toBe(0);
    expect(cutOff(DAFTAR_BLOCKS, "nope").size).toBe(0);
    expect(failedLinks(DAFTAR_BLOCKS, links, null).size).toBe(0);
  });

  it("stops a request at the first block that is down", () => {
    const path = ["students", "gateway", "balancer", "app", "cache"];
    expect(stopIndex(path, cutOff(DAFTAR_BLOCKS, "balancer"))).toBe(2);
    expect(stopIndex(path, cutOff(DAFTAR_BLOCKS, "queue"))).toBeNull();
  });

  it("stops a dot at a card's edge and walks a route by hops", () => {
    expect(edgeFraction({ x: 0, y: 0 }, { x: 100, y: 0 }, 40, 20, 10)).toBeCloseTo(0.5);
    expect(edgeFraction({ x: 0, y: 0 }, { x: 0, y: 100 }, 40, 20, 10)).toBeCloseTo(0.7);
    expect(edgeFraction({ x: 0, y: 0 }, { x: 0, y: 0 }, 40, 20)).toBe(0);
    const route = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(alongRoute(route, 0.75)).toEqual({ x: 10, y: 5 });
    expect(alongRoute(route, 2)).toEqual({ x: 10, y: 10 });
    expect(alongRoute([], 0.5)).toEqual({ x: 0, y: 0 });
  });
});

describe("sysdesign-m1-block-map", () => {
  it("has a clean map whose cards fit the picture and never overlap", () => {
    expect(checkMap(DAFTAR_BLOCKS)).toEqual([]);
    for (const b of DAFTAR_BLOCKS) {
      expect(b.x - MAP_CARD_W / 2, b.id).toBeGreaterThanOrEqual(0);
      expect(b.x + MAP_CARD_W / 2, b.id).toBeLessThanOrEqual(420);
      expect(b.y - MAP_CARD_H / 2, b.id).toBeGreaterThanOrEqual(46);
      expect(b.y + MAP_CARD_H / 2 + 3, b.id).toBeLessThanOrEqual(318);
      // A label of 12.5px fits beside the icon.
      expect(b.label.length, b.id).toBeLessThanOrEqual(11);
    }
    for (const a of DAFTAR_BLOCKS)
      for (const b of DAFTAR_BLOCKS) {
        if (a === b) continue;
        const apart = Math.abs(a.x - b.x) >= MAP_CARD_W + 16 || Math.abs(a.y - b.y) >= MAP_CARD_H + 16;
        expect(apart, `${a.id} and ${b.id}`).toBe(true);
      }
  });

  it("names a cloud service and a failure for every block a request can reach", () => {
    for (const b of DAFTAR_BLOCKS.slice(1)) {
      expect(b.failure, b.id).toBeDefined();
      expect(b.cloud.length).toBeGreaterThan(1);
    }
    expect(DAFTAR_BLOCKS.find((b) => b.id === "cache")?.failure?.verdict).toBe("Cache down: all reads hit the database");
  });

  it("shows the blocks that lean on a broken block, without cutting them off", () => {
    const blocks = (id: string) => effectsOf(DAFTAR_BLOCKS.find((b) => b.id === id)?.failure).map((e) => e.block);
    // The app servers stay up when the database, cache, queue or files break, but each says what it lost.
    for (const id of ["database", "cache", "queue", "files"]) {
      expect(blocks(id), id).toContain("app");
      expect(cutOff(DAFTAR_BLOCKS, id).has("app"), id).toBe(false);
    }
    expect(blocks("cache")).toEqual(["database", "app"]);
    expect(blocks("workers")).toEqual(["queue"]);
    expect(blocks("cdn")).toEqual(["students"]);
    expect(effectsOf(undefined)).toEqual([]);
  });

  it("rejects an effect that names an unknown block or a pill that is too long", () => {
    const bad = DAFTAR_BLOCKS.map((b) => (b.id === "database" ? { ...b, failure: { verdict: "Database down", affects: [{ block: "nope", status: "a pill that is far too long" }] } } : b));
    expect(checkMap(bad)).toEqual(expect.arrayContaining(["database: unknown block nope", 'database: pill "a pill that is far too long" longer than 15 characters']));
  });

  it("server-renders the picture, a button per block and the panel", () => {
    const { component: Canvas, title, purpose, limits } = sysdesignM1BlockMap;
    const html = renderToString(createElement(Canvas, { title, purpose, limits })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("ElastiCache");
    expect(html).toContain("Break it");
    expect(html.match(/aria-pressed/g)?.length).toBeGreaterThanOrEqual(DAFTAR_BLOCKS.length);
  });
});
