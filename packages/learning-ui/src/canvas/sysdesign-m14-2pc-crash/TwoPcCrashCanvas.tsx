"use client";

import { useId, useRef, useState } from "react";
import { Lock, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail, type RailStop } from "../primitives/snap-stops-rail";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  CRASH_LABELS,
  CRASH_POINTS,
  CRASH_WORDS,
  DEFAULTS,
  DOWNTIME_SNAPS,
  ORDERS_PER_SECOND,
  QUEUE_DOT_CAP,
  crashState,
  downtimeAt,
  formatCount,
  formatDowntime,
  queueDots,
  queueOverflow,
  type DbState,
} from "../models/two-pc-crash";

const W = 420;
const H = 438;
const RAIL_X0 = 48;
const RAIL_X1 = 372;
const CRASH_Y = 104;
const DOWN_Y = 224;
const CARD_X = 72;
const A_Y = 300;
const B_Y = 392;
const PANEL = { x: 176, y: 262, w: 232, h: 164 };
const TRACK_Y = 306;
const TRACK_X0 = 192;
const TRACK_X1 = 394;
const COLS = 15;
const PITCH = 13.5;
const GRID_X = 198;
const GRID_Y = 330;
const ROW_PITCH = 14;
const SPEED = 85;

const r1 = (v: number) => Math.round(v * 10) / 10;

const DB_TONE: Record<DbState, Tone | undefined> = { Working: undefined, Prepared: "warn", Committed: "good" };

const CRASH_STOPS: RailStop[] = CRASH_POINTS.map((p) => ({ value: p, label: CRASH_LABELS[p] }));
const DOWN_STOPS: RailStop[] = DOWNTIME_SNAPS.map((s) => ({ value: s, label: formatDowntime(s), at: downtimeAt(s) }));

