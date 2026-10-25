"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { LABEL_HALO, NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import { withCommas } from "../models/picture-controls";
import {
  dotCount,
  dotProgress,
  FLEET,
  K_CHOICES,
  K_DEFAULT,
  linesAt,
  linesTone,
  restartRun,
  restartValueText,
  restartVerdict,
  secondsText,
  SPREAD_DEFAULT,
  SPREAD_STEPS,
  type Restart,
} from "../models/gateway-restart";

const W = 420;
const H = 520;
const COLS = 12;
const CELL = { w: 24, h: 18, gapX: 6, gapY: 6, x0: 33, y0: 70 };
const CHIPS_Y = 226;
const CHIP_W = 64;
const CHIP_GAP = 12;
const NUM_Y = 256;
const NUM_H = 42;
const PLOT = { x0: 46, x1: 364, top: 326, base: 410 };
const T_MAX = 36;
const Y_MAX = 70_000;
const RAIL = { x0: 60, x1: 360, y: 480 };
/** Seconds of the story that pass in one second on screen. */
const SPEED = 2.4;
const LEAD = 0.4;
const REST = 2;

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(PLOT.x0 + (Math.max(0, Math.min(T_MAX, t)) / T_MAX) * (PLOT.x1 - PLOT.x0));
const yOf = (v: number) => r1(PLOT.base - (Math.max(0, Math.min(Y_MAX, v)) / Y_MAX) * (PLOT.base - PLOT.top));
const cellX = (i: number) => CELL.x0 + (i % COLS) * (CELL.w + CELL.gapX);
const cellY = (i: number) => CELL.y0 + Math.floor(i / COLS) * (CELL.h + CELL.gapY);

/** Story seconds at a clock reading: waits a moment, plays, rests on the finished picture, repeats. */
function storyAt(run: Restart, seconds: number): number {
  const play = (run.time + 2) / SPEED;
  const loop = LEAD + play + REST;
  const phase = ((seconds % loop) + loop) % loop;
  return Math.min(run.time + 2, Math.max(0, (phase - LEAD) * SPEED));
}

const BAR: Record<Tone, string> = {
  good: "fill-emerald-600/25 dark:fill-emerald-400/25",
  warn: "fill-amber-600/25 dark:fill-amber-400/25",
  bad: "fill-red-600/30 dark:fill-red-400/30",
  accent: "fill-blue-600/25 dark:fill-blue-400/25",
};

