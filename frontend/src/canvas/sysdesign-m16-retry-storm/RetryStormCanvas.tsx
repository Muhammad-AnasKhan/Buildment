"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow, chipRowWidth } from "../primitives/radio-chip-row";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgStat } from "../primitives/svg-stat";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import { BASE_LOAD, BLIP, CAPACITY, RETRY_DEFAULT, RETRY_STOPS, RULES, RULE_DEFAULT, SECONDS, rowAt, runStorm, valueText, verdictFor, type Rule } from "./model";

const W = 420;
const H = 520;
const CARD_Y = 80;
const CLIENTS_X = 72;
const SERVER_X = 348;
const PLOT = { x0: 50, x1: 406, top: 140, base: 262, max: 340 };
const BAR_W = 4.2;
const STAT_Y = 328;
const CHIP_Y = 420;
const RAIL = { x0: 70, x1: 350, y: 478 };
/** How many model seconds the sweep covers in one real second, and the rest at the end. */
const SWEEP_RATE = 9;
const SWEEP_PERIOD = SECONDS / SWEEP_RATE + 2.5;

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(PLOT.x0 + (Math.max(0, Math.min(SECONDS, t)) / SECONDS) * (PLOT.x1 - PLOT.x0));
const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(PLOT.max, v)) / PLOT.max) * (PLOT.base - PLOT.top));

