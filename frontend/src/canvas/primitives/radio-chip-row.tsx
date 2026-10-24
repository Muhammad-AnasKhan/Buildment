"use client";

import { cn } from "@/lib/utils";
import { CHIP_H, chipWidth, rowPositions } from "./svg-chip";
import { SvgRadioChip } from "./svg-radio-chip";
import { NEUTRAL } from "./tones";

// A row of radio chips drawn inside a beat picture: exactly one is selected,
// and a chip can be disabled (faded, out of the tab order, still read by a
// screen reader as unavailable). Wraps SvgRadioChip for the enabled chips.
// Data-driven: the caller passes the options and, if it wants, a caption.

export type RadioChipOption<T extends string> = {
  id: T;
  /** The words on the chip. */
  text: string;
  /** What a screen reader says. */
  label: string;
  disabled?: boolean;
};

type RadioChipRowProps<T extends string> = {
  /** Left edge of the first chip and the row's vertical centre. */
  x: number;
  y: number;
  options: readonly RadioChipOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Names the group for screen readers. */
  ariaLabel: string;
  gap?: number;
};

/** Total width of a row of chips for these labels. */
export function chipRowWidth(texts: readonly string[], gap = 8): number {
  return texts.reduce((sum, t) => sum + chipWidth(t), 0) + gap * Math.max(0, texts.length - 1);
}

export function RadioChipRow<T extends string>({ x, y, options, value, onChange, ariaLabel, gap = 8 }: RadioChipRowProps<T>) {
  const widths = options.map((o) => chipWidth(o.text));
  const xs = rowPositions(widths, x, gap);
  return (
    <g role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) =>
        o.disabled ? (
          <g key={o.id} role="radio" aria-checked={false} aria-disabled="true" aria-label={o.label} opacity={0.45}>
            <rect x={xs[i]} y={y - CHIP_H / 2} width={widths[i]} height={CHIP_H} rx={CHIP_H / 2} strokeWidth={1.5} strokeDasharray="4 3" className={cn("fill-muted", NEUTRAL.faintStroke)} />
            <text x={xs[i] + widths[i] / 2} y={y + 4.5} textAnchor="middle" className={cn("text-[12.5px] font-semibold", NEUTRAL.mutedText)}>
              {o.text}
            </text>
          </g>
        ) : (
          <SvgRadioChip key={o.id} x={xs[i]} y={y} text={o.text} width={widths[i]} label={o.label} checked={o.id === value} onSelect={() => onChange(o.id)} />
        )
      )}
    </g>
  );
}
