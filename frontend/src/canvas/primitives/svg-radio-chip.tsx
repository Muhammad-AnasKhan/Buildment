"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { CHIP_H } from "./svg-chip";
import { NEUTRAL, TONES } from "./tones";

// Like SvgChip, but the chips of one row are radio buttons: exactly one is
// selected. The caller wraps the row in a <g role="radiogroup" aria-label=...>.
// The visible pill is 30 units tall; the tap area around it is 44 units.

const HIT_H = 44;

type SvgRadioChipProps = {
  /** Left edge and vertical centre. */
  x: number;
  y: number;
  text: string;
  width: number;
  /** What a screen reader says, for example "Split into 4 sub-keys". */
  label: string;
  checked: boolean;
  onSelect: () => void;
};

export function SvgRadioChip({ x, y, text, width, label, checked, onSelect }: SvgRadioChipProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };
  return (
    <g role="radio" tabIndex={0} aria-label={label} aria-checked={checked} className="group cursor-pointer outline-none" onClick={onSelect} onKeyDown={onKeyDown}>
      <rect x={x} y={y - HIT_H / 2} width={width} height={HIT_H} fill="none" pointerEvents="all" />
      <rect
        x={x}
        y={y - CHIP_H / 2}
        width={width}
        height={CHIP_H}
        rx={CHIP_H / 2}
        strokeWidth={1.5}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", checked ? "fill-blue-600 stroke-blue-600 dark:fill-blue-400 dark:stroke-blue-400" : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted"))}
      />
      <text x={x + width / 2} y={y + 4.5} textAnchor="middle" className={cn("text-[12.5px] font-semibold tabular-nums", checked ? "fill-white dark:fill-blue-950" : NEUTRAL.text)}>
        {text}
      </text>
      <rect x={x - 3} y={y - CHIP_H / 2 - 3} width={width + 6} height={CHIP_H + 6} rx={CHIP_H / 2 + 3} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
