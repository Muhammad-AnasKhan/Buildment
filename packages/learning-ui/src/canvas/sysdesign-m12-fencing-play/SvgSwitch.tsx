"use client";

import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { NEUTRAL, TONES } from "../primitives/tones";

// An on/off switch drawn inside a beat picture: a label above, a track with a
// knob, the word On or Off beside it. A real role="switch" for keyboards and
// screen readers; the whole block (62 units tall) is the tap target.

type SvgSwitchProps = {
  /** Left edge and top of the block. */
  x: number;
  y: number;
  label: string;
  /** What a screen reader says for the switch. */
  ariaLabel: string;
  checked: boolean;
  onToggle: () => void;
};

export const SWITCH_W = 112;
export const SWITCH_H = 64;

export function SvgSwitch({ x, y, label, ariaLabel, checked, onToggle }: SvgSwitchProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onToggle();
  };
  return (
    <g role="switch" tabIndex={0} aria-checked={checked} aria-label={ariaLabel} className="group cursor-pointer outline-none" onClick={onToggle} onKeyDown={onKeyDown}>
      <rect x={x} y={y} width={SWITCH_W} height={SWITCH_H} rx={14} fill="none" pointerEvents="all" />
      <text x={x + 6} y={y + 18} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{label}</text>
      <rect
        x={x + 6}
        y={y + 28}
        width={52}
        height={28}
        rx={14}
        strokeWidth={1.5}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", checked ? "fill-blue-600 stroke-blue-600 dark:fill-blue-400 dark:stroke-blue-400" : "fill-muted stroke-border")}
      />
      <circle
        cx={x + 20}
        cy={y + 42}
        r={10}
        style={{ transform: `translateX(${checked ? 24 : 0}px)` }}
        className="fill-white stroke-border transition-transform duration-200 motion-reduce:transition-none dark:fill-blue-950"
        strokeWidth={1}
      />
      <text x={x + 66} y={y + 47} className={cn(checked ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-bold")}>{checked ? "On" : "Off"}</text>
      <rect x={x - 2} y={y - 2} width={SWITCH_W + 4} height={SWITCH_H + 4} rx={16} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
