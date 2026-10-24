"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatActionButton, BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  D1_DEFAULT,
  D1_MAX,
  D1_MIN,
  DRIVER_2,
  kmText,
  match,
  matchVerdict,
  RIDER_A,
  RIDER_B,
  savingText,
  shown,
  tripProgress,
  valueText,
  type Mode,
  type Pair,
} from "../models/batch-match";

const W = 420;
const H = 332;
const ROAD = { y0: 106, y1: 134, mid: 120 };
const PIN_Y = 74;
const BRACKET_Y = [190, 242] as const;
const TEXT_DY = 27;
const CHIP_Y = 290;

/** Road position: -0.5 km at x = 40, 1.0 km at x = 380. Positions are in tenths of a km. */
const xOf = (tenths: number) => Math.round((40 + ((tenths + 5) * 340) / 15) * 10) / 10;
const r1 = (v: number) => Math.round(v * 10) / 10;

const MODES = [
  { id: "one" as const, label: "One by one" },
  { id: "together" as const, label: "Together" },
];

const RIDER_PIN = "fill-violet-100 stroke-violet-600 dark:fill-violet-500/20 dark:stroke-violet-400";
const RIDER_TEXT = "fill-violet-800 dark:fill-violet-200";

/** 24.4 beat 5: two riders, two drivers on a road. Drag Driver 1 and compare matching one by one with matching together. */
export function BatchMatchCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [d1, setD1] = useState<number>(D1_DEFAULT);
  const [mode, setMode] = useState<Mode>("one");

  const r = match(d1);
  const verdict = matchVerdict(r, mode);
  const m = shown(r, mode);
  const [pA, pB] = clock.reduced ? ([1, 1] as [number, number]) : tripProgress(clock.seconds, mode, m);
  const wasted = mode === "one" && r.savedTenths > 0;
  const pairTone: [Tone, Tone] = mode === "together" ? ["good", "good"] : wasted ? ["accent", "bad"] : ["accent", "accent"];
  const text = valueText(d1, r);
  const driverX = (n: 1 | 2) => xOf(n === 1 ? d1 : DRIVER_2);
  const riderX = (id: "A" | "B") => xOf(id === "A" ? RIDER_A : RIDER_B);

  const description = `Rider A at 0 km, rider B at 1 km, Driver 2 at minus 0.5 km, Driver 1 at ${(d1 / 10).toFixed(1)} km. ${mode === "one" ? "One by one" : "Together"}: ${m.pairs.map((p) => `rider ${p.rider} gets Driver ${p.driver}, ${kmText(p.tenths)}`).join("; ")}; total ${kmText(m.totalTenths)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatChoice label="How the riders are matched" options={[MODES[0], MODES[1]]} value={mode} onChange={setMode} />
          <BeatActionButton onClick={() => setD1(D1_DEFAULT)} disabled={d1 === D1_DEFAULT}>Reset to 0.4 km</BeatActionButton>
        </>
      }
      hint={<>Drag <b>Driver 1</b> along the road.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The road, and the two riders waiting beside it. */}
          <rect x={14} y={ROAD.y0} width={W - 28} height={ROAD.y1 - ROAD.y0} rx={14} className="fill-muted" />
          <line x1={26} x2={W - 26} y1={ROAD.mid} y2={ROAD.mid} strokeWidth={1.5} strokeDasharray="6 7" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {(["A", "B"] as const).map((id) => {
            const x = riderX(id);
            return (
              <g key={id} aria-hidden>
                <path d={`M${x - 6} ${PIN_Y + 11} L${x} ${ROAD.y0 - 2} L${x + 6} ${PIN_Y + 11} Z`} className={cn(RIDER_PIN)} strokeWidth={1.5} strokeLinejoin="round" />
                <circle cx={x} cy={PIN_Y} r={14} strokeWidth={2} className={RIDER_PIN} />
                <text x={x} y={PIN_Y + 4.8} textAnchor="middle" className={cn(RIDER_TEXT, "text-[14px] font-bold")}>{id}</text>
                <text x={id === "A" ? x + 21 : x - 21} y={PIN_Y + 4.5} textAnchor={id === "A" ? "start" : "end"} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Rider {id}</text>
              </g>
            );
          })}

          {/* Driver 2 stays where it is. */}
          <Car x={driverX(2)} y={ROAD.mid} digit="2" accent={false} />

          {/* Guides from the cars and riders down to the pairing lines. */}
          {BRACKET_Y.map((y, i) => {
            const p = m.pairs[i];
            return (
              <g key={`guide-${i}`} aria-hidden>
                {[riderX(p.rider), driverX(p.driver)].map((x) => (
                  <line key={x} x1={x} x2={x} y1={ROAD.y1 + 3} y2={y - 10} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
                ))}
              </g>
            );
          })}

          {/* The pairing lines: who gets which driver, and how far the pickup is. */}
          {m.pairs.map((p, i) => (
            <Bracket key={`${p.rider}`} pair={p} y={BRACKET_Y[i]} tone={pairTone[i]} step={mode === "one" ? i + 1 : null} progress={i === 0 ? pA : pB} riderX={riderX(p.rider)} driverX={driverX(p.driver)} />
          ))}

          {/* Driver 1 is the slider: drag the car along the road. */}
          <TightRailSlider
            svgRef={svg}
            x0={xOf(D1_MIN)}
            x1={xOf(D1_MAX)}
            y={ROAD.mid}
            label="Driver 1 on the road"
            valueText={text}
            value={d1}
            min={D1_MIN}
            max={D1_MAX}
            fromFraction={(f) => Math.max(D1_MIN, Math.min(D1_MAX, Math.round(D1_MIN + f * (D1_MAX - D1_MIN))))}
            onKey={(v, key) => (key === "ArrowRight" || key === "ArrowUp" ? Math.min(D1_MAX, v + 1) : key === "ArrowLeft" || key === "ArrowDown" ? Math.max(D1_MIN, v - 1) : key === "Home" ? D1_MIN : key === "End" ? D1_MAX : null)}
            onChange={setD1}
            above={26}
            below={26}
            side={22}
          >
            {Array.from({ length: D1_MAX - D1_MIN + 1 }, (_, i) => (
              <circle key={i} cx={xOf(D1_MIN + i)} cy={ROAD.mid + 19} r={2} className={NEUTRAL.faintFill} aria-hidden />
            ))}
            <g style={{ transform: `translate(${driverX(1)}px, ${ROAD.mid}px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
              <circle r={24} className={TONES.accent.softFill} />
              <Car x={0} y={0} digit="1" accent />
            </g>
          </TightRailSlider>

          {/* Totals. */}
          <rect x={14} y={CHIP_Y} width={132} height={36} rx={18} strokeWidth={2} className={cn(NEUTRAL.surface, TONES[verdict.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={80} y={CHIP_Y + 23.5} textAnchor="middle" className={cn(TONES[verdict.tone].text, "text-[15px] font-bold tabular-nums")}>Total {kmText(m.totalTenths)}</text>
          <rect x={154} y={CHIP_Y} width={252} height={36} rx={18} strokeWidth={1.5} className={cn(r.savedTenths > 0 ? TONES.good.softFill : "fill-muted", r.savedTenths > 0 ? TONES.good.stroke : NEUTRAL.line)} />
          <text x={280} y={CHIP_Y + 23} textAnchor="middle" className={cn(r.savedTenths > 0 ? TONES.good.text : NEUTRAL.mutedText, "text-[13px] font-semibold tabular-nums")}>{savingText(r, mode)}</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}

/** A car on the road: a small body with its number. Driver 1 (accent) is the one the learner moves. */
function Car({ x, y, digit, accent }: { x: number; y: number; digit: string; accent: boolean }) {
  return (
    <g aria-hidden transform={`translate(${x} ${y})`}>
      <rect x={-19} y={-10} width={38} height={20} rx={7} className={accent ? cn(TONES.accent.solidFill, "stroke-card") : cn(NEUTRAL.doneFill, "stroke-card")} strokeWidth={2} />
      <circle cx={14} cy={0} r={1.8} className="fill-card" />
      <text x={-3} y={5} textAnchor="middle" className={cn(accent ? "fill-white dark:fill-blue-950" : "fill-card", "text-[14px] font-bold")}>{digit}</text>
    </g>
  );
}

function Bracket({ pair, y, tone, step, progress, riderX, driverX }: { pair: Pair; y: number; tone: Tone; step: number | null; progress: number; riderX: number; driverX: number }) {
  const t = TONES[tone];
  const cx = r1(driverX + (riderX - driverX) * progress);
  const label = `${step ? `${step}. ` : ""}${pair.rider} gets Driver ${pair.driver}: ${kmText(pair.tenths)}`;
  // Keep the words inside the picture when the pairing sits at the far left.
  const half = (label.length * 6.8) / 2;
  const labelX = r1(Math.max(14 + half, Math.min(W - 14 - half, (driverX + riderX) / 2)));
  return (
    <g>
      <line x1={driverX} x2={riderX} y1={y} y2={y} strokeWidth={3} strokeLinecap="round" className={cn(t.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
      {/* The car on its way to the rider. */}
      <circle cx={cx} cy={y} r={5.5} className={cn(t.solidFill, "stroke-card")} strokeWidth={2} />
      <g aria-hidden>
        <circle cx={driverX} cy={y} r={10} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
        <text x={driverX} y={y + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-bold")}>{pair.driver}</text>
        <circle cx={riderX} cy={y} r={10} strokeWidth={1.5} className={RIDER_PIN} />
        <text x={riderX} y={y + 4.2} textAnchor="middle" className={cn(RIDER_TEXT, "text-[11.5px] font-bold")}>{pair.rider}</text>
      </g>
      <text x={labelX} y={y + TEXT_DY} textAnchor="middle" className={cn(t.text, "text-[12.5px] font-semibold tabular-nums")}>{label}</text>
    </g>
  );
}
