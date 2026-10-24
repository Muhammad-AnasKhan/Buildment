"use client";

import type { ReactNode, RefObject } from "react";
import { cn } from "../../lib/utils";
import { TightRailSlider } from "./tight-rail-slider";
import { NEUTRAL, TONES } from "./tones";

// A rail with a few named stops, drawn inside a beat picture: the knob snaps to
// the stop nearest the finger or the arrow keys. Each stop has a value, a
// position (evenly spaced unless the caller gives one, for example log spacing)
// and a label of one or two short lines under the rail. A disabled rail is
// drawn faded and leaves the tab order, so a picture can grey out an input
// that does not apply. Data-driven: another course can pass its own stops.

export type RailStop = {
  value: number;
  /** One or two short lines under the stop. */
  label: string | readonly string[];
  /** 0 to 1 along the rail; defaults to even spacing. */
  at?: number;
};

type SnapStopsRailProps = {
  svgRef: RefObject<SVGSVGElement | null>;
  x0: number;
  x1: number;
  y: number;
  stops: readonly RailStop[];
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  valueText: string;
  /** Stops at or below the value are drawn as passed (a filled dot). */
  fillPassed?: boolean;
  /** The knob's content (an icon or a number); the default is a plain knob. */
  knob?: ReactNode;
  /** Pale ring colour behind the knob. */
  tone?: "accent" | "warn" | "bad";
  disabled?: boolean;
  /** Text size class for the labels. */
  labelClass?: string;
  onGrab?: (grabbed: boolean) => void;
  /** Room under the rail that still counts as the slider, for taller labels; the default fits one or two lines. */
  below?: number;
};

const r1 = (v: number) => Math.round(v * 10) / 10;

/** The x of each stop on a rail from x0 to x1. */
export function stopXs(stops: readonly RailStop[], x0: number, x1: number): number[] {
  const last = Math.max(1, stops.length - 1);
  return stops.map((s, i) => r1(x0 + (s.at ?? i / last) * (x1 - x0)));
}

/** The index of the stop whose position is nearest a 0 to 1 pointer position. */
export function nearestStop(stops: readonly RailStop[], fraction: number): number {
  const last = Math.max(1, stops.length - 1);
  let best = 0;
  let gap = Infinity;
  stops.forEach((s, i) => {
    const d = Math.abs((s.at ?? i / last) - fraction);
    if (d < gap) {
      gap = d;
      best = i;
    }
  });
  return best;
}

export function SnapStopsRail({ svgRef, x0, x1, y, stops, value, onChange, ariaLabel, valueText, fillPassed = true, knob, tone = "accent", disabled = false, labelClass, onGrab, below }: SnapStopsRailProps) {
  const xs = stopXs(stops, x0, x1);
  const at = Math.max(0, stops.findIndex((s) => s.value === value));
  const last = stops.length - 1;
  const lines = (s: RailStop) => (typeof s.label === "string" ? [s.label] : s.label);
  const drawing = (
    <g aria-hidden>
      <line x1={x0} x2={x1} y1={y} y2={y} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
      {!disabled ? <line x1={x0} x2={xs[at]} y1={y} y2={y} strokeWidth={5} strokeLinecap="round" className={cn(TONES[tone].stroke, "transition-all duration-200 motion-reduce:transition-none")} /> : null}
      {xs.map((x, i) => (
        <circle key={stops[i].value} cx={x} cy={y} r={3.2} className={!disabled && fillPassed && i <= at ? "fill-card" : NEUTRAL.faintFill} />
      ))}
      {stops.map((s, i) => (
        <text key={`t-${s.value}`} x={xs[i]} y={y + 29} textAnchor="middle" className={cn(!disabled && i === at ? cn(NEUTRAL.text, "font-bold") : cn(NEUTRAL.mutedText, "font-medium"), labelClass ?? "text-[11.5px]", "tabular-nums")}>
          {lines(s).map((line, k) => (
            <tspan key={k} x={xs[i]} dy={k === 0 ? 0 : 13}>
              {line}
            </tspan>
          ))}
        </text>
      ))}
      {!disabled ? (
        <g style={{ transform: `translate(${xs[at]}px, ${y}px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
          <circle r={19} className={TONES[tone].softFill} />
          <circle r={13} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={2.5} />
          {knob}
        </g>
      ) : null}
    </g>
  );
  if (disabled) {
    return (
      <g role="slider" aria-label={ariaLabel} aria-disabled="true" aria-valuemin={stops[0].value} aria-valuemax={stops[last].value} aria-valuenow={value} aria-valuetext={`${valueText} (not used here)`} opacity={0.45}>
        {drawing}
      </g>
    );
  }
  const keyed = (v: number, key: string): number | null => {
    const i = Math.max(0, stops.findIndex((s) => s.value === v));
    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        return stops[Math.min(last, i + 1)].value;
      case "ArrowLeft":
      case "ArrowDown":
        return stops[Math.max(0, i - 1)].value;
      case "Home":
        return stops[0].value;
      case "End":
        return stops[last].value;
      default:
        return null;
    }
  };
  return (
    <TightRailSlider
      svgRef={svgRef}
      x0={x0}
      x1={x1}
      y={y}
      label={ariaLabel}
      valueText={valueText}
      value={value}
      min={stops[0].value}
      max={stops[last].value}
      fromFraction={(f) => stops[nearestStop(stops, f)].value}
      onKey={keyed}
      onChange={onChange}
      onGrab={onGrab}
      above={24}
      below={below ?? (lines(stops[0]).length > 1 ? 44 : 34)}
      side={18}
    >
      {drawing}
    </TightRailSlider>
  );
}
