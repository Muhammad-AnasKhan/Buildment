"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { CHIP_H } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import {
  AXIS,
  ERRORS_BEGIN,
  ERROR_RATE,
  PENALTY_MIN,
  STEPS,
  allClear,
  clock,
  clockText,
  errorsGone,
  finished,
  penalty,
  pick,
  rollbackDone,
  start,
  summaryLines,
  timeText,
  verdictFor,
  type Play,
} from "./model";

const W = 420;
const H = 384;
const PLOT = { x0: 44, x1: 404, top: 142, base: 238 };
const Y_MAX = 8;
const CHIP_X = 14;
const CHIP_W = 392;
const CHIP_YS = [296, 344] as const;
const HIT_H = 44;
/** Fades a new mark in with CSS, so it is visible even when no clock runs and appears at once under reduced motion. */
const FADE_IN = "animate-in fade-in duration-300 motion-reduce:animate-none";

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (min: number) => r1(PLOT.x0 + ((Math.max(AXIS.from, Math.min(AXIS.to, min)) - AXIS.from) / (AXIS.to - AXIS.from)) * (PLOT.x1 - PLOT.x0));
const yOf = (pct: number) => r1(PLOT.base - (pct / Y_MAX) * (PLOT.base - PLOT.top));

type ChoiceProps = { y: number; text: string; label: string; state: "idle" | "tried"; onPick: () => void };

