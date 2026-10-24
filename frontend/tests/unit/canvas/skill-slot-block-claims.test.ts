import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InteractiveCanvas } from "@/canvas/InteractiveCanvas";
import { DEFAULT_INPUT, GRID_END, START_BOUNDS, simulateClaims } from "@/canvas/skill-slot-block-claims/model";

describe("SkillSlot block claims", () => {
  it("shows five occupied blocks and the default 09:45 collision", () => {
    const run = simulateClaims(DEFAULT_INPUT);
    expect(run.needed).toEqual([540, 555, 570, 585, 600]);
    expect(run.collisions).toEqual([585]);
    expect(run.canHold).toBe(false);
    expect(run.rows.find((row) => row.minute === 600)?.purpose).toBe("buffer");
  });

  it("moves past the early claim, then finds a later conflict", () => {
    const clear = simulateClaims({ start: 600, earlyClaim: true, lateClaim: false });
    expect(clear.canHold).toBe(true);
    const blocked = simulateClaims({ ...clear.input, lateClaim: true });
    expect(blocked.collisions).toEqual([630]);
  });

  it("ends the latest candidate at the window boundary and clamps off-grid input", () => {
    const latest = simulateClaims({ start: START_BOUNDS.max, earlyClaim: false, lateClaim: false });
    expect(latest.occupiedEnd).toBe(GRID_END);
    expect(latest.canHold).toBe(true);
    expect(simulateClaims({ ...DEFAULT_INPUT, start: 999 }).input.start).toBe(START_BOUNDS.max);
    expect(simulateClaims({ ...DEFAULT_INPUT, start: Number.NaN }).input.start).toBe(START_BOUNDS.default);
  });

  it("renders through the reader registry with a text alternative and limits", () => {
    const html = renderToString(createElement(InteractiveCanvas, { slug: "skill-slot-block-claims" })).replaceAll("<!-- -->", "");
    expect(html).toContain("Which blocks does this booking need?");
    expect(html).toContain("Collision at 09:45");
    expect(html).toContain("Limits of the model");
    expect(html).toContain("Provider claim blocks");
  });
});
