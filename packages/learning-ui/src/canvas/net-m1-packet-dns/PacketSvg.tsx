"use client";

import { useId, type ReactNode } from "react";
import { DotGrid } from "../primitives/svg-parts";
import { VIEW_W } from "./layout";

/** The one SVG every packet picture draws in: a titled group on a dotted canvas, 420 units wide. */
export function PacketSvg({ title, purpose, summary, height, children }: { title: string; purpose: string; summary: string; height: number; children: ReactNode }) {
  const ids = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${height}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
      <title id={`${ids}t`}>{title}</title>
      <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
      <DotGrid width={VIEW_W} height={height} />
      {children}
    </svg>
  );
}
