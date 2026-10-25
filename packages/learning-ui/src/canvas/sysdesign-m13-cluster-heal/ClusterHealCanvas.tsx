"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Server, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgPillButton } from "../primitives/svg-pill-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  NODE_COUNT,
  STAND_INS,
  USUAL,
  WAIT_TICKS,
  advance,
  busy,
  coordinatorOf,
  describeNode,
  describeState,
  initial,
  isStale,
  nodeName,
  read,
  reset,
  setHints,
  setMode,
  tick,
  toggle,
  write,
  type Mode,
  type Msg,
  type Sim,
} from "./model";

const W = 420;
const H = 352;
const CARD = { w: 74, h: 88, gap: 8, x0: 9, y: 150 };
const cardCx = (i: number) => CARD.x0 + CARD.w / 2 + i * (CARD.w + CARD.gap);
const TOP = CARD.y;
const BOTTOM = CARD.y + CARD.h;
const BADGE_Y = BOTTOM + 9;
const BADGE_H = 22;
const BELOW = BADGE_Y + BADGE_H;
/** Seconds one tick lasts in the animation. */
const TICK_S = 1;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A point on a curve between two cards, bowed up (above the cards) or down (under the badges). */
function arcPoint(from: number, to: number, u: number, side: "up" | "down"): { x: number; y: number } {
  const x0 = cardCx(from);
  const x1 = cardCx(to);
  const y0 = side === "up" ? TOP : BELOW;
  const cy = side === "up" ? TOP - 44 : BELOW + 44;
  const v = 1 - u;
  return { x: r2(v * v * x0 + 2 * v * u * ((x0 + x1) / 2) + u * u * x1), y: r2(v * v * y0 + 2 * v * u * cy + u * u * y0) };
}

const DOT: Record<Msg["kind"], Tone> = { store: "accent", ack: "good", handover: "warn" };

