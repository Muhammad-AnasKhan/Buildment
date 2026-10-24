"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import { CODES_PER_SECOND, SMS_RATE } from "../models/dardasha-numbers";
import {
  CHART_MAX,
  HORIZON_MINUTES,
  limitLine,
  LIMIT_DEFAULT,
  LIMIT_STEPS,
  limitText,
  OUTAGE_DEFAULT,
  OUTAGE_STEPS,
  outageRun,
  outageValueText,
  outageVerdict,
  type Outage,
} from "../models/dardasha-outage";

const W = 420;
const H = 456;
const CARD_Y = 86;
const APP_X = 62;
const QUEUE_X = 210;
const SMS_X = 358;
const CARD_HALF = 56;
const NUM_Y = 128;
const NUM_H = 42;
const PLOT = { x0: 52, x1: 388, top: 220, base: 336 };
const RAIL = { x0: 70, x1: 350, y: 408 };
const HORIZON = HORIZON_MINUTES * 60;
const LEAD = 0.4;
const REST = 2;
const PLAY_SECONDS = 8;

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (sec: number) => r1(PLOT.x0 + (Math.max(0, Math.min(HORIZON, sec)) / HORIZON) * (PLOT.x1 - PLOT.x0));
const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(CHART_MAX, v)) / CHART_MAX) * (PLOT.base - PLOT.top));

const AREA: Record<Tone, string> = {
  good: "fill-emerald-600/25 dark:fill-emerald-400/25",
  warn: "fill-amber-600/25 dark:fill-amber-400/25",
  bad: "fill-red-600/25 dark:fill-red-400/25",
  accent: "fill-blue-600/25 dark:fill-blue-400/25",
};

/** Where the story ends on the chart: a little after the queue is empty. */
function playEnd(r: Outage): number {
  return Math.min(HORIZON, r.outage * 60 + r.backSeconds + 120);
}

/** Story seconds at a clock reading: waits a moment, grows, rests on the finished picture, repeats. */
function storyAt(r: Outage, seconds: number): number {
  const loop = LEAD + PLAY_SECONDS + REST;
  const phase = ((seconds % loop) + loop) % loop;
  return Math.min(playEnd(r), Math.max(0, ((phase - LEAD) / PLAY_SECONDS) * playEnd(r)));
}

