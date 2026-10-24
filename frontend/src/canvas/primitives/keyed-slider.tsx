"use client";

import { useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { stepByKey, type KeyRange } from "../models/picture-controls";
import { FOCUS_RING } from "./tones";

// Like PictureSlider (drag anywhere on the picture, the value follows the rail
// drawn inside it) but for a value on a plain number line with its own key
// steps: arrow keys move by `step`, Page keys by `page`. PictureSlider walks a
// ladder and always pages by ten rungs, which is wrong for a week (7 days).

type KeyedSliderProps = {
  /** The SVG inside, used to turn a pointer position into viewBox units. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** The rail's ends in viewBox units. */
  x0: number;
  x1: number;
  label: string;
  valueText: string;
  value: number;
  range: KeyRange;
  fromFraction: (f: number) => number;
  onChange: (value: number) => void;
  /** Called when a drag starts and ends, for example to pause an animation. */
  onGrab?: (grabbed: boolean) => void;
  children: ReactNode;
};

export function KeyedSlider({ svgRef, x0, x1, label, valueText, value, range, fromFraction, onChange, onGrab, children }: KeyedSliderProps) {
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
    const next = stepByKey(value, e.key, range);
    if (next === null) return;
    e.preventDefault();
    if (next !== value) onChange(next);
  };
  const end = () => {
    setDragging(false);
    onGrab?.(false);
  };
  return (
    <div
      className={cn("cursor-ew-resize touch-none rounded-xl", FOCUS_RING)}
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        setDragging(true);
        onGrab?.(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        follow(e);
      }}
      onPointerMove={(e) => dragging && follow(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {children}
    </div>
  );
}
