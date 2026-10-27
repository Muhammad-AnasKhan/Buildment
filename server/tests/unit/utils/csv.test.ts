import { describe, expect, it } from "vitest";
import { toCsv } from "../../../src/utils/csv.js";

describe("toCsv", () => {
  it("joins rows with a newline and escapes commas, quotes and newlines", () => {
    const csv = toCsv([
      ["a", "b"],
      ["x,y", 'he said "hi"', "line\nbreak"],
      [null, undefined, 5],
    ]);
    expect(csv).toBe(["a,b", '"x,y","he said ""hi""","line\nbreak"', ",,5"].join("\n"));
  });

  it("leaves plain values untouched and stringifies numbers", () => {
    expect(toCsv([["id", "count"], ["abc", 42]])).toBe("id,count\nabc,42");
  });
});
