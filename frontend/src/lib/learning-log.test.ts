import { describe, expect, it } from "vitest";
import {
  normalizeLearningLogQuestionProps,
  parseLearningLogQuestions,
} from "./learning-log";

describe("LearningLog MDX props", () => {
  const questions = [{ id: "01JTEST", title: "What changed?" }];

  it("accepts legacy quoted JSON without letting it reach the renderer as a string", () => {
    expect(parseLearningLogQuestions(JSON.stringify(questions))).toEqual(questions);
    expect(parseLearningLogQuestions("not json")).toEqual([]);
  });

  it("restores an array expression after an editor rich-text/source round trip", () => {
    const source = `<LearningLog title="Reflect" questions="${JSON.stringify(questions)}" />`;
    expect(normalizeLearningLogQuestionProps(source)).toBe(
      `<LearningLog title="Reflect" questions={${JSON.stringify(questions)}} />`
    );
  });
});
