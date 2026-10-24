"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SliderRail } from "../primitives/picture-slider";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  POOL_DEFAULT,
  POOL_MAX,
  POOL_SNAPS,
  SLOW_DEFAULT,
  WORKERS,
  formatShare,
  poolFromFraction,
  poolKey,
  poolToFraction,
  serve,
  valueText,
  verdictFor,
  workerStates,
  type WorkerState,
} from "./model";

const W = 420;
const H = 452;
const COLS = 10;
const GRID = { x0: 34, y0: 92, pitch: 23, r: 8 };
const PICKS = { x: 338, y: 132 };
const BAR_X = 14;
const BAR_W = 392;
const BARS_Y = 226;
const RAIL = { x0: 34, x1: 386, y: 392 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const cx = (i: number) => GRID.x0 + (i % COLS) * GRID.pitch;
const cy = (i: number) => GRID.y0 + Math.floor(i / COLS) * GRID.pitch;

const WORKER_CLASS: Record<WorkerState, string> = {
  "pay-busy": TONES.good.solidFill,
  "home-busy": TONES.accent.solidFill,
  stuck: TONES.bad.solidFill,
  idle: "fill-muted",
};

/** The wall between worker P-1 and worker P of a 10 by 5 grid read row by row, as a stepped line. */
function wallPath(p: number): string {
  const half = GRID.pitch / 2;
  const row = Math.floor(p / COLS);
  const col = p % COLS;
  const left = GRID.x0 - half;
  const right = GRID.x0 + (COLS - 1) * GRID.pitch + half;
  const yRow = (n: number) => GRID.y0 + n * GRID.pitch - half;
  const xCol = GRID.x0 + col * GRID.pitch - half;
  const top = yRow(row);
  if (col === 0) return `M${left} ${top} L${right} ${top}`;
  const bottom = yRow(row + 1);
  const steps = `M${left} ${bottom} L${xCol} ${bottom} L${xCol} ${top}`;
  return row > 0 ? `${steps} L${right} ${top}` : steps;
}

/** 16.5 beat 4: drag the wall between the pools and see who gets served. */
export function BulkheadPoolsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [pool, setPool] = useState<number>(POOL_DEFAULT);
  const [slow, setSlow] = useState<boolean>(SLOW_DEFAULT);

  const r = serve(pool, slow);
  const verdict = verdictFor(r);
  const states = workerStates(r);
  const pulse = clock.reduced ? 1 : 0.7 + 0.3 * Math.sin(clock.seconds * 4);
  const barTone = (share: number): Tone => (share >= 0.999 ? "good" : share >= 0.5 ? "warn" : "bad");
  const caption = pool === 0 ? `one shared pool of ${WORKERS}` : `payments pool ${pool}, home pool ${WORKERS - pool}`;
  const bars = [
    { label: "payments served", share: r.payments },
    { label: "home page served", share: r.home },
  ];

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>wall</b> rail to give workers to payments. Tap <b>Picks</b> to make it slow or healthy.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{`Checkout has ${WORKERS} workers; ${caption}. Picks is ${slow ? "slow, 3 seconds" : "healthy, 0.1 seconds"}. ${valueText(r)}. ${verdict.text}.`}</desc>
          <DotGrid width={W} height={H} />

          <text x={GRID.x0 - 12} y={GRID.y0 - 24} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Checkout: 50 workers</text>

          {/* The 50 workers; the wall is a stepped line after the first P. */}
          <g aria-hidden>
            {states.map((s, i) => (
              <circle key={i} cx={cx(i)} cy={cy(i)} r={GRID.r} opacity={s === "stuck" ? pulse : 1} className={cn(WORKER_CLASS[s], i < pool && s === "idle" ? "fill-emerald-600/15 dark:fill-emerald-400/20" : "", SHAPE_TRANSITION)} />
            ))}
            {pool > 0 ? <path d={wallPath(pool)} fill="none" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} /> : null}
          </g>
          <text x={GRID.x0 - 12} y={GRID.y0 + 4 * GRID.pitch + 28} className={cn(NEUTRAL.mutedText, "text-[12px]")}>{caption}</text>

          <SvgButton x={PICKS.x - 62} y={PICKS.y - 36} width={124} height={72} label={slow ? "Picks: slow, 3 seconds a call, press to make it healthy" : "Picks: healthy, 0.1 seconds a call, press to make it slow"} pressed={slow} onPress={() => setSlow((s) => !s)}>
            <SvgNode x={PICKS.x} y={PICKS.y} label="Picks" kind="server" status={slow ? "slow: 3 s" : "healthy"} statusTone={slow ? "bad" : "good"} mark={slow ? "bad" : undefined} />
          </SvgButton>
          <text x={PICKS.x} y={PICKS.y + 52} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>home page calls it</text>

          {/* Who gets served. */}
          {bars.map((b, i) => {
            const y = BARS_Y + i * 62;
            const tone = barTone(b.share);
            return (
              <g key={b.label}>
                <text x={BAR_X} y={y} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{b.label}</text>
                <text x={BAR_X + BAR_W} y={y} textAnchor="end" className={cn(TONES[tone].text, "text-[17px] font-bold tabular-nums")}>{formatShare(b.share)}</text>
                <rect x={BAR_X} y={y + 10} width={BAR_W} height={16} rx={8} className="fill-muted" />
                <rect x={BAR_X} y={y + 10} width={r1(Math.max(0, BAR_W * b.share))} height={16} rx={8} className={cn(TONES[tone].solidFill, SHAPE_TRANSITION)} style={{ transition: "width 200ms" }} />
              </g>
            );
          })}

          <text x={RAIL.x0} y={RAIL.y - 44} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>drag the wall: workers for payments</text>
          <TightRailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Workers in the payment pool"
            valueText={valueText(r)}
            value={pool}
            min={0}
            max={POOL_MAX}
            fromFraction={poolFromFraction}
            onKey={poolKey}
            onChange={setPool}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
            above={26}
            below={42}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={poolToFraction(pool)}
              marks={POOL_SNAPS.map((v) => ({ at: poolToFraction(v), label: v === 0 || v === 10 || v === 20 || v === 30 || v === 45 ? String(v) : undefined }))}
              ends={["0: one pool", "45"]}
              caption={pool === 0 ? "wall: none" : `wall after ${pool} workers`}
            />
          </TightRailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
