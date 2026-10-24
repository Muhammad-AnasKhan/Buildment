"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { BAR_COUNT, LIMIT_DEFAULT, LIMIT_SNAPS, POOL, bars, cutOff, formatCut, heldInHang, valueText, verdictFor } from "./model";

const W = 420;
const H = 462;
const CARD_Y = 84;
const LINK = { x0: 136, x1: 284, y: 80 };
const CH = { x0: 62, x1: 410, top: 142, base: 266, lo: 10, hi: 1000 };
const PITCH = (CH.x1 - CH.x0) / BAR_COUNT;
const BAR_W = 5;
const STATS_Y = 300;
const STATS_H = 74;
const RAIL = { x0: 34, x1: 386, y: 418 };
const STEP_S = 0.2;
const REST_STEPS = 5;
const HOLD_SCALE = 100; // the held-workers bar runs from 0 to 100 workers; the pool ends halfway

const r1 = (v: number) => Math.round(v * 10) / 10;
const yOf = (ms: number) => r1(CH.base - ((Math.log(Math.max(CH.lo, Math.min(CH.hi, ms))) - Math.log(CH.lo)) / (Math.log(CH.hi) - Math.log(CH.lo))) * (CH.base - CH.top));
const barX = (i: number) => r1(CH.x0 + i * PITCH + (PITCH - BAR_W) / 2);

/** 16.4 beat 2: drag the limit line and see what it cuts off and what a hang holds. */
export function TimeoutLineCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [limit, setLimit] = useState<number>(LIMIT_DEFAULT);

  const latencies = bars();
  const cut = cutOff(limit);
  const held = heldInHang(limit);
  const verdict = verdictFor(limit);
  const cutTone: Tone | null = cut >= 0.05 ? "warn" : null;
  const heldTone: Tone = held > POOL ? "bad" : "good";
  const lineY = yOf(limit);
  const barsCut = latencies.filter((ms) => ms > limit).length;

  // A sweep walks along the bars; Picks shows the call under the cursor.
  const step = clock.reduced ? -1 : Math.floor(clock.seconds / STEP_S) % (BAR_COUNT + REST_STEPS);
  const cursor = step >= 0 && step < BAR_COUNT ? step : -1;
  const over = cursor >= 0 && latencies[cursor] > limit;
  const picksStatus = cursor >= 0 ? (over ? "cut off" : `answers ${Math.round(latencies[cursor])} ms`) : "answers";
  const picksTone: Tone = over ? "bad" : "good";
  const phase = clock.reduced ? 0.5 : (clock.seconds % 1.5) / 1.5;
  const dotX = r1(LINK.x0 + phase * (LINK.x1 - LINK.x0));

  const description = `Fifty calls to Picks sorted from fastest to slowest, ${barsCut} of them slower than the ${limit} ms limit. By the formula ${formatCut(cut)} of calls are cut off. At 100 pages a second a hang holds ${Math.round(held)} of ${POOL} workers. ${verdict.text}.`;
  const track = 178;
  const fill = Math.min(held, HOLD_SCALE) / HOLD_SCALE;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>rail</b> to move the limit line. Red bars are good calls you cut off.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <LinkLine x1={LINK.x0} y1={LINK.y} x2={LINK.x1} y2={LINK.y} />
          <circle cx={dotX} cy={LINK.y} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
          <text x={(LINK.x0 + LINK.x1) / 2} y={CARD_Y + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>100 pages a second</text>
          <SvgNode x={72} y={CARD_Y} label="Checkout" kind="server" status={`${POOL} workers`} statusTone="good" />
          <SvgNode x={348} y={CARD_Y} label="Picks" kind="server" status={picksStatus} statusTone={picksTone} mark={over ? "bad" : undefined} arrival={over ? 0.6 : 0} />

          {/* 50 calls to Picks, fastest to slowest, on a log scale. */}
          <line x1={CH.x0} x2={CH.x1} y1={CH.base} y2={CH.base} strokeWidth={2} className={NEUTRAL.line} />
          {cursor >= 0 ? <rect x={r1(CH.x0 + cursor * PITCH)} y={CH.top - 6} width={r1(PITCH)} height={CH.base - CH.top + 6} rx={3} className="fill-muted-foreground/15" /> : null}
          {latencies.map((ms, i) => {
            const top = yOf(ms);
            return <rect key={i} x={barX(i)} y={top} width={BAR_W} height={r1(Math.max(1, CH.base - top))} rx={2} className={cn(ms > limit ? TONES.bad.solidFill : "fill-blue-600/55 dark:fill-blue-400/55", SHAPE_TRANSITION)} />;
          })}
          <line x1={CH.x0} x2={CH.x1} y1={lineY} y2={lineY} strokeWidth={2.5} strokeDasharray="7 4" className={TONES.warn.stroke} style={{ transition: "none" }} />
          <text x={CH.x0 - 5} y={lineY + 4.5} textAnchor="end" className={cn(TONES.warn.text, "text-[12px] font-bold tabular-nums")}>{`${limit} ms`}</text>
          <text x={CH.x0} y={CH.base + 21} className={cn(NEUTRAL.mutedText, "text-[12px]")}>50 calls to Picks, slowest on the right</text>

          {/* The two prices of the limit. */}
          <g>
            <rect x={13} y={STATS_Y} width={194} height={STATS_H} rx={14} strokeWidth={cutTone ? 2 : 1.5} className={cn(NEUTRAL.surface, cutTone ? TONES[cutTone].stroke : NEUTRAL.line, SHAPE_TRANSITION)} />
            <text x={25} y={STATS_Y + 22} className={cn(NEUTRAL.mutedText, "text-[12px]")}>calls cut off</text>
            <text x={25} y={STATS_Y + 56} className={cn(cutTone ? TONES[cutTone].text : NEUTRAL.text, "text-[26px] font-bold tabular-nums")}>{formatCut(cut)}</text>
          </g>
          <g>
            <rect x={213} y={STATS_Y} width={194} height={STATS_H} rx={14} strokeWidth={2} className={cn(NEUTRAL.surface, TONES[heldTone].stroke, SHAPE_TRANSITION)} />
            <text x={225} y={STATS_Y + 22} className={cn(NEUTRAL.mutedText, "text-[12px]")}>workers held in a hang</text>
            <text x={225} y={STATS_Y + 46} className={cn(TONES[heldTone].text, "text-[20px] font-bold tabular-nums")}>{`${Math.round(held)} of ${POOL}`}</text>
            <rect x={225} y={STATS_Y + 56} width={track} height={8} rx={4} className="fill-muted" />
            <rect x={225 + track / 2} y={STATS_Y + 56} width={track / 2} height={8} rx={4} className="fill-red-600/20 dark:fill-red-400/25" />
            <rect x={225} y={STATS_Y + 56} width={r1(Math.max(4, track * fill))} height={8} rx={4} className={cn(TONES[heldTone].solidFill, SHAPE_TRANSITION)} />
            <line x1={225 + track / 2} x2={225 + track / 2} y1={STATS_Y + 52} y2={STATS_Y + 68} strokeWidth={2} className={NEUTRAL.doneStroke} />
          </g>

          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={LIMIT_SNAPS.map((v) => ({ value: v, label: v === 1000 ? "1,000" : String(v) }))}
            value={limit}
            onChange={setLimit}
            ariaLabel="Timeout limit in milliseconds"
            valueText={valueText(limit)}
            tone="warn"
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
