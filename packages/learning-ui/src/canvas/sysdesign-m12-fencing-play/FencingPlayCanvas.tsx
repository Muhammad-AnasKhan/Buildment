"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SliderRail } from "../primitives/picture-slider";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  B_LOCK_S,
  B_WRITE_S,
  LEASE_S,
  PAUSE,
  PAUSE_SNAPS,
  TIMELINE_S,
  fencingState,
  formatSeconds,
  pauseFromFraction,
  pauseKey,
  pauseToFraction,
  type Who,
} from "../models/fencing-play";
import { SvgSwitch } from "./SvgSwitch";

const W = 420;
const H = 372;
const T0 = 42;
const PX = 15;
const ROW_A = 88;
const ROW_B = 128;
const AXIS_Y = 156;
const MID_Y = 196;
const CARD = { x: 344, y: 230 };
const CHIP = { x: 130, w: 118, ys: [214, 248] };
const RAIL = { x0: 28, x1: 392, y: 330 };
const LOOP = 4.2;
const TRAVEL = 0.9;

const X = (s: number) => Math.round((T0 + s * PX) * 10) / 10;
const r1 = (v: number) => Math.round(v * 10) / 10;

const WHO: Record<Who, { solid: string; text: string }> = {
  A: { solid: "fill-blue-600 dark:fill-blue-400", text: "fill-white dark:fill-blue-950" },
  B: { solid: "fill-violet-600 dark:fill-violet-400", text: "fill-white dark:fill-violet-950" },
};

