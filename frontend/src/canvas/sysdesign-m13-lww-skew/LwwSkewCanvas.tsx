"use client";

import { useId, useRef, useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_GAP,
  DEFAULT_SKEW,
  GAPS,
  GAP_MAX,
  PAIRS,
  SKEWS,
  WRITE_1_AT,
  counterText,
  counts,
  formatMs,
  gapFromFraction,
  gapToFraction,
  pairResults,
  resultOf,
  skewFromFraction,
  skewToFraction,
  spreadPair,
  stamps,
  verdict,
  winner,
  type Mode,
  type Result,
} from "./model";

const W = 420;
const H = 500;
const AX0 = 28;
const AX1 = 392;
const MS_MAX = 56;
const AXIS_Y = 106;
const PILL = { y: 64, w: 66, h: 24 };
const TAG = { y: 192, w: 102, h: 28 };
const SQ = { x0: 22, y: 288, size: 15, step: 19 };
const RAIL_X0 = 118;
const RAIL_X1 = 386;
const RAIL_Y = [388, 450] as const;

const xOf = (ms: number) => AX0 + (ms / MS_MAX) * (AX1 - AX0);
const r1 = (v: number) => Math.round(v * 10) / 10;

const SQUARE: Record<Result, string> = {
  right: "fill-muted",
  wrong: cn(TONES.bad.solidFill),
  tie: cn(TONES.warn.solidFill),
  lost: cn(TONES.bad.solidFill),
};

/** A small triangle at the end of a line from (x0, y0) to (x1, y1). */
function head(x0: number, y0: number, x1: number, y1: number): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const p = (d: number, side: number) => `${r1(x1 - d * Math.cos(a) - side * Math.sin(a))},${r1(y1 - d * Math.sin(a) + side * Math.cos(a))}`;
  return `${r1(x1)},${r1(y1)} ${p(9, 4.5)} ${p(9, -4.5)}`;
}