/** 22.3 beat 3: tap how many gateways restart, drag how long the phones spread their return. */
export function ConnectionsPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [k, setK] = useState<number>(K_DEFAULT);
  const [spread, setSpread] = useState<number>(SPREAD_DEFAULT);

  const run = restartRun(k, spread);
  const verdict = restartVerdict(run);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const end = run.time + 2;
  const t = clock.reduced || settled ? end : storyAt(run, clock.seconds);
  const playing = !clock.reduced && !settled;

  const lines = linesAt(run, t);
  const cellTone = linesTone(lines);
  const finalTone = linesTone(run.linesEach);
  const arrivalTone: Tone = run.over ? "bad" : "good";

  const lit = Array.from({ length: FLEET - k }, (_, i) => k + i);
  const dots = playing
    ? Array.from({ length: dotCount(k) }, (_, i) => {
        const p = dotProgress(run, i, t);
        if (p === null) return null;
        const from = i % k;
        const to = lit[(i * 7 + 3) % lit.length];
        const fx = cellX(from) + CELL.w / 2;
        const fy = cellY(from) + CELL.h / 2;
        const tx = cellX(to) + CELL.w / 2;
        const ty = cellY(to) + CELL.h / 2;
        return { id: i, x: r1(fx + (tx - fx) * p), y: r1(fy + (ty - fy) * p) };
      })
    : [];

  const revealed = Math.min(run.window, t);
  const barTop = yOf(run.arrival);
  const clipped = run.arrival > Y_MAX;
  const acceptY = yOf(run.accepts);
  const marker = xOf(run.time);
  const markerLabel = `back in ${secondsText(run.time)}`;
  const markerX = Math.max(PLOT.x0 + 44, Math.min(PLOT.x1 - 44, marker));

  const chipsW = K_CHOICES.length * CHIP_W + (K_CHOICES.length - 1) * CHIP_GAP;
  const chipsX0 = (W - chipsW) / 2;

  const cards = [
    { label: "arrive each second", value: withCommas(run.arrival), tone: arrivalTone },
    { label: "fleet accepts", value: withCommas(run.accepts), tone: "good" as Tone },
    { label: "lines on each", value: withCommas(run.linesEach), tone: finalTone },
  ];

  const description = `Sixty gateways hold 50,000 lines each. ${restartValueText(run)}. Each healthy gateway ends with ${withCommas(run.linesEach)} lines. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap how many gateways <b>restart</b>, then drag the <b>spread</b> of the return.
        </>
      }
      controls={<BeatButton onClick={clock.restart}>Restart</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <text x={W / 2} y={58} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            60 gateways: the dark ones restart
          </text>

          {/* The fleet: one cell for each gateway. Dark cells restart; lit cells take their phones and turn from green to red as they fill. */}
          <g aria-hidden>
            {Array.from({ length: FLEET }, (_, i) =>
              i < k ? (
                <rect key={i} x={cellX(i)} y={cellY(i)} width={CELL.w} height={CELL.h} rx={5} strokeWidth={1.5} className="fill-muted-foreground stroke-muted-foreground" />
              ) : (
                <rect
                  key={i}
                  x={cellX(i)}
                  y={cellY(i)}
                  width={CELL.w}
                  height={CELL.h}
                  rx={5}
                  strokeWidth={1.5}
                  className={cn(TONES[cellTone].softFill, TONES[cellTone].stroke, "transition-colors duration-200 motion-reduce:transition-none")}
                />
              )
            )}
            {dots.map((d) => (d ? <circle key={d.id} cx={d.x} cy={d.y} r={3.4} className={cn(TONES[run.over ? "bad" : "accent"].solidFill, "stroke-card")} strokeWidth={1} /> : null))}
          </g>

          {/* How many gateways restart: four chips inside the picture. */}
          <text x={W / 2} y={CHIPS_Y - 22} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
            gateways restarting at once
          </text>
          <g role="radiogroup" aria-label="Gateways restarting at once">
            {K_CHOICES.map((n, i) => (
              <SvgRadioChip
                key={n}
                x={chipsX0 + i * (CHIP_W + CHIP_GAP)}
                y={CHIPS_Y}
                width={CHIP_W}
                text={String(n)}
                label={`${n} ${n === 1 ? "gateway" : "gateways"} restart at once, ${withCommas(restartRun(n, spread).arrival)} arrivals a second`}
                checked={n === k}
                onSelect={() => setK(n)}
              />
            ))}
          </g>

          {/* Three numbers. */}
          {cards.map((c, i) => {
            const x = 13 + i * 134;
            return (
              <g key={c.label}>
                <rect x={x} y={NUM_Y} width={126} height={NUM_H} rx={12} strokeWidth={c.tone === "bad" ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone === "bad" ? TONES.bad.stroke : NEUTRAL.line)} />
                <text x={x + 10} y={NUM_Y + 16} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
                <text x={x + 10} y={NUM_Y + 35} className={cn(c.tone === "bad" ? TONES.bad.text : NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{c.value}</text>
              </g>
            );
          })}

          {/* The chart: phones arriving each second, against what the fleet accepts. */}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(Y_MAX)} y2={yOf(Y_MAX)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(Y_MAX / 2)} y2={yOf(Y_MAX / 2)} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          {revealed > 0 ? (
            <g>
              <rect x={xOf(0)} y={barTop} width={r1(Math.max(2, xOf(revealed) - xOf(0)))} height={r1(PLOT.base - barTop)} className={BAR[run.over ? "bad" : "accent"]} />
              <line x1={xOf(0)} x2={xOf(revealed)} y1={barTop} y2={barTop} strokeWidth={2.25} className={TONES[run.over ? "bad" : "accent"].stroke} />
              {clipped ? <path d={`M${xOf(0) + 1} ${barTop + 10} l5 -9 l5 9 Z`} className={TONES.bad.solidFill} /> : null}
            </g>
          ) : null}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={acceptY} y2={acceptY} strokeWidth={2} strokeDasharray="6 4" className={TONES.good.stroke} />
          <text x={PLOT.x1 + 6} y={acceptY + 4} className={cn(TONES.good.text, "text-[11.5px] font-semibold")}>accepts</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, Y_MAX / 2, Y_MAX].map((v) => (
            <text key={v} x={PLOT.x0 - 6} y={yOf(v) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{withCommas(v)}</text>
          ))}
          {[0, 10, 20, 30].map((s) => (
            <text key={s} x={xOf(s)} y={PLOT.base + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{s === 30 ? "30 s" : String(s)}</text>
          ))}
          <line x1={marker} x2={marker} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} className={TONES.accent.stroke} />
          <text x={markerX} y={PLOT.top - 8} textAnchor="middle" className={cn(TONES.accent.text, LABEL_HALO, "text-[11.5px] font-semibold tabular-nums")}>{markerLabel}</text>
          {playing ? <line x1={xOf(t)} x2={xOf(t)} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} /> : null}

          {/* The spread of the return: a rail with four stops. */}
          <text x={W / 2} y={RAIL.y - 26} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>phones come back over</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={SPREAD_STEPS.map((v) => ({ value: v, label: v === 0 ? "at once" : `${v} s` }))}
            value={spread}
            onChange={setSpread}
            ariaLabel="Spread of the return in seconds"
            valueText={restartValueText(run)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
