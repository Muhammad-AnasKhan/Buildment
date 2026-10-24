"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { HIT_MS, MISS_MS } from "../models/wasla-numbers";
import {
  HIT_DEFAULT,
  HIT_LADDER,
  HIT_MAX,
  HIT_SNAPS,
  hitFromFraction,
  MAX_NODES,
  missSpacing,
  msText,
  opsText,
  readPath,
  readPathValueText,
  readPathVerdict,
  stillMissDots,
  stripFraction,
} from "../models/wasla-read-path";

const W = 420;
const H = 384;
const STRIP = { x0: 76, x1: 404, avgY: 92, p99Y: 128, tickLabelY: 64 };
const CACHE = { x: 100, y: 200 };
const DB = { x: 324, y: 200 };
const NODE = { size: 14, gap: 5, perRow: 21, x0: 13, row1: 270, row2: 292 };
const RAIL = { x0: 30, x1: 390, y: 342 };
const CHIP = { w: 62, h: 22 };
const DOT_SPACING = 16;
const DOT_SPEED = 56;

const r1 = (v: number) => Math.round(v * 10) / 10;
const stripX = (ms: number) => r1(STRIP.x0 + stripFraction(ms) * (STRIP.x1 - STRIP.x0));

/** Dots along a horizontal link, moving right, spaced `spacing` apart. */
function dotsOnLink(x0: number, x1: number, spacing: number, seconds: number): number[] {
  if (!Number.isFinite(spacing)) return [];
  const out: number[] = [];
  for (let d = (seconds * DOT_SPEED) % spacing; x0 + d <= x1; d += spacing) out.push(r1(x0 + d));
  return out;
}

/** 20.4: drag the hit rate; the average slides, p99 jumps at 99, and the database nodes follow the misses. */
export function HitRatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [hit, setHit] = useState<number>(HIT_DEFAULT);
  const r = readPath(hit);
  const verdict = readPathVerdict(r);
  const valueText = readPathValueText(r);
  const tone: Tone = verdict.tone;

  const LINK = { x0: CACHE.x + 56, x1: DB.x - 56, y: CACHE.y };
  const incoming = clock.reduced ? [14, 30] : dotsOnLink(8, CACHE.x - 56, DOT_SPACING, clock.seconds);
  const still = stillMissDots(hit);
  const missDots = clock.reduced
    ? Array.from({ length: still }, (_, i) => r1(LINK.x0 + ((i + 1) * (LINK.x1 - LINK.x0)) / (still + 1)))
    : dotsOnLink(LINK.x0, LINK.x1, missSpacing(hit, DOT_SPACING), clock.seconds);

  const summary = `Hit rate ${hit} percent. Average ${msText(r.averageMs)} ms, p99 ${msText(r.p99Ms)} ms. The database gets ${r.operations.toLocaleString("en-US")} operations a second and needs ${r.nodes} nodes. ${verdict.text}.`;

  const chip = (label: string, ms: number, y: number, chipTone: Tone, glide: boolean) => (
    <g style={{ transform: `translate(${stripX(ms)}px, ${y}px)` }} className={glide ? "transition-transform duration-200 motion-reduce:transition-none" : undefined}>
      <rect x={-CHIP.w / 2} y={-CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} strokeWidth={1.5} className={cn(NEUTRAL.surface, TONES[chipTone].stroke)} />
      <rect x={-CHIP.w / 2} y={-CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} className={TONES[chipTone].softFill} />
      <text y={4.3} textAnchor="middle" className={cn(TONES[chipTone].text, "text-[12px] font-bold tabular-nums")}>
        {label}
      </text>
    </g>
  );

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>hit rate</b> rail in the picture, or use the arrow keys.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* The latency strip: two tracks on one scale from 0 to 3.5 ms. */}
          <g aria-hidden>
            <text x={stripX(HIT_MS)} y={STRIP.tickLabelY} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
              hit {HIT_MS} ms
            </text>
            <text x={stripX(MISS_MS)} y={STRIP.tickLabelY} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
              miss {MISS_MS} ms
            </text>
            {[STRIP.avgY, STRIP.p99Y].map((y) => (
              <g key={y}>
                <line x1={STRIP.x0} x2={STRIP.x1} y1={y} y2={y} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
                {[HIT_MS, MISS_MS].map((ms) => (
                  <line key={ms} x1={stripX(ms)} x2={stripX(ms)} y1={y - 8} y2={y + 8} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.faintStroke} />
                ))}
              </g>
            ))}
            <text x={8} y={STRIP.avgY + 4.2} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
              average
            </text>
            <text x={8} y={STRIP.p99Y + 4.2} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
              p99
            </text>
            {chip(`${msText(r.averageMs)} ms`, r.averageMs, STRIP.avgY, "accent", true)}
            {chip(`${msText(r.p99Ms)} ms`, r.p99Ms, STRIP.p99Y, r.p99Ms === HIT_MS ? "good" : "warn", false)}
          </g>

          {/* Requests reach the cache; the misses go on to the database. */}
          <g aria-hidden>
            <line x1={8} x2={CACHE.x - 56} y1={CACHE.y} y2={CACHE.y} strokeWidth={2} className={NEUTRAL.faintStroke} />
            <line x1={LINK.x0} x2={LINK.x1} y1={LINK.y} y2={LINK.y} strokeWidth={2} className={NEUTRAL.faintStroke} />
            {incoming.map((x) => (
              <circle key={`in-${x}`} cx={x} cy={CACHE.y} r={3.6} className={TONES.accent.solidFill} />
            ))}
            {missDots.map((x) => (
              <circle key={`miss-${x}`} cx={x} cy={LINK.y} r={3.6} className={TONES.warn.solidFill} />
            ))}
          </g>
          <SvgNode x={CACHE.x} y={CACHE.y} label="Cache" kind="cache" status={`hit ${hit}%`} statusTone="accent" />
          <SvgNode x={DB.x} y={DB.y} label="Database" kind="database" status={opsText(r.operations)} statusTone={tone} mark={tone} />

          {/* One small box for each database node the misses could need; the needed ones are lit. */}
          <text x={20} y={252} className={cn(TONES[tone].text, "text-[13px] font-bold tabular-nums")}>
            {r.nodes} database {r.nodes === 1 ? "node" : "nodes"} needed
          </text>
          <g aria-hidden>
            {Array.from({ length: MAX_NODES }, (_, i) => {
              const row = i < NODE.perRow ? 0 : 1;
              const col = row === 0 ? i : i - NODE.perRow;
              const lit = i < r.nodes;
              return (
                <rect
                  key={i}
                  x={NODE.x0 + col * (NODE.size + NODE.gap)}
                  y={(row === 0 ? NODE.row1 : NODE.row2) - 8}
                  width={NODE.size}
                  height={16}
                  rx={4}
                  strokeWidth={1.5}
                  className={cn("transition-colors duration-200 motion-reduce:transition-none", lit ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn("fill-muted/60", NEUTRAL.line))}
                />
              );
            })}
          </g>

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Hit rate"
            valueText={valueText}
            value={hit}
            ladder={HIT_LADDER}
            fromFraction={hitFromFraction}
            onChange={setHit}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={hit / HIT_MAX}
              marks={HIT_SNAPS.map((m) => ({ at: m / HIT_MAX, label: m === 0 || m === 95 ? undefined : String(m) }))}
              ends={["0%", "99%"]}
              caption={`Hit rate ${hit}%`}
            />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
