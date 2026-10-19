import { describe, expect, it } from "vitest";
import { extractBlockConfigsFromSource, extractQuizConfigFromElement, hasQuizBlocks, isActivityOnlySource } from "../../../../src/shared/mdx/extract-block-config.js";
import { QuizConfigSchema } from "../../../../src/shared/blocks/quiz/schema.js";

describe("extractBlockConfigsFromSource", () => {
  it("extracts editable presentation blocks and preserves reference-only blocks", () => {
    const configs = extractBlockConfigsFromSource('<Roadmap id="r" title="Plan" milestones={[{"id":"a","title":"Start","state":"current"}]} />\n<VideoBlock id="v" sourceUrl="https://example.com/video.mp4" requiredWatch={false} />\n<VisualWalkthrough id="stored" />');
    expect(configs.get("r")).toMatchObject({ title: "Plan", milestones: [{ id: "a", title: "Start", state: "current" }] });
    expect(configs.get("v")).toMatchObject({ requiredWatch: false });
    expect(configs.has("stored")).toBe(false);
  });
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

  it("keeps incomplete quiz edits visible to publish validation", () => {
    const configs = extractBlockConfigsFromSource('<Quiz id="q" prompt="" options={[]} correctOptionIds={[]} />');
    expect(configs.has("q")).toBe(true);
    expect(QuizConfigSchema.safeParse(configs.get("q")).success).toBe(false);
  });

  it("extracts typed activity settings while leaving stored references alone", () => {
    const configs = extractBlockConfigsFromSource(`
<OpenQuestion id="open" prompt="Explain" minWords={20} allowUrl={false} rubric="Private criteria" />
<Predict id="predict" prompt="Next?" options={[{"id":"a","label":"A"},{"id":"b","label":"B"}]} correctOptionId="b" />
<CodeExercise id="code" prompt="Implement" starterCode="" tests={[{"name":"Test","code":"assert(true)"}]} />
<Predict id="stored" />
`);
    expect(configs.get("open")).toMatchObject({ minWords: 20, allowUrl: false, rubric: "Private criteria" });
    expect(configs.get("predict")).toMatchObject({ correctOptionId: "b", options: [{ id: "a", label: "A" }, { id: "b", label: "B" }] });
    expect(configs.get("code")).toMatchObject({ tests: [{ name: "Test", code: "assert(true)" }] });
    expect(configs.has("stored")).toBe(false);
  });
});

describe("quiz flow restrictions", () => {
  it("allows all four activities but rejects prose and presentation blocks", () => {
    expect(isActivityOnlySource('<Quiz id="a" />\n<OpenQuestion id="b" />\n<Predict id="c" />\n<CodeExercise id="d" />')).toBe(true);
    expect(isActivityOnlySource('## Lesson\n\n<Quiz id="a" />')).toBe(false);
    expect(isActivityOnlySource('<DiffBlock before="a" after="b" />')).toBe(false);
  });
  it("detects quizzes with or without IDs and quiz fences", () => {
    expect(hasQuizBlocks('<Quiz id="q" />')).toBe(true);
    expect(hasQuizBlocks('<Quiz prompt="Question" />')).toBe(true);
    expect(hasQuizBlocks('```quiz\nprompt: Question\n```')).toBe(true);
  });
  it("allows mentions of quizzes and code examples in ordinary lessons", () => {
    expect(hasQuizBlocks('Use a quiz later.\n\n```jsx\n<Quiz />\n```')).toBe(false);
    expect(hasQuizBlocks('<OpenQuestion id="q" />')).toBe(false);
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
