"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SliderRail } from "../primitives/picture-slider";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import {
  BURST,
  BURST_FROM,
  BURST_SNAPS,
  BURST_TO,
  CHART_MAX,
  HORIZON,
  NORMAL,
  PER_WORKER,
  QUEUE_LIMIT,
  WORKERS_DEFAULT,
  WORKER_STOPS,
  arrivalsAt,
  backlogAt,
  burstFromFraction,
  burstKey,
  burstToFraction,
  busyAt,
  numbersFor,
  playhead,
  runBacklog,
  valueText,
  verdictFor,
} from "./model";

const W = 420;
const H = 502;
const CARD_Y = 72;
const APP_X = 62;
const QUEUE_X = 210;
const WORKERS_X = 358;
const CARD_HALF = 56;
const SQUARES_Y = 114;
const PLOT = { x0: 50, x1: 404, top: 146, base: 272 };
const NUM_Y = 300;
const NUM_H = 42;
const BURST_RAIL = { x0: 34, x1: 386, y: 374 };
const WORKERS_RAIL = { x0: 50, x1: 370, y: 460 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(PLOT.x0 + (Math.max(0, Math.min(HORIZON, t)) / HORIZON) * (PLOT.x1 - PLOT.x0));
const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(CHART_MAX, v)) / CHART_MAX) * (PLOT.base - PLOT.top));

const AREA: Record<Tone, string> = {
  good: "fill-emerald-600/25 dark:fill-emerald-400/25",
  warn: "fill-amber-600/25 dark:fill-amber-400/25",
  bad: "fill-red-600/25 dark:fill-red-400/25",
  accent: "fill-blue-600/25 dark:fill-blue-400/25",
};

