"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail, type RailMark } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  band,
  bytesText,
  DEFAULT_REGISTERS,
  EXACT_BYTES,
  hllVerdict,
  LINE_MAX,
  memoryBytes,
  percentText,
  ratioText,
  REGISTER_LADDER,
  registersFromFraction,
  registersToFraction,
  registersValueText,
  SHOPPERS,
  standardError,
  wobble,
} from "../models/hll-registers";
import { withCommas } from "../models/picture-controls";

// 23.4: drag the registers. The number line shows the true count (50 million)
// with a dark band for one standard error and a light band for two; a small
// diamond is one run's estimate, wobbling inside them. Two bars compare the
// memory of HyperLogLog with an exact set of 400 MB.

const W = 420;
const H = 438;
const LINE = { x0: 24, x1: 396, top: 96, bottom: 156 };
const RAIL = { x0: 42, x1: 378, y: 284 };
const BARS = { x0: 24, x1: 396 };
const MARKS: RailMark[] = REGISTER_LADDER.map((m) => ({ at: registersToFraction(m), label: withCommas(m) }));

const X = (v: number) => LINE.x0 + (Math.max(0, Math.min(LINE_MAX, v)) / LINE_MAX) * (LINE.x1 - LINE.x0);

export function HllRegistersCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [m, setM] = useState<number>(DEFAULT_REGISTERS);

  const s = standardError(m);
  const one = band(m, 1);
  const two = band(m, 2);
  const verdict = hllVerdict(m);
  const tone = TONES[verdict.tone];
  const mem = memoryBytes(m);
  const barW = BARS.x1 - BARS.x0;
  const hllW = Math.max(2.5, (mem / EXACT_BYTES) * barW);
  const estimate = clock.reduced ? SHOPPERS : wobble(m, clock.seconds);
  const mid = X(SHOPPERS);
  const valueText = registersValueText(m);
  const description = `HyperLogLog with ${withCommas(m)} registers counts 50 million different shoppers with a typical error of ${percentText(s)}, using ${bytesText(mem)} where an exact set takes 400 MB, which is ${ratioText(m)}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the handle to change the <b>registers</b>, or use the arrow keys.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The number line, with the true count at its middle. */}
          <text x={mid} y={64} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>True count: 50 million shoppers</text>
          <line x1={LINE.x0} x2={LINE.x1} y1={LINE.bottom} y2={LINE.bottom} strokeWidth={2} className={NEUTRAL.faintStroke} />
          <rect x={X(two.lo).toFixed(1)} y={LINE.top} width={Math.max(2, X(two.hi) - X(two.lo)).toFixed(1)} height={LINE.bottom - LINE.top} rx={4} className={cn(tone.solidFill, "opacity-25")} />
          <rect x={X(one.lo).toFixed(1)} y={LINE.top} width={Math.max(2, X(one.hi) - X(one.lo)).toFixed(1)} height={LINE.bottom - LINE.top} rx={3} className={cn(tone.solidFill, "opacity-60")} />
          <line x1={mid} x2={mid} y1={LINE.top - 12} y2={LINE.bottom + 6} strokeWidth={1.5} className={NEUTRAL.doneStroke} />
          {clock.reduced ? null : (
            <path d={`M${X(estimate).toFixed(1)} ${LINE.top + 18} l5 5 l-5 5 l-5 -5 Z`} strokeWidth={1.5} className={cn("fill-card", TONES.accent.stroke)} aria-hidden />
          )}
          <text x={LINE.x0} y={LINE.bottom + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0</text>
          <text x={LINE.x1} y={LINE.bottom + 20} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>100 million</text>

          {/* The error, written beside the band. */}
          <text x={mid} y={198} textAnchor="middle" className={cn(tone.text, "text-[22px] font-bold tabular-nums")}>{`± ${percentText(s)}`}</text>
          <text x={mid} y={216} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>typical error of the count</text>

          {/* Legend for the three shapes on the line. */}
          <g aria-hidden>
            <path d="M24 234 l5 5 l-5 5 l-5 -5 Z" strokeWidth={1.5} className={cn("fill-card", TONES.accent.stroke)} />
            <text x={36} y={243} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>one estimate</text>
            <rect x={150} y={234} width={12} height={10} rx={2} className={cn(tone.solidFill, "opacity-60")} />
            <text x={168} y={243} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>1 error</text>
            <rect x={238} y={234} width={12} height={10} rx={2} className={cn(tone.solidFill, "opacity-25")} />
            <text x={256} y={243} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>2 errors</text>
          </g>

          {/* The rail: registers. */}
          <RailSlider svgRef={svg} x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} label="Registers" valueText={valueText} value={m} ladder={REGISTER_LADDER} fromFraction={registersFromFraction} onChange={setM}>
            <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={registersToFraction(m)} marks={MARKS} ends={["fewer", "more"]} caption={`${withCommas(m)} registers`} />
          </RailSlider>

          {/* Memory: the sketch against an exact set. */}
          <text x={BARS.x0} y={348} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>HyperLogLog memory</text>
          <text x={BARS.x1} y={348} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{bytesText(mem)}</text>
          <rect x={BARS.x0} y={354} width={barW} height={10} rx={5} className="fill-muted" />
          <rect x={BARS.x0} y={354} width={hllW.toFixed(1)} height={10} rx={5} className={TONES.good.solidFill} />
          <text x={BARS.x0} y={388} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Exact set of 50 million IDs</text>
          <text x={BARS.x1} y={388} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{bytesText(EXACT_BYTES)}</text>
          <rect x={BARS.x0} y={394} width={barW} height={10} rx={5} className={TONES.accent.solidFill} />
          <text x={mid} y={426} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{ratioText(m)}</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
