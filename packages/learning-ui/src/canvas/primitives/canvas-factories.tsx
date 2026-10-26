import type { ComponentType } from "react";
import { BlockMap, type BlockMapConfig } from "./block-map";
import { BudgetStack, type BudgetStackConfig } from "./budget-stack";
import { PhraseFixer, type PhraseFixerConfig } from "./phrase-fixer";
import { SlotCard, type SlotCardConfig } from "./slot-card";
import { Sorter, type SorterConfig } from "./sorter";
import {
  SpecimenCompare,
  SpecimenLadder,
  SpecimenSkim,
  SpecimenSpot,
  type SpecimenCompareConfig,
  type SpecimenLadderConfig,
  type SpecimenSkimConfig,
  type SpecimenSpotConfig,
} from "./specimen-beats";

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

export function makePhraseFixerCanvas(config: PhraseFixerConfig): ComponentType<CanvasProps> {
  function PhraseFixerCanvas({ title, limits }: CanvasProps) {
    return <PhraseFixer title={title} limits={limits} {...config} />;
  }
  PhraseFixerCanvas.displayName = "PhraseFixerCanvas";
  return PhraseFixerCanvas;
}

export function makeBudgetStackCanvas(config: BudgetStackConfig): ComponentType<CanvasProps> {
  function BudgetStackCanvas({ title, limits }: CanvasProps) {
    return <BudgetStack title={title} limits={limits} {...config} />;
  }
  BudgetStackCanvas.displayName = "BudgetStackCanvas";
  return BudgetStackCanvas;
}

export function makeSlotCardCanvas(config: SlotCardConfig): ComponentType<CanvasProps> {
  function SlotCardCanvas({ title, limits }: CanvasProps) {
    return <SlotCard title={title} limits={limits} {...config} />;
  }
  SlotCardCanvas.displayName = "SlotCardCanvas";
  return SlotCardCanvas;
}

export function makeSpecimenCompareCanvas(config: SpecimenCompareConfig): ComponentType<CanvasProps> {
  function SpecimenCompareCanvas({ title, limits }: CanvasProps) {
    return <SpecimenCompare title={title} limits={limits} {...config} />;
  }
  SpecimenCompareCanvas.displayName = "SpecimenCompareCanvas";
  return SpecimenCompareCanvas;
}

export function makeSpecimenLadderCanvas(config: SpecimenLadderConfig): ComponentType<CanvasProps> {
  function SpecimenLadderCanvas({ title, limits }: CanvasProps) {
    return <SpecimenLadder title={title} limits={limits} {...config} />;
  }
  SpecimenLadderCanvas.displayName = "SpecimenLadderCanvas";
  return SpecimenLadderCanvas;
}

export function makeSpecimenSpotCanvas(config: SpecimenSpotConfig): ComponentType<CanvasProps> {
  function SpecimenSpotCanvas({ title, limits }: CanvasProps) {
    return <SpecimenSpot title={title} limits={limits} {...config} />;
  }
  SpecimenSpotCanvas.displayName = "SpecimenSpotCanvas";
  return SpecimenSpotCanvas;
}

export function makeSpecimenSkimCanvas(config: SpecimenSkimConfig): ComponentType<CanvasProps> {
  function SpecimenSkimCanvas({ title, limits }: CanvasProps) {
    return <SpecimenSkim title={title} limits={limits} {...config} />;
  }
  SpecimenSkimCanvas.displayName = "SpecimenSkimCanvas";
  return SpecimenSkimCanvas;
}