function Marker({ who, cx, cy, label }: { who: Who; cx: number; cy: number; label: string }) {
  return (
    <g style={{ transform: `translate(${cx}px, ${cy}px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
      <rect x={-19} y={-11} width={38} height={22} rx={11} className={cn(WHO[who].solid, "stroke-card")} strokeWidth={2} />
      <text y={4.5} textAnchor="middle" className={cn(WHO[who].text, "text-[12px] font-bold")}>{label}</text>
    </g>
  );
}

function Gutter({ who, cy }: { who: Who; cy: number }) {
  return (
    <g>
      <circle cx={20} cy={cy} r={11} className={WHO[who].solid} />
      <text x={20} y={cy + 4.5} textAnchor="middle" className={cn(WHO[who].text, "text-[12.5px] font-bold")}>{who}</text>
    </g>
  );
}

/** 12.4 beat 3: drag how long A sleeps, flip fencing, and see whose write storage keeps. */
export function FencingPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [pause, setPause] = useState<number>(PAUSE.default);
  const [fencing, setFencing] = useState(false);
  const titleId = useId();
  const descId = useId();
  const hatchId = useId().replace(/:/g, "");
  const s = fencingState(pause, fencing);

  const wakeX = X(s.wake);
  const frozenW = (s.wake - 2) * PX;
  const showPausePill = frozenW - 24 >= 100;
  const pauseText = `paused ${formatSeconds(s.pause)} s`;
  const pausePillW = 98;
  const pausePillX = r1(X(2) + (frozenW - 24 - pausePillW) / 2);

  // The dots that carry each write to storage: in arrival order, one after the other.
  const t = clock.reduced ? -1 : clock.seconds % LOOP;
  const dotFor = (i: number, accepted: boolean) => {
    if (t < 0) return null;
    const local = (t - 0.3 - i * 1.5) / TRAVEL;
    if (local < 0 || local > 1) return null;
    const out = accepted ? local : local < 0.5 ? local / 0.5 : 1 - (local - 0.5) / 0.5;
    return { out: accepted ? local : out * 0.62 };
  };
  const arrival = (i: number) => {
    if (t < 0 || !s.writes[i].accepted) return 0;
    const since = t - (0.3 + i * 1.5 + TRAVEL);
    return since >= 0 ? Math.max(0, 1 - since / 0.6) : 0;
  };
  const cardArrival = Math.max(arrival(0), arrival(1));

  const tokenPill = s.fencing ? `highest token ${s.highestToken}` : "no token check";
  const tokenW = tokenPill.length * 7 + 18;

  const ticks = [0, 5, 10, 15, 20];
  const description = `A holds a lease of ${LEASE_S} seconds and freezes at 2 seconds for ${formatSeconds(s.pause)} seconds, so it wakes at ${formatSeconds(s.wake)} seconds. B writes at ${B_WRITE_S} seconds with token 34. Fencing is ${fencing ? "on" : "off"}. ${s.verdict.text}. Storage holds x equal ${s.stored}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag across the rail to change <b>how long A sleeps</b>, then flip fencing.</>}>
      <div ref={box}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <defs>
            <pattern id={hatchId} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={7} strokeWidth={2.5} className="stroke-muted-foreground/55" />
            </pattern>
          </defs>
          <DotGrid width={W} height={H} />
          <g role="status" aria-live="polite">
            <VerdictBanner width={W} text={s.verdict.text} tone={s.verdict.tone} />
          </g>

          {/* The moment A's lease ends. */}
          <line x1={X(LEASE_S)} x2={X(LEASE_S)} y1={64} y2={146} strokeWidth={1.75} strokeDasharray="4 4" className={TONES.warn.stroke} aria-hidden />
          <g aria-hidden>
            <rect x={X(LEASE_S) - 62} y={44} width={124} height={20} rx={10} className={cn(NEUTRAL.surface, TONES.warn.stroke)} strokeWidth={1.5} />
            <text x={X(LEASE_S)} y={58.5} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>{"A's lease ends"}</text>
          </g>

          {/* A: lease bar, frozen span, write. */}
          <Gutter who="A" cy={ROW_A} />
          <g aria-hidden>
            <rect x={X(0)} y={ROW_A - 6} width={2 * PX} height={12} rx={3} className="fill-blue-600 dark:fill-blue-400" />
            <rect x={X(2)} y={ROW_A - 6} width={(LEASE_S - 2) * PX} height={12} rx={3} className="fill-muted-foreground/25" />
            {s.pause > 0 ? <rect x={X(2)} y={ROW_A - 10} width={frozenW} height={20} rx={4} fill={`url(#${hatchId})`} strokeWidth={1.25} className="stroke-muted-foreground/70" /> : null}
            {showPausePill ? (
              <g>
                <rect x={pausePillX} y={ROW_A - 10} width={pausePillW} height={20} rx={10} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.25} />
                <text x={pausePillX + pausePillW / 2} y={ROW_A + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{pauseText}</text>
              </g>
            ) : null}
          </g>
          <Marker who="A" cx={wakeX} cy={ROW_A} label="x=A" />

          {/* B: lease bar and write. */}
          <Gutter who="B" cy={ROW_B} />
          <g aria-hidden>
            <rect x={X(B_LOCK_S)} y={ROW_B - 8} width={LEASE_S * PX} height={16} rx={4} strokeWidth={1.5} className="fill-violet-100 stroke-violet-500 dark:fill-violet-500/20 dark:stroke-violet-400" />
            <text x={X(B_WRITE_S) + 30} y={ROW_B + 4.2} className="fill-violet-800 text-[11.5px] font-semibold dark:fill-violet-200">{"B's lease"}</text>
          </g>
          <Marker who="B" cx={X(B_WRITE_S)} cy={ROW_B} label="x=B" />

          {/* Time axis. */}
          <g aria-hidden>
            <line x1={X(0)} x2={X(TIMELINE_S)} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={1.5} className={NEUTRAL.line} />
            {ticks.map((v) => (
              <g key={v}>
                <line x1={X(v)} x2={X(v)} y1={AXIS_Y} y2={AXIS_Y + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                <text x={X(v)} y={AXIS_Y + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{v} s</text>
              </g>
            ))}
          </g>

          {/* Storage and the switch. */}
          <SvgSwitch x={8} y={MID_Y} label="Fencing check" ariaLabel="Storage checks fencing tokens" checked={fencing} onToggle={() => setFencing(!fencing)} />
          {s.writes.map((w, i) => {
            const cy = CHIP.ys[i];
            const tone = w.accepted ? "good" : "bad";
            const dot = dotFor(i, w.accepted);
            const x1 = CHIP.x + CHIP.w;
            const x2 = CARD.x - 56 - 6;
            const y2 = CARD.y - 8 + i * 16;
            const bx = r1(x1 + (x2 - x1) * 0.62);
            return (
              <g key={w.who} aria-hidden>
                <rect x={CHIP.x} y={cy - 14} width={CHIP.w} height={28} rx={14} strokeWidth={1.75} className={cn(TONES[tone].softFill, TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={CHIP.x + 12} y={cy + 4.5} className={cn(TONES[tone].text, "text-[12.5px] font-semibold tabular-nums")}>{w.who}: token {w.token}</text>
                <circle cx={CHIP.x + CHIP.w - 16} cy={cy} r={8} className={cn(TONES[tone].solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                {w.accepted ? (
                  <polyline points={`${CHIP.x + CHIP.w - 20},${cy + 0.5} ${CHIP.x + CHIP.w - 17},${cy + 3.5} ${CHIP.x + CHIP.w - 11.5},${cy - 3}`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-white dark:stroke-emerald-950" />
                ) : (
                  <g strokeWidth={2} strokeLinecap="round" className="stroke-white dark:stroke-red-950">
                    <line x1={CHIP.x + CHIP.w - 19} y1={cy - 3} x2={CHIP.x + CHIP.w - 13} y2={cy + 3} />
                    <line x1={CHIP.x + CHIP.w - 13} y1={cy - 3} x2={CHIP.x + CHIP.w - 19} y2={cy + 3} />
                  </g>
                )}
                {w.accepted ? (
                  <line x1={x1} y1={cy} x2={x2} y2={y2} strokeWidth={2.25} strokeLinecap="round" className={TONES.good.stroke} />
                ) : (
                  <>
                    <line x1={x1} y1={cy} x2={bx} y2={r1(cy + (y2 - cy) * 0.62)} strokeWidth={2.25} strokeLinecap="round" strokeDasharray="4 4" className={TONES.bad.stroke} />
                    <g strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke}>
                      <line x1={bx + 2} y1={r1(cy + (y2 - cy) * 0.62) - 6} x2={bx + 12} y2={r1(cy + (y2 - cy) * 0.62) + 6} />
                      <line x1={bx + 12} y1={r1(cy + (y2 - cy) * 0.62) - 6} x2={bx + 2} y2={r1(cy + (y2 - cy) * 0.62) + 6} />
                    </g>
                  </>
                )}
                {dot ? <circle cx={r1(x1 + (x2 - x1) * dot.out)} cy={r1(cy + (y2 - cy) * dot.out)} r={5} className={cn(w.accepted ? TONES.good.solidFill : TONES.bad.solidFill, "stroke-card")} strokeWidth={1.5} /> : null}
              </g>
            );
          })}
          <SvgNode x={CARD.x} y={CARD.y} label="Storage" kind="database" status={`x = ${s.stored}`} statusTone={s.kind === "overwrite" ? "bad" : "good"} arrival={cardArrival} />
          <g aria-hidden>
            <rect x={CARD.x - tokenW / 2} y={CARD.y + NODE_H / 2 + 6} width={tokenW} height={22} rx={11} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <text x={CARD.x} y={CARD.y + NODE_H / 2 + 21.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{tokenPill}</text>
          </g>

          {/* The pause rail. */}
          <TightRailSlider
            svgRef={svgRef}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="How long A sleeps, in seconds"
            valueText={`pause ${formatSeconds(s.pause)} s, A wakes at ${formatSeconds(s.wake)} s`}
            value={s.pause}
            min={PAUSE.min}
            max={PAUSE.max}
            fromFraction={pauseFromFraction}
            onKey={(v, k) => pauseKey(v, k)}
            onChange={setPause}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
            above={30}
            below={42}
            side={22}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={pauseToFraction(s.pause)}
              marks={PAUSE_SNAPS.filter((v) => v > 0 && v < 20).map((v) => ({ at: pauseToFraction(v), label: v === 9 ? "9 s" : undefined, tone: v === 9 ? ("bad" as const) : undefined }))}
              ends={["0 s", "20 s"]}
              caption={`pause ${formatSeconds(s.pause)} s, A wakes at ${formatSeconds(s.wake)} s`}
            />
          </TightRailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}
