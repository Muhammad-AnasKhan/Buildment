import { describe, expect, it } from "vitest";
import { labView, resolveLab } from "@buildment/learning-ui/labs/Lab";
import type { DbLabSpec } from "@buildment/learning-ui/labs/types";

describe("resolveLab", () => {
  it("resolves a known slug to its spec", () => {
    const resolved = resolveLab("hld-m2-utilisation-knee");
    expect(resolved).not.toBeNull();
    expect(resolved?.spec.title.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown slug and does not throw", () => {
    expect(resolveLab("not-a-lab")).toBeNull();
  });

  it("routes hld specs to the board and db specs to the placeholder", () => {
    const hld = resolveLab("hld-m2-utilisation-knee");
    expect(hld && labView(hld.spec)).toBe("hld-board");
    const db: DbLabSpec = {
      slug: "db-x", family: "db", title: "t", purpose: "p",
      limits: "a long enough limits string here", hints: [],
      startingDbml: "Table u { id int }", query: "select 1",
    };
    expect(labView(db)).toBe("db-placeholder");
  });
});
