import { describe, expect, it } from "vitest";
import { gradeCode, gradeCodeDetails } from "./grade.js";
import type { CodeConfig } from "./schema.js";

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
  const directConfig: CodeConfig = {
    ...baseConfig,
    tests: [{ name: "adds two numbers", code: "if (add(1, 2) !== 3) throw new Error('Expected 3');" }],
  };

  it("accepts the correct top-level function used by the editor starter", () => {
    expect(gradeCode(directConfig, { source: "function add(a, b) { return a + b; }" }).isCorrect).toBe(true);
  });

  it("accepts top-level arrow functions", () => {
    expect(gradeCode(directConfig, { source: "const add = (a, b) => a + b;" }).isCorrect).toBe(true);
  });

  it("still rejects incorrect top-level implementations", () => {
    const result = gradeCodeDetails(directConfig, { source: "function add(a, b) { return a - b; }" });
    expect(result.passed).toBe(false);
    expect(result.failedTestName).toBe("adds two numbers");
  });

  it("does not leak declarations between submissions", () => {
    gradeCode(directConfig, { source: "function add(a, b) { return a + b; }" });
    expect(gradeCode(directConfig, { source: "const unrelated = 1;" }).isCorrect).toBe(false);
  });

  it("keeps test-local declarations separate", () => {
    const config = { ...directConfig, tests: [
      { name: "positive", code: "const result = add(1, 2); if (result !== 3) throw new Error('Expected 3');" },
      { name: "negative", code: "const result = add(-1, 2); if (result !== 1) throw new Error('Expected 1');" },
    ] };
    expect(gradeCode(config, { source: "function add(a, b) { return a + b; }" }).isCorrect).toBe(true);
  });
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
