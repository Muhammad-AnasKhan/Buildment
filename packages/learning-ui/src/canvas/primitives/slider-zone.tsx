"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { FOCUS_RING } from "./tones";

// Controls that live on top of a picture. The picture draws the bar, the knob
// or the chip in SVG; these are real HTML elements laid over the same spot
// (placed in viewBox units, scaled with percentages), so they get pointer
// capture, keys, a focus ring and a 44 px target without leaving the picture.
// Use inside a `relative` wrapper that holds the SVG.

export type ZoneBox = { x: number; y: number; w: number; h: number };
export type ZoneView = { w: number; h: number };

const place = (box: ZoneBox, view: ZoneView): CSSProperties => ({
  left: `${(box.x / view.w) * 100}%`,
  top: `${(box.y / view.h) * 100}%`,
  width: `${(box.w / view.w) * 100}%`,
  height: `${(box.h / view.h) * 100}%`,
});

type SliderZoneProps = {
  view: ZoneView;
  box: ZoneBox;
  label: string;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  valueText: string;
  /** The pointer's position inside the zone, 0 to 1 across and down. */
  onFraction: (fx: number, fy: number) => void;
  /** Return true when the key was used. */
  onKey: (key: string) => boolean;
  /** Called with true while a finger or mouse is down, so a clock can pause. */
  onPress?: (pressed: boolean) => void;
  /** Lets the learner see the target while testing: a faint ring on hover. */
  className?: string;
};

export function SliderZone({ view, box, label, valueNow, valueMin, valueMax, valueText, onFraction, onKey, onPress, className }: SliderZoneProps) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const follow = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return;
    onFraction(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)));
  };
  const end = () => {
    setDragging(false);
    onPress?.(false);
  };
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      style={place(box, view)}
      className={cn("absolute cursor-ew-resize touch-none rounded-xl", FOCUS_RING, className)}
      onKeyDown={(e: KeyboardEvent) => {
        if (onKey(e.key)) e.preventDefault();
      }}
      onPointerDown={(e) => {
        setDragging(true);
        onPress?.(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        follow(e);
      }}
      onPointerMove={(e) => dragging && follow(e)}
      onPointerUp={end}
      onPointerCancel={end}
    />
  );
}

type OverlayButtonProps = {
  view: ZoneView;
  box: ZoneBox;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
};

/** A transparent button over a chip the picture draws. Real button: keys, focus ring, 44 px target. */
export function OverlayButton({ view, box, label, pressed, disabled, onClick }: OverlayButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      style={place(box, view)}
      className={cn("absolute cursor-pointer rounded-full bg-transparent disabled:cursor-not-allowed", FOCUS_RING)}
    />
  );
}
