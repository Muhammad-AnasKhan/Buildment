import type { BlockRegistryEntry } from "./types";
import { QuizConfigSchema, type QuizConfig, type QuizPayload } from "./quiz/schema";
import { gradeQuiz } from "./quiz/grade";
import { QuizComponent } from "./quiz/Component";
import { reportQuiz } from "./quiz/report";
import {
  OpenQuestionConfigSchema,
  type OpenQuestionConfig,
  type OpenQuestionPayload,
} from "./open-question/schema";
import { gradeOpenQuestion } from "./open-question/grade";
import { OpenQuestionComponent } from "./open-question/Component";
import { reportOpenQuestion } from "./open-question/report";

// The block registry — the one place a BlockType maps to its implementation.
// See docs/03-blocks-registry.mdx "The registry pattern": adding a block type
// means adding one entry here plus its own src/blocks/<type>/ folder, never a
// switch statement scattered across submission handling, progress, or reports.
//
// TEST, MUST_READ, and CODE are declared in the schema (docs/08-data-model.mdx)
// but not implemented yet — no imported course content uses them yet. Add
// their entries here when the add-block-type skill is run for each.
export const blockRegistry = {
  QUIZ: {
    type: "QUIZ",
    schema: QuizConfigSchema,
    grade: gradeQuiz,
    Component: QuizComponent,
    report: reportQuiz,
  } satisfies BlockRegistryEntry<QuizConfig, QuizPayload>,
  OPEN_QUESTION: {
    type: "OPEN_QUESTION",
    schema: OpenQuestionConfigSchema,
    grade: gradeOpenQuestion,
    Component: OpenQuestionComponent,
    report: reportOpenQuestion,
  } satisfies BlockRegistryEntry<OpenQuestionConfig, OpenQuestionPayload>,
} as const;

export type RegisteredBlockType = keyof typeof blockRegistry;

export function isRegisteredBlockType(type: string): type is RegisteredBlockType {
  return type in blockRegistry;
}
