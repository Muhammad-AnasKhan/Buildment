"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import { textWidth } from "../models/history-layout";
import { AVERAGE_ROUNDS, COPIES, DEFAULT_COPIES, DEFAULT_INTERVAL, INTERVALS, P95_ROUNDS, averageSeconds, fixedRun, formatSeconds, ladderFraction, ladderValue, syncVerdict } from "../models/sync-rate";

const W = 420;
const CENTER = { x: 210, y: 126 };
const RING_R = 58;
const AXIS = { x0: 52, x1: 396, y: 252, rounds: 6 };
const RAIL_X0 = 118;
const RAIL_X1 = 386;
const RAILS_Y = [330, 384] as const;
const H = 429;
const ROUND_S = 1.3;
const HOLD_S = 2.5;
const r1 = (v: number) => Math.round(v * 10) / 10;

const dotRadius = (n: number) => (n <= 8 ? 12 : n <= 16 ? 9 : 6.5);
const axisX = (rounds: number) => AXIS.x0 + (rounds / AXIS.rounds) * (AXIS.x1 - AXIS.x0);
const tickText = (s: number) => (Number.isInteger(s) ? String(s) : s.toFixed(1));

/** 11.6 beat 2: drag the sync interval and the number of copies, and watch a write spread by rounds of random pairs. */
export function SyncRateCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [interval, setIntervalS] = useState<number>(DEFAULT_INTERVAL);
  const [copies, setCopies] = useState<number>(DEFAULT_COPIES);
  const titleId = useId();
  const descId = useId();

  const run = useMemo(() => fixedRun(copies), [copies]);
  const R = run.rounds.length;
  const verdict = syncVerdict(copies, interval);
  const avgRounds = AVERAGE_ROUNDS[copies];
  const avgText = `average ${formatSeconds(averageSeconds(copies, interval))} s`;

  const cycle = R * ROUND_S + HOLD_S;
  const progress = clock.reduced || settled ? R : Math.min(R, (clock.seconds % cycle) / ROUND_S);
  const done = progress >= R;
  const k = Math.min(R - 1, Math.floor(progress));
  const f = progress - k;
  const lit = done ? run.rounds[R - 1].lit : f < 0.5 ? (k === 0 ? run.start : run.rounds[k - 1].lit) : run.rounds[k].lit;
  const roundsDone = done ? R : f < 0.5 ? k : k + 1;
  const flashing = !done && f < 0.85;

  const n = copies;
  const dr = dotRadius(n);
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: CENTER.x + RING_R * Math.cos(a), y: CENTER.y + RING_R * Math.sin(a) };
  };

  const avgW = textWidth(avgText, 11.5, true);
  const avgX = Math.max(8 + avgW / 2, Math.min(W - 8 - avgW / 2, axisX(avgRounds)));
  const status = `${roundsDone} of ${R} rounds, ${formatSeconds(roundsDone * interval)} s`;

  const rails = [
    {
      key: "interval",
      y: RAILS_Y[0],
      name: "Sync every",
      value: `${interval} s`,
      label: "How often the copies sync, in seconds",
      ladder: INTERVALS,
      current: interval,
      set: (v: number) => setIntervalS(v),
      ticks: INTERVALS.map((v) => ({ v, text: `${v} s` })),
    },
    {
      key: "copies",
      y: RAILS_Y[1],
      name: "Copies",
      value: String(copies),
      label: "Number of copies",
      ladder: COPIES,
      current: copies,
      set: (v: number) => setCopies(v),
      ticks: COPIES.map((v) => ({ v, text: String(v) })),
    },
  ];

  const description = `${copies} copies, one write on copy 1. Every ${interval} seconds each copy swaps with one random copy. On average it takes ${AVERAGE_ROUNDS[copies]} rounds, and 95 of 100 runs finish within ${P95_ROUNDS[copies]}. ${verdict}. This run takes ${R} rounds.`;

  return (
    <BeatFrame label={title} limits={limits} controls={<BeatButton onClick={() => clock.restart()}>Replay</BeatButton>} hint="Drag both rails and compare.">
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict} tone="accent" />

          {/* The copies on a ring; a lit dot has the value. */}
          <circle cx={CENTER.x} cy={CENTER.y} r={RING_R} fill="none" strokeWidth={1.5} className={NEUTRAL.line} />
          {flashing
            ? run.rounds[k].pairs.map(([a, b], i) => {
                const p = pos(a);
                const q = pos(b);
                return <line key={`pair-${i}`} x1={r1(p.x)} y1={r1(p.y)} x2={r1(q.x)} y2={r1(q.y)} strokeWidth={n <= 8 ? 2 : 1} strokeLinecap="round" opacity={0.55} className={TONES.accent.stroke} />;
              })
            : null}
          {Array.from({ length: n }, (_, i) => {
            const p = pos(i);
            return <circle key={i} cx={r1(p.x)} cy={r1(p.y)} r={dr} strokeWidth={2} className={cn("transition-colors duration-200 motion-reduce:transition-none", lit[i] ? cn(TONES.accent.solidFill, "stroke-card") : cn(NEUTRAL.surface, NEUTRAL.doneStroke))} />;
          })}
          {/* The clock ring in the middle grows to the elapsed time. */}
          <circle cx={CENTER.x} cy={CENTER.y} r={22} fill="none" strokeWidth={6} className="stroke-muted" />
          <circle cx={CENTER.x} cy={CENTER.y} r={22} fill="none" strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray={`${r1(Math.max(0.01, (progress / R) * 100))} 100`} transform={`rotate(-90 ${CENTER.x} ${CENTER.y})`} className={TONES.accent.stroke} />
          <text x={CENTER.x} y={CENTER.y + RING_R + dr + 17} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{status}</text>

          {/* Time axis in seconds, with the average marked. */}
          <line x1={AXIS.x0} x2={AXIS.x1} y1={AXIS.y} y2={AXIS.y} strokeWidth={2} className={NEUTRAL.line} />
          <line x1={AXIS.x0} x2={r1(axisX(Math.min(progress, AXIS.rounds)))} y1={AXIS.y} y2={AXIS.y} strokeWidth={5} strokeLinecap="round" className={TONES.accent.stroke} />
          {Array.from({ length: AXIS.rounds + 1 }, (_, t) => (
            <g key={t}>
              <line x1={axisX(t)} x2={axisX(t)} y1={AXIS.y} y2={AXIS.y + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={axisX(t)} y={AXIS.y + 21} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{tickText(t * interval)}</text>
            </g>
          ))}
          <text x={W / 2} y={AXIS.y + 40} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>seconds after the write</text>
          <polygon points={`${r1(axisX(avgRounds) - 6)},${AXIS.y - 14} ${r1(axisX(avgRounds) + 6)},${AXIS.y - 14} ${r1(axisX(avgRounds))},${AXIS.y - 4}`} className={TONES.warn.solidFill} />
          <text x={r1(avgX)} y={AXIS.y - 20} textAnchor="middle" className={cn(TONES.warn.text, "text-[12px] font-bold tabular-nums")}>{avgText}</text>

          {rails.map((r) => {
            const hx = RAIL_X0 + ladderFraction(r.ladder, r.current) * (RAIL_X1 - RAIL_X0);
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
                  valueText={`${r.value}. ${verdict}`}
                  value={r.current}
                  ladder={r.ladder}
                  fromFraction={(fr) => ladderValue(r.ladder, fr)}
                  onChange={(v) => {
                    if (v !== r.current) {
                      r.set(v);
                      clock.restart();
                    }
                  }}
                  onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
                >
                  <g aria-hidden>
                    <line x1={RAIL_X0} x2={RAIL_X1} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                    <line x1={RAIL_X0} x2={hx} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                    {r.ticks.map((t) => {
                      const tx = RAIL_X0 + ladderFraction(r.ladder, t.v) * (RAIL_X1 - RAIL_X0);
                      return (
                        <g key={t.v}>
                          <line x1={tx} x2={tx} y1={r.y - 9} y2={r.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                          <text x={tx} y={r.y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t.text}</text>
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
        </svg>
      </div>
    </BeatFrame>
  );
}
