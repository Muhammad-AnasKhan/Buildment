"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { ORIGIN_BUDGET_TBIT, PEAK_SENT_TBIT } from "../models/lamha-numbers";
import {
  budgetBarShare,
  CACHE_DEFAULT,
  CACHE_STOPS,
  cacheText,
  CATALOGUE,
  decadesBelowTop,
  missShare,
  originText,
  percentText,
  SKEW_DEFAULT,
  SKEW_STOPS,
  skewPlay,
  skewVerdict,
  stillMissDots,
  valueText,
  wholePercent,
} from "../models/lamha-skew";

const W = 420;
const H = 546;
const PLOT = { x0: 44, x1: 404, top: 58, base: 182, decades: 12 };
const EDGE = { x: 100, y: 268 };
const ORIGIN = { x: 320, y: 268 };
const BAR = { x0: 20, x1: 400, y: 340 };
const SKEW_RAIL = { x0: 40, x1: 380, y: 416 };
const CACHE_RAIL = { x0: 40, x1: 380, y: 506 };
const DOT_SPACING = 16;
const DOT_SPEED = 56;
const MAX_EXP = Math.log10(CATALOGUE);

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOfRank = (rank: number) => r1(PLOT.x0 + (Math.log10(Math.max(1, rank)) / MAX_EXP) * (PLOT.x1 - PLOT.x0));
const yOfDecades = (d: number) => r1(PLOT.top + (Math.min(PLOT.decades, d) / PLOT.decades) * (PLOT.base - PLOT.top));

/** Dots along a horizontal link, moving right, spaced `spacing` apart. */
function dotsOnLink(x0: number, x1: number, spacing: number, seconds: number): number[] {
  if (!Number.isFinite(spacing)) return [];
  const out: number[] = [];
  for (let d = (seconds * DOT_SPEED) % spacing; x0 + d <= x1; d += spacing) out.push(r1(x0 + d));
  return out;
}

