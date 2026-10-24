"use client";

import { useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/utils";
import { FOCUS_RING, LABEL_HALO, NEUTRAL, TONES } from "./tones";

// A picture that is also a slider: drag anywhere on it (or use the arrow keys)
// and the value follows the rail drawn inside the picture. The rail is SVG, so
// it reads as part of the picture; the wrapper is a real slider for keyboards
// and screen readers. Data-driven: the caller maps value to and from a 0 to 1
// position, so the rail can be linear, logarithmic or snap to chosen values.

type PictureSliderProps = {
  /** The SVG inside, used to turn a pointer position into viewBox units. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** The rail's ends in viewBox units. */
  x0: number;
  x1: number;
  label: string;
  valueText: string;
  value: number;
  /** Arrow keys move to the next value on this ladder; Page keys jump 10 rungs. */
  ladder: readonly number[];
  fromFraction: (f: number) => number;
  onChange: (value: number) => void;
  children: ReactNode;
};

export function PictureSlider({ svgRef, x0, x1, label, valueText, value, ladder, fromFraction, onChange, children }: PictureSliderProps) {
  const [dragging, setDragging] = useState(false);
  const follow = (e: PointerEvent) => {
    const el = svgRef.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const x = p.matrixTransform(m.inverse()).x;
    onChange(fromFraction((x - x0) / (x1 - x0)));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const next = ladderStep(ladder, value, e.key);
    if (next === null) return;
    e.preventDefault();
    if (next !== value) onChange(next);
  };
  return (
    <div
      className={cn("cursor-ew-resize touch-none rounded-xl", FOCUS_RING)}
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuemin={ladder[0]}
      aria-valuemax={ladder[ladder.length - 1]}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        follow(e);
      }}
      onPointerMove={(e) => dragging && follow(e)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {children}
    </div>
  );
}

/** The value a key press moves to on the ladder, or null if the key is not a slider key. */
export function ladderStep(ladder: readonly number[], value: number, key: string): number | null {
  if (ladder.length === 0) return null;
  const above = ladder.findIndex((v) => v > value);
  const up = above === -1 ? ladder.length - 1 : above;
  let below = -1;
  for (let i = ladder.length - 1; i >= 0; i--) if (ladder[i] < value) { below = i; break; }
  const down = below === -1 ? 0 : below;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return ladder[up];
    case "ArrowLeft":
    case "ArrowDown":
      return ladder[down];
    case "PageUp":
      return ladder[Math.min(ladder.length - 1, up + 9)];
    case "PageDown":
      return ladder[Math.max(0, down - 9)];
    case "Home":
      return ladder[0];
    case "End":
      return ladder[ladder.length - 1];
    default:
      return null;
  }
}

export type RailMark = { at: number; label?: string; tone?: "warn" | "bad" };

type SliderRailProps = {
  x0: number;
  x1: number;
  y: number;
  /** Handle position, 0 to 1. */
  fraction: number;
  /** Small ticks on the rail, optionally labelled, for example the capacity wall. */
  marks?: RailMark[];
  /** Words under the two ends, for example "10" and "100,000". */
  ends: [string, string];
  /** One line under the rail saying what dragging changes. */
  caption: string;
};

/** The rail and its handle, drawn inside the picture's SVG. */
export function SliderRail({ x0, x1, y, fraction, marks = [], ends, caption }: SliderRailProps) {
  const f = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
  const hx = x0 + f * (x1 - x0);
  const X = (t: number) => x0 + t * (x1 - x0);
  return (
    <g aria-hidden>
      <line x1={x0} x2={x1} y1={y} y2={y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
      <line x1={x0} x2={hx} y1={y} y2={y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
      {marks.map((m) => (
        <line key={`${m.at}-tick`} x1={X(m.at)} x2={X(m.at)} y1={y - 9} y2={y + 9} strokeWidth={m.tone ? 2 : 1.5} className={m.tone ? TONES[m.tone].stroke : NEUTRAL.faintStroke} />
      ))}
      <text x={x0} y={y + 31} textAnchor="start" className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{ends[0]}</text>
      <text x={x1} y={y + 31} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{ends[1]}</text>
      <text x={(x0 + x1) / 2} y={y + 31} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{caption}</text>
      {/* The handle: a soft halo for the finger, a solid knob and a grip. */}
      <circle cx={hx} cy={y} r={17} className={TONES.accent.softFill} />
      <circle cx={hx} cy={y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
      <line x1={hx - 3} x2={hx - 3} y1={y - 4.5} y2={y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
      <line x1={hx + 3} x2={hx + 3} y1={y - 4.5} y2={y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
      {/* Mark labels sit above the handle's halo, so the handle never hides them. */}
      {marks.map((m) =>
        m.label ? (
          <text key={`${m.at}-label`} x={X(m.at)} y={y - 21} textAnchor="middle" className={cn(m.tone ? TONES[m.tone].text : NEUTRAL.mutedText, LABEL_HALO, "text-[11.5px] font-semibold")}>
            {m.label}
          </text>
        ) : null
      )}
    </g>
  );
}
