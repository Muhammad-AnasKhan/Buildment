"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { NEUTRAL, TONES } from "./tones";

// A tap target drawn inside a beat picture: a pill with a short label, the
// selected one filled with the accent. It is a real button for keyboards and
// screen readers (role="button" with aria-pressed). The visible pill is 30
// units tall; the tap area around it is 44 units, so a finger can hit it.

export const CHIP_H = 30;
const HIT_H = 44;
const GLYPH = 7.7;

/** Width of a chip for a label, in viewBox units, with room on both sides. */
export function chipWidth(text: string, glyph = GLYPH): number {
  return Math.ceil(text.length * glyph + 20);
}

/** Left edges for a row of items of the given widths, `gap` apart, starting at x0. */
export function rowPositions(widths: readonly number[], x0: number, gap = 8): number[] {
  const xs: number[] = [];
  let x = x0;
  for (const w of widths) {
    xs.push(x);
    x += w + gap;
  }
  return xs;
}

type SvgChipProps = {
  /** Left edge and vertical centre. */
  x: number;
  y: number;
  /** The words on the chip. */
  text: string;
  width?: number;
  /** What a screen reader says, for example "HTTP/3". */
  label: string;
  pressed: boolean;
  onPress: () => void;
};

export function SvgChip({ x, y, text, width = chipWidth(text), label, pressed, onPress }: SvgChipProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    onPress();
  };
  return (
    <g role="button" tabIndex={0} aria-label={label} aria-pressed={pressed} className="group cursor-pointer outline-none" onClick={onPress} onKeyDown={onKeyDown}>
      <rect x={x} y={y - HIT_H / 2} width={width} height={HIT_H} fill="none" pointerEvents="all" />
      <rect
        x={x}
        y={y - CHIP_H / 2}
        width={width}
        height={CHIP_H}
        rx={CHIP_H / 2}
        strokeWidth={1.5}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", pressed ? "fill-blue-600 stroke-blue-600 dark:fill-blue-400 dark:stroke-blue-400" : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted"))}
      />
      <text x={x + width / 2} y={y + 4.5} textAnchor="middle" className={cn("text-[12.5px] font-semibold", pressed ? "fill-white dark:fill-blue-950" : NEUTRAL.text)}>
        {text}
      </text>
      <rect x={x - 3} y={y - CHIP_H / 2 - 3} width={width + 6} height={CHIP_H + 6} rx={CHIP_H / 2 + 3} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
