"use client";

import { cn } from "@/lib/utils";
import { SvgButton } from "./svg-button";
import { CHIP_H } from "./svg-chip";
import { NEUTRAL, TONES, type Tone } from "./tones";

// An action button drawn inside a beat picture: a pill with a short label.
// "primary" fills it with the accent (the step the learner should take next);
// a tone paints it as a state (for example a crashed instance); "disabled"
// fades it and takes it out of the tab order, but leaves it in the reading
// order with aria-disabled so a screen reader still says why it is off.
// The pill is 30 units tall; the tap area around it is 44 units.

const HIT_H = 44;

type SvgPillButtonProps = {
  /** Left edge and vertical centre. */
  x: number;
  y: number;
  width: number;
  text: string;
  /** What a screen reader says, for example "Crash payments-2". */
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  tone?: Tone;
};

export function SvgPillButton({ x, y, width, text, label, onPress, primary = false, disabled = false, tone }: SvgPillButtonProps) {
  const pill = (
    <>
      <rect
        x={x}
        y={y - CHIP_H / 2}
        width={width}
        height={CHIP_H}
        rx={CHIP_H / 2}
        strokeWidth={1.5}
        className={cn(
          "transition-colors duration-200 motion-reduce:transition-none",
          tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : primary ? "fill-blue-600 stroke-blue-600 dark:fill-blue-400 dark:stroke-blue-400" : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted")
        )}
      />
      <text
        x={x + width / 2}
        y={y + 4.5}
        textAnchor="middle"
        className={cn("text-[12.5px] font-semibold", tone ? TONES[tone].text : primary ? "fill-white dark:fill-blue-950" : NEUTRAL.text)}
      >
        {text}
      </text>
    </>
  );
  if (disabled) {
    return (
      <g role="button" aria-label={label} aria-disabled="true" opacity={0.5}>
        {pill}
      </g>
    );
  }
  return (
    <SvgButton x={x} y={y - HIT_H / 2} width={width} height={HIT_H} rx={HIT_H / 2} label={label} onPress={onPress}>
      {pill}
    </SvgButton>
  );
}
