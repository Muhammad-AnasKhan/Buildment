"use client";

import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { ladderStep } from "./picture-slider";
import { TONES } from "./tones";

// A slider that lives only on its rail, inside the picture's own SVG. Unlike
// PictureSlider (the whole picture is the drag surface) this one leaves the
// rest of the picture free for chips and taps, so a beat can hold a slider and
// several buttons at once. The group is a real role="slider" for keyboards and
// screen readers; the caller draws the rail inside it with SliderRail.

type RailSliderProps = {
  /** The SVG that holds the rail, to turn a pointer position into viewBox units. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** The rail's ends and height in viewBox units. */
  x0: number;
  x1: number;
  y: number;
  label: string;
  valueText: string;
  value: number;
  /** Arrow keys move to the next value on this ladder. */
  ladder: readonly number[];
  fromFraction: (f: number) => number;
  onChange: (value: number) => void;
  /** Called when a drag starts and ends, for example to pause an animation. */
  onGrab?: (grabbed: boolean) => void;
  /** The rail drawing. */
  children: ReactNode;
};

/** Room around the rail, in viewBox units, that still counts as the slider. */
const ABOVE = 26;
const BELOW = 40;
const SIDE = 24;

export function RailSlider({ svgRef, x0, x1, y, label, valueText, value, ladder, fromFraction, onChange, onGrab, children }: RailSliderProps) {
  const dragging = useRef(false);
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
  const zone = { x: x0 - SIDE, y: y - ABOVE, width: x1 - x0 + 2 * SIDE, height: ABOVE + BELOW };
  return (
    <g
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={ladder[0]}
      aria-valuemax={ladder[ladder.length - 1]}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className="group cursor-ew-resize touch-none outline-none"
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onGrab?.(true);
        follow(e);
      }}
      onPointerMove={(e) => dragging.current && follow(e)}
      onPointerUp={() => {
        dragging.current = false;
        onGrab?.(false);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        onGrab?.(false);
      }}
    >
      {/* A path, not a rect, so the picture's text check does not take the tap area for a card the labels must fit in. */}
      <path d={`M${zone.x} ${zone.y} h${zone.width} v${zone.height} h${-zone.width} Z`} fill="none" pointerEvents="all" />
      {children}
      <rect {...zone} rx={14} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
