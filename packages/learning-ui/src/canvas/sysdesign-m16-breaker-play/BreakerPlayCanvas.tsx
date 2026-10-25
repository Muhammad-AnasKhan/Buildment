"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgStat } from "../primitives/svg-stat";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import {
  DOT_COUNT,
  FAILURE_THRESHOLD,
  INITIAL_SIM,
  PILL_TEXT,
  PILL_TONE,
  advance,
  picksLabel,
  seconds as fmtSeconds,
  state as breakerState,
  toggleBroken,
  verdictFor,
  type DotKind,
  type Sim,
} from "./model";

const W = 420;
const H = 352;
const ROW_Y = 88;
const CHECKOUT_X = 62;
const PICKS_X = 358;
const PILL = { x: 160, w: 100, h: 32 };
const STAT_Y = 148;
const DOTS = { x0: 28, pitch: 12.6, perRow: 30, y0: 252, rowGap: 17, r: 4.3 };
const LEGEND_Y = 306;
/** One real second moves the model two seconds, so the 10 s wait takes 5 s on screen. */
const SIM_MS_PER_SECOND = 2000;
/** A tap with reduced motion jumps to the settled picture: open after a break, closed after a fix. */
const SETTLE_AFTER_BREAK = 3000;
const SETTLE_AFTER_FIX = 12_000;

