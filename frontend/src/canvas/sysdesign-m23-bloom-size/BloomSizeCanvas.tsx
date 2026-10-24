"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail, type RailMark } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  amberTypos,
  bestHashes,
  BITS_LADDER,
  bitsFromFraction,
  bitsToFraction,
  bloomSizeVerdict,
  CELLS,
  DEFAULT_BITS,
  DEFAULT_HASHES,
  filledCells,
  HASH_LADDER,
  HASH_MAX,
  HASH_MIN,
  hashCurve,
  hashesFromFraction,
  hashesToFraction,
  memoryMb,
  memoryText,
  oneInText,
  rateText,
  shareSet,
  sharePercent,
  sizeValueText,
  TYPOS,
  wrongMaybe,
} from "../models/bloom-hashes";

// 23.4: drag the bits per word and the number of hashes. A row of 50 cells shows
// how full the filter is, a curve shows the wrong-maybe rate for every hash
// count (log scale) with the best count ringed, a bar shows the memory for
// 100 million words, and a strip of 100 typos shows how many slip through.

const W = 420;
const H = 446;
const CELL = { x0: 8, pitch: 8.08, w: 6.6, y: 64, h: 16 };
const PLOT = { x0: 46, x1: 394, top: 112, bottom: 208, decades: 5 };
const RAIL_K = { x0: PLOT.x0, x1: PLOT.x1, y: 246 };
const RAIL_B = { x0: PLOT.x0, x1: PLOT.x1, y: 316 };
const MEM = { y: 384, h: 10 };
const TYPO = { x0: 12, pitch: 8, r: 3, y: [426, 435] as const };
const SWEEP_PER_S = 12;
const MEM_MAX_MB = memoryMb(20);

const xOfK = (k: number) => PLOT.x0 + hashesToFraction(k) * (PLOT.x1 - PLOT.x0);
/** Log scale from 0.001% to 100%: five decades, so a rate of 0.01% and one of 10% both fit. */
const yOfRate = (fp: number) => {
  const f = (Math.log10(Math.max(fp, 1e-5)) + PLOT.decades) / PLOT.decades;
  return PLOT.bottom - Math.max(0, Math.min(1, f)) * (PLOT.bottom - PLOT.top);
};

const K_MARKS: RailMark[] = HASH_LADDER.map((k) => ({ at: hashesToFraction(k), label: [1, 5, 10, 15, 20].includes(k) ? String(k) : undefined }));
const B_MARKS: RailMark[] = BITS_LADDER.map((b) => ({ at: bitsToFraction(b), label: String(b) }));
const GRID: { exp: number; label?: string }[] = [
  { exp: 0, label: "100%" },
  { exp: -1 },
  { exp: -2, label: "1%" },
  { exp: -3 },
  { exp: -4, label: "0.01%" },
];

