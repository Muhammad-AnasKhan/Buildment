import { describe, expect, it } from "vitest";
import {
  OpenQuestionConfigSchema,
  OpenQuestionPayloadSchema,
  validateOpenQuestionPayload,
} from "./schema";

const baseConfig = OpenQuestionConfigSchema.parse({
  prompt: "Explain your design",
  minWords: 0,
  allowSpeechInput: false,
  allowUrl: true,
  urlRequired: false,
});

describe("OpenQuestionPayloadSchema", () => {
  it("accepts text only", () => {
    expect(OpenQuestionPayloadSchema.parse({ text: "hello" }).text).toBe("hello");
  });

  it("accepts optional https URL", () => {
    const p = OpenQuestionPayloadSchema.parse({
      text: "see link",
      url: "https://drive.google.com/file/d/abc/view",
    });
    expect(p.url).toContain("drive.google.com");
  });

  it("rejects malformed URL", () => {
    expect(() =>
      OpenQuestionPayloadSchema.parse({ text: "x", url: "not-a-url" })
    ).toThrow();
  });

  it.each(["javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "ftp://example.com/file"]) (
    "rejects unsafe protocol %s",
    (url) => {
      expect(() => OpenQuestionPayloadSchema.parse({ text: "x", url })).toThrow();
    }
  );

  it("rejects non-local HTTP URLs", () => {
    expect(() =>
      OpenQuestionPayloadSchema.parse({ text: "x", url: "http://example.com/demo" })
    ).toThrow();
  });

  it.each(["http://localhost:3000/demo", "http://127.0.0.1:5173/demo"]) (
    "allows local development URL %s",
    (url) => {
      expect(OpenQuestionPayloadSchema.parse({ text: "x", url }).url).toBe(url);
    }
  );
});

describe("validateOpenQuestionPayload", () => {
  it("requires URL when urlRequired", () => {
    expect(
      validateOpenQuestionPayload(
        { ...baseConfig, urlRequired: true },
        { text: "done", url: "" }
      )
    ).toMatch(/link/i);
  });

  it("passes when URL provided and text empty with urlRequired", () => {
    expect(
      validateOpenQuestionPayload(
        { ...baseConfig, urlRequired: true },
        { text: "", url: "https://loom.com/share/abc" }
      )
    ).toBeNull();
  });
});
