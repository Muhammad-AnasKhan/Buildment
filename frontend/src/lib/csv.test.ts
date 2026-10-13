import { describe, expect, it } from "vitest";
import { csvEscape, toCsv } from "./csv";

describe("csvEscape", () => {
  it("passes a plain value through unchanged", () => {
    expect(csvEscape("hello")).toBe("hello");
  });

  it("quotes values containing a comma", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
  });

  it("doubles embedded double quotes", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });

  it("quotes values containing a newline", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsv", () => {
  it("joins cells and rows", () => {
    expect(
      toCsv([
        ["name", "email"],
        ["Ada", "ada@example.com"],
      ])
    ).toBe("name,email\nAda,ada@example.com");
  });

  it("escapes special characters per cell", () => {
    expect(toCsv([["a,b", 'c"d']])).toBe('"a,b","c""d"');
  });
});