export function BloomSizeCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [bits, setBits] = useState<number>(DEFAULT_BITS);
  const [hashes, setHashes] = useState<number>(DEFAULT_HASHES);

  const fp = wrongMaybe(bits, hashes);
  const best = bestHashes(bits);
  const verdict = bloomSizeVerdict(bits, hashes);
  const share = shareSet(bits, hashes);
  const filled = filledCells(bits, hashes);
  const amber = amberTypos(bits, hashes);
  const rate = rateText(fp);
  const tone = TONES[verdict.tone];
  const crowded = share > 0.6;
  const curve = useMemo(() => hashCurve(bits).map((p, i) => `${i === 0 ? "M" : "L"}${xOfK(p.hashes).toFixed(1)} ${yOfRate(p.rate).toFixed(1)}`).join(" "), [bits]);
  const dotX = xOfK(hashes);
  const dotY = yOfRate(fp);
  const bestX = xOfK(best);
  const bestY = yOfRate(wrongMaybe(bits, best));
  const sweep = clock.reduced ? -1 : Math.floor(clock.seconds * SWEEP_PER_S) % TYPOS;
  const valueText = sizeValueText(bits, hashes);
  const description = `Bloom filter with ${bits} bits per word and ${hashes} hashes. ${rate} of typos wrongly say maybe, ${oneInText(fp)}. ${sharePercent(bits, hashes)} of the bits are set. ${memoryText(bits)} for 100 million words. ${verdict.text}.`;

  // The rate pill sits above the marker, or below it near the top of the plot, and stays inside the plot.
  const pillW = rate.length * 8 + 18;
  const pillX = Math.max(PLOT.x0 + 2, Math.min(PLOT.x1 - pillW - 2, dotX - pillW / 2));
  const pillY = dotY - 36 >= PLOT.top - 2 ? dotY - 36 : dotY + 14;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>hashes</b> under the curve, then the <b>bits per word</b>. Arrow keys work too.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The row of bits: how many are set to 1. */}
          <text x={8} y={58} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Bits in the filter (1 = set)</text>
          <text x={W - 8} y={58} textAnchor="end" className={cn(crowded ? TONES.warn.text : TONES.accent.text, "text-[12.5px] font-bold tabular-nums")}>{`${sharePercent(bits, hashes)} set`}</text>
          {Array.from({ length: CELLS }, (_, i) => (
            <rect key={i} x={(CELL.x0 + i * CELL.pitch).toFixed(2)} y={CELL.y} width={CELL.w} height={CELL.h} rx={2} className={cn(SHAPE_TRANSITION, i < filled ? (crowded ? TONES.warn.solidFill : TONES.accent.solidFill) : "fill-muted")} />
          ))}

          {/* The curve: wrong maybes against hashes, log scale. */}
          <text x={8} y={102} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Wrong maybes for each hash count</text>
          <g aria-hidden>
            <circle cx={W - 104} cy={98} r={6} strokeWidth={2} className={cn("fill-none", TONES.good.stroke)} />
            <text x={W - 94} y={102} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>best</text>
            <circle cx={W - 56} cy={98} r={4.5} className={tone.solidFill} />
            <text x={W - 47} y={102} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>yours</text>
          </g>
          {GRID.map((g) => {
            const yy = PLOT.bottom - ((g.exp + PLOT.decades) / PLOT.decades) * (PLOT.bottom - PLOT.top);
            return (
              <g key={g.exp}>
                <line x1={PLOT.x0} x2={PLOT.x1} y1={yy} y2={yy} strokeWidth={1} strokeDasharray="3 4" className={NEUTRAL.faintStroke} />
                {g.label ? <text x={PLOT.x0 - 6} y={yy + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{g.label}</text> : null}
              </g>
            );
          })}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.bottom} y2={PLOT.bottom} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          <path d={curve} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
          <line x1={dotX} x2={dotX} y1={dotY} y2={PLOT.bottom} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.faintStroke} />
          <circle cx={bestX} cy={bestY} r={9} strokeWidth={2.25} className={cn("fill-none", TONES.good.stroke)} />
          <circle cx={dotX} cy={dotY} r={6} strokeWidth={2} className={cn(tone.solidFill, "stroke-card", SHAPE_TRANSITION)} />
          <rect x={pillX.toFixed(1)} y={pillY} width={pillW} height={22} rx={11} className="fill-card" />
          <rect x={pillX.toFixed(1)} y={pillY} width={pillW} height={22} rx={11} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke)} />
          <text x={(pillX + pillW / 2).toFixed(1)} y={pillY + 15.5} textAnchor="middle" className={cn(tone.text, "text-[13px] font-bold tabular-nums")}>{rate}</text>

          {/* Rail 1: the number of hashes. */}
          <RailSlider svgRef={svg} x0={RAIL_K.x0} x1={RAIL_K.x1} y={RAIL_K.y} label="Hashes" valueText={valueText} value={hashes} ladder={HASH_LADDER} fromFraction={hashesFromFraction} onChange={setHashes}>
            <SliderRail x0={RAIL_K.x0} x1={RAIL_K.x1} y={RAIL_K.y} fraction={hashesToFraction(hashes)} marks={K_MARKS} ends={[`${HASH_MIN}`, `${HASH_MAX}`]} caption={`${hashes} ${hashes === 1 ? "hash" : "hashes"} (best: ${best})`} />
          </RailSlider>

          {/* Rail 2: the bits per word. */}
          <RailSlider svgRef={svg} x0={RAIL_B.x0} x1={RAIL_B.x1} y={RAIL_B.y} label="Bits per word" valueText={valueText} value={bits} ladder={BITS_LADDER} fromFraction={bitsFromFraction} onChange={setBits}>
            <SliderRail x0={RAIL_B.x0} x1={RAIL_B.x1} y={RAIL_B.y} fraction={bitsToFraction(bits)} marks={B_MARKS} ends={["fewer bits", "more bits"]} caption={`${bits} bits per word`} />
          </RailSlider>

          {/* Memory for 100 million words. */}
          <text x={PLOT.x0} y={MEM.y - 6} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Memory for 100 million words</text>
          <text x={PLOT.x1} y={MEM.y - 6} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{memoryText(bits)}</text>
          <rect x={PLOT.x0} y={MEM.y} width={PLOT.x1 - PLOT.x0} height={MEM.h} rx={5} className="fill-muted" />
          <rect x={PLOT.x0} y={MEM.y} width={((memoryMb(bits) / MEM_MAX_MB) * (PLOT.x1 - PLOT.x0)).toFixed(1)} height={MEM.h} rx={5} className={cn(TONES.good.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />

          {/* 100 typos: the first few say maybe by mistake. */}
          <text x={PLOT.x0} y={414} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>100 typos: amber ones wrongly say maybe</text>
          {Array.from({ length: TYPOS }, (_, i) => {
            const cx = TYPO.x0 + (i % 50) * TYPO.pitch;
            const cy = TYPO.y[i < 50 ? 0 : 1];
            const wrong = i < amber;
            return (
              <g key={i}>
                {i === sweep ? <circle cx={cx} cy={cy} r={TYPO.r + 2.5} strokeWidth={1.25} className={cn("fill-none", wrong ? TONES.warn.stroke : NEUTRAL.faintStroke)} /> : null}
                <circle cx={cx} cy={cy} r={TYPO.r} className={cn(wrong ? TONES.warn.solidFill : NEUTRAL.faintFill, SHAPE_TRANSITION)} />
              </g>
            );
          })}
        </svg>
      </div>
    </BeatFrame>
  );
}
