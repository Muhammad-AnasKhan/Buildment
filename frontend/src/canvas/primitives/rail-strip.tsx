"use client";

import { useRef } from "react";
import { PictureSlider, SliderRail, type RailMark } from "./picture-slider";
import { DotGrid } from "./svg-parts";

// A rail under a picture that is its own small SVG, so the cards above it can
// be tapped without moving the slider. It sits flush with the picture on the
// same dotted canvas, and works like the rail inside the traffic playground:
// drag anywhere on it, or use the arrow keys, Page keys, Home and End.
// Data-driven: another course passes its own ladder, marks and words.

export const RAIL_W = 420;
export const RAIL_H = 80;
const RAIL = { x0: 34, x1: 386, y: 34 };

export type RailStripProps = {
  label: string;
  valueText: string;
  value: number;
  /** Arrow keys walk this ladder. */
  ladder: readonly number[];
  /** Handle position, 0 to 1. */
  fraction: number;
  fromFraction: (f: number) => number;
  onChange: (value: number) => void;
  marks?: RailMark[];
  /** Words under the two ends of the rail. */
  ends: [string, string];
  /** One line under the middle of the rail. */
  caption: string;
};

export function RailStrip({ label, valueText, value, ladder, fraction, fromFraction, onChange, marks, ends, caption }: RailStripProps) {
  const svg = useRef<SVGSVGElement>(null);
  return (
    <PictureSlider svgRef={svg} x0={RAIL.x0} x1={RAIL.x1} label={label} valueText={valueText} value={value} ladder={ladder} fromFraction={fromFraction} onChange={onChange}>
      <svg ref={svg} viewBox={`0 0 ${RAIL_W} ${RAIL_H}`} aria-hidden className="block h-auto w-full select-none">
        <DotGrid width={RAIL_W} height={RAIL_H} />
        <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={fraction} marks={marks} ends={ends} caption={caption} />
      </svg>
    </PictureSlider>
  );
}