/** 13.3: take nodes down, write, bring them back, read, and wait for the hints. */
export function ClusterHealCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [sim, setSim] = useState<Sim>(() => initial());
  const [run, setRun] = useState({ start: 0, pending: 0 });

  const running = !clock.reduced && (run.pending > 0 || busy(sim));
  const frac = running ? clamp01((clock.seconds - run.start) / TICK_S) : 0;

  // Time only moves while something is on the way, or after Wait: one tick per second.
  const now = useRef(0);
  useEffect(() => {
    now.current = clock.seconds;
  });
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      setRun((r) => ({ start: now.current, pending: Math.max(0, r.pending - 1) }));
      setSim((s) => tick(s));
    }, TICK_S * 1000);
    return () => window.clearTimeout(id);
  }, [running, run.start, sim.tick]);

  const startTime = (extra: number) => {
    if (clock.reduced) return;
    setRun((r) => (running ? { ...r, pending: r.pending + extra } : { start: clock.seconds, pending: extra }));
  };

  const onWrite = () => {
    const next = write(sim);
    setSim(clock.reduced ? advance(next, 0) : next);
    startTime(0);
  };
  const onRead = () => setSim(read(sim));
  const onWait = () => {
    if (clock.reduced) setSim(advance(sim, WAIT_TICKS));
    else startTime(WAIT_TICKS);
  };
  const onReset = () => {
    setSim(reset(sim));
    setRun({ start: clock.seconds, pending: 0 });
  };
  const onToggle = (n: number) => setSim(toggle(sim, n));
  const onMode = (m: Mode) => setSim(setMode(sim, m));

  const coordinator = coordinatorOf(sim.up);
  const answerOf = (n: number) => sim.answers.find((a) => a.node === n);
  const hintsOn = (n: number) => sim.hints.filter((h) => h.holder === n);
  const verdict = sim.verdict;

  const dots = running
    ? sim.msgs.flatMap((m) => {
        if (m.from === m.to) return [];
        const u = clamp01((sim.tick - m.sentAt + frac) / Math.max(1, m.due - m.sentAt));
        return [{ id: m.id, tone: DOT[m.kind], at: arcPoint(m.from, m.to, u, m.kind === "handover" ? "down" : "up") }];
      })
    : [];

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>node</b> to take it down or up, then tap <b>Write</b>, <b>Read</b> and <b>Wait</b>. The outlined node is the coordinator.
        </>
      }
      controls={
        <>
          <BeatChoice<Mode>
            label="Quorum kind"
            options={[
              { id: "strict", label: "Strict" },
              { id: "sloppy", label: "Sloppy" },
            ]}
            value={sim.mode}
            onChange={onMode}
          />
          <BeatChoice<"on" | "off">
            label="Hints"
            options={[
              { id: "on", label: "Hints on" },
              { id: "off", label: "Hints off" },
            ]}
            value={sim.hintsOn ? "on" : "off"}
            onChange={(v) => setSim(setHints(sim, v === "on"))}
          />
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{`${sim.mode === "strict" ? "Strict" : "Sloppy"} quorum, hints ${sim.hintsOn ? "on" : "off"}. Writes need 2 acks, reads need 2 answers. ${describeState(sim)}`}</desc>
          <DotGrid width={W} height={H} />

          {verdict ? (
            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          ) : (
            <text x={W / 2} y={28} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
              All five nodes are up and x = 6 on each
            </text>
          )}

          {/* The client, and what it can ask. */}
          <circle cx={26} cy={72} r={16} className="fill-violet-100 dark:fill-violet-500/20" />
          <User x={17} y={63} width={18} height={18} strokeWidth={2} className="text-violet-700 dark:text-violet-300" aria-hidden />
          <SvgPillButton x={50} y={72} width={60} text="Write" label="Write the next value of x" onPress={onWrite} primary />
          <SvgPillButton x={116} y={72} width={54} text="Read" label="Read x" onPress={onRead} />
          <SvgPillButton x={176} y={72} width={54} text="Wait" label={`Wait ${WAIT_TICKS} seconds`} onPress={onWait} />
          <SvgPillButton x={236} y={72} width={60} text="Reset" label="Reset all nodes and x" onPress={onReset} />
          <text x={W - 10} y={77} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold tabular-nums")}>
            {`tick ${sim.tick}`}
          </text>

          {/* The five nodes, in ring order for x. */}
          {Array.from({ length: NODE_COUNT }, (_, n) => {
            const cx = cardCx(n);
            const left = cx - CARD.w / 2;
            const up = sim.up[n];
            const usual = n < USUAL.length;
            const stale = usual && up && isStale(sim, n);
            const lead = n === coordinator;
            return (
              <SvgButton key={n} x={left - 5} y={CARD.y - 5} width={CARD.w + 10} height={CARD.h + 10} rx={19} label={describeNode(sim, n)} onPress={() => onToggle(n)}>
                {lead ? <rect x={left - 5} y={CARD.y - 5} width={CARD.w + 10} height={CARD.h + 10} rx={19} strokeWidth={2.5} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                <rect x={left} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={left} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={1.5} className={cn(up ? NEUTRAL.surface : "fill-muted", up ? NEUTRAL.line : TONES.bad.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                <circle cx={left + 17} cy={CARD.y + 17} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={left + 9} y={CARD.y + 9} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={left + 34} y={CARD.y + 22} className={cn(NEUTRAL.text, "text-[14px] font-bold")}>
                  {nodeName(n)}
                </text>
                <text x={cx} y={CARD.y + 50} textAnchor="middle" opacity={up ? 1 : 0.55} className={cn(stale ? TONES.warn.text : NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>
                  {`x = ${sim.x[n]}`}
                </text>
                <rect x={left + 7} y={CARD.y + 60} width={CARD.w - 14} height={20} rx={10} className={cn(up ? TONES.good.softFill : TONES.bad.softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={cx} y={CARD.y + 74} textAnchor="middle" className={cn(up ? TONES.good.text : TONES.bad.text, "text-[11.5px] font-semibold")}>
                  {up ? "up" : "down"}
                </text>
              </SvgButton>
            );
          })}

          {/* Under the stand-ins: the hints they hold. Under the usual nodes: what each said to a Read. */}
          {STAND_INS.map((n) =>
            hintsOn(n).map((h, j) => (
              <g key={`${h.owner}-${h.value}`}>
                <rect x={cardCx(n) - 34} y={BADGE_Y + j * 24} width={68} height={BADGE_H} rx={11} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
                <text x={cardCx(n)} y={BADGE_Y + j * 24 + 15} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold tabular-nums")}>
                  {`for ${nodeName(h.owner)}: ${h.value}`}
                </text>
              </g>
            ))
          )}
          {USUAL.map((n) => {
            const a = answerOf(n);
            if (!a) return null;
            const tone: Tone = a.counted ? "accent" : "good";
            return (
              <g key={`a${n}`}>
                <rect x={cardCx(n) - 34} y={BADGE_Y} width={68} height={BADGE_H} rx={11} strokeWidth={1.5} className={cn(a.counted ? TONES.accent.softFill : "fill-muted", a.counted ? TONES[tone].stroke : NEUTRAL.line)} />
                <text x={cardCx(n)} y={BADGE_Y + 15} textAnchor="middle" className={cn(a.counted ? TONES.accent.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                  {`says ${a.value}`}
                </text>
              </g>
            );
          })}

          {/* Messages on their way. */}
          {dots.map((d) => (
            <circle key={d.id} cx={d.at.x} cy={d.at.y} r={5} strokeWidth={2} className={cn(TONES[d.tone].solidFill, "stroke-card")} />
          ))}

          {/* Which nodes are the usual three, and which are stand-ins. */}
          {[
            { text: "usual nodes for x", a: 0, b: USUAL.length - 1 },
            { text: "stand-ins", a: USUAL.length, b: NODE_COUNT - 1 },
          ].map((g) => {
            const x0 = cardCx(g.a) - CARD.w / 2 + 2;
            const x1 = cardCx(g.b) + CARD.w / 2 - 2;
            return (
              <g key={g.text}>
                <path d={`M${x0} 322 v8 H${x1} v-8`} fill="none" strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                <text x={(x0 + x1) / 2} y={346} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
                  {g.text}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="sr-only" aria-live="polite">
          {verdict?.text ?? ""}
        </p>
      </div>
    </BeatFrame>
  );
}