/** 15.2 beat 3: drag the burst, pick the workers, and watch the line rise and drain over time. */
export function BacklogPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [burst, setBurst] = useState<number>(BURST.default);
  const [workers, setWorkers] = useState<number>(WORKERS_DEFAULT);
  const [limited, setLimited] = useState(false);

  const run = runBacklog(burst, workers, limited ? QUEUE_LIMIT : null);
  const verdict = verdictFor(run);
  const nums = numbersFor(run);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  // Where the playhead is: a sweep over the chart; a still picture rests at the end of the burst.
  const t = clock.reduced ? BURST_TO : playhead(clock.seconds);
  const arrivals = arrivalsAt(t, run.burst);
  const waiting = backlogAt(run, t);
  const { busy, tone: busyTone } = busyAt(run, t);
  const full = run.limit !== null && waiting >= run.limit - 0.5;
  const queueTone: Tone = waiting < 1 ? "good" : run.never || full ? "bad" : "warn";
  const lit = waiting >= 1 || busy >= 1 ? workers : Math.max(1, Math.ceil(busy * workers));

  const points: string[] = [];
  for (let s = 0; s <= HORIZON; s += 3) points.push(`L${xOf(s)} ${yOf(run.series[s])}`);
  const curve = points.join(" ");
  const area = `M${xOf(0)} ${PLOT.base} ${curve} L${xOf(HORIZON)} ${PLOT.base} Z`;
  const line = `M${xOf(0)} ${yOf(0)} ${curve}`;

  const dotsIn = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(arrivals / BURST.max));
  const dotsOut = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(Math.min(1, busy)));
  const gapA = { x0: APP_X + CARD_HALF + 4, x1: QUEUE_X - CARD_HALF - 4 };
  const gapB = { x0: QUEUE_X + CARD_HALF + 4, x1: WORKERS_X - CARD_HALF - 4 };

  const description = `A queue with ${workers} workers that each finish ${PER_WORKER} jobs a second, so capacity is ${run.capacity} a second. Jobs arrive at ${NORMAL} a second, and at ${run.burst} a second from second ${BURST_FROM} to ${BURST_TO}. ${valueText(run)}. ${verdict.text}.`;
  const yLimit = run.limit !== null ? yOf(run.limit) : 0;

  const cards = [
    { label: "peak line", value: nums.peak, tone: run.never ? ("bad" as Tone) : null },
    { label: "oldest job waits", value: nums.oldest, tone: null },
    { label: "empty after burst", value: nums.empty, tone: run.never ? ("bad" as Tone) : null },
  ];

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>burst</b> rail and pick the <b>workers</b>. Then try the queue limit.
        </>
      }
      controls={
        <BeatChoice<"off" | "on">
          label="Queue limit"
          options={[
            { id: "off", label: "No limit" },
            { id: "on", label: "Limit 5,000" },
          ]}
          value={limited ? "on" : "off"}
          onChange={(id) => setLimited(id === "on")}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Lanes between the cards, with job dots that follow the arrival rate and the busy share. */}
          <line x1={gapA.x0} x2={gapA.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={gapB.x0} x2={gapB.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dotsIn.map((d) => (
            <circle key={`a${d.id}`} cx={r1(gapA.x0 + (gapA.x1 - gapA.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES.accent.solidFill} />
          ))}
          {dotsOut.map((d) => (
            <circle key={`b${d.id}`} cx={r1(gapB.x0 + (gapB.x1 - gapB.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES[busyTone].solidFill} />
          ))}

          <SvgNode x={APP_X} y={CARD_Y} label="App" kind="server" status={`${arrivals} jobs/s`} statusTone={arrivals > NORMAL ? "warn" : "good"} />
          <SvgNode x={QUEUE_X} y={CARD_Y} label="Queue" kind="queue" status={waiting < 1 ? "empty" : `${withCommas(Math.round(waiting))} waiting`} statusTone={queueTone} mark={queueTone === "bad" ? "bad" : undefined} />
          <SvgNode x={WORKERS_X} y={CARD_Y} label="Workers" kind="worker" status={`${run.capacity} jobs/s`} statusTone={busyTone} />

          {/* One small square for each worker; lit while it has work. */}
          <g aria-hidden>
            {Array.from({ length: workers }, (_, i) => {
              const x = WORKERS_X - ((workers - 1) * 14) / 2 + i * 14;
              return <rect key={i} x={r1(x - 5)} y={SQUARES_Y - 5} width={10} height={10} rx={3} className={cn(i < lit ? TONES[busyTone].solidFill : "fill-muted", "transition-colors duration-200 motion-reduce:transition-none")} />;
            })}
          </g>

          {/* The chart: backlog over 420 seconds, with the burst as a shaded band. */}
          <rect x={xOf(BURST_FROM)} y={PLOT.top} width={r1(xOf(BURST_TO) - xOf(BURST_FROM))} height={PLOT.base - PLOT.top} className="fill-muted-foreground/10" />
          <text x={r1((xOf(BURST_FROM) + xOf(BURST_TO)) / 2)} y={PLOT.top - 6} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>burst</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CHART_MAX)} y2={yOf(CHART_MAX)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CHART_MAX / 2)} y2={yOf(CHART_MAX / 2)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <path d={area} className={cn(AREA[verdict.tone], "transition-colors duration-200 motion-reduce:transition-none")} />
          <path d={line} fill="none" strokeWidth={2.25} strokeLinejoin="round" className={cn(TONES[verdict.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 6000, 12000].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{withCommas(v)}</text>
          ))}
          {[0, 100, 200, 300, 400].map((s) => (
            <text key={s} x={xOf(s)} y={PLOT.base + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{s === 400 ? "400 s" : String(s)}</text>
          ))}

          {run.limit !== null ? (
            <g>
              <line x1={PLOT.x0} x2={PLOT.x1} y1={yLimit} y2={yLimit} strokeWidth={2} strokeDasharray="6 4" className={TONES.warn.stroke} />
              <rect x={PLOT.x1 - 86} y={yLimit - 25} width={86} height={21} rx={10.5} className="fill-card" />
              <rect x={PLOT.x1 - 86} y={yLimit - 25} width={86} height={21} rx={10.5} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              <text x={PLOT.x1 - 43} y={yLimit - 10} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold tabular-nums")}>limit 5,000</text>
              {run.refused > 0 ? (
                <g>
                  <rect x={PLOT.x1 - 104} y={yLimit + 5} width={104} height={21} rx={10.5} className="fill-card" />
                  <rect x={PLOT.x1 - 104} y={yLimit + 5} width={104} height={21} rx={10.5} strokeWidth={1.5} className={cn(TONES.bad.softFill, TONES.bad.stroke)} />
                  <text x={PLOT.x1 - 52} y={yLimit + 20} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold tabular-nums")}>{`${withCommas(run.refused)} refused`}</text>
                </g>
              ) : null}
            </g>
          ) : null}

          {/* The playhead: where the cards above are in the story. */}
          <line x1={xOf(t)} x2={xOf(t)} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />
          <circle cx={xOf(t)} cy={yOf(waiting)} r={4.5} className={cn(TONES[verdict.tone].solidFill, "stroke-card")} strokeWidth={1.5} />

          {/* The three numbers. */}
          {cards.map((c, i) => {
            const x = 13 + i * 134;
            return (
              <g key={c.label}>
                <rect x={x} y={NUM_Y} width={126} height={NUM_H} rx={12} strokeWidth={c.tone ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone ? TONES[c.tone].stroke : NEUTRAL.line)} />
                <text x={x + 10} y={NUM_Y + 16} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
                <text x={x + 10} y={NUM_Y + 35} className={cn(c.tone ? TONES[c.tone].text : NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{c.value}</text>
              </g>
            );
          })}

          {/* The burst rail. */}
          <TightRailSlider
            svgRef={svg}
            x0={BURST_RAIL.x0}
            x1={BURST_RAIL.x1}
            y={BURST_RAIL.y}
            label="Burst rate in jobs per second"
            valueText={valueText(run)}
            value={burst}
            min={BURST.min}
            max={BURST.max}
            fromFraction={burstFromFraction}
            onKey={burstKey}
            onChange={setBurst}
            onGrab={grab}
            above={24}
            below={20}
          >
            <SliderRail
              x0={BURST_RAIL.x0}
              x1={BURST_RAIL.x1}
              y={BURST_RAIL.y}
              fraction={burstToFraction(burst)}
              marks={BURST_SNAPS.map((v) => ({ at: burstToFraction(v) }))}
              ends={["150", "400"]}
              caption={`burst ${burst} jobs a second`}
            />
          </TightRailSlider>

          {/* The workers rail. */}
          <text x={34} y={WORKERS_RAIL.y - 24} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`workers: each does ${PER_WORKER} a second`}</text>
          <SnapStopsRail
            svgRef={svg}
            x0={WORKERS_RAIL.x0}
            x1={WORKERS_RAIL.x1}
            y={WORKERS_RAIL.y}
            stops={WORKER_STOPS.map((v) => ({ value: v, label: String(v) }))}
            value={workers}
            onChange={setWorkers}
            ariaLabel="Number of workers"
            valueText={`${workers} workers, capacity ${run.capacity} jobs per second`}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
