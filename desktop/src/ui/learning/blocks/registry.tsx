// Host adapters handle progress and desktop-only exercise behavior. The visual
// lesson blocks come from learning-ui so they match the web reader.
import type { ComponentType } from 'react';
import { ReadingCard } from './ReadingCard';
import { Practice } from './Practice';
import { BlockGallery } from './BlockGallery';
import { MermaidDiagram as WebMermaidDiagram } from '@buildment/learning-ui/components/learn/mermaid-diagram';
import mermaidScript from '@buildment/learning-ui/assets/vendor/mermaid.min.js?url';
import { sharedLessonBlocks } from '@buildment/learning-ui/lesson-blocks';

function MermaidDiagram(props: { chart: string; title?: string; legend?: string }) {
  return <WebMermaidDiagram {...props} scriptSrc={mermaidScript} />;
}

export const lessonBlocks: Record<string, ComponentType<any>> = {
  ...sharedLessonBlocks,
  EcosystemGallery: BlockGallery,
  Quiz: Practice,
  Predict: Practice,
  OpenQuestion: Practice,
  CodeExercise: Practice,
  Code: Practice,
  MandatoryReadCard: ReadingCard,
  MustRead: ReadingCard,
  MermaidDiagram,
  StateMachine: MermaidDiagram,
  EntityDiagram: MermaidDiagram,
};
