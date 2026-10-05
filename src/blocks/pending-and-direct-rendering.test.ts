import { describe, expect, it } from "vitest";
import { restoreInteractiveBlockTags } from "@/mdx/restore-block-tags";
import { transformVisualFences } from "@/mdx/transform-visual-fences";

describe("Mentee side block rendering and tag restoration", () => {
  it("restores escaped tags for all interactive blocks with direct props or empty attributes", () => {
    const raw = `
&lt;ProjectPreview title="My Project" features={["F1", "F2"]} /&gt;
&lt;LearningObjectives objectives={["O1"]} /&gt;
&lt;ChapterRecap points={["P1"]} /&gt;
&lt;Steps title="Step Guide"&gt;
  &lt;Step title="Step 1"&gt;Do this&lt;/Step&gt;
&lt;/Steps&gt;
&lt;Quiz prompt="What is 2+2?" options={[{ id: "1", label: "4" }, { id: "2", label: "5" }]} /&gt;
&lt;PendingBlock typeLabel="Quiz Checkpoint" /&gt;
&lt;CheckpointIntro title="Notice" content="Some info" /&gt;
`;
    const restored = restoreInteractiveBlockTags(raw);
    expect(restored).toContain('<ProjectPreview title="My Project" features={["F1", "F2"]} />');
    expect(restored).toContain('<LearningObjectives objectives={["O1"]} />');
    expect(restored).toContain('<ChapterRecap points={["P1"]} />');
    expect(restored).toContain('<Steps title="Step Guide">');
    expect(restored).toContain('<Step title="Step 1">Do this</Step>');
    expect(restored).toContain('</Steps>');
    expect(restored).toContain('<Quiz prompt="What is 2+2?"');
    expect(restored).toContain('<PendingBlock typeLabel="Quiz Checkpoint" />');
    expect(restored).toContain('<CheckpointIntro title="Notice" content="Some info" />');
  });

  it("transforms fences for quiz, openquestion, predict, and codeexercise into MDX components", () => {
    const quizFence = `
\`\`\`quiz
question: "What is an idempotent operation?"
type: mcq
options:
  - "Can be run multiple times safely"
  - "Always fails on retry"
correct: 0
\`\`\`
`;
    const transformedQuiz = transformVisualFences(quizFence);
    expect(transformedQuiz).toContain("<Quiz");
    expect(transformedQuiz).toContain("What is an idempotent operation?");

    const openQuestionFence = `
\`\`\`openquestion
prompt: "Explain how you handle webhook timeouts."
minWords: 25
\`\`\`
`;
    const transformedOQ = transformVisualFences(openQuestionFence);
    expect(transformedOQ).toContain("<OpenQuestion");
    expect(transformedOQ).toContain("Explain how you handle webhook timeouts.");
    expect(transformedOQ).toContain("minWords={25}");

    const predictFence = `
\`\`\`predict
prompt: "What status code will be returned?"
options:
  - id: "200"
    label: "200 OK"
  - id: "400"
    label: "400 Bad Request"
\`\`\`
`;
    const transformedPredict = transformVisualFences(predictFence);
    expect(transformedPredict).toContain("<Predict");
    expect(transformedPredict).toContain("What status code will be returned?");

    const codeFence = `
\`\`\`codeexercise
prompt: "Implement safe retry logic"
language: "typescript"
starterCode: "function retry() {}"
\`\`\`
`;
    const transformedCode = transformVisualFences(codeFence);
    expect(transformedCode).toContain("<CodeExercise");
    expect(transformedCode).toContain("Implement safe retry logic");
  });
});
