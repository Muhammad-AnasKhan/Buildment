"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { SvgButton } from "../primitives/svg-button";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";

// Pieces the three address canvases share: a bit card you can tap, a plain
// text label in the picture, a 44px control button with a disabled state, and
// the reduced-motion preference.

/** True when the learner asked for less motion. Starts false so the server and browser agree. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Timers that are all cleared on unmount and on demand. */
export function useTimers() {
  const ids = useRef<number[]>([]);
  const clear = () => {
    ids.current.forEach((id) => window.clearTimeout(id));
    ids.current = [];
  };
  useEffect(() => clear, []);
  const later = (ms: number, fn: () => void) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
  return { later, clear };
}

type BitCardProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  bit: 0 | 1;
  /** Accessible name, for example "Bit worth 16, off". */
  label: string;
  /** Leave out for a card that cannot be tapped (a locked answer). */
  onPress?: () => void;
  /** A brief accent ring after this card changed. */
  flash?: boolean;
  /** A result ring: this bit was right or wrong. */
  ring?: Tone;
  /** The size class for the digit, written out so the class scanner sees it. */
  digitClass: string;
};

/** One bit as a card: the digit 0 or 1 is always printed, so colour is never the only signal. */
export function BitCard({ x, y, w, h, bit, label, onPress, flash, ring, digitClass }: BitCardProps) {
  const on = bit === 1;
  const body = (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        strokeWidth={on ? 2 : 1.5}
        className={cn(on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
      />
      {flash ? <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={12} strokeWidth={3} className={cn("fill-none", TONES.accent.stroke)} /> : null}
      {ring ? <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={12} strokeWidth={3} className={cn("fill-none", TONES[ring].stroke)} /> : null}
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" className={cn(on ? TONES.accent.text : NEUTRAL.mutedText, "font-bold tabular-nums", digitClass)}>
        {bit}
      </text>
    </>
  );
  if (!onPress) {
    return (
      <g role="img" aria-label={label}>
        {body}
      </g>
    );
  }
  return (
    <SvgButton x={x} y={y} width={w} height={h} rx={10} label={label} pressed={on} onPress={onPress}>
      {body}
    </SvgButton>
  );
}

/** "Bit worth 16, off" for the accessible name of a bit. */
export const bitName = (place: number, bit: 0 | 1) => `Bit worth ${place}, ${bit === 1 ? "on" : "off"}`;

/** A small muted label in the picture, at least 13 units. */
export function Caption({ x, y, children, anchor = "middle", strong }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; strong?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums", strong ? "font-semibold" : "font-medium")}>
      {children}
    </text>
  );
}

/** A tone-coloured icon for a right or wrong mark, drawn inside a card. */
export function ResultMark({ x, y, right }: { x: number; y: number; right: boolean }) {
  const Icon = right ? Check : X;
  return <Icon x={x} y={y} width={16} height={16} strokeWidth={3} aria-hidden className={cn("fill-none", TONES[right ? "good" : "bad"].stroke)} />;
}

/** A 44px pill control under the picture, with a disabled state. */
export function ControlButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-4 text-sm font-semibold sm:h-10", FOCUS_RING)}
    >
      {children}
    </button>
  );
}
