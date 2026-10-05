import { describe, expect, it } from "vitest";
import { extractReflectionRequirements, reflectionSatisfied } from "./reflection";
import { parseLearningLog } from "@/lib/learning-log";

describe("extractReflectionRequirements", () => {
  it("reads checklist and learning-log ids from the reader transforms", () => {
    const source = `
## Gate checklist

- [ ] Explain the request path
- [ ] Name the collection

## Learning log

1. **What changed?** Describe the decision.
`;
    const requirements = extractReflectionRequirements(source);
    expect(requirements.checklistIds).toHaveLength(2);
    expect(requirements.questionIds).toHaveLength(1);
  });

  it("reads authored checklist and learning-log props", () => {
    const source = `
<Checklist items={[{"id":"box-1","label":"Done"}]} />

<LearningLog questions={[{"id":"q-1","title":"Why?"}]} />
`;
    expect(extractReflectionRequirements(source)).toEqual({
      checklistIds: ["box-1"],
      questionIds: ["q-1"],
    });
  });
});

describe("reflectionSatisfied", () => {
  const requirements = { checklistIds: ["box-1"], questionIds: ["q-1"] };

  it("requires every checklist item and a non-empty answer", () => {
    const empty = parseLearningLog(null);
    expect(reflectionSatisfied(requirements, empty)).toBe(false);
    expect(reflectionSatisfied(requirements, parseLearningLog({
      version: 1,
      answers: { "q-1": { text: "Because the route is locked.", updatedAt: "2026-01-01T00:00:00.000Z" } },
      checklist: { "box-1": { checked: true, updatedAt: "2026-01-01T00:00:00.000Z" } },
    }))).toBe(true);
  });
});
