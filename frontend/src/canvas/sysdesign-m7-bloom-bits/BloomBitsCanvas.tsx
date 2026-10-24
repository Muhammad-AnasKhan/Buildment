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
  BITS_LADDER,
  BITS_MAX,
  BITS_MIN,
  DEFAULT_BITS,
  LOOKUPS,
  amberDots,
  bitsFromFraction,
  bitsToFraction,
  bloomVerdict,
  curvePoints,
  falsePositiveRate,
  formatMemory,
  formatRate,
  hashCount,
  oneIn,
  withCommas,
  wastedReadsPer1000,
} from "../models/bloom";

// 7.3: drag the bits per key. A strip of 100 lookups for keys that are not
// stored shows how many wrongly say "maybe"; a curve of that rate against bits
// has a dot that rides it; a bar shows the filter's memory for a billion keys.

const W = 420;
const H = 340;
const COLS = 20;
const PITCH = 11.5;
const DOT_R = 4.2;
const DOTS = { x0: 22, y0: 70 };
const PLOT = { x0: 42, x1: 386, top: 148, bottom: 224, maxPct: 40 };
const RAIL = { x0: 42, x1: 386, y: 300 };
const MEM = { y: 250, h: 10 };
const SWEEP_PER_S = 12;

const xOfBits = (b: number) => PLOT.x0 + ((b - BITS_MIN) / (BITS_MAX - BITS_MIN)) * (PLOT.x1 - PLOT.x0);
const yOfRate = (fp: number) => PLOT.bottom - Math.min(1, (fp * 100) / PLOT.maxPct) * (PLOT.bottom - PLOT.top);

const CURVE = curvePoints()
  .map((p, i) => `${i === 0 ? "M" : "L"}${xOfBits(p.bits).toFixed(1)} ${yOfRate(p.rate).toFixed(1)}`)
  .join(" ");

const MARKS: RailMark[] = BITS_LADDER.map((b) => ({ at: bitsToFraction(b), label: String(b) }));

export function BloomBitsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [bits, setBits] = useState<number>(DEFAULT_BITS);

  const fp = falsePositiveRate(bits);
  const amber = amberDots(bits);
  const verdict = bloomVerdict(bits);
  const rate = formatRate(bits);
  const dotX = xOfBits(bits);
  const dotY = yOfRate(fp);
  const rateTone = fp > 0.05 ? TONES.warn : fp >= 0.005 ? TONES.accent : TONES.good;
  const memFill = (bits / BITS_MAX) * (PLOT.x1 - PLOT.x0);
  const sweep = clock.reduced ? -1 : Math.floor(clock.seconds * SWEEP_PER_S) % LOOKUPS;

  const valueText = `${bits} bits per key: ${rate} of lookups for absent keys wrongly say maybe, about ${wastedReadsPer1000(bits)} in 1,000. Memory for a billion keys: ${formatMemory(bits)}. ${verdict.text}`;
  const description = `${LOOKUPS} lookups for keys that are not stored. With ${bits} bits per key and ${hashCount(bits)} hash functions, ${amber} of them wrongly say maybe (${rate}), about 1 in ${withCommas(oneIn(bits))}. The filter needs ${formatMemory(bits)} for a billion keys. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the handle to change the <b>bits per key</b>, or use the arrow keys.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* 100 lookups for keys that are not stored. */}
          <text x={22} y={58} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>100 lookups for keys that are not stored</text>
          {Array.from({ length: LOOKUPS }, (_, i) => {
            const cx = DOTS.x0 + (i % COLS) * PITCH;
            const cy = DOTS.y0 + Math.floor(i / COLS) * PITCH;
            const wrong = i < amber;
            return (
              <g key={i}>
                {i === sweep ? <circle cx={cx} cy={cy} r={DOT_R + 2.5} className={cn("fill-none", wrong ? TONES.warn.stroke : NEUTRAL.faintStroke)} strokeWidth={1.25} /> : null}
                <circle cx={cx} cy={cy} r={DOT_R} className={cn(wrong ? TONES.warn.solidFill : NEUTRAL.faintFill, "transition-colors duration-200 motion-reduce:transition-none")} />
              </g>
            );
          })}
          <g>
            <circle cx={26} cy={132} r={DOT_R} className={NEUTRAL.faintFill} />
            <text x={36} y={136} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>says no (right)</text>
            <circle cx={140} cy={132} r={DOT_R} className={TONES.warn.solidFill} />
            <text x={150} y={136} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>says maybe (wrong)</text>
          </g>

          {/* The exact rate, beside the strip. */}
          <text x={274} y={92} className={cn(rateTone.text, "text-[26px] font-bold tabular-nums")}>{rate}</text>
          <text x={274} y={110} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>say maybe by mistake</text>
          <text x={274} y={125} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium tabular-nums")}>{`about 1 in ${withCommas(oneIn(bits))}`}</text>

          {/* The curve: wrong maybes against bits per key. */}
          {[0, 20, 40].map((pct) => {
            const y = PLOT.bottom - (pct / PLOT.maxPct) * (PLOT.bottom - PLOT.top);
            return (
              <g key={pct}>
                <line x1={PLOT.x0} x2={PLOT.x1} y1={y} y2={y} strokeWidth={1} strokeDasharray={pct === 0 ? undefined : "3 4"} className={NEUTRAL.faintStroke} />
                <text x={PLOT.x0 - 13} y={y + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`${pct}%`}</text>
              </g>
            );
          })}
          <text x={PLOT.x1} y={PLOT.top - 6} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>wrong maybes</text>
          <path d={CURVE} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
          <line x1={dotX} x2={dotX} y1={dotY} y2={PLOT.bottom} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.faintStroke} />
          <circle cx={dotX} cy={dotY} r={9} className={rateTone.softFill} />
          <circle cx={dotX} cy={dotY} r={6} className={cn(rateTone.solidFill, "stroke-card")} strokeWidth={2} />

          {/* Memory for a billion keys. */}
          <text x={PLOT.x0} y={MEM.y - 5} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Filter memory for a billion keys</text>
          <text x={PLOT.x1} y={MEM.y - 5} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{formatMemory(bits)}</text>
          <rect x={PLOT.x0} y={MEM.y} width={PLOT.x1 - PLOT.x0} height={MEM.h} rx={5} className="fill-muted" />
          <rect x={PLOT.x0} y={MEM.y} width={memFill} height={MEM.h} rx={5} className={cn(TONES.good.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />

          {/* The rail: drag the bits per key. */}
          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Bits per key"
            valueText={valueText}
            value={bits}
            ladder={BITS_LADDER}
            fromFraction={bitsFromFraction}
            onChange={setBits}
          >
            <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={bitsToFraction(bits)} marks={MARKS} ends={["fewer bits", "more bits"]} caption={`${bits} bits per key`} />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}