/** 16.4 beat 4: a short blip, then retries. Does the system come back? */
export function RetryStormCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [retries, setRetries] = useState<number>(RETRY_DEFAULT);
  const [rule, setRule] = useState<Rule>(RULE_DEFAULT);

  const run = useMemo(() => runStorm(retries, rule), [retries, rule]);
  const verdict = verdictFor(run);

  // The sweep walks along the strip; the cards show the state under it. A still picture rests at the end.
  const t = clock.reduced ? SECONDS : Math.min(SECONDS, (clock.seconds % SWEEP_PERIOD) * SWEEP_RATE);
  const row = rowAt(run, Math.min(SECONDS - 1, t - 0.01));
  const waiting = Math.round(row.queue);
  const serverTone: Tone = waiting < 20 ? "good" : "bad";
  const dots = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(Math.min(1, row.attempts / 320)));
  const gap = { x0: CLIENTS_X + 60, x1: SERVER_X - 60 };

  const attemptsLine = run.rows.map((r, i) => `${i === 0 ? "M" : "L"}${xOf(r.t - 0.5)} ${yOf(r.attempts)}`).join(" ");
  const stuck = run.recoveredAt === null;
  const peakTone: Tone | null = run.peakAttempts > CAPACITY * 1.2 ? "bad" : null;
  const queueTone: Tone | null = run.queueAtEnd >= 20 ? "bad" : null;
  const description = `A ${BLIP.to - BLIP.from} second blip from second ${BLIP.from} cuts capacity from ${CAPACITY} to ${BLIP.capacity} requests a second; normal load is ${BASE_LOAD}. With ${retries} retries, rule ${RULES.find((r) => r.id === rule)?.text}: peak ${Math.round(run.peakAttempts)} attempts a second, ${withCommas(run.queueAtEnd)} waiting at ${SECONDS} seconds. ${verdict.text}.`;
  const chipX = (W - chipRowWidth(RULES.map((r) => r.text))) / 2;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>retries</b> rail and pick a <b>retry rule</b>. Does the system come back after the blip?</>}
      controls={<BeatActionButton onClick={() => clock.restart()}>Replay</BeatActionButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Clients and the server, with attempt dots that follow the load under the sweep. */}
          <line x1={gap.x0} x2={gap.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dots.map((d) => (
            <circle key={d.id} cx={r1(gap.x0 + (gap.x1 - gap.x0) * d.progress)} cy={CARD_Y} r={3.6} className={TONES[serverTone].solidFill} />
          ))}
          <SvgNode x={CLIENTS_X} y={CARD_Y} label="Clients" kind="phone" status={`${Math.round(row.attempts)} a second`} statusTone={row.attempts > CAPACITY ? "bad" : "good"} />
          <SvgNode x={SERVER_X} y={CARD_Y} label="Server" kind="server" status={waiting < 20 ? "keeps up" : `${withCommas(waiting)} waiting`} statusTone={serverTone} mark={waiting >= 20 ? "bad" : undefined} />

          {/* The strip: answers in time (bars), attempts (line), capacity (dashed), the blip (band). */}
          <rect x={xOf(BLIP.from)} y={PLOT.top} width={r1(xOf(BLIP.to) - xOf(BLIP.from))} height={PLOT.base - PLOT.top} className="fill-muted-foreground/15" />
          <text x={r1((xOf(BLIP.from) + xOf(BLIP.to)) / 2)} y={PLOT.top - 6} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>blip</text>
          {run.rows.map((r) => (
            <rect key={r.t} x={r1(xOf(r.t - 0.5) - BAR_W / 2)} y={yOf(r.good)} width={BAR_W} height={r1(Math.max(0, PLOT.base - yOf(r.good)))} rx={1.5} className={cn(TONES.good.solidFill, "opacity-70")} />
          ))}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CAPACITY)} y2={yOf(CAPACITY)} strokeWidth={2} strokeDasharray="6 4" className={TONES.warn.stroke} />
          <path d={attemptsLine} fill="none" strokeWidth={2.25} strokeLinejoin="round" className={cn(TONES.accent.stroke, "stroke-[2.25px]")} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 100, 200, 300].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(v === CAPACITY ? TONES.warn.text : NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{v}</text>
          ))}
          {[0, 20, 40, 60].map((s) => (
            <text key={s} x={xOf(s)} y={PLOT.base + 17} textAnchor={s === 0 ? "start" : s === 60 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{s === 60 ? "60 s" : String(s)}</text>
          ))}
          {!clock.reduced ? (
            <g>
              <line x1={xOf(t)} x2={xOf(t)} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />
              <circle cx={xOf(t)} cy={yOf(row.attempts)} r={4.5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
            </g>
          ) : null}

          {/* Legend. */}
          <g aria-hidden>
            <rect x={PLOT.x0} y={PLOT.base + 29} width={10} height={10} rx={2} className={cn(TONES.good.solidFill, "opacity-70")} />
            <text x={PLOT.x0 + 15} y={PLOT.base + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>answered in time</text>
            <line x1={PLOT.x0 + 118} x2={PLOT.x0 + 136} y1={PLOT.base + 34} y2={PLOT.base + 34} strokeWidth={2.5} className={TONES.accent.stroke} />
            <text x={PLOT.x0 + 141} y={PLOT.base + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>attempts</text>
            <line x1={PLOT.x0 + 204} x2={PLOT.x0 + 222} y1={PLOT.base + 34} y2={PLOT.base + 34} strokeWidth={2.5} strokeDasharray="5 3" className={TONES.warn.stroke} />
            <text x={PLOT.x0 + 227} y={PLOT.base + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>capacity 100</text>
          </g>

          <SvgStat x={13} y={STAT_Y} width={194} label="most attempts in a second" value={String(Math.round(run.peakAttempts))} tone={peakTone} />
          <SvgStat x={213} y={STAT_Y} width={194} label={`waiting at ${SECONDS} s`} value={withCommas(run.queueAtEnd)} tone={queueTone} />

          {/* The retry rule, then the number of retries. */}
          <text x={chipX} y={CHIP_Y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>retry rule</text>
          <RadioChipRow x={chipX} y={CHIP_Y} options={RULES.map((r) => ({ id: r.id, text: r.text, label: r.label }))} value={rule} onChange={setRule} ariaLabel="Retry rule" />
          <text x={RAIL.x0 - 36} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>retries for each request</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={RETRY_STOPS.map((v) => ({ value: v, label: String(v) }))}
            value={retries}
            onChange={setRetries}
            ariaLabel="Retries per request"
            valueText={valueText(run)}
            tone={stuck && retries > 0 ? "bad" : "accent"}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
