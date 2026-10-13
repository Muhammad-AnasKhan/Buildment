import { describe, expect, it } from "vitest";
import { extractBlockConfigsFromSource, extractQuizConfigFromElement } from "./extract-block-config";
import { QuizConfigSchema } from "@/blocks/quiz/schema";

describe("extractBlockConfigsFromSource", () => {
  it("parses inline Quiz props into block config", () => {
    const source = `
<Quiz
  id="quiz-1"
  quizType="single"
  prompt="Which layer handles auth?"
  options={[{"id":"opt-0","label":"API"},{"id":"opt-1","label":"DB"}]}
  correctOptionIds={["opt-0"]}
  explanation="The API validates sessions."
  allowRetry={true}
/>
`;
    const configs = extractBlockConfigsFromSource(source);
    const config = QuizConfigSchema.parse(configs.get("quiz-1"));
    expect(config.prompt).toBe("Which layer handles auth?");
    expect(config.correctOptionIds).toEqual(["opt-0"]);
    expect(config.explanation).toBe("The API validates sessions.");
  });

  it("ignores id-only Quiz tags without inline content", () => {
    const configs = extractBlockConfigsFromSource('<Quiz id="only-id" />');
    expect(configs.has("only-id")).toBe(false);
  });
});

describe("extractQuizConfigFromElement", () => {
  it("reads string and expression attributes", () => {
    const element = {
      type: "mdxJsxFlowElement" as const,
      name: "Quiz",
      attributes: [
        { type: "mdxJsxAttribute" as const, name: "prompt", value: "Pick one" },
        {
          type: "mdxJsxAttribute" as const,
          name: "options",
          value: { type: "mdxJsxAttributeValueExpression", value: '[{"id":"a","label":"A"},{"id":"b","label":"B"}]' },
        },
        {
          type: "mdxJsxAttribute" as const,
          name: "correctOptionIds",
          value: { type: "mdxJsxAttributeValueExpression", value: '["a"]' },
        },
      ],
      children: [],
    };
    const config = extractQuizConfigFromElement(element);
    expect(config?.prompt).toBe("Pick one");
    expect(config?.correctOptionIds).toEqual(["a"]);
  });
});
