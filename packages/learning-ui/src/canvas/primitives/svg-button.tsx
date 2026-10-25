"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { TONES } from "./tones";

// A tap target drawn inside an SVG picture: a group with role="button" that
// answers Enter and Space, shows the shared focus ring, and has a hit area at
// least as big as the shape. Any picture that lets the learner tap a card or
// a chip can use it.

type SvgButtonProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Corner radius of the focus ring and hit area. */
  rx?: number;
  label: string;
  /** Set for toggles (a selected chip); leave out for plain buttons. */
  pressed?: boolean;
  onPress: () => void;
  children: ReactNode;
};

export function SvgButton({ x, y, width, height, rx = 14, label, pressed, onPress, children }: SvgButtonProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPress();
    }
  };
  return (
    <g role="button" tabIndex={0} aria-label={label} aria-pressed={pressed} className="group cursor-pointer outline-none" onClick={onPress} onKeyDown={onKeyDown}>
      <rect x={x} y={y} width={width} height={height} rx={rx} className="fill-transparent" />
      {children}
      <rect x={x - 3} y={y - 3} width={width + 6} height={height + 6} rx={rx + 2} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
