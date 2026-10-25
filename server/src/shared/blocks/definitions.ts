import { NO_GRADE, type BlockDefinition } from "./types.js";
import { QuizConfigSchema, type QuizConfig, type QuizPayload } from "./quiz/schema.js";
import { gradeQuiz } from "./quiz/grade.js";
import { reportQuiz } from "./quiz/report.js";
import {
  OpenQuestionConfigSchema,
  type OpenQuestionConfig,
  type OpenQuestionPayload,
} from "./open-question/schema.js";
import { gradeOpenQuestion } from "./open-question/grade.js";
import { reportOpenQuestion } from "./open-question/report.js";
import { StepsConfigSchema, type StepsConfig, type StepsPayload } from "./steps/schema.js";
import { reportSteps } from "./steps/report.js";
import { ProjectPreviewConfigSchema, type ProjectPreviewConfig } from "./project-preview/schema.js";
import { reportProjectPreview } from "./project-preview/report.js";
import { LearningObjectivesConfigSchema, type LearningObjectivesConfig } from "./learning-objectives/schema.js";
import { ChapterRecapConfigSchema, type ChapterRecapConfig } from "./chapter-recap/schema.js";
import { CodeConfigSchema, type CodeConfig, type CodePayload } from "./code/schema.js";
import { gradeCode } from "./code/grade.js";
import { reportCode } from "./code/report.js";
import { PredictConfigSchema, type PredictConfig, type PredictPayload } from "./predict/schema.js";
import { gradePredict } from "./predict/grade.js";
import { reportPredict } from "./predict/report.js";
import { MustReadConfigSchema, type MustReadConfig, type MustReadPayload } from "./must-read/schema.js";
import { gradeMustRead } from "./must-read/grade.js";
import { VideoConfigSchema, type VideoConfig } from "./video/schema.js";
import { VisualWalkthroughConfigSchema, type VisualWalkthroughConfig } from "./visual-walkthrough/schema.js";
import { VisualDiagramConfigSchema, type VisualDiagramConfig } from "./visual-diagram/schema.js";
import { RoadmapConfigSchema, type RoadmapConfig } from "./roadmap/schema.js";
import { AiInterviewConfigSchema, type AiInterviewConfig, type AiInterviewPayload } from "./ai-interview/schema.js";
import { gradeAiInterview } from "./ai-interview/grade.js";
import { reportAiInterview } from "./ai-interview/report.js";

// The one place a BlockType maps to its schema, grader and report — see
// docs/03-blocks-registry.mdx. The API grades against this table; the frontend
// spreads each entry into its registry and adds the React component.
// TEST is declared in the Prisma schema but has no implementation yet.
export const blockDefinitions = {
  VIDEO: {
    type: "VIDEO",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VideoConfigSchema,
    grade: () => NO_GRADE,
    report: (config: VideoConfig) => ({ type: "VIDEO", title: config.title, summary: "", details: [] }),
  } satisfies BlockDefinition<VideoConfig, never>,
  VISUAL_WALKTHROUGH: {
    type: "VISUAL_WALKTHROUGH",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VisualWalkthroughConfigSchema,
    grade: () => NO_GRADE,
    report: (config: VisualWalkthroughConfig) => ({ type: "VISUAL_WALKTHROUGH", title: config.title, summary: "", details: [] }),
  } satisfies BlockDefinition<VisualWalkthroughConfig, never>,
  VISUAL_DIAGRAM: {
    type: "VISUAL_DIAGRAM",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VisualDiagramConfigSchema,
    grade: () => NO_GRADE,
    report: (config: VisualDiagramConfig) => ({ type: "VISUAL_DIAGRAM", title: config.title, summary: "", details: [] }),
  } satisfies BlockDefinition<VisualDiagramConfig, never>,
  ROADMAP: {
    type: "ROADMAP",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: RoadmapConfigSchema,
    grade: () => NO_GRADE,
    report: (config: RoadmapConfig) => ({ type: "ROADMAP", title: config.title, summary: "", details: [] }),
  } satisfies BlockDefinition<RoadmapConfig, never>,
  MUST_READ: {
    type: "MUST_READ",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: MustReadConfigSchema,
    grade: gradeMustRead,
    report: () => ({ type: "MUST_READ", title: "Mandatory read", summary: "", details: [] }),
  } satisfies BlockDefinition<MustReadConfig, MustReadPayload>,
  QUIZ: {
    type: "QUIZ",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: QuizConfigSchema,
    grade: gradeQuiz,
    report: reportQuiz,
  } satisfies BlockDefinition<QuizConfig, QuizPayload>,
  OPEN_QUESTION: {
    type: "OPEN_QUESTION",
    version: 1,
    behavior: "assessment",
    progress: "review",
    schema: OpenQuestionConfigSchema,
    grade: gradeOpenQuestion,
    report: reportOpenQuestion,
  } satisfies BlockDefinition<OpenQuestionConfig, OpenQuestionPayload>,
  STEPS: {
    type: "STEPS",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: StepsConfigSchema,
    grade: () => NO_GRADE,
    report: reportSteps,
  } satisfies BlockDefinition<StepsConfig, StepsPayload>,
  PROJECT_PREVIEW: {
    type: "PROJECT_PREVIEW",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: ProjectPreviewConfigSchema,
    grade: () => NO_GRADE,
    report: reportProjectPreview,
  } satisfies BlockDefinition<ProjectPreviewConfig, never>,
  LEARNING_OBJECTIVES: {
    type: "LEARNING_OBJECTIVES",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: LearningObjectivesConfigSchema,
    grade: () => NO_GRADE,
    report: () => ({ type: "LEARNING_OBJECTIVES", title: "Learning objectives", summary: "", details: [] }),
  } satisfies BlockDefinition<LearningObjectivesConfig, never>,
  CHAPTER_RECAP: {
    type: "CHAPTER_RECAP",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: ChapterRecapConfigSchema,
    grade: () => NO_GRADE,
    report: () => ({ type: "CHAPTER_RECAP", title: "Chapter recap", summary: "", details: [] }),
  } satisfies BlockDefinition<ChapterRecapConfig, never>,
  CODE: {
    type: "CODE",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: CodeConfigSchema,
    grade: gradeCode,
    report: reportCode,
  } satisfies BlockDefinition<CodeConfig, CodePayload>,
  PREDICT: {
    type: "PREDICT",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: PredictConfigSchema,
    grade: gradePredict,
    report: reportPredict,
  } satisfies BlockDefinition<PredictConfig, PredictPayload>,
  AI_INTERVIEW: {
    type: "AI_INTERVIEW",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: AiInterviewConfigSchema,
    grade: gradeAiInterview,
    report: reportAiInterview,
  } satisfies BlockDefinition<AiInterviewConfig, AiInterviewPayload>,
} as const;

export type RegisteredBlockType = keyof typeof blockDefinitions;

export function isRegisteredBlockType(type: string): type is RegisteredBlockType {
  return type in blockDefinitions;
}
