import { describe, expect, it } from "vitest";
import { resolveLab } from "@/lab/Lab";

describe("resolveLab", () => {
  it("resolves a known slug to its spec", () => {
    const resolved = resolveLab("hld-m2-utilisation-knee");
    expect(resolved).not.toBeNull();
    expect(resolved?.spec.title.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown slug and does not throw", () => {
    expect(resolveLab("not-a-lab")).toBeNull();
  });
});
