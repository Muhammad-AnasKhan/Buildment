import { describe, expect, it } from "vitest";
import { collectCanvasProblems } from "../../../../src/shared/mdx/canvas-tags.js";
import { CANVAS_SLUGS, isCanvasSlug } from "../../../../src/shared/canvas/slugs.js";

describe("collectCanvasProblems", () => {
  it("accepts a registered slug", () => {
    expect(collectCanvasProblems('Prose.\n\n<InteractiveCanvas slug="weighted-matrix-two-offers" />\n')).toEqual([]);
  });

  it("rejects an unknown slug", () => {
    expect(collectCanvasProblems('<InteractiveCanvas slug="made-up" />')).toEqual([
      '<InteractiveCanvas slug="made-up"> is not a registered canvas.',
    ]);
  });

  it("rejects a missing slug and an expression slug", () => {
    const problems = collectCanvasProblems('<InteractiveCanvas />\n\n<InteractiveCanvas slug={"weighted-matrix-two-offers"} />');
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/needs a slug/);
    expect(problems[1]).toMatch(/plain string/);
  });

  it("rejects children", () => {
    const problems = collectCanvasProblems('<InteractiveCanvas slug="weighted-matrix-two-offers">\n\nRaw text\n\n</InteractiveCanvas>');
    expect(problems).toEqual([expect.stringMatching(/takes no children/)]);
  });

  it("ignores chapters without canvases", () => {
    expect(collectCanvasProblems("<Callout type=\"tip\">Hi</Callout>")).toEqual([]);
  });
});

describe("isCanvasSlug", () => {
  it("only accepts listed strings", () => {
    for (const slug of CANVAS_SLUGS) expect(isCanvasSlug(slug)).toBe(true);
    expect(isCanvasSlug("constructor")).toBe(false);
    expect(isCanvasSlug(42)).toBe(false);
  });
});