const DOT_CLASS: Record<DotKind, string> = {
  ok: TONES.good.solidFill,
  fail: TONES.bad.solidFill,
  refused: "fill-muted-foreground/45",
  probe: TONES.warn.solidFill,
  pending: "fill-card stroke-blue-600 dark:stroke-blue-400",
};
const LEGEND: { kind: DotKind; text: string; x: number }[] = [
  { kind: "ok", text: "worked", x: 16 },
  { kind: "fail", text: "failed", x: 98 },
  { kind: "refused", text: "refused", x: 176 },
  { kind: "probe", text: "probe", x: 266 },
];

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 16.5 beat 2: tap Picks to break it and watch the breaker open, probe and close. */
export function BreakerPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [sim, setSim] = useState<Sim>(INITIAL_SIM);
  const [paused, setPaused] = useState(false);
  const last = useRef(clock.seconds);
  const { seconds, reduced } = clock;

  useEffect(() => {
    const dt = seconds - last.current;
    last.current = seconds;
    if (reduced || paused || dt <= 0 || dt > 0.25) return;
    setSim((prev) => advance(prev, prev.t + dt * SIM_MS_PER_SECOND));
  }, [seconds, reduced, paused]);

  const tapPicks = useCallback(() => {
    setSim((prev) => {
      const next = toggleBroken(prev);
      return reduced ? advance(next, next.t + (next.broken ? SETTLE_AFTER_BREAK : SETTLE_AFTER_FIX)) : next;
    });
  }, [reduced]);
  const replay = () => {
    setSim(INITIAL_SIM);
    setPaused(false);
    last.current = seconds;
  };

  const s = breakerState(sim);
  const verdict = verdictFor(sim);
  const pillTone = PILL_TONE[s];
  const outage = sim.outage;
  const reachedText = outage ? `${outage.reached} of ${outage.calls}` : "none yet";
  const statTone: Tone | null = outage && !outage.active && outage.calls > outage.reached ? "good" : null;

  // Calls that leave Checkout all reach the breaker; they reach Picks only when it lets them through.
  const toBreaker = reduced ? [] : flowDots(seconds, flowDotsPerSecond(0.6));
  const toPicks = reduced || s !== "closed" ? [] : flowDots(seconds, flowDotsPerSecond(0.6));
  const lane1 = { x0: CHECKOUT_X + 60, x1: PILL.x - 4 };
  const lane2 = { x0: PILL.x + PILL.w + 4, x1: PICKS_X - 60 };

  const counts = sim.dots.reduce<Record<DotKind, number>>((c, d) => ({ ...c, [d.kind]: c[d.kind] + 1 }), { ok: 0, fail: 0, refused: 0, probe: 0, pending: 0 });
  const description = `Checkout calls Picks 10 times a second through a circuit breaker. Picks is ${sim.broken ? "broken" : "healthy"}. The breaker is ${s}. Of the last ${sim.dots.length} calls, ${counts.ok} worked, ${counts.fail} failed, ${counts.refused} were refused and ${counts.probe} were probes. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap <b>Picks</b> to break it, and tap again to fix it. The breaker opens after {FAILURE_THRESHOLD} failures in a row.</>}
      controls={
        <>
          <BeatActionButton onClick={replay}>Replay</BeatActionButton>
          <BeatButton pressed={paused} onClick={() => setPaused((p) => !p)}>Pause</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Checkout, the breaker, Picks. */}
          <line x1={lane1.x0} x2={lane1.x1} y1={ROW_Y} y2={ROW_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={lane2.x0} x2={lane2.x1} y1={ROW_Y} y2={ROW_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {toBreaker.map((d) => (
            <circle key={`a${d.id}`} cx={r1(lane1.x0 + (lane1.x1 - lane1.x0) * d.progress)} cy={ROW_Y} r={3.4} className={TONES.accent.solidFill} />
          ))}
          {toPicks.map((d) => (
            <circle key={`b${d.id}`} cx={r1(lane2.x0 + (lane2.x1 - lane2.x0) * d.progress)} cy={ROW_Y} r={3.4} className={sim.broken ? TONES.bad.solidFill : TONES.good.solidFill} />
          ))}
          <SvgNode x={CHECKOUT_X} y={ROW_Y} label="Checkout" kind="server" status="10 calls/s" statusTone="good" />
          <rect x={PILL.x} y={ROW_Y - PILL.h / 2} width={PILL.w} height={PILL.h} rx={PILL.h / 2} className="fill-card" />
          <rect x={PILL.x} y={ROW_Y - PILL.h / 2} width={PILL.w} height={PILL.h} rx={PILL.h / 2} strokeWidth={2} className={cn(TONES[pillTone].softFill, TONES[pillTone].stroke, SHAPE_TRANSITION)} />
          <text x={PILL.x + PILL.w / 2} y={ROW_Y + 5} textAnchor="middle" className={cn(TONES[pillTone].text, "text-[13px] font-bold")}>{PILL_TEXT[s]}</text>
          <text x={PILL.x + PILL.w / 2} y={ROW_Y + 36} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>breaker</text>
          <SvgButton x={PICKS_X - 62} y={ROW_Y - 36} width={124} height={72} label={picksLabel(sim.broken)} pressed={sim.broken} onPress={tapPicks}>
            <SvgNode x={PICKS_X} y={ROW_Y} label="Picks" kind="server" status={sim.broken ? "broken" : "healthy"} statusTone={sim.broken ? "bad" : "good"} mark={sim.broken ? "bad" : undefined} />
          </SvgButton>

          <SvgStat x={13} y={STAT_Y} width={150} label="time" value={`${fmtSeconds(sim.t)} s`} tone={null} />
          <SvgStat x={173} y={STAT_Y} width={234} label="calls that reached Picks in the outage" value={reachedText} tone={statTone} />

          {/* The last 60 calls, oldest first. */}
          <text x={DOTS.x0 - 12} y={DOTS.y0 - 16} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>the last 60 calls</text>
          <g aria-hidden>
            {Array.from({ length: DOT_COUNT }, (_, i) => {
              const d = sim.dots[i - (DOT_COUNT - sim.dots.length)];
              const cx = r1(DOTS.x0 + (i % DOTS.perRow) * DOTS.pitch + DOTS.r);
              const cy = DOTS.y0 + Math.floor(i / DOTS.perRow) * DOTS.rowGap;
              return d ? (
                <circle key={i} cx={cx} cy={cy} r={DOTS.r} strokeWidth={d.kind === "pending" ? 1.75 : 0} className={DOT_CLASS[d.kind]} />
              ) : (
                <circle key={i} cx={cx} cy={cy} r={DOTS.r - 1.5} className="fill-muted" />
              );
            })}
          </g>
          <g aria-hidden>
            {LEGEND.map((l) => (
              <g key={l.kind}>
                <circle cx={l.x + 5} cy={LEGEND_Y} r={4.5} className={DOT_CLASS[l.kind]} />
                <text x={l.x + 15} y={LEGEND_Y + 4} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{l.text}</text>
              </g>
            ))}
          </g>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
      <p className="sr-only" aria-live="polite">{verdict.text}</p>
    </BeatFrame>
  );
}
