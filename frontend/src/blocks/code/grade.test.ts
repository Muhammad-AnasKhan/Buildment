import { describe, expect, it } from "vitest";
import { gradeCode, gradeCodeDetails } from "./grade";
import type { CodeConfig } from "./schema";

const baseConfig: CodeConfig = {
  mode: "implement",
  language: "javascript",
  prompt: "Return a health response.",
  starterCode: `function buildHealthResponse() {\n  // TODO\n}\nmodule.exports = { buildHealthResponse };`,
  allowRetry: true,
  tests: [
    {
      name: "returns status ok",
      code: `
        const { buildHealthResponse } = module.exports;
        const r = buildHealthResponse();
        if (!r || r.status !== "ok") throw new Error("Expected { status: 'ok' }");
      `,
    },
  ],
};

describe("gradeCode", () => {
  it("marks a correct implementation as passed", () => {
    const source = `
      function buildHealthResponse() {
        return { status: "ok" };
      }
      module.exports = { buildHealthResponse };
    `;
    const result = gradeCode(baseConfig, { source });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("marks an incorrect implementation as failed", () => {
    const source = `
      function buildHealthResponse() {
        return { status: "down" };
      }
      module.exports = { buildHealthResponse };
    `;
    const result = gradeCode(baseConfig, { source });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it("fails empty submissions", () => {
    const result = gradeCode(baseConfig, { source: "   " });
    expect(result.isCorrect).toBe(false);
  });

  it("returns the failing test name on error", () => {
    const details = gradeCodeDetails(baseConfig, {
      source: `module.exports = { buildHealthResponse: () => ({ status: "nope" }) };`,
    });
    expect(details.passed).toBe(false);
    expect(details.failedTestName).toBe("returns status ok");
  });
});
