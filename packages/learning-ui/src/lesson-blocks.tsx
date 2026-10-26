import type { ComponentType } from "react";
import { ChapterRecap } from "./blocks/chapter-recap/ChapterRecap";
import { AiInterview } from "./blocks/ai-interview/AiInterview";
import { LearningObjectives } from "./blocks/learning-objectives/LearningObjectives";
import { ProjectPreview } from "./blocks/project-preview/ProjectPreview";
import { RoadmapClient } from "./blocks/roadmap/RoadmapClient";
import { Step } from "./blocks/steps/Step";
import { Steps } from "./blocks/steps/Steps";
import { VisualDiagramClient } from "./blocks/visual-diagram/VisualDiagramClient";
import { VisualWalkthroughClient } from "./blocks/visual-walkthrough/VisualWalkthroughClient";
import { InteractiveCanvas } from "./canvas/InteractiveCanvas";
import { Lab } from "./labs/Lab";
import { getLabSpec } from "./labs/registry";
import { ApiRequest, ApiRequestPanel } from "./components/learn/api-request-panel";
import { BigWordAlert } from "./components/learn/big-word-alert";
import { Callout } from "./components/learn/callout";
import { CheckpointIntro } from "./components/learn/checkpoint-intro";
import {
  ArchitectureDiagram, ArchNode, CompareColumn, ComparePanel, DiffBlock,
  FileTree, FileTreeItem, TerminalBlock, TerminalLine, TraceRequest, TraceStep,
} from "./components/learn/content-blocks";
import { FaqGroup, FaqItem } from "./components/learn/faq-group";
import { GlossaryTerm } from "./components/learn/glossary-term";
import { GoDeeper } from "./components/learn/go-deeper";
import { InterestingRead } from "./components/learn/interesting-read";
import { PendingBlockCard } from "./components/learn/pending-block-card";
import { RealWorldEvent } from "./components/learn/real-world-event";
import { Video } from "./components/learn/video-embed";
import { Checklist } from "./components/learn/checklist";
import { LearningLog } from "./components/learn/learning-log";

function LabBlock(props: { slug?: unknown }) {
  return <Lab spec={typeof props.slug === "string" ? getLabSpec(props.slug) : null} />;
}

/** Components whose complete presentation and behavior are shared by web and desktop. */
export const sharedLessonBlocks: Record<string, ComponentType<any>> = {
  AiInterview,
  ChapterRecap,
  LearningObjectives,
  ProjectPreview,
  Roadmap: RoadmapClient,
  Step,
  Steps,
  VisualDiagram: VisualDiagramClient,
  VisualWalkthrough: VisualWalkthroughClient,
  InteractiveCanvas,
  Lab: LabBlock,
  ApiRequest,
  ApiRequestPanel,
  BigWordAlert,
  Callout,
  CheckpointIntro,
  ArchitectureDiagram,
  ArchNode,
  CompareColumn,
  ComparePanel,
  DiffBlock,
  FileTree,
  FileTreeItem,
  TerminalBlock,
  TerminalLine,
  TraceRequest,
  TraceStep,
  FaqGroup,
  FaqItem,
  GlossaryTerm,
  GoDeeper,
  InterestingRead,
  PendingBlock: PendingBlockCard,
  PendingBlockCard,
  RealWorldEvent,
  Video,
  VideoBlock: Video,
  Checklist,
  LearningLog,
};
