"use client";

import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { CHIP_H, chipWidth } from "./svg-chip";
import { NEUTRAL, TONES } from "./tones";

// An action button drawn inside a beat picture: a pill with a short label that
// can be switched off (aria-disabled, dimmed, no focus stop) and can wear a
// tone for risky actions such as "Kill the leader". The visible pill is 30
// units tall; the tap area around it is 44 units. SvgChip is for toggles; this
// one is for things that happen once per press.

const HIT_H = 44;

type SvgActionProps = {
  /** Left edge and vertical centre. */
  x: number;
  y: number;
  text: string;
  width?: number;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "bad" | "accent";
};

export function SvgAction({ x, y, text, width = chipWidth(text), label, onPress, disabled = false, tone }: SvgActionProps) {
  const fire = () => {
    if (!disabled) onPress();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    fire();
  };
  return (
    <g role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled} className={cn("group outline-none", disabled ? "cursor-not-allowed" : "cursor-pointer")} onClick={fire} onKeyDown={onKeyDown} opacity={disabled ? 0.55 : 1}>
      <rect x={x} y={y - HIT_H / 2} width={width} height={HIT_H} fill="none" pointerEvents="all" />
      <rect
        x={x}
        y={y - CHIP_H / 2}
        width={width}
        height={CHIP_H}
        rx={CHIP_H / 2}
        strokeWidth={1.5}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line, !disabled && "group-hover:fill-muted")}
      />
      <text x={x + width / 2} y={y + 4.5} textAnchor="middle" className={cn("text-[12.5px] font-semibold", tone === "bad" ? TONES.bad.text : NEUTRAL.text)}>
        {text}
      </text>
      <rect x={x - 3} y={y - CHIP_H / 2 - 3} width={width + 6} height={CHIP_H + 6} rx={CHIP_H / 2 + 3} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