/** 13.5: drag the clock skew and the gap between two writes, and count the wrong winners. */
export function LwwSkewCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [skew, setSkew] = useState<number>(DEFAULT_SKEW);
  const [gap, setGap] = useState<number>(DEFAULT_GAP);
  const [mode, setMode] = useState<Mode>("sequential");

  const { stamp1, stamp2 } = stamps(skew, gap);
  const v = verdict(skew, gap, mode);
  const res = resultOf(skew, gap, mode);
  const win = winner(skew, gap);
  const tally = counts(skew, mode);
  const pairs = pairResults(skew, mode);
  const counter = counterText(skew, mode);

  const real = [xOf(WRITE_1_AT), xOf(WRITE_1_AT + gap)];
  const [p1, p2] = spreadPair(real[0], real[1], PILL.w, 8, W - 8);
  const [t1, t2] = spreadPair(xOf(stamp1), xOf(stamp2), TAG.w, 8, W - 8);
  const pillX = [p1, p2];
  const tagX = [t1, t2];
  const stampOf = [stamp1, stamp2];

  const phase = clock.reduced ? -1 : (clock.seconds / 1.8) % 1;

  const tagState = (n: 0 | 1): "win" | "lost" | "wrong" | "replaced" | "tie" => {
    if (win === 0) return "tie";
    const mine = n === 0 ? 1 : 2;
    if (win === mine) return "win";
    if (mode === "concurrent") return "lost";
    return res === "wrong" ? "wrong" : "replaced";
  };

  const rails = [
    { key: "skew", y: RAIL_Y[0], name: "Clock skew", value: `${skew} ms`, label: "Clock skew between the two nodes", ladder: SKEWS as readonly number[], current: skew, ticks: SKEWS.map((s) => ({ v: s, f: skewToFraction(s), text: String(s) })), from: skewFromFraction, set: setSkew },
    {
      key: "gap",
      y: RAIL_Y[1],
      name: "Gap",
      value: `${gap} ms`,
      label: "Gap between the two writes",
      ladder: GAPS,
      current: gap,
      ticks: [1, 5, 10, 15, 20, 25, GAP_MAX].map((g) => ({ v: g, f: gapToFraction(g), text: String(g) })),
      from: gapFromFraction,
      set: setGap,
    },
  ];

  const description = `Write 1 happens on node A at ${WRITE_1_AT} ms. Node A's clock is ${skew} ms ahead of node B's. Write 2 happens on node B ${gap} ms later. Stamp 1 is ${formatMs(stamp1)} and stamp 2 is ${formatMs(stamp2)}. ${v.text}. ${counter}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>skew</b> and the <b>gap</b>. Then switch to Concurrent.
        </>
      }
      controls={
        <BeatChoice<Mode>
          label="Kind of conflict"
          options={[
            { id: "sequential", label: "Sequential" },
            { id: "concurrent", label: "Concurrent" },
          ]}
          value={mode}
          onChange={setMode}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Real time: where the two writes really happened. */}
          <line x1={AX0} x2={AX1} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={2.5} strokeLinecap="round" className={NEUTRAL.doneStroke} />
          <text x={8} y={AXIS_Y - 8} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>real time</text>
          {[0, 1].map((n) => (
            <g key={`real${n}`}>
              <line x1={r1(pillX[n])} x2={r1(real[n])} y1={PILL.y + PILL.h / 2} y2={AXIS_Y - 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <circle cx={r1(real[n])} cy={AXIS_Y} r={6} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
            </g>
          ))}

          {/* Arrows from the real moment to the stamp the clock wrote. */}
          {[0, 1].map((n) => {
            const x0 = real[n];
            const y0 = AXIS_Y + 8;
            const x1 = tagX[n];
            const y1 = TAG.y - TAG.h / 2 - 3;
            return (
              <g key={`arrow${n}`}>
                <line x1={r1(x0)} y1={y0} x2={r1(x1)} y2={y1} strokeWidth={1.75} className={NEUTRAL.doneStroke} />
                <polygon points={head(x0, y0, x1, y1)} className={NEUTRAL.doneFill} />
                {phase >= 0 ? <circle cx={r1(x0 + (x1 - x0) * phase)} cy={r1(y0 + (y1 - y0) * phase)} r={3.5} className={TONES.accent.solidFill} opacity={Math.sin(Math.PI * phase)} /> : null}
              </g>
            );
          })}

          {/* Write pills, drawn after the lines. */}
          {[0, 1].map((n) => (
            <g key={`pill${n}`}>
              <rect x={r1(pillX[n] - PILL.w / 2)} y={PILL.y - PILL.h / 2 + 4} width={PILL.w} height={PILL.h} rx={PILL.h / 2} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={r1(pillX[n])} y={PILL.y + 8.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{`write ${n + 1}`}</text>
            </g>
          ))}

          {/* The stamps the two clocks wrote. The larger one wins. */}
          {[0, 1].map((n) => {
            const state = tagState(n as 0 | 1);
            const tone: Tone = state === "win" ? (res === "wrong" ? "warn" : "good") : state === "tie" ? "warn" : state === "replaced" ? "accent" : "bad";
            const left = tagX[n] - TAG.w / 2;
            const crowned = state === "win";
            return (
              <g key={`tag${n}`}>
                <rect x={r1(left)} y={TAG.y - TAG.h / 2} width={TAG.w} height={TAG.h} rx={TAG.h / 2} strokeWidth={2} className={cn(NEUTRAL.surface, state === "replaced" ? NEUTRAL.line : TONES[tone].stroke)} />
                {crowned ? <Crown x={r1(left + 8)} y={TAG.y - 8} width={16} height={16} strokeWidth={2} className={cn("fill-none", res === "wrong" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")} aria-hidden /> : null}
                <text x={r1(left + (crowned ? 62 : TAG.w / 2))} y={TAG.y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{`stamp ${formatMs(stampOf[n])}`}</text>
                <rect x={r1(tagX[n] - 36)} y={TAG.y + TAG.h / 2 + 5} width={72} height={20} rx={10} className={state === "replaced" ? "fill-muted" : state === "win" ? TONES.good.softFill : TONES[tone].softFill} />
                <text x={r1(tagX[n])} y={TAG.y + TAG.h / 2 + 19} textAnchor="middle" className={cn(state === "replaced" ? NEUTRAL.mutedText : TONES[state === "win" ? (res === "wrong" ? "warn" : "good") : tone].text, "text-[11.5px] font-semibold")}>
                  {state === "win" ? "kept" : state === "tie" ? "tie" : state === "replaced" ? "replaced" : "lost"}
                </text>
              </g>
            );
          })}
          <text x={W / 2} y={254} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>stamp = what that node&apos;s clock read</text>

          {/* 20 pairs, gaps 1 to 20 ms: red where the wrong write wins. */}
          <text x={SQ.x0} y={SQ.y - 12} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`${PAIRS} pairs, gaps 1 to ${PAIRS} ms`}</text>
          <text x={W - 22} y={SQ.y - 12} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px]")}>red wrong, amber tie</text>
          {pairs.map((p, i) => (
            <rect key={p.gap} x={SQ.x0 + i * SQ.step} y={SQ.y} width={SQ.size} height={SQ.size} rx={4} className={cn(SQUARE[p.result], "transition-colors duration-200 motion-reduce:transition-none")} />
          ))}
          {gap <= PAIRS ? <rect x={SQ.x0 + (gap - 1) * SQ.step - 3} y={SQ.y - 3} width={SQ.size + 6} height={SQ.size + 6} rx={6} strokeWidth={2} className={cn("fill-none", TONES.accent.stroke)} /> : null}
          <text x={W / 2} y={SQ.y + 38} textAnchor="middle" className={cn(tally.wrong > 0 ? TONES.bad.text : TONES.good.text, "text-[14px] font-bold tabular-nums")}>{counter}</text>

          {rails.map((r) => {
            const hx = RAIL_X0 + (r.key === "skew" ? skewToFraction(skew) : gapToFraction(gap)) * (RAIL_X1 - RAIL_X0);
            return (
              <g key={r.key}>
                <text x={8} y={r.y - 2} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{r.name}</text>
                <text x={8} y={r.y + 15} className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{r.value}</text>
                <RailSlider
                  svgRef={svg}
                  x0={RAIL_X0}
                  x1={RAIL_X1}
                  y={r.y}
                  label={r.label}
                  valueText={`${r.name.toLowerCase()} ${r.value}. ${counter}`}
                  value={r.current}
                  ladder={r.ladder}
                  fromFraction={r.from}
                  onChange={r.set}
                >
                  <g aria-hidden>
                    <line x1={RAIL_X0} x2={RAIL_X1} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                    <line x1={RAIL_X0} x2={hx} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                    {r.ticks.map((t) => {
                      const x = RAIL_X0 + t.f * (RAIL_X1 - RAIL_X0);
                      return (
                        <g key={t.v}>
                          <line x1={x} x2={x} y1={r.y - 9} y2={r.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                          <text x={x} y={r.y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t.text}</text>
                        </g>
                      );
                    })}
                    <circle cx={hx} cy={r.y} r={17} className={TONES.accent.softFill} />
                    <circle cx={hx} cy={r.y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
                    <line x1={hx - 3} x2={hx - 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                    <line x1={hx + 3} x2={hx + 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                  </g>
                </RailSlider>
              </g>
            );
          })}

          <VerdictBanner width={W} text={v.text} tone={v.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{counter}</p>
      </div>
    </BeatFrame>
  );
}
