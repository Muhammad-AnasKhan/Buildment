import { describe, expect, it } from "vitest";
import type { ComponentKind } from "@/lab/catalog";
import type { BoardNode, DbLabSpec, HldLabSpec } from "@/lab/types";
import { validateLabSpec } from "@/lab/types";

const n = (id: string, kind: ComponentKind): BoardNode => ({ id, kind, x: 0, y: 0 });

const hld: HldLabSpec = {
  slug: "hld-example",
  family: "hld",
  title: "Example HLD lab",
  purpose: "Place a tier and watch it saturate.",
  limits: "A model, not a cloud. No real prices.",
  hints: [],
  allowedComponents: ["client", "load-balancer", "app-server", "database"],
  startingBoard: {
    nodes: [n("c", "client"), n("lb", "load-balancer"), n("a", "app-server"), n("d", "database")],
    edges: [
      { from: "c", to: "lb" },
      { from: "lb", to: "a" },
      { from: "a", to: "d" },
    ],
  },
  scenario: "Serve 10k req/s under a budget.",
  levels: [{ id: "l1", load: 1000, targets: { rps: 1000, p99Ms: 200 } }],
};

const db: DbLabSpec = {
  slug: "db-example",
  family: "db",
  title: "Example DB lab",
  purpose: "Add an index and watch the scan shrink.",
  limits: "Rows scanned, not milliseconds. No query planner.",
  hints: [],
  startingDbml: "Table users {\n  id int [pk]\n}",
  query: "select * from users where id = 1",
};

describe("validateLabSpec", () => {
  it("rejects a short limits string", () => {
    expect(validateLabSpec({ ...hld, limits: "too short" })).toContain(
      "limits must be longer than 20 characters",
    );
  });

  it("rejects an allowedComponents id that is not in the catalog", () => {
    const bad = { ...hld, allowedComponents: ["app-server", "unicorn" as ComponentKind] };
    expect(validateLabSpec(bad).some((m) => m.includes("unicorn"))).toBe(true);
  });

  it("rejects a startingBoard edge between ports that cannot connect", () => {
    const bad: HldLabSpec = {
      ...hld,
      startingBoard: {
        nodes: [n("a", "database"), n("b", "client")],
        edges: [{ from: "a", to: "b" }],
      },
      allowedComponents: ["database", "client"],
    };
    expect(validateLabSpec(bad).some((m) => m.includes("cannot connect"))).toBe(true);
  });

  it("passes a well-formed hld and db spec", () => {
    expect(validateLabSpec(hld)).toEqual([]);
    expect(validateLabSpec(db)).toEqual([]);
  });
});
