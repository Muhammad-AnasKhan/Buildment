"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import {
  arrivalsAt,
  backlogAt,
  backlogVerdict,
  BUSY_MINUTES,
  busyAt,
  chartMax,
  DAY_MINUTES,
  MACHINE_STOPS,
  MACHINES_DEFAULT,
  playhead,
  rateShare,
  RATE_DEFAULT,
  RATE_STOPS,
  runBacklog,
  TARGET_MINUTES,
  valueText,
  waitingText,
} from "../models/lamha-backlog";

const W = 420;
const H = 528;
const CARD_Y = 72;
const SRC_X = 62;
const QUEUE_X = 210;
const WORK_X = 358;
const CARD_HALF = 56;
const SQUARES_Y = 118;
const PLOT = { x0: 50, x1: 404, top: 158, base: 292 };
const RATE_RAIL = { x0: 40, x1: 380, y: 382 };
const MACHINE_RAIL = { x0: 40, x1: 380, y: 482 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (m: number) => r1(PLOT.x0 + (Math.max(0, Math.min(DAY_MINUTES, m)) / DAY_MINUTES) * (PLOT.x1 - PLOT.x0));

const AREA: Record<Tone, string> = {
  good: "fill-emerald-600/25 dark:fill-emerald-400/25",
  warn: "fill-amber-600/25 dark:fill-amber-400/25",
  bad: "fill-red-600/25 dark:fill-red-400/25",
  accent: "fill-blue-600/25 dark:fill-blue-400/25",
};

/** 27.3 beat 5: drag the busy-hour uploads and pick the machines; the line rises, then drains. */
export function BacklogPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [rate, setRate] = useState<number>(RATE_DEFAULT);
  const [machines, setMachines] = useState<number>(MACHINES_DEFAULT);

  const run = runBacklog(rate, machines);
  const verdict = backlogVerdict(run);
  const yMax = chartMax(run);
  const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(yMax, v)) / yMax) * (PLOT.base - PLOT.top));
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  // The playhead sweeps the three hours; a still picture rests at the end of the busy hour.
  const t = clock.reduced ? BUSY_MINUTES : playhead(clock.seconds);
  const arrivals = arrivalsAt(t, rate);
  const waiting = backlogAt(run, t);
  const { busy, tone: busyTone } = busyAt(run, t);
  const waitNow = waiting / run.capacity / 60;
  const queueTone: Tone = waiting < 0.5 ? "good" : waitNow <= TARGET_MINUTES ? "good" : waitNow < 60 ? "warn" : "bad";
  const lit = Math.min(10, Math.ceil(Math.min(1, waiting / (run.capacity * 3600)) * 10));

  const pts: string[] = [];
  for (let m = 0; m <= DAY_MINUTES; m += 2) pts.push(`L${xOf(m)} ${yOf(run.series[m])}`);
  const curve = pts.join(" ");
  const area = `M${xOf(0)} ${PLOT.base} ${curve} L${xOf(DAY_MINUTES)} ${PLOT.base} Z`;
  const line = `M${xOf(0)} ${yOf(0)} ${curve}`;

  const dotsIn = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(rateShare(arrivals)));
  const dotsOut = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(Math.min(1, busy)));
  const gapA = { x0: SRC_X + CARD_HALF + 4, x1: QUEUE_X - CARD_HALF - 4 };
  const gapB = { x0: QUEUE_X + CARD_HALF + 4, x1: WORK_X - CARD_HALF - 4 };

  const yTarget = yOf(run.targetBacklog);
  const markY = yOf(run.backlog);
  const waitMin = Math.round(run.waitMinutes);
  const description = `Lamha transcode line. ${run.rate} uploads a second in the busy hour, then 5.8 a second, against ${withCommas(run.machines)} machines that finish ${r1(run.capacity)} videos a second. ${valueText(run)}. ${verdict.text}.`;

  const stopLabel = (v: number): string[] => (v === 5.8 ? ["5.8", "average"] : v === 17.4 ? ["17.4", "peak"] : [String(v)]);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>uploads</b> rail and pick the <b>machines</b>. Read the wait at the end of the busy hour.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Lanes between the cards, with video dots that follow the arrival rate and the busy share. */}
          <line x1={gapA.x0} x2={gapA.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={gapB.x0} x2={gapB.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dotsIn.map((d) => (
            <circle key={`a${d.id}`} cx={r1(gapA.x0 + (gapA.x1 - gapA.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES.accent.solidFill} />
          ))}
          {dotsOut.map((d) => (
            <circle key={`b${d.id}`} cx={r1(gapB.x0 + (gapB.x1 - gapB.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES[busyTone].solidFill} />
          ))}

          <SvgNode x={SRC_X} y={CARD_Y} label="Uploads" kind="phone" status={`${arrivals} /s`} statusTone={arrivals > RATE_STOPS[0] ? "warn" : "good"} />
          <SvgNode x={QUEUE_X} y={CARD_Y} label="Queue" kind="queue" status={waitingText(waiting)} statusTone={queueTone} mark={queueTone === "bad" ? "bad" : undefined} />
          <SvgNode x={WORK_X} y={CARD_Y} label="Workers" kind="worker" status={`${machines / 1000}k machines`} statusTone={busyTone} />

          {/* A small queue icon: ten squares that fill as the wait grows to an hour. */}
          <g aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={r1(QUEUE_X - 59 + i * 12.5)} y={SQUARES_Y - 5} width={10} height={10} rx={3} className={cn(i < lit ? TONES[queueTone].solidFill : "fill-muted", "transition-colors duration-200 motion-reduce:transition-none")} />
            ))}
          </g>

          {/* The chart: backlog over three hours, with the busy hour shaded. */}
          <rect x={xOf(0)} y={PLOT.top} width={r1(xOf(BUSY_MINUTES) - xOf(0))} height={PLOT.base - PLOT.top} className="fill-muted-foreground/10" />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(yMax)} y2={yOf(yMax)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(yMax / 2)} y2={yOf(yMax / 2)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <path d={area} className={cn(AREA[verdict.tone], "transition-colors duration-200 motion-reduce:transition-none")} />
          <path d={line} fill="none" strokeWidth={2.25} strokeLinejoin="round" className={cn(TONES[verdict.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, yMax / 2, yMax].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
              {v === 0 ? "0" : `${v / 1000}k`}
            </text>
          ))}
          {[0, 60, 120, 180].map((m) => (
            <text key={m} x={xOf(m)} y={PLOT.base + 18} textAnchor={m === 0 ? "start" : m === 180 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
              {m === 180 ? "180 min" : String(m)}
            </text>
          ))}
          <text x={r1((xOf(0) + xOf(BUSY_MINUTES)) / 2)} y={PLOT.base + 34} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>busy hour</text>
          <text x={PLOT.x1} y={PLOT.top - 8} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>videos waiting</text>

          {/* The 10 minute wait target. */}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yTarget} y2={yTarget} strokeWidth={1.75} strokeDasharray="6 4" className={TONES.good.stroke} />
          <text x={PLOT.x1 - 4} y={yTarget - 5} textAnchor="end" className={cn(TONES.good.text, LABEL_HALO, "text-[11.5px] font-semibold")}>{`${TARGET_MINUTES} min wait`}</text>

          {/* The end of the busy hour: backlog and wait. */}
          <circle cx={xOf(BUSY_MINUTES)} cy={markY} r={5} className={cn(TONES[verdict.tone].solidFill, "stroke-card")} strokeWidth={2} />
          {run.none ? (
            <text x={xOf(BUSY_MINUTES) - 10} y={markY - 9} textAnchor="end" className={cn(TONES.good.text, LABEL_HALO, "text-[12px] font-bold")}>no backlog</text>
          ) : (
            <g>
              <text x={xOf(BUSY_MINUTES) - 10} y={markY - 22} textAnchor="end" className={cn(TONES[verdict.tone].text, LABEL_HALO, "text-[12px] font-bold tabular-nums")}>{`${withCommas(run.backlog)} waiting`}</text>
              <text x={xOf(BUSY_MINUTES) - 10} y={markY - 8} textAnchor="end" className={cn(TONES[verdict.tone].text, LABEL_HALO, "text-[12px] font-bold tabular-nums")}>{`${waitMin} min wait`}</text>
            </g>
          )}

          {/* Where the line returns to zero. */}
          {run.emptyAt !== null ? (
            <g>
              <circle cx={xOf(run.emptyAt)} cy={PLOT.base} r={5} className={cn(NEUTRAL.surface, TONES.good.stroke)} strokeWidth={2.25} />
              <text x={xOf(run.emptyAt) + 9} y={PLOT.base - 10} textAnchor={run.emptyAt > 150 ? "end" : "start"} className={cn(TONES.good.text, LABEL_HALO, "text-[12px] font-bold tabular-nums")}>{`empty at minute ${run.emptyAt}`}</text>
            </g>
          ) : run.never ? (
            <text x={PLOT.x1} y={PLOT.base + 34} textAnchor="end" className={cn(TONES.bad.text, "text-[12px] font-bold")}>not empty within 3 hours</text>
          ) : null}

          {/* The playhead: where the cards above are in the day. */}
          <line x1={xOf(t)} x2={xOf(t)} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />
          <circle cx={xOf(t)} cy={yOf(waiting)} r={4.5} className={cn(TONES[queueTone].solidFill, "stroke-card")} strokeWidth={1.5} />

          {/* The uploads rail. */}
          <text x={RATE_RAIL.x0 - 6} y={RATE_RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>uploads a second in the busy hour</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RATE_RAIL.x0}
            x1={RATE_RAIL.x1}
            y={RATE_RAIL.y}
            stops={RATE_STOPS.map((v) => ({ value: v, label: stopLabel(v) }))}
            value={rate}
            onChange={setRate}
            ariaLabel="Uploads a second in the busy hour"
            valueText={valueText(run)}
            onGrab={grab}
          />

          {/* The machines rail. */}
          <text x={MACHINE_RAIL.x0 - 6} y={MACHINE_RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>transcode machines</text>
          <SnapStopsRail
            svgRef={svg}
            x0={MACHINE_RAIL.x0}
            x1={MACHINE_RAIL.x1}
            y={MACHINE_RAIL.y}
            stops={MACHINE_STOPS.map((v) => ({ value: v, label: withCommas(v) }))}
            value={machines}
            onChange={setMachines}
            ariaLabel="Transcode machines"
            valueText={valueText(run)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
