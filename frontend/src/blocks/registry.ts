import { blockDefinitions } from "@/shared/blocks/definitions";
import { QuizComponent } from "./quiz/Component";
import { OpenQuestionComponent } from "./open-question/Component";
import { StepsComponent } from "./steps/Component";
import { ProjectPreviewComponent } from "./project-preview/Component";
import { LearningObjectivesComponent } from "./learning-objectives/Component";
import { ChapterRecapComponent } from "./chapter-recap/Component";
import { CodeExerciseComponent } from "./code/Component";
import { PredictComponent } from "./predict/Component";
import { MustReadComponent } from "./must-read/Component";
import { VideoComponent } from "./video/Component";
import { VisualWalkthroughComponent } from "./visual-walkthrough/Component";
import { VisualDiagramComponent } from "./visual-diagram/Component";
import { RoadmapComponent } from "./roadmap/Component";

export { isRegisteredBlockType, type RegisteredBlockType } from "@/shared/blocks/definitions";

// The block registry — the one place a BlockType maps to its implementation.
// Schema/grader/report come from src/shared (the same code the API runs); this
// file only attaches the React component. Adding a block type means one entry in
// shared/src/blocks/definitions.ts plus one line here — never a switch statement
// scattered across submission handling, progress, or reports.
export const blockRegistry = {
  VIDEO: { ...blockDefinitions.VIDEO, Component: VideoComponent },
  VISUAL_WALKTHROUGH: { ...blockDefinitions.VISUAL_WALKTHROUGH, Component: VisualWalkthroughComponent },
  VISUAL_DIAGRAM: { ...blockDefinitions.VISUAL_DIAGRAM, Component: VisualDiagramComponent },
  ROADMAP: { ...blockDefinitions.ROADMAP, Component: RoadmapComponent },
  MUST_READ: { ...blockDefinitions.MUST_READ, Component: MustReadComponent },
  QUIZ: { ...blockDefinitions.QUIZ, Component: QuizComponent },
  OPEN_QUESTION: { ...blockDefinitions.OPEN_QUESTION, Component: OpenQuestionComponent },
  STEPS: { ...blockDefinitions.STEPS, Component: StepsComponent },
  PROJECT_PREVIEW: { ...blockDefinitions.PROJECT_PREVIEW, Component: ProjectPreviewComponent },
  LEARNING_OBJECTIVES: { ...blockDefinitions.LEARNING_OBJECTIVES, Component: LearningObjectivesComponent },
  CHAPTER_RECAP: { ...blockDefinitions.CHAPTER_RECAP, Component: ChapterRecapComponent },
  CODE: { ...blockDefinitions.CODE, Component: CodeExerciseComponent },
  PREDICT: { ...blockDefinitions.PREDICT, Component: PredictComponent },
} as const;
