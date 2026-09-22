import { describe, expect, it } from "vitest";
import {
  OpenQuestionPayloadSchema,
  validateOpenQuestionPayload,
  type OpenQuestionConfig,
} from "./schema";

const baseConfig: OpenQuestionConfig = {
  prompt: "Explain your design",
  minWords: 0,
  allowSpeechInput: false,
  allowUrl: true,
  urlRequired: false,
};

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
