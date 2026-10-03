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
import {
  StepsConfigSchema,
  type StepsConfig,
  type StepsPayload,
} from "./steps/schema";
import { StepsComponent } from "./steps/Component";
import { reportSteps } from "./steps/report";
import {
  ProjectPreviewConfigSchema,
  type ProjectPreviewConfig,
} from "./project-preview/schema";
import { ProjectPreviewComponent } from "./project-preview/Component";
import { reportProjectPreview } from "./project-preview/report";
import {
  LearningObjectivesConfigSchema,
  type LearningObjectivesConfig,
} from "./learning-objectives/schema";
import { LearningObjectivesComponent } from "./learning-objectives/Component";
import {
  ChapterRecapConfigSchema,
  type ChapterRecapConfig,
} from "./chapter-recap/schema";
import {
  CodeConfigSchema,
  type CodeConfig,
  type CodePayload,
} from "./code/schema";
import { gradeCode, gradeCodeDetails } from "./code/grade";
import { CodeExerciseComponent } from "./code/Component";
import { reportCode } from "./code/report";
import { ChapterRecapComponent } from "./chapter-recap/Component";
import {
  PredictConfigSchema,
  type PredictConfig,
  type PredictPayload,
} from "./predict/schema";
import { gradePredict } from "./predict/grade";
import { PredictComponent } from "./predict/Component";
import { reportPredict } from "./predict/report";
import { MustReadConfigSchema, type MustReadConfig, type MustReadPayload } from "./must-read/schema";
import { gradeMustRead } from "./must-read/grade";
import { MustReadComponent } from "./must-read/Component";
import { VideoConfigSchema, type VideoConfig } from "./video/schema";
import { VideoComponent } from "./video/Component";
import { VisualWalkthroughConfigSchema, type VisualWalkthroughConfig } from "./visual-walkthrough/schema";
import { VisualWalkthroughComponent } from "./visual-walkthrough/Component";
import { VisualDiagramConfigSchema, type VisualDiagramConfig } from "./visual-diagram/schema";
import { VisualDiagramComponent } from "./visual-diagram/Component";
import { RoadmapConfigSchema, type RoadmapConfig } from "./roadmap/schema";
import { RoadmapComponent } from "./roadmap/Component";

// The block registry — the one place a BlockType maps to its implementation.
// See docs/03-blocks-registry.mdx "The registry pattern": adding a block type
// means adding one entry here plus its own src/blocks/<type>/ folder, never a
// switch statement scattered across submission handling, progress, or reports.
//
// TEST, MUST_READ are declared in the schema (docs/08-data-model.mdx)
// but not implemented yet — no imported course content uses them yet.
export const blockRegistry = {
  VIDEO: {
    type: "VIDEO",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VideoConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: VideoComponent,
    report: (config: VideoConfig) => ({ type: "VIDEO", title: config.title, summary: "", details: [] }),
  } satisfies BlockRegistryEntry<VideoConfig, never>,
  VISUAL_WALKTHROUGH: {
    type: "VISUAL_WALKTHROUGH",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VisualWalkthroughConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: VisualWalkthroughComponent,
    report: (config: VisualWalkthroughConfig) => ({ type: "VISUAL_WALKTHROUGH", title: config.title, summary: "", details: [] }),
  } satisfies BlockRegistryEntry<VisualWalkthroughConfig, never>,
  VISUAL_DIAGRAM: {
    type: "VISUAL_DIAGRAM",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: VisualDiagramConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: VisualDiagramComponent,
    report: (config: VisualDiagramConfig) => ({ type: "VISUAL_DIAGRAM", title: config.title, summary: "", details: [] }),
  } satisfies BlockRegistryEntry<VisualDiagramConfig, never>,
  ROADMAP: {
    type: "ROADMAP",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: RoadmapConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: RoadmapComponent,
    report: (config: RoadmapConfig) => ({ type: "ROADMAP", title: config.title, summary: "", details: [] }),
  } satisfies BlockRegistryEntry<RoadmapConfig, never>,
  MUST_READ: {
    type: "MUST_READ",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: MustReadConfigSchema,
    grade: gradeMustRead,
    Component: MustReadComponent,
    report: () => ({ type: "MUST_READ", title: "Mandatory read", summary: "", details: [] }),
  } satisfies BlockRegistryEntry<MustReadConfig, MustReadPayload>,
  QUIZ: {
    type: "QUIZ",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: QuizConfigSchema,
    grade: gradeQuiz,
    Component: QuizComponent,
    report: reportQuiz,
  } satisfies BlockRegistryEntry<QuizConfig, QuizPayload>,
  OPEN_QUESTION: {
    type: "OPEN_QUESTION",
    version: 1,
    behavior: "assessment",
    progress: "review",
    schema: OpenQuestionConfigSchema,
    grade: gradeOpenQuestion,
    Component: OpenQuestionComponent,
    report: reportOpenQuestion,
  } satisfies BlockRegistryEntry<OpenQuestionConfig, OpenQuestionPayload>,
  STEPS: {
    type: "STEPS",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: StepsConfigSchema,
    // Steps blocks are static — no grading needed. Provide a no-op grade function.
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: StepsComponent,
    report: reportSteps,
  } satisfies BlockRegistryEntry<StepsConfig, StepsPayload>,
  PROJECT_PREVIEW: {
    type: "PROJECT_PREVIEW",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: ProjectPreviewConfigSchema,
    // Project preview blocks are static — no grading needed.
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: ProjectPreviewComponent,
    report: reportProjectPreview,
  } satisfies BlockRegistryEntry<ProjectPreviewConfig, never>,
  LEARNING_OBJECTIVES: {
    type: "LEARNING_OBJECTIVES",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: LearningObjectivesConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: LearningObjectivesComponent,
    report: () => ({ type: "LEARNING_OBJECTIVES", title: "Learning objectives", summary: "", details: [] }),
  } satisfies BlockRegistryEntry<LearningObjectivesConfig, never>,
  CHAPTER_RECAP: {
    type: "CHAPTER_RECAP",
    version: 1,
    behavior: "presentation",
    progress: "none",
    schema: ChapterRecapConfigSchema,
    grade: () => ({ score: null, maxScore: null, isCorrect: null, status: "DRAFT" as const }),
    Component: ChapterRecapComponent,
    report: () => ({ type: "CHAPTER_RECAP", title: "Chapter recap", summary: "", details: [] }),
  } satisfies BlockRegistryEntry<ChapterRecapConfig, never>,
  CODE: {
    type: "CODE",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: CodeConfigSchema,
    grade: gradeCode,
    Component: CodeExerciseComponent,
    report: reportCode,
  } satisfies BlockRegistryEntry<CodeConfig, CodePayload>,
  PREDICT: {
    type: "PREDICT",
    version: 1,
    behavior: "assessment",
    progress: "completion",
    schema: PredictConfigSchema,
    grade: gradePredict,
    Component: PredictComponent,
    report: reportPredict,
  } satisfies BlockRegistryEntry<PredictConfig, PredictPayload>,
} as const;

export type RegisteredBlockType = keyof typeof blockRegistry;

export function isRegisteredBlockType(type: string): type is RegisteredBlockType {
  return type in blockRegistry;
}
