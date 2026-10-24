import { describe, expect, it } from "vitest";
import { barPercent, defaultValues, isDefault, snapValue, withValue } from "@buildment/learning-ui/canvas/renderers/slider/model";
import type { SliderSpec } from "@buildment/learning-ui/canvas/renderers/slider/types";

const spec: SliderSpec = {
  kind: "slider",
  title: "Test",
  purpose: "Test",
  intro: "Test",
  inputs: [
    { id: "a", label: "A", min: 0, max: 10, step: 2, default: 4, unit: "" },
    { id: "rate", label: "Rate", min: 0, max: 1, step: 0.1, default: 0.3, unit: "" },
  ],
  compute: () => ({ stats: [{ label: "x", value: "1" }], summary: "A test result." }),
  describeChange: () => "",
  tryThis: ["one", "two"],
  limits: "A test spec with no meaning.",
};

describe("slider canvas inputs", () => {
  it("starts from the defaults", () => {
    expect(defaultValues(spec)).toEqual({ a: 4, rate: 0.3 });
    expect(isDefault(spec, defaultValues(spec))).toBe(true);
  });

  it("clamps, snaps to the step and removes floating-point noise", () => {
    const [a, rate] = spec.inputs;
    expect(snapValue(a!, 99)).toBe(10);
    expect(snapValue(a!, -5)).toBe(0);
    expect(snapValue(a!, 5)).toBe(6);
    expect(snapValue(rate!, 0.1 + 0.2)).toBe(0.3);
    expect(snapValue(a!, Number.NaN)).toBe(4);
  });

  it("changes one input and ignores unknown ids", () => {
    const start = defaultValues(spec);
    expect(withValue(spec, start, "a", 8)).toEqual({ a: 8, rate: 0.3 });
    expect(withValue(spec, start, "nope", 8)).toBe(start);
    expect(isDefault(spec, withValue(spec, start, "a", 8))).toBe(false);
  });

  it("keeps bar widths between 0 and 100", () => {
    expect(barPercent(5, 10)).toBe(50);
    expect(barPercent(20, 10)).toBe(100);
    expect(barPercent(-1, 10)).toBe(0);
    expect(barPercent(1, 0)).toBe(0);
    expect(barPercent(Number.NaN, 10)).toBe(0);
  });
});
