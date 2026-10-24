import { describe, expect, it } from "vitest";
import type { Board } from "@/lab/types";
import { applied, initialControls } from "@/lab/hld-board-model";
import { runTieredModel } from "@/lab/tiered-architecture";

const board: Board = {
  nodes: [
    { id: "client", kind: "client", x: 0, y: 0 },
    { id: "app", kind: "app-server", x: 1, y: 0 },
    { id: "db", kind: "database", x: 2, y: 0 },
  ],
  edges: [
    { from: "client", to: "app" },
    { from: "app", to: "db" },
  ],
};

describe("hld board model glue", () => {
  it("seeds each node's editable props from catalog defaults", () => {
    const c = initialControls(board, 1000);
    expect(c.load).toBe(1000);
    expect(c.perNode.app.count).toBe(2);
    expect(c.perNode.app.size).toBe("compute-small");
  });

  it("applies controls onto the board so the model reflects them", () => {
    const c = initialControls(board, 4000);
    c.perNode.app.count = 1;
    const one = runTieredModel(applied(board, c), c.load, {});
    c.perNode.app.count = 4;
    const four = runTieredModel(applied(board, c), c.load, {});
    const u1 = one.tiers.find((t) => t.id === "app")!.utilisation;
    const u4 = four.tiers.find((t) => t.id === "app")!.utilisation;
    expect(u4).toBeLessThan(u1);
  });
});
