import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentKind } from "@/lab/catalog";
import type { BoardNode } from "@/lab/types";
import { boardToStatic } from "@/lab/StaticBoard";

const STATIC_BOARD_PATH = resolve(process.cwd(), "src/lab/StaticBoard.tsx");
const n = (id: string, kind: ComponentKind): BoardNode => ({ id, kind, x: 0, y: 0 });

describe("boardToStatic", () => {
  it("caps the node count and reports the overflow", () => {
    const big = {
      nodes: Array.from({ length: 30 }, (_, i) => n(`x${i}`, "app-server")),
      edges: [],
    };
    const out = boardToStatic(big, 12);
    expect(out.nodes.length).toBe(12);
    expect(out.overflow).toBe(18);
    expect(out.empty).toBe(false);
  });

  it("flags an empty board", () => {
    const out = boardToStatic({ nodes: [], edges: [] });
    expect(out.empty).toBe(true);
    expect(out.nodes.length).toBe(0);
  });

  it("keeps only edges whose endpoints both survive the cap", () => {
    const board = {
      nodes: [n("a", "client"), n("b", "load-balancer"), n("c", "app-server")],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
      ],
    };
    const out = boardToStatic(board, 2);
    expect(out.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(out.edges).toEqual([{ from: "a", to: "b" }]);
  });

  it("uses no forbidden SVG constructs in its source", () => {
    const src = readFileSync(STATIC_BOARD_PATH, "utf8");
    for (const bad of ["foreignObject", "dangerouslySetInnerHTML", "#", "<script"]) {
      expect(src.includes(bad)).toBe(false);
    }
  });
});
