import type { ComponentType } from "react";
import { BlockMap, type BlockMapConfig } from "./block-map";
import { Sorter, type SorterConfig } from "./sorter";

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
