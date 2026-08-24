import { describe, expect, it } from "vitest";
import { safeRedirectTo } from "./safe-redirect";

describe("safeRedirectTo", () => {
  it("accepts a simple local path", () => {
    expect(safeRedirectTo("/dashboard")).toBe("/dashboard");
  });

  it("accepts a nested local path with segments", () => {
    expect(safeRedirectTo("/invite/abc123")).toBe("/invite/abc123");
  });

  it("rejects an absolute external URL", () => {
    expect(safeRedirectTo("https://evil.example.com")).toBeUndefined();
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeRedirectTo("//evil.example.com/phish")).toBeUndefined();
  });

  it("rejects a backslash path (browser-normalised to a remote host)", () => {
    expect(safeRedirectTo("/\\evil.example.com")).toBeUndefined();
  });

  it("rejects empty and missing input", () => {
    expect(safeRedirectTo("")).toBeUndefined();
    expect(safeRedirectTo(undefined)).toBeUndefined();
    expect(safeRedirectTo(null)).toBeUndefined();
  });
});
