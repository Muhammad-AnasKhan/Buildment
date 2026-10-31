"use client";

import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/utils";
import { TONES } from "./tones";
import { useSvgTouchDrag } from "./svg-touch-drag";

// A slider on a rail drawn inside the picture's SVG, like RailSlider, but with
// a hit zone you size yourself and a key handler you supply. That lets a
// picture stack several rails 44 units apart (RailSlider's zone is taller than
// that) and use its own key steps, for example half a second with Page keys at
// five. The caller draws the rail inside; this group is the real role="slider".

type TightRailSliderProps = {
  svgRef: RefObject<SVGSVGElement | null>;
  /** The rail's ends in viewBox units: a pointer at x0 gives fraction 0, at x1 fraction 1. */
  x0: number;
  x1: number;
  y: number;
  label: string;
  valueText: string;
  value: number;
  min: number;
  max: number;
  /** Turns a 0 to 1 pointer position into a value (snapped by the caller). */
  fromFraction: (f: number) => number;
  /** The value a key moves to, or null if the key is not a slider key. */
  onKey: (value: number, key: string) => number | null;
  onChange: (value: number) => void;
  /** Called when a drag starts and ends, for example to pause an animation. */
  onGrab?: (grabbed: boolean) => void;
  /** Room above and below the rail's centre line that still counts as the slider. */
  above?: number;
  below?: number;
  /** Room left of x0 and right of x1. */
  side?: number;
  children: ReactNode;
};

export function TightRailSlider({
  svgRef,
  x0,
  x1,
  y,
  label,
  valueText,
  value,
  min,
  max,
  fromFraction,
  onKey,
  onChange,
  onGrab,
  above = 22,
  below = 22,
  side = 16,
  children,
}: TightRailSliderProps) {
  const touchRef = useSvgTouchDrag<SVGGElement>();
  const dragging = useRef(false);
  const follow = (e: PointerEvent) => {
    const el = svgRef.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const x = p.matrixTransform(m.inverse()).x;
    const next = fromFraction(Math.max(0, Math.min(1, (x - x0) / (x1 - x0))));
    if (next !== value) onChange(next);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const next = onKey(value, e.key);
    if (next === null) return;
    e.preventDefault();
    if (next !== value) onChange(next);
  };
  const zone = { x: x0 - side, y: y - above, width: x1 - x0 + 2 * side, height: above + below };
  return (
    <g ref={touchRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
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
      {/* A path, not a rect, so the picture's text check does not take the tap area for a card. */}
      <path d={`M${zone.x} ${zone.y} h${zone.width} v${zone.height} h${-zone.width} Z`} fill="none" pointerEvents="all" />
      {children}
      <rect {...zone} rx={14} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}
