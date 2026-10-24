// Shared lesson UI; only desktop adapters live in this registry. Data fetching stays in desktop/src/api.
import type { ComponentType } from 'react';
import { ReadingCard } from './ReadingCard';
import { LearningObjectivesView } from '@buildment/learning-ui/blocks/learning-objectives/LearningObjectivesView';
import { ChapterRecapView } from '@buildment/learning-ui/blocks/chapter-recap/ChapterRecapView';
import { ProjectPreviewView } from '@buildment/learning-ui/blocks/project-preview/ProjectPreviewView';
import { Practice } from './Practice';
import { BlockGallery } from './BlockGallery';
import { MermaidDiagram as WebMermaidDiagram } from '@buildment/learning-ui/components/learn/mermaid-diagram';
import mermaidScript from '@buildment/learning-ui/assets/vendor/mermaid.min.js?url';

import { BigWordAlert } from '@buildment/learning-ui/components/learn/big-word-alert';
import { Callout } from '@buildment/learning-ui/components/learn/callout';
import { InterestingRead } from '@buildment/learning-ui/components/learn/interesting-read';
import { RealWorldEvent } from '@buildment/learning-ui/components/learn/real-world-event';
import {
  FaqGroup,
  FaqItem,
} from '@buildment/learning-ui/components/learn/faq-group';
import { CheckpointIntro } from '@buildment/learning-ui/components/learn/checkpoint-intro';
import { GlossaryTerm } from '@buildment/learning-ui/components/learn/glossary-term';
import {
  ApiRequest,
  ApiRequestPanel,
} from '@buildment/learning-ui/components/learn/api-request-panel';
import { PendingBlockCard } from '@buildment/learning-ui/components/learn/pending-block-card';
import { Step } from '@buildment/learning-ui/blocks/steps/Step';
import { InteractiveCanvas } from '@buildment/learning-ui/canvas/InteractiveCanvas';
import { VisualDiagramClient } from '@buildment/learning-ui/blocks/visual-diagram/VisualDiagramClient';
import { VisualWalkthroughClient } from '@buildment/learning-ui/blocks/visual-walkthrough/VisualWalkthroughClient';
import { RoadmapClient } from '@buildment/learning-ui/blocks/roadmap/RoadmapClient';
import { Video } from '@buildment/learning-ui/components/learn/video-embed';
import {
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
} from '@buildment/learning-ui/components/learn/content-blocks';

function MermaidDiagram(props: {
  chart: string;
  title?: string;
  legend?: string;
}) {
  return <WebMermaidDiagram {...props} scriptSrc={mermaidScript} />;
}
function LearningObjectives(props: any) {
  return (
    <LearningObjectivesView
      id={props.id}
      objectives={props.objectives || props.items || []}
    />
  );
}
function ChapterRecap(props: any) {
  return <ChapterRecapView points={props.points || props.items || []} />;
}
function ProjectPreview(props: any) {
  return (
    <ProjectPreviewView config={{ ...props, features: props.features || [] }} />
  );
}

export const lessonBlocks: Record<string, ComponentType<any>> = {
  EcosystemGallery: BlockGallery,
  Quiz: Practice,
  Predict: Practice,
  OpenQuestion: Practice,
  CodeExercise: Practice,
  Code: Practice,
  MandatoryReadCard: ReadingCard,
  MustRead: ReadingCard,
  ProjectPreview,
  LearningObjectives,
  ChapterRecap,
  MermaidDiagram,
  StateMachine: MermaidDiagram,
  EntityDiagram: MermaidDiagram,
  BigWordAlert,
  Callout,
  InterestingRead,
  RealWorldEvent,
  FaqGroup,
  FaqItem,
  CheckpointIntro,
  GlossaryTerm,
  ApiRequest,
  ApiRequestPanel,
  PendingBlockCard,
  PendingBlock: PendingBlockCard,
  Step,
  InteractiveCanvas,
  VisualDiagram: VisualDiagramClient,
  VisualWalkthrough: VisualWalkthroughClient,
  Roadmap: RoadmapClient,
  Video,
  VideoBlock: Video,
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
};