/** A padlock badge on the corner of a card that is holding its locks. */
function Padlock({ x, y, shown }: { x: number; y: number; shown: boolean }) {
  return (
    <g aria-hidden opacity={shown ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
      <circle cx={x} cy={y} r={11} strokeWidth={2} className={cn(TONES.bad.softFill, TONES.bad.stroke)} />
      <Lock x={x - 6} y={y - 6} width={12} height={12} strokeWidth={2.5} className={cn(TONES.bad.stroke, "fill-none")} />
    </g>
  );
}

/** 14.2 beat: pick where the coordinator crashes and how long it stays down; locks and the order queue answer. */
export function TwoPcCrashCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [pick, setPick] = useState<{ point: number; downtime: number }>({ point: DEFAULTS.point, downtime: DEFAULTS.downtime });
  const titleId = useId();
  const descId = useId();
  const s = crashState(pick.point, pick.downtime);
  const dots = queueDots(s.waiting);
  const over = queueOverflow(s.waiting);
  const t = clock.reduced ? 0 : clock.seconds;
  const span = TRACK_X1 - TRACK_X0;
  const flowing = [0, 1, 2, 3, 4].map((k) => TRACK_X1 - ((t * SPEED + k * (span / 4.8)) % span));
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const downText = formatDowntime(s.downtime);
  const waitingText = `${formatCount(s.waiting)} waiting`;
  const description = `Coordinator crashes ${CRASH_WORDS[s.point]} and stays down for ${downText}. Stock DB is ${s.a.toLowerCase()}, Payments DB is ${s.b.toLowerCase()}. ${formatCount(s.waiting)} orders wait at ${ORDERS_PER_SECOND} a second. ${s.verdict.text}.`;
  const blockedTone: Tone = s.waiting > 0 ? "bad" : "good";

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag <b>where it crashes</b>, then drag <b>how long it stays down</b>.</>}>
      <div ref={box}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <g role="status" aria-live="polite">
            <VerdictBanner width={W} text={s.verdict.text} tone={s.verdict.tone} />
          </g>

          <text x={14} y={68} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>The coordinator crashes after</text>
          <SnapStopsRail
            svgRef={svgRef}
            x0={RAIL_X0}
            x1={RAIL_X1}
            y={CRASH_Y}
            stops={CRASH_STOPS}
            value={s.point}
            onChange={(v) => setPick((p) => ({ ...p, point: v }))}
            ariaLabel="Where the coordinator crashes"
            valueText={`point ${s.point} of 4, ${CRASH_WORDS[s.point]}`}
            tone="bad"
            knob={<Zap x={-7} y={-7} width={14} height={14} strokeWidth={2.5} className="fill-white stroke-white dark:fill-red-950 dark:stroke-red-950" aria-hidden />}
            onGrab={grab}
          />

          <text x={14} y={188} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>and stays down for</text>
          <SnapStopsRail
            svgRef={svgRef}
            x0={RAIL_X0}
            x1={RAIL_X1}
            y={DOWN_Y}
            stops={DOWN_STOPS}
            value={s.downtime}
            onChange={(v) => setPick((p) => ({ ...p, downtime: v }))}
            ariaLabel="How long the coordinator stays down"
            valueText={`${downText}, ${formatCount(s.waiting)} orders waiting`}
            onGrab={grab}
          />

          {/* The two databases. */}
          <SvgNode x={CARD_X} y={A_Y} label="Stock" kind="database" status={s.a} statusTone={DB_TONE[s.a]} />
          <SvgNode x={CARD_X} y={B_Y} label="Payments" kind="database" status={s.b} statusTone={DB_TONE[s.b]} />
          <Padlock x={CARD_X + 56} y={A_Y - NODE_H / 2 + 52} shown={s.aLocked} />
          <Padlock x={CARD_X + 56} y={B_Y - NODE_H / 2 + 52} shown={s.bLocked} />

          {/* Payments can ask Stock what was decided, when it committed. */}
          <g aria-hidden opacity={s.askStock ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
            <line x1={CARD_X} x2={CARD_X} y1={B_Y - NODE_H / 2 - 4} y2={A_Y + NODE_H / 2 + 8} strokeWidth={2.25} strokeLinecap="round" className={TONES.accent.stroke} />
            <polygon points={`${CARD_X},${A_Y + NODE_H / 2 + 3} ${CARD_X - 5},${A_Y + NODE_H / 2 + 12} ${CARD_X + 5},${A_Y + NODE_H / 2 + 12}`} className={TONES.accent.solidFill} />
            <rect x={CARD_X + 12} y={(A_Y + B_Y) / 2 - 12} width={78} height={24} rx={12} className={cn(TONES.accent.softFill, TONES.accent.stroke)} strokeWidth={1.75} />
            <text x={CARD_X + 51} y={(A_Y + B_Y) / 2 + 4.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12px] font-semibold")}>ask Stock</text>
          </g>

          {/* Orders behind the databases. */}
          <rect x={PANEL.x} y={PANEL.y + 3} width={PANEL.w} height={PANEL.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, s.blocked ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={PANEL.x + 16} y={PANEL.y + 25} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`Orders arrive ${ORDERS_PER_SECOND} a second`}</text>
          <g aria-hidden>
            <line x1={TRACK_X0} x2={TRACK_X1} y1={TRACK_Y} y2={TRACK_Y} strokeWidth={1.5} strokeDasharray="3 5" className={NEUTRAL.faintStroke} />
            {flowing.map((x, k) => (
              <circle key={k} cx={r1(x)} cy={TRACK_Y} r={3.6} className={s.blocked ? TONES.bad.solidFill : TONES.accent.solidFill} />
            ))}
            <line x1={TRACK_X0 - 3} x2={TRACK_X0 - 3} y1={TRACK_Y - 12} y2={TRACK_Y + 12} strokeWidth={4} strokeLinecap="round" className={cn(TONES.bad.stroke, "transition-opacity duration-200 motion-reduce:transition-none")} opacity={s.blocked ? 1 : 0} />
          </g>
          <g aria-hidden>
            {Array.from({ length: QUEUE_DOT_CAP }, (_, i) => (
              <circle
                key={i}
                cx={GRID_X + (i % COLS) * PITCH}
                cy={GRID_Y + Math.floor(i / COLS) * ROW_PITCH}
                r={4}
                className={cn("transition-colors duration-200 motion-reduce:transition-none", i < dots ? TONES.bad.solidFill : "fill-muted")}
              />
            ))}
          </g>
          <text x={PANEL.x + 16} y={PANEL.y + PANEL.h - 14} className={cn(TONES[blockedTone].text, "text-[15px] font-bold tabular-nums")}>{waitingText}</text>
          {over > 0 ? (
            <text x={PANEL.x + PANEL.w - 14} y={PANEL.y + PANEL.h - 14} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{QUEUE_DOT_CAP} dots shown</text>
          ) : null}
        </svg>
      </div>
    </BeatFrame>
  );
}
