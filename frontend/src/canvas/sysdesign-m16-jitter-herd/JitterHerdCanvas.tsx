"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow, chipRowWidth } from "../primitives/radio-chip-row";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgStat } from "../primitives/svg-stat";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import { CAPACITY, CLIENTS, RETRY_DEFAULT, RETRY_STOPS, SHOWN, WAITS, WAIT_DEFAULT, herd, textAlternative, valueText, verdictFor, type Wait } from "./model";

const W = 420;
const H = 520;
const CARD_Y = 80;
const CLIENTS_X = 72;
const SERVER_X = 348;
const PLOT = { x0: 50, x1: 410, top: 138, base: 252, max: 1000 };
const PITCH = (PLOT.x1 - PLOT.x0) / SHOWN;
const BAR_W = 12;
const STAT_Y = 296;
const CHIP_Y = 410;
const RAIL = { x0: 64, x1: 356, y: 474 };
const SLOT_S = 0.45;
const REST_S = 2.5;

const r1 = (v: number) => Math.round(v * 10) / 10;
const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(PLOT.max, v)) / PLOT.max) * (PLOT.base - PLOT.top));
const barX = (i: number) => r1(PLOT.x0 + i * PITCH + (PITCH - BAR_W) / 2);

/** 16.4 beat 5: 1,000 clients fail together. Does the wait rule spread their retries? */
export function JitterHerdCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [retries, setRetries] = useState<number>(RETRY_DEFAULT);
  const [wait, setWait] = useState<Wait>(WAIT_DEFAULT);

  const h = useMemo(() => herd(retries, wait), [retries, wait]);
  const verdict = verdictFor(h);

  // The sweep walks along the seconds; a still picture rests on the last one.
  const slot = clock.reduced ? SHOWN - 1 : Math.min(SHOWN - 1, Math.floor((clock.seconds % (SHOWN * SLOT_S + REST_S)) / SLOT_S));
  const arrivals = Math.round(h.arrivals[slot]);
  const servedNow = Math.round(h.servedBy[slot]);
  const over = arrivals > CAPACITY;
  const dots = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(Math.min(1, arrivals / CLIENTS)));
  const gap = { x0: CLIENTS_X + 60, x1: SERVER_X - 60 };
  const finalServed = Math.round(h.servedBy[SHOWN - 1]);
  const servedTone: Tone | null = verdict.tone === "good" ? "good" : verdict.tone === "bad" ? "bad" : "warn";
  const chipX = (W - chipRowWidth(WAITS.map((w) => w.text))) / 2;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Pick a <b>wait rule</b> and drag the <b>retries</b> rail. Watch how many clients get served.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{textAlternative(h)}</desc>
          <DotGrid width={W} height={H} />

          <line x1={gap.x0} x2={gap.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dots.map((d) => (
            <circle key={d.id} cx={r1(gap.x0 + (gap.x1 - gap.x0) * d.progress)} cy={CARD_Y} r={3.6} className={over ? TONES.bad.solidFill : TONES.good.solidFill} />
          ))}
          <SvgNode x={CLIENTS_X} y={CARD_Y} label="Clients" kind="phone" status={`${withCommas(arrivals)} calls`} statusTone={arrivals === 0 ? undefined : over ? "warn" : "good"} />
          <SvgNode x={SERVER_X} y={CARD_Y} label="Server" kind="server" status={`${CAPACITY} a second`} statusTone={over ? "bad" : "good"} mark={over ? "bad" : undefined} />

          {/* Calls arriving each second, against the 100 the server can serve. */}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(500)} y2={yOf(500)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          {!clock.reduced ? <rect x={r1(PLOT.x0 + slot * PITCH)} y={PLOT.top - 4} width={r1(PITCH)} height={PLOT.base - PLOT.top + 4} rx={3} className="fill-muted-foreground/15" /> : null}
          {h.arrivals.slice(0, SHOWN).map((a, i) => (
            <rect key={i} x={barX(i)} y={yOf(a)} width={BAR_W} height={r1(Math.max(0, PLOT.base - yOf(a)))} rx={2} className={cn(a > CAPACITY * 1.001 ? TONES.accent.solidFill : TONES.good.solidFill, "opacity-80", SHAPE_TRANSITION)} />
          ))}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(CAPACITY)} y2={yOf(CAPACITY)} strokeWidth={2} strokeDasharray="6 4" className={TONES.warn.stroke} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[1000, 500, 100].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(v === CAPACITY ? TONES.warn.text : NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{withCommas(v)}</text>
          ))}
          {[0, 5, 10, 15].map((s) => (
            <text key={s} x={r1(PLOT.x0 + s * PITCH + PITCH / 2)} y={PLOT.base + 17} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{String(s)}</text>
          ))}
          <text x={PLOT.x1} y={PLOT.base + 17} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>seconds</text>
          <text x={PLOT.x0} y={PLOT.base + 36} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>calls arriving each second; dashed line: what the server serves</text>

          <SvgStat x={13} y={STAT_Y} width={252} label={clock.reduced ? `served by ${SHOWN} s` : `served by ${slot + 1} s`} value={`${withCommas(clock.reduced ? finalServed : servedNow)} of ${withCommas(CLIENTS)}`} tone={servedTone} height={60} />
          <rect x={23} y={STAT_Y + 46} width={232} height={6} rx={3} className="fill-muted" />
          <rect x={23} y={STAT_Y + 46} width={r1(232 * ((clock.reduced ? finalServed : servedNow) / CLIENTS))} height={6} rx={3} className={cn(servedTone ? TONES[servedTone].solidFill : TONES.accent.solidFill, SHAPE_TRANSITION)} />
          <SvgStat x={273} y={STAT_Y} width={134} label="calls in all" value={withCommas(Math.round(h.calls))} tone={null} height={60} />

          <text x={chipX} y={CHIP_Y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>wait rule</text>
          <RadioChipRow x={chipX} y={CHIP_Y} options={WAITS.map((w) => ({ id: w.id, text: w.text, label: w.label }))} value={wait} onChange={setWait} ariaLabel="Wait rule" />
          <text x={RAIL.x0 - 30} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>retries allowed for each client</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={RETRY_STOPS.map((v) => ({ value: v, label: String(v) }))}
            value={retries}
            onChange={setRetries}
            ariaLabel="Retries allowed per client"
            valueText={valueText(h)}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
