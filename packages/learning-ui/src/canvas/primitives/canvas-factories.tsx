import type { ComponentType } from "react";
import { BlockMap, type BlockMapConfig } from "./block-map";
import { CommitStory } from "./commit-story";
import { ContextPicker } from "./context-picker";
import { FlipDeck } from "./flip-deck";
import { Sorter, type SorterConfig } from "./sorter";
import { WordSampler } from "./word-sampler";
import type { CommitStoryConfig } from "../models/commit-story";
import type { ContextPickerConfig } from "../models/context-picker";
import type { FlipDeckConfig } from "../models/flip-deck";
import type { WordSamplerConfig } from "../models/word-sampler";

// Factories that turn a course's data into a registry component, so its
// data.ts holds only data. This file has no "use client": the registry runs
// on the server, and calling a function from a client module there throws.
// The returned component only renders the client component with the data.

type CanvasProps = { title: string; purpose: string; limits: string };

export function makeSorterCanvas(config: SorterConfig): ComponentType<CanvasProps> {
  function SorterCanvas({ title, limits }: CanvasProps) {
    return <Sorter title={title} limits={limits} {...config} />;
  }
  SorterCanvas.displayName = "SorterCanvas";
  return SorterCanvas;
}

export function makeBlockMapCanvas(config: BlockMapConfig): ComponentType<CanvasProps> {
  function BlockMapCanvas({ title, limits }: CanvasProps) {
    return <BlockMap title={title} limits={limits} {...config} />;
  }
  BlockMapCanvas.displayName = "BlockMapCanvas";
  return BlockMapCanvas;
}

export function makeContextPickerCanvas(config: ContextPickerConfig): ComponentType<CanvasProps> {
  function ContextPickerCanvas({ title, limits }: CanvasProps) {
    return <ContextPicker title={title} limits={limits} {...config} />;
  }
  ContextPickerCanvas.displayName = "ContextPickerCanvas";
  return ContextPickerCanvas;
}

export function makeFlipDeckCanvas(config: FlipDeckConfig): ComponentType<CanvasProps> {
  function FlipDeckCanvas({ title, limits }: CanvasProps) {
    return <FlipDeck title={title} limits={limits} {...config} />;
  }
  FlipDeckCanvas.displayName = "FlipDeckCanvas";
  return FlipDeckCanvas;
}

export function makeCommitStoryCanvas(config: CommitStoryConfig): ComponentType<CanvasProps> {
  function CommitStoryCanvas({ title, limits }: CanvasProps) {
    return <CommitStory title={title} limits={limits} {...config} />;
  }
  CommitStoryCanvas.displayName = "CommitStoryCanvas";
  return CommitStoryCanvas;
}

export function makeWordSamplerCanvas(config: WordSamplerConfig): ComponentType<CanvasProps> {
  function WordSamplerCanvas({ title, limits }: CanvasProps) {
    return <WordSampler title={title} limits={limits} {...config} />;
  }
  WordSamplerCanvas.displayName = "WordSamplerCanvas";
  return WordSamplerCanvas;
}
