import { describe, expect, it } from "vitest";
import { formatJsonDisplay } from "./format-json";

describe("formatJsonDisplay", () => {
  it("pretty-prints valid JSON", () => {
    expect(formatJsonDisplay('{"a":1,"b":[2,3]}')).toBe(
      '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}'
    );
  });

  it("returns empty string for blank input", () => {
    expect(formatJsonDisplay("")).toBe("");
    expect(formatJsonDisplay(undefined)).toBe("");
  });

  it("passes through invalid JSON unchanged", () => {
    const invalid = '{ "broken": ';
    expect(formatJsonDisplay(invalid)).toBe(invalid);
  });
});
