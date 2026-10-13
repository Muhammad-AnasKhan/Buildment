import { describe, expect, it } from "vitest";
import { gradePredict } from "./grade";
import { PredictConfigSchema } from "./schema";

describe("gradePredict", () => {
  const config = PredictConfigSchema.parse({
    prompt: "What status code?",
    options: [
      { id: "a", label: "401" },
      { id: "b", label: "403" },
    ],
    correctOptionId: "b",
    allowRetry: true,
  });

  it("marks correct selection", () => {
    const result = gradePredict(config, { selected: "b" });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("marks incorrect selection", () => {
    const result = gradePredict(config, { selected: "a" });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });
});
