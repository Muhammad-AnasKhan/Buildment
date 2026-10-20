import { describe, expect, it } from "vitest";
import { INITIAL_STEPPER, stepperActionForKey, stepperReducer } from "@/canvas/primitives/stepper";

const reduce = stepperReducer(4);

describe("stepperReducer", () => {
  it("moves forward and back inside the range", () => {
    let s = reduce(INITIAL_STEPPER, { type: "prev" });
    expect(s.active).toBe(0);
    s = reduce(s, { type: "next" });
    s = reduce(s, { type: "next" });
    expect(s.active).toBe(2);
    s = reduce(s, { type: "go", index: 99 });
    expect(s.active).toBe(3);
    s = reduce(s, { type: "next" });
    expect(s.active).toBe(3);
    s = reduce(s, { type: "go", index: -5 });
    expect(s.active).toBe(0);
  });

  it("pauses Play on any manual move", () => {
    const playing = reduce(INITIAL_STEPPER, { type: "togglePlay" });
    expect(playing.playing).toBe(true);
    for (const action of [{ type: "next" }, { type: "prev" }, { type: "go", index: 2 }, { type: "first" }, { type: "last" }] as const) {
      expect(reduce(playing, action).playing).toBe(false);
    }
  });

  it("stops Play on the last step, and Play from the end starts over", () => {
    let s = reduce(INITIAL_STEPPER, { type: "togglePlay" });
    s = reduce(s, { type: "tick" });
    s = reduce(s, { type: "tick" });
    expect(s).toEqual({ active: 2, playing: true });
    s = reduce(s, { type: "tick" });
    expect(s).toEqual({ active: 3, playing: false });
    expect(reduce(s, { type: "tick" })).toBe(s);
    expect(reduce(s, { type: "togglePlay" })).toEqual({ active: 0, playing: true });
  });

  it("does not play a single step", () => {
    expect(stepperReducer(1)(INITIAL_STEPPER, { type: "togglePlay" }).playing).toBe(false);
  });

  it("maps only the step keys", () => {
    expect(stepperActionForKey("ArrowRight")).toEqual({ type: "next" });
    expect(stepperActionForKey("ArrowLeft")).toEqual({ type: "prev" });
    expect(stepperActionForKey("Home")).toEqual({ type: "first" });
    expect(stepperActionForKey("End")).toEqual({ type: "last" });
    expect(stepperActionForKey("ArrowDown")).toBeNull();
    expect(stepperActionForKey(" ")).toBeNull();
  });
});
