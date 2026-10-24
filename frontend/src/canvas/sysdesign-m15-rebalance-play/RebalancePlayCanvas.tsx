"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BEST,
  CONSUMERS,
  OFFERED,
  PARTITIONS,
  PAUSE_S,
  PER_CONSUMER,
  PER_PARTITION,
  assignmentText,
  groupLimit,
  holdsOf,
  idleConsumers,
  loadOf,
  movedBetween,
  movesWhenOneJoins,
  ownersOf,
  valueText,
  verdictFor,
} from "./model";

const W = 420;
const H = 396;
const BLOCK = { x0: 22, w: 56, gap: 8, y: 68, h: 46 };
const COL = { x0: 12, span: 396, gap: 4, y: 146, minW: 46, maxW: 140 };
const CHIP = { w: 38, h: 17, stepX: 42, stepY: 20 };
const BAR = { x0: 22, x1: 398, y: 268, h: 18 };
const RAIL = { x0: 40, x1: 380, y: 352 };

const r1 = (v: number) => Math.round(v * 10) / 10;

// One colour for each consumer, always next to its name, so colour is never the only signal.
const OWNER_FILL = [
  "fill-blue-700 dark:fill-blue-400",
  "fill-orange-700 dark:fill-orange-400",
  "fill-emerald-700 dark:fill-emerald-400",
  "fill-violet-700 dark:fill-violet-400",
  "fill-rose-700 dark:fill-rose-400",
  "fill-cyan-700 dark:fill-cyan-400",
  "fill-fuchsia-700 dark:fill-fuchsia-400",
  "fill-amber-700 dark:fill-amber-400",
];
const ON_OWNER = "fill-white dark:fill-slate-950";
const MOVING_FILL = "fill-muted";

