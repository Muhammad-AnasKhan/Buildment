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
});