/** 22.5 beat 5: drag the outage length and choose when stale codes are dropped. */
export function OutagePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [outage, setOutage] = useState<number>(OUTAGE_DEFAULT);
  const [limit, setLimit] = useState<number>(LIMIT_DEFAULT);

  const run = useMemo(() => outageRun(outage, limit), [outage, limit]);
  const verdict = outageVerdict(run);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const end = playEnd(run);
  const t = clock.reduced || settled ? end : storyAt(run, clock.seconds);
  const playing = !clock.reduced && !settled;
  const down = t < run.outage * 60;
  const waiting = run.series[Math.min(HORIZON, Math.floor(t))] ?? 0;

  const points: string[] = [];
  const last = Math.min(HORIZON, Math.floor(t));
  for (let s = 0; s <= last; s += 6) points.push(`L${xOf(s)} ${yOf(run.series[s])}`);
  if (last % 6 !== 0) points.push(`L${xOf(last)} ${yOf(run.series[last])}`);
  const curve = points.join(" ");
  const area = `M${xOf(0)} ${PLOT.base} ${curve} L${xOf(last)} ${PLOT.base} Z`;
  const line = `M${xOf(0)} ${yOf(0)} ${curve}`;

  const dotsIn = playing ? flowDots(clock.seconds, flowDotsPerSecond(0.45)) : [];
  const dotsOut = playing && !down && waiting > 0 ? flowDots(clock.seconds, flowDotsPerSecond(0.9)) : [];
  const gapA = { x0: APP_X + CARD_HALF + 4, x1: QUEUE_X - CARD_HALF - 4 };
  const gapB = { x0: QUEUE_X + CARD_HALF + 4, x1: SMS_X - CARD_HALF - 4 };

  const queueTone: Tone = waiting < 1 ? "good" : "warn";
  const xEnd = xOf(run.outage * 60);
  const yLimit = run.limit > 0 ? yOf(limitLine(run.limit)) : 0;
  const limitLabel = `older than ${run.limit} min`;
  const limitW = r1(limitLabel.length * 6.4 + 18);

  const cards = [
    { label: "waiting at end", value: withCommas(run.waiting), tone: null as Tone | null },
    { label: "dropped", value: withCommas(run.dropped), tone: run.dropped > 0 ? ("warn" as Tone) : null },
    { label: "back to normal in", value: `${Math.round(run.backSeconds / 60)} min`, tone: null as Tone | null },
  ];

  const description = `An SMS provider is down for ${outage} minutes while login codes arrive at ${CODES_PER_SECOND} a second. After it returns it sends ${SMS_RATE} a second. ${outageValueText(run)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>outage</b> length, then choose when to <b>drop</b> old codes.
        </>
      }
      controls={
        <>
          <BeatSegmented<string>
            label="Drop codes older than"
            options={LIMIT_STEPS.map((v) => ({ id: String(v), label: limitText(v) === "never" ? "Never" : limitText(v) }))}
            value={String(limit)}
            onChange={(id) => setLimit(Number(id))}
          />
          <BeatActionButton onClick={clock.restart}>Replay</BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The path of a code: the app makes it, the queue holds it, the SMS provider sends it. */}
          <line x1={gapA.x0} x2={gapA.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={gapB.x0} x2={gapB.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dotsIn.map((d) => (
            <circle key={`a${d.id}`} cx={r1(gapA.x0 + (gapA.x1 - gapA.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES.accent.solidFill} />
          ))}
          {dotsOut.map((d) => (
            <circle key={`b${d.id}`} cx={r1(gapB.x0 + (gapB.x1 - gapB.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES.good.solidFill} />
          ))}
          <SvgNode x={APP_X} y={CARD_Y} label="App" kind="server" status={`${CODES_PER_SECOND} codes /s`} statusTone="accent" />
          <SvgNode x={QUEUE_X} y={CARD_Y} label="Queue" kind="queue" status={waiting < 1 ? "empty" : `${withCommas(Math.round(waiting))} waiting`} statusTone={queueTone} />
          <SvgNode x={SMS_X} y={CARD_Y} label="Provider" kind="server" status={down ? "down" : `${SMS_RATE} /s`} statusTone={down ? "bad" : "good"} mark={down ? "bad" : undefined} />

          {/* Three numbers. */}
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

          {/* The chart: codes waiting over 30 minutes, with the outage as a shaded band. */}
          <rect x={xOf(0)} y={PLOT.top} width={r1(xEnd - xOf(0))} height={PLOT.base - PLOT.top} className="fill-muted-foreground/10" />
          <text x={r1((xOf(0) + xEnd) / 2)} y={PLOT.top - 7} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>outage</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CHART_MAX)} y2={yOf(CHART_MAX)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CHART_MAX / 2)} y2={yOf(CHART_MAX / 2)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <path d={area} className={cn(AREA[verdict.tone], "transition-colors duration-200 motion-reduce:transition-none")} />
          <path d={line} fill="none" strokeWidth={2.25} strokeLinejoin="round" className={cn(TONES[verdict.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
          {run.dropped > 0 && t >= run.outage * 60 ? (
            <line x1={xEnd} x2={xEnd} y1={yOf(run.waiting)} y2={yOf(run.afterDrop)} strokeWidth={3} strokeLinecap="round" className={TONES.warn.stroke} />
          ) : null}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, CHART_MAX / 2, CHART_MAX].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{withCommas(v)}</text>
          ))}
          {[0, 10, 20, 30].map((m) => (
            <text key={m} x={xOf(m * 60)} y={PLOT.base + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{m === 30 ? "30 min" : String(m)}</text>
          ))}

          {run.limit > 0 ? (
            <g>
              <line x1={PLOT.x0} x2={PLOT.x1} y1={yLimit} y2={yLimit} strokeWidth={2} strokeDasharray="6 4" className={TONES.warn.stroke} />
              <rect x={PLOT.x1 - limitW} y={yLimit - 25} width={limitW} height={21} rx={10.5} className="fill-card" />
              <rect x={PLOT.x1 - limitW} y={yLimit - 25} width={limitW} height={21} rx={10.5} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              <text x={PLOT.x1 - limitW / 2} y={yLimit - 10} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold tabular-nums")}>{limitLabel}</text>
            </g>
          ) : null}

          {playing ? (
            <g>
              <line x1={xOf(t)} x2={xOf(t)} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />
              <circle cx={xOf(t)} cy={yOf(waiting)} r={4.5} className={cn(TONES[verdict.tone].solidFill, "stroke-card")} strokeWidth={1.5} />
            </g>
          ) : null}

          {/* The outage length: a rail with four stops. */}
          <text x={W / 2} y={RAIL.y - 26} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>the SMS provider is down for</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={OUTAGE_STEPS.map((v) => ({ value: v, label: `${v} min` }))}
            value={outage}
            onChange={setOutage}
            ariaLabel="Length of the outage in minutes"
            valueText={outageValueText(run)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
