import { describe, expect, it } from "vitest";
import { collectLabProblems } from "@/shared/mdx/lab-tags";

describe("collectLabProblems", () => {
  it("flags a missing slug", () => {
    expect(collectLabProblems(`<Lab/>`)[0]).toMatch(/needs a slug/);
  });

  it("flags an expression slug", () => {
    expect(collectLabProblems(`<Lab slug={x}/>`)[0]).toMatch(/plain string/);
  });

  it("flags an unregistered slug", () => {
    expect(collectLabProblems(`<Lab slug="nope"/>`)[0]).toMatch(/not a registered lab/);
  });

  it("flags children on the tag", () => {
    expect(collectLabProblems(`<Lab slug="hld-m2-utilisation-knee">x</Lab>`)[0]).toMatch(/self-closing/);
  });

  it("passes a valid self-closing Lab tag", () => {
    expect(collectLabProblems(`<Lab slug="hld-m2-utilisation-knee"/>`)).toEqual([]);
  });

  it("accepts a valid ```lab fence and rejects an invalid one", () => {
    const valid = [
      "```lab",
      "family: hld",
      "version: 1",
      "title: Design a short-link service",
      "purpose: Build a short-link service from parts and press Run.",
      "limits: A simplified model, not a real cloud, with made-up prices.",
      "allowedComponents: [client, load-balancer, app-server, database]",
      "levels:",
      "  - id: l1",
      "    load: 3000",
      "    targets: { rps: 3000 }",
      "```",
    ].join("\n");
    expect(collectLabProblems(valid)).toEqual([]);

    const bad = ["```lab", "family: unknown", "title: T", "purpose: P", "limits: Long enough limits string here", "```"].join("\n");
    expect(collectLabProblems(bad)[0]).toMatch(/"family" must be one of/);
  });
});