/** 15.3 beat 3: pick the number of consumers and watch the six partitions move and the group's limit step. */
export function RebalancePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const timer = useRef<number | undefined>(undefined);
  const [c, setC] = useState<number>(CONSUMERS.default);
  const [moving, setMoving] = useState<number[]>([]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const change = (next: number) => {
    if (next === c) return;
    const moved = movedBetween(c, next);
    setC(next);
    window.clearTimeout(timer.current);
    // The moved partitions go grey for a moment; with reduced motion the colours change at once.
    if (!clock.reduced && moved.length > 0) {
      setMoving(moved);
      timer.current = window.setTimeout(() => setMoving([]), PAUSE_S * 1000);
    } else setMoving([]);
  };

  const owners = ownersOf(c);
  const holds = holdsOf(c);
  const limit = groupLimit(c);
  const verdict = verdictFor(c);
  const idle = idleConsumers(c);
  const joins = movesWhenOneJoins(c);
  const colW = Math.max(COL.minW, Math.min(COL.maxW, Math.floor((COL.span - (c - 1) * COL.gap) / c)));
  const barTone = limit < OFFERED ? "bad" : "good";
  const xOffered = r1(BAR.x0 + (OFFERED / BEST) * (BAR.x1 - BAR.x0));
  const xLimit = r1(BAR.x0 + (limit / BEST) * (BAR.x1 - BAR.x0));
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const pulse = (p: number) => (clock.reduced ? 0.9 : Math.round((0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (clock.seconds * 0.9 + p * 0.17)))) * 100) / 100);

  const caption = joins === null ? "all eight consumers are in the group" : joins === 0 ? "one more consumer moves no partition" : `one more consumer moves ${joins} ${joins === 1 ? "partition" : "partitions"}`;
  const description = `A topic with ${PARTITIONS} partitions, each carrying ${PER_PARTITION} events a second of the ${OFFERED} offered. ${c} consumers in the group, each able to do ${PER_CONSUMER} a second. Partitions held: ${assignmentText(c)}. ${valueText(c)}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>rail</b> or tap a number to add or remove consumers.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <text x={BLOCK.x0} y={BLOCK.y - 8} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{`${PARTITIONS} partitions, ${PER_PARTITION} events a second each`}</text>
          {moving.length > 0 ? (
            <g>
              <rect x={W - 22 - 150} y={BLOCK.y - 24} width={150} height={20} rx={10} className="fill-card" />
              <rect x={W - 22 - 150} y={BLOCK.y - 24} width={150} height={20} rx={10} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              <text x={W - 22 - 75} y={BLOCK.y - 10} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>1 s pause, illustrative</text>
            </g>
          ) : null}

          {/* The six partitions, coloured by the consumer that holds them. */}
          {owners.map((o, p) => {
            const x = BLOCK.x0 + p * (BLOCK.w + BLOCK.gap);
            const grey = moving.includes(p);
            return (
              <g key={p} role="img" aria-label={`Partition ${p}, held by consumer ${o + 1}`}>
                <rect x={x} y={BLOCK.y + 3} width={BLOCK.w} height={BLOCK.h} rx={11} className="fill-foreground/[0.06]" />
                <rect x={x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} rx={11} strokeWidth={grey ? 2 : 0} strokeDasharray={grey ? "4 3" : undefined} className={cn(grey ? cn(MOVING_FILL, NEUTRAL.doneStroke) : cn(OWNER_FILL[o], "stroke-transparent"), "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={x + BLOCK.w / 2} y={BLOCK.y + 20} textAnchor="middle" className={cn(grey ? NEUTRAL.text : ON_OWNER, "text-[13px] font-bold")}>{`P${p}`}</text>
                <text x={x + BLOCK.w / 2} y={BLOCK.y + 37} textAnchor="middle" className={cn(grey ? NEUTRAL.mutedText : ON_OWNER, "text-[11.5px] font-semibold")}>{grey ? "moving" : `C${o + 1}`}</text>
              </g>
            );
          })}

          <text x={BLOCK.x0} y={COL.y - 8} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{caption}</text>

          {/* One column for each consumer, holding its partitions as chips. The red ones would need more than 100 events a second. */}
          {holds.map((h, i) => {
            const x = COL.x0 + i * (colW + COL.gap);
            const isIdle = h.length === 0;
            const over = loadOf(h.length) > PER_CONSUMER;
            const perRow = Math.max(1, Math.floor((colW - 4) / CHIP.stepX));
            const rows = Math.ceil(h.length / perRow);
            const height = isIdle ? 50 : 26 + rows * CHIP.stepY + 4;
            return (
              <g key={i}>
                <rect x={x} y={COL.y + 3} width={colW} height={height} rx={11} className="fill-foreground/[0.06]" />
                <rect
                  x={x}
                  y={COL.y}
                  width={colW}
                  height={height}
                  rx={11}
                  strokeWidth={1.75}
                  strokeDasharray={isIdle ? "4 3" : undefined}
                  className={cn(NEUTRAL.surface, isIdle ? NEUTRAL.line : over ? TONES.bad.stroke : TONES.good.stroke, "transition-colors duration-200 motion-reduce:transition-none")}
                />
                <circle cx={x + 11} cy={COL.y + 15} r={4.5} className={OWNER_FILL[i]} />
                <text x={x + 20} y={COL.y + 19} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{`C${i + 1}`}</text>
                {isIdle ? (
                  <text x={x + colW / 2} y={COL.y + 40} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>idle</text>
                ) : (
                  h.map((p, k) => {
                    const cx = x + 4 + (k % perRow) * CHIP.stepX;
                    const cy = COL.y + 26 + Math.floor(k / perRow) * CHIP.stepY;
                    const grey = moving.includes(p);
                    return (
                      <g key={p}>
                        <rect x={cx} y={cy} width={CHIP.w} height={CHIP.h} rx={6} className={cn(grey ? MOVING_FILL : OWNER_FILL[i], "transition-colors duration-200 motion-reduce:transition-none")} />
                        <text x={cx + 6} y={cy + 12.5} className={cn(grey ? NEUTRAL.text : ON_OWNER, "text-[11.5px] font-semibold")}>{`P${p}`}</text>
                        <circle cx={cx + CHIP.w - 8} cy={cy + CHIP.h / 2} r={2.6} opacity={grey ? 0.3 : pulse(p)} className={grey ? NEUTRAL.doneFill : ON_OWNER} />
                      </g>
                    );
                  })
                )}
              </g>
            );
          })}

          {/* The group's limit against the offered load. */}
          <text x={BAR.x0} y={BAR.y - 8} className={cn(TONES[barTone].text, "text-[12.5px] font-bold tabular-nums")}>{`group limit ${limit} a second`}</text>
          <rect x={BAR.x0} y={BAR.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={9} className="fill-muted" />
          <rect x={BAR.x0} y={BAR.y} width={Math.max(8, xLimit - BAR.x0)} height={BAR.h} rx={9} className={cn(TONES[barTone].solidFill, "transition-all duration-200 motion-reduce:transition-none")} />
          <line x1={xOffered} x2={xOffered} y1={BAR.y - 6} y2={BAR.y + BAR.h + 6} strokeWidth={2} strokeDasharray="4 3" className={NEUTRAL.doneStroke} />
          <rect x={xOffered - 46} y={BAR.y - 30} width={92} height={20} rx={10} className="fill-card" />
          <rect x={xOffered - 46} y={BAR.y - 30} width={92} height={20} rx={10} strokeWidth={1.5} className={cn("fill-none", NEUTRAL.line)} />
          <text x={xOffered} y={BAR.y - 16} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{`${OFFERED} offered`}</text>
          <text x={BAR.x0} y={BAR.y + BAR.h + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0</text>
          <text x={BAR.x1} y={BAR.y + BAR.h + 20} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`${BEST} a second`}</text>

          {/* The consumers rail. */}
          <text x={22} y={RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`consumers in the group: ${c}${idle > 0 ? ` (${idle} idle)` : ""}`}</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={Array.from({ length: CONSUMERS.max }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
            value={c}
            onChange={change}
            ariaLabel="Consumers in the group"
            valueText={valueText(c)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