/** A full-width choice pill: a real button for keyboards, 44 units tall to tap. A wrong choice already tried is shown struck off. */
function ChoiceChip({ y, text, label, state, onPick }: ChoiceProps) {
  const tried = state === "tried";
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    if (!tried) onPick();
  };
  return (
    <g role="button" tabIndex={tried ? -1 : 0} aria-label={label} aria-disabled={tried} className={cn("group outline-none", tried ? "cursor-default" : "cursor-pointer")} onClick={tried ? undefined : onPick} onKeyDown={onKeyDown}>
      <path d={`M${CHIP_X} ${y - HIT_H / 2} h${CHIP_W} v${HIT_H} h${-CHIP_W} Z`} fill="none" pointerEvents="all" />
      <rect
        x={CHIP_X}
        y={y - CHIP_H / 2}
        width={CHIP_W}
        height={CHIP_H}
        rx={CHIP_H / 2}
        strokeWidth={1.75}
        strokeDasharray={tried ? "5 4" : undefined}
        className={cn(SHAPE_TRANSITION, tried ? cn(TONES.bad.softFill, TONES.bad.stroke) : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted"))}
      />
      <text x={CHIP_X + CHIP_W / 2} y={y + 4.5} textAnchor="middle" className={cn("text-[13px] font-semibold", tried ? TONES.bad.text : NEUTRAL.text)}>{text}</text>
      <rect x={CHIP_X - 3} y={y - CHIP_H / 2 - 3} width={CHIP_W + 6} height={CHIP_H + 6} rx={CHIP_H / 2 + 3} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}

/** 17.6 beat 2: step through the incident, choosing the better of two moves at each step. */
export function IncidentStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const [play, setPlay] = useState<Play>(start);

  const done = finished(play);
  const step = done ? null : STEPS[play.done];
  const verdict = verdictFor(play);
  const extra = penalty(play);
  const nowMin = clock(play) ?? allClear(play) ?? errorsGone(play) ?? 36;
  const gone = errorsGone(play);
  const rollback = rollbackDone(play);
  const clear = allClear(play);
  const upTo = gone ?? nowMin;
  const errorsNow = nowMin >= ERRORS_BEGIN && (gone === null || nowMin < gone);
  const xRollback = rollback === null ? 0 : xOf(rollback);
  const xClear = clear === null ? 0 : xOf(clear);
  const clearText = clear === null ? "" : `all clear ${timeText(clear)}`;
  const clearEnd = xClear > 310;
  const [sum1, sum2] = summaryLines(play);

  const description = `The evening of 19:27 at Souq Express, ${done ? "all five steps done" : `step ${play.done + 1} of ${STEPS.length}`}. The clock reads ${clockText(play)}. Order errors started at 19:20 at ${ERROR_RATE} percent${gone === null ? " and are still going" : ` and ended at ${timeText(gone)}`}. ${extra > 0 ? `Wrong picks added ${extra} minutes. ` : ""}${verdict.text}.`;

  // The two choices of the current step, in a fixed order that does not always put the better one first.
  const slots = step
    ? ([0, 1] as const).map((slot) => {
        const better = slot === step.betterSlot;
        return { slot, better, text: better ? step.better : step.worse.text, tried: !better && play.tried[play.done] };
      })
    : [];

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Choose a <b>move</b> at each step. A poor choice adds {PENALTY_MIN} minutes.</>}
      controls={
        <BeatButton onClick={() => setPlay(start())}>
          <RotateCcw aria-hidden className="size-4" />
          Start over
        </BeatButton>
      }
    >
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The situation at this step, and the clock. */}
          {step ? (
            <g>
              <text x={14} y={68} className={cn(NEUTRAL.text, "text-[13.5px] font-semibold")}>{step.lines[0]}</text>
              <text x={14} y={88} className={cn(NEUTRAL.text, "text-[13.5px] font-semibold")}>{step.lines[1]}</text>
            </g>
          ) : (
            <g>
              <text x={14} y={68} className={cn(NEUTRAL.text, "text-[13.5px] font-semibold")}>All five steps are done.</text>
              <text x={14} y={88} className={cn(NEUTRAL.text, "text-[13.5px] font-semibold")}>Here is how the evening went.</text>
            </g>
          )}
          <text x={14} y={110} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium tabular-nums")}>{done ? "Done" : `Step ${play.done + 1} of ${STEPS.length}`}</text>
          <SvgNode x={356} y={82} label="Clock" kind="clock" status={clockText(play)} statusTone={extra > 0 ? "warn" : "accent"} />

          {/* Error rate against the clock. */}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          <text x={PLOT.x0 - 6} y={yOf(ERROR_RATE) + 4.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`${ERROR_RATE}%`}</text>
          <text x={PLOT.x0 - 6} y={PLOT.base + 4.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0%</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={yOf(ERROR_RATE)} y2={yOf(ERROR_RATE)} strokeWidth={1} strokeDasharray="3 5" className="stroke-muted-foreground/30" />
          {[20, 40, 60].map((m) => (
            <text key={m} x={xOf(m)} y={PLOT.base + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{timeText(m)}</text>
          ))}

          <path d={`M${xOf(ERRORS_BEGIN)} ${PLOT.base} V${yOf(ERROR_RATE)} H${xOf(gone ?? upTo)} V${PLOT.base} Z`} className={TONES.bad.softFill} />
          <path d={`M${xOf(ERRORS_BEGIN)} ${PLOT.base} V${yOf(ERROR_RATE)} H${xOf(gone ?? upTo)}${gone === null ? "" : ` V${PLOT.base}`}`} fill="none" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" className={TONES.bad.stroke} />
          {gone !== null ? <line x1={xOf(gone)} x2={xOf(nowMin)} y1={PLOT.base} y2={PLOT.base} strokeWidth={3} strokeLinecap="round" className={cn(TONES.good.stroke, FADE_IN)} /> : null}

          {rollback !== null ? (
            <g className={FADE_IN}>
              <line x1={xRollback} x2={xRollback} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.75} strokeDasharray="4 4" className={NEUTRAL.doneStroke} />
              <text x={xRollback} y={PLOT.top - 9} textAnchor="end" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{`rollback ${timeText(rollback)}`}</text>
            </g>
          ) : null}
          {clear !== null ? (
            <g className={FADE_IN}>
              <line x1={xClear} x2={xClear} y1={PLOT.top} y2={PLOT.base} strokeWidth={1.75} strokeDasharray="4 4" className={TONES.good.stroke} />
              <text x={xClear} y={PLOT.top - 9} textAnchor={clearEnd ? "end" : "start"} className={cn(TONES.good.text, "text-[11.5px] font-semibold tabular-nums")}>{clearText}</text>
            </g>
          ) : null}

          {/* Now: a dot on the line. */}
          <circle cx={xOf(nowMin)} cy={errorsNow ? yOf(ERROR_RATE) : PLOT.base} r={6} strokeWidth={2.5} className={cn(errorsNow ? TONES.bad.solidFill : TONES.good.solidFill, "stroke-card", SHAPE_TRANSITION)} />

          {/* The two moves, or the summary once all five are done. */}
          {step ? (
            slots.map((s) => (
              <ChoiceChip
                key={`${play.done}-${s.slot}`}
                y={CHIP_YS[s.slot]}
                text={s.text}
                label={s.tried ? `${s.text}. Already tried: ${step.worse.cost}` : s.text}
                state={s.tried ? "tried" : "idle"}
                onPick={() => setPlay((p) => pick(p, s.better ? "better" : "worse"))}
              />
            ))
          ) : (
            <g className={FADE_IN}>
              <rect x={14} y={272} width={392} height={96} rx={14} strokeWidth={2} className={cn(NEUTRAL.surface, play.tried.some(Boolean) ? TONES.warn.stroke : TONES.good.stroke)} />
              <text x={W / 2} y={308} textAnchor="middle" className={cn(NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>{sum1}</text>
              <text x={W / 2} y={334} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>{sum2}</text>
              <text x={W / 2} y={356} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>Tap Start over to try the other moves.</text>
            </g>
          )}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{`${verdict.text}. Clock ${clockText(play)}.`}</p>
      </div>
    </BeatFrame>
  );
}
