"use client";

import { useId, useState, type ComponentType, type SVGProps } from "react";
import { Cpu, Database, ListOrdered, Server, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow } from "../primitives/radio-chip-row";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import {
  APPROACHES,
  CRASHES,
  DEFAULTS,
  LANE_NAMES,
  crashAllowed,
  eventsText,
  fitCrash,
  orderText,
  outboxRun,
  runSummary,
  type Approach,
  type Crash,
  type Lane,
  type Step,
} from "../models/outbox-crash";

const W = 420;
const H = 458;
const HEAD_Y = 46;
const HEAD_H = 32;
const HEAD_W = 92;
const ROW_TOP = 108;
const PITCH = 32;
const PILL_H = 24;
const LIFE_BOTTOM = ROW_TOP + 5 * PITCH + PILL_H / 2 + 8;
const DOTS_Y = LIFE_BOTTOM + 12;
const BADGE_Y = LIFE_BOTTOM + 36;
const LABEL_X = 14;
const CHIPS_X = 84;
const APPROACH_Y = 372;
const CRASH_Y = 416;
const STEP_DELAY = 260;

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
const LANE_ICON: Record<Lane, Icon> = { app: Server, db: Database, relay: Cpu, broker: ListOrdered };

/** One step on the page: a pill on its lane, with the arrow that leads to it. */
function StepView({ step, from, x, y, fx, fy, pillW, index }: { step: Step; from?: Step; x: number; y: number; fx: number; fy: number; pillW: number; index: number }) {
  const tone: Tone | undefined = step.tone;
  const delay = { animationDelay: `${index * STEP_DELAY}ms` };
  let arrow = null;
  if (from) {
    const dir = Math.sign(x - fx) || 1;
    const x1 = fx + (dir * pillW) / 2;
    const x2 = x - (dir * pillW) / 2;
    const len = Math.hypot(x2 - x1, y - fy) || 1;
    const ux = (x2 - x1) / len;
    const uy = (y - fy) / len;
    const head = `${x2},${y} ${x2 - ux * 9 - uy * 4.5},${y - uy * 9 + ux * 4.5} ${x2 - ux * 9 + uy * 4.5},${y - uy * 9 - ux * 4.5}`;
    const t = tone === "bad" ? "bad" : tone === "warn" ? "warn" : "accent";
    arrow = (
      <g>
        <line x1={x1} y1={fy} x2={x2} y2={y} strokeWidth={2.25} strokeLinecap="round" className={TONES[t].stroke} />
        <polygon points={head} className={TONES[t].solidFill} />
      </g>
    );
  }
  const left = x - pillW / 2;
  let body;
  if (step.kind === "cross") {
    body = (
      <>
        <rect x={left} y={y - PILL_H / 2} width={pillW} height={PILL_H} rx={12} strokeWidth={2} className={cn(TONES.bad.softFill, TONES.bad.stroke)} />
        <X x={left + 8} y={y - 6.5} width={13} height={13} strokeWidth={3} className={cn(TONES.bad.stroke, "fill-none")} aria-hidden />
        <text x={left + 26} y={y + 4.5} className={cn(TONES.bad.text, "text-[12px] font-bold")}>{step.text}</text>
      </>
    );
  } else if (step.kind === "quiet") {
    body = (
      <>
        <rect x={left} y={y - PILL_H / 2} width={pillW} height={PILL_H} rx={12} strokeWidth={1.5} strokeDasharray="4 3" className={cn(NEUTRAL.surface, NEUTRAL.faintStroke)} />
        <text x={x} y={y + 4.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold")}>{step.text}</text>
      </>
    );
  } else {
    body = (
      <>
        <rect x={left} y={y - PILL_H / 2} width={pillW} height={PILL_H} rx={12} strokeWidth={tone ? 2 : 1.5} className={cn(tone ? TONES[tone].softFill : NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line)} />
        <text x={x} y={y + 4.5} textAnchor="middle" className={cn(tone ? TONES[tone].text : NEUTRAL.text, "text-[12px] font-bold")}>{step.text}</text>
      </>
    );
  }
  return (
    <g className="animate-in fade-in duration-300 fill-mode-backwards motion-reduce:animate-none" style={delay}>
      {arrow}
      {body}
    </g>
  );
}

/** 14.4 beat: pick how the order is saved and announced, and where it crashes; count the events and the orders. */
export function OutboxCrashCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [pick, setPick] = useState<{ approach: Approach; crash: Crash }>({ ...DEFAULTS });
  const titleId = useId();
  const descId = useId();
  const run = outboxRun(pick.approach, pick.crash);
  const four = run.lanes.length === 4;
  const cols = four ? [58, 162, 266, 370] : [70, 210, 350];
  const pillW = four ? 80 : 84;
  const colOf = (lane: Lane) => cols[run.lanes.indexOf(lane)];
  const yOf = (row: number) => ROW_TOP + row * PITCH;
  const byId = new Map(run.steps.map((s) => [s.id, s]));
  const brokerX = colOf("broker");
  const dbX = colOf("db");
  const savedTone: Tone = run.orderSaved ? "good" : "bad";
  const eventTone: Tone = run.events === 1 && run.orderSaved ? "good" : run.events === 0 || !run.orderSaved ? "bad" : "warn";
  const key = `${run.approach}-${run.crash}`;
  const showHint = run.approach !== "outbox";

  return (
    <BeatFrame label={title} limits={limits} hint={<>Pick <b>how the order is saved</b> and <b>where it crashes</b>. Count the events and the orders.</>}>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{runSummary(run)}</desc>
        <DotGrid width={W} height={H} />
        <g role="status" aria-live="polite">
          <VerdictBanner width={W} text={run.verdict.text} tone={run.verdict.tone} />
        </g>

        {/* Lane headers and lifelines. */}
        {run.lanes.map((lane) => {
          const cx = colOf(lane);
          const IconCmp = LANE_ICON[lane];
          return (
            <g key={lane}>
              <line x1={cx} x2={cx} y1={HEAD_Y + HEAD_H} y2={LIFE_BOTTOM} strokeWidth={1.5} strokeDasharray="4 4" className={NEUTRAL.faintStroke} />
              <rect x={cx - HEAD_W / 2} y={HEAD_Y + 3} width={HEAD_W} height={HEAD_H} rx={12} className="fill-foreground/[0.06]" />
              <rect x={cx - HEAD_W / 2} y={HEAD_Y} width={HEAD_W} height={HEAD_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <IconCmp x={cx - HEAD_W / 2 + 9} y={HEAD_Y + 8} width={16} height={16} strokeWidth={2} className={cn("fill-none", lane === "db" ? "stroke-emerald-700 dark:stroke-emerald-300" : lane === "broker" ? "stroke-orange-700 dark:stroke-orange-300" : "stroke-blue-700 dark:stroke-blue-300")} aria-hidden />
              <text x={cx - HEAD_W / 2 + 30} y={HEAD_Y + 21} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{LANE_NAMES[lane]}</text>
            </g>
          );
        })}

        {/* The steps play one after another; remounting on a new pick replays them. */}
        <g key={key}>
          {run.steps.map((step, i) => {
            const from = step.from ? byId.get(step.from) : undefined;
            return (
              <StepView
                key={step.id}
                step={step}
                from={from}
                x={colOf(step.lane)}
                y={yOf(step.row)}
                fx={from ? colOf(from.lane) : 0}
                fy={from ? yOf(from.row) : 0}
                pillW={pillW}
                index={i}
              />
            );
          })}
        </g>

        {/* What is left: events on the broker, and whether the order exists. */}
        <g aria-hidden>
          {Array.from({ length: run.events }, (_, k) => (
            <circle key={k} cx={brokerX + (k - (run.events - 1) / 2) * 16} cy={DOTS_Y} r={5.5} className={cn(run.approach === "outbox" && k > 0 ? TONES.warn.solidFill : eventTone === "bad" ? TONES.bad.solidFill : TONES.accent.solidFill)} />
          ))}
        </g>
        {[
          { x: dbX, text: orderText(run.orderSaved), tone: savedTone },
          { x: brokerX, text: eventsText(run.events), tone: eventTone },
        ].map((b) => (
          <g key={b.text} role="status">
            <rect x={b.x - 46} y={BADGE_Y - 13} width={92} height={26} rx={13} strokeWidth={1.75} className={cn(TONES[b.tone].softFill, TONES[b.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={b.x} y={BADGE_Y + 4.5} textAnchor="middle" className={cn(TONES[b.tone].text, "text-[12.5px] font-bold tabular-nums")}>{b.text}</text>
          </g>
        ))}

        <text x={LABEL_X} y={APPROACH_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Approach</text>
        <RadioChipRow
          x={CHIPS_X}
          y={APPROACH_Y}
          options={APPROACHES.map((o) => ({ id: o.id, text: o.text, label: o.label }))}
          value={pick.approach}
          onChange={(approach) => setPick((p) => ({ approach, crash: fitCrash(approach, p.crash) }))}
          ariaLabel="How the order is saved and announced"
        />
        <text x={LABEL_X} y={CRASH_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Crash</text>
        <RadioChipRow
          x={CHIPS_X}
          y={CRASH_Y}
          options={CRASHES.map((o) => ({ id: o.id, text: o.text, label: crashAllowed(pick.approach, o.id) ? o.label : `${o.label}: needs a relay, only the outbox has one`, disabled: !crashAllowed(pick.approach, o.id) }))}
          value={run.crash}
          onChange={(crash) => setPick((p) => ({ ...p, crash }))}
          ariaLabel="Where it crashes"
        />
        {showHint ? (
          <text x={CHIPS_X} y={CRASH_Y + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>After publish needs a relay, and only the outbox has one.</text>
        ) : null}
      </svg>
    </BeatFrame>
  );
}