/** 27.4 beat 5: drag the skew and the cache size; the curve, the hit rate and the origin follow. */
export function SkewPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [skew, setSkew] = useState<number>(SKEW_DEFAULT);
  const [cache, setCache] = useState<number>(CACHE_DEFAULT);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  const m = skewPlay(skew, cache);
  const verdict = skewVerdict(m);
  const tone = verdict.tone;

  // The curve is drawn as short segments, so each one has a small box of its own.
  const segments: [number, number, number, number][] = [];
  for (let e = 0; e < MAX_EXP - 1e-9; e += 0.25) {
    const a = Math.pow(10, e);
    const b = Math.pow(10, Math.min(MAX_EXP, e + 0.25));
    segments.push([xOfRank(a), yOfDecades(decadesBelowTop(a, skew)), xOfRank(b), yOfDecades(decadesBelowTop(b, skew))]);
  }
  const xc = xOfRank(cache);
  const shade: string[] = [`M${PLOT.x0} ${PLOT.base}`];
  for (let e = 0; e <= Math.log10(cache) + 1e-9; e += 0.25) shade.push(`L${xOfRank(Math.pow(10, e))} ${yOfDecades(decadesBelowTop(Math.pow(10, e), skew))}`);
  shade.push(`L${xc} ${yOfDecades(decadesBelowTop(cache, skew))} L${xc} ${PLOT.base} Z`);

  const LINK = { x0: EDGE.x + 60, x1: ORIGIN.x - 60, y: EDGE.y };
  const spacing = DOT_SPACING / Math.max(missShare(m), 1e-9);
  const incoming = clock.reduced ? [14, 30] : dotsOnLink(8, EDGE.x - 60, DOT_SPACING, clock.seconds);
  const still = stillMissDots(m);
  const missDots = clock.reduced
    ? Array.from({ length: still }, (_, i) => r1(LINK.x0 + ((i + 1) * (LINK.x1 - LINK.x0)) / (still + 1)))
    : dotsOnLink(LINK.x0, LINK.x1, spacing, clock.seconds);

  const barX = (v: number) => r1(BAR.x0 + budgetBarShare(v) * (BAR.x1 - BAR.x0));
  const budgetX = barX(ORIGIN_BUDGET_TBIT);
  const description = `Lamha edge cache. Views follow a Zipf shape with skew ${skew.toFixed(1)}, and each edge keeps ${cacheText(cache)} of 1 billion videos. ${valueText(m)}. ${verdict.text}.`;
  const stopLabel = (v: number): string[] => (v === SKEW_STOPS[0] ? [v.toFixed(1), "mild"] : v === SKEW_STOPS[SKEW_STOPS.length - 1] ? [v.toFixed(1), "steep"] : [v.toFixed(1)]);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>skew</b> rail and the <b>cache size</b> rail, or use the arrow keys.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The popularity curve: views per video against rank, both on log scales. */}
          <g aria-hidden>
            <path d={shade.join(" ")} className={cn(TONES[tone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} opacity={0.9} />
            {segments.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2.5} strokeLinecap="round" className={TONES.accent.stroke} />
            ))}
            <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
            <line x1={xc} x2={xc} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.75} strokeDasharray="4 3" className={TONES[tone].stroke} />
            <text x={r1((PLOT.x0 + xc) / 2)} y={PLOT.base - 24} textAnchor="middle" className={cn(TONES[tone].text, "text-[15px] font-bold tabular-nums")}>
              {`${wholePercent(m.hit)} of plays`}
            </text>
            <text x={r1((PLOT.x0 + xc) / 2)} y={PLOT.base - 8} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
              kept at the edge
            </text>
            {[
              { rank: 1, label: "1", anchor: "start" as const },
              { rank: 1e3, label: "1 thousand", anchor: "middle" as const },
              { rank: 1e6, label: "1 million", anchor: "middle" as const },
              { rank: 1e9, label: "1 billion", anchor: "end" as const },
            ].map((t) => (
              <g key={t.rank}>
                <line x1={xOfRank(t.rank)} x2={xOfRank(t.rank)} y1={PLOT.base} y2={PLOT.base + 5} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                <text x={xOfRank(t.rank)} y={PLOT.base + 19} textAnchor={t.anchor} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                  {t.label}
                </text>
              </g>
            ))}
            <text x={PLOT.x0} y={PLOT.top - 8} textAnchor="start" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>views per video, log scale</text>
            <text x={PLOT.x0} y={PLOT.base + 36} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>rank of the video, most watched first</text>
          </g>

          {/* Requests reach the edge; the misses go on to the origin. */}
          <g aria-hidden>
            <line x1={8} x2={EDGE.x - 60} y1={EDGE.y} y2={EDGE.y} strokeWidth={2} className={NEUTRAL.faintStroke} />
            <line x1={LINK.x0} x2={LINK.x1} y1={LINK.y} y2={LINK.y} strokeWidth={2} className={NEUTRAL.faintStroke} />
            {incoming.map((x) => (
              <circle key={`in-${x}`} cx={x} cy={EDGE.y} r={3.6} className={TONES.accent.solidFill} />
            ))}
            {missDots.map((x) => (
              <circle key={`miss-${x}`} cx={x} cy={LINK.y} r={3.6} className={TONES.warn.solidFill} />
            ))}
          </g>
          <SvgNode x={EDGE.x} y={EDGE.y} label="CDN edge" kind="cdn" status={`${percentText(m.hit)} hits`} statusTone="accent" />
          <SvgNode x={ORIGIN.x} y={ORIGIN.y} label="Origin" kind="database" status={`${originText(m.origin)} Tbit/s`} statusTone={tone} mark={tone} />

          {/* The origin load against its budget, on a bar from 0 to the 12.5 Tbit/s sent with no cache. */}
          <g aria-hidden>
            <text x={budgetX} y={BAR.y - 12} textAnchor="start" className={cn(TONES.good.text, "text-[11.5px] font-semibold")}>budget 1 Tbit/s</text>
            <line x1={BAR.x0} x2={BAR.x1} y1={BAR.y} y2={BAR.y} strokeWidth={9} strokeLinecap="round" className="stroke-muted" />
            <line x1={BAR.x0} x2={Math.max(BAR.x0 + 0.1, barX(m.origin))} y1={BAR.y} y2={BAR.y} strokeWidth={9} strokeLinecap="round" className={cn(TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            <line x1={budgetX} x2={budgetX} y1={BAR.y - 10} y2={BAR.y + 10} strokeWidth={2.5} strokeLinecap="round" className={TONES.good.stroke} />
            <circle cx={barX(m.origin)} cy={BAR.y} r={6} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={2} />
            <text x={BAR.x0} y={BAR.y + 28} className={cn(NEUTRAL.mutedText, LABEL_HALO, "text-[11.5px]")}>origin load</text>
            <text x={BAR.x1} y={BAR.y + 28} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`${PEAK_SENT_TBIT} Tbit/s with no cache`}</text>
          </g>

          {/* The skew rail. */}
          <text x={SKEW_RAIL.x0 - 6} y={SKEW_RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>skew: how unevenly views are spread</text>
          <SnapStopsRail
            svgRef={svg}
            x0={SKEW_RAIL.x0}
            x1={SKEW_RAIL.x1}
            y={SKEW_RAIL.y}
            stops={SKEW_STOPS.map((v) => ({ value: v, label: stopLabel(v) }))}
            value={skew}
            onChange={setSkew}
            ariaLabel="Skew of the views"
            valueText={valueText(m)}
            onGrab={grab}
          />

          {/* The cache rail, spaced by the log of the size. */}
          <text x={CACHE_RAIL.x0 - 6} y={CACHE_RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>videos kept at the edge</text>
          <SnapStopsRail
            svgRef={svg}
            x0={CACHE_RAIL.x0}
            x1={CACHE_RAIL.x1}
            y={CACHE_RAIL.y}
            stops={CACHE_STOPS.map((v) => ({ value: v, label: cacheText(v), at: (Math.log10(v) - Math.log10(CACHE_STOPS[0])) / (Math.log10(CACHE_STOPS[CACHE_STOPS.length - 1]) - Math.log10(CACHE_STOPS[0])) }))}
            value={cache}
            onChange={setCache}
            ariaLabel="Videos kept at the edge"
            valueText={valueText(m)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
