"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import { BAD_AT, DEFAULT_LIMIT, LIMITS, MESSAGES, WORKS_ON, plan as makePlan, seconds2, snapshot, verdictFor, type Bad, type Plan, type Snapshot } from "./model";

const W = 420;
const H = 388;
const SQ = { x0: 22, pitch: 15.5, size: 14, y: 56, n: 22 };
const BAR = { x0: 22, x1: 398, y: 100, h: 8 };
const CARD_Y = 182;
const CONSUMER_X = 70;
const DLQ_X = 350;
const RAIL = { x0: 44, x1: 376, y: 282 };
const CHIP = { y: 330, h: 44, w: 192 };

const r1 = (v: number) => Math.round(v * 10) / 10;

type SquareState = "done" | "active" | "failing" | "parked" | "waiting";

function squareState(i: number, s: Snapshot, p: Plan): SquareState {
  if (i === BAD_AT) {
    if (s.parked) return "parked";
    if (s.done >= BAD_AT) return "done";
    if (s.tryNo > 0) return s.failing ? "failing" : "active";
    return "waiting";
  }
  if (s.done >= i) return "done";
  if (i === s.current && (i < BAD_AT || p.outcome !== "blocked")) return "active";
  return "waiting";
}

const SQUARE_FILL: Record<SquareState, string> = {
  done: TONES.good.solidFill,
  active: TONES.accent.solidFill,
  failing: TONES.bad.solidFill,
  parked: TONES.warn.solidFill,
  waiting: "fill-muted-foreground/25",
};

/** 15.5 beat 2: one bad message in an ordered line. Wait in place for ever, or park it after a few tries. */
export function PoisonPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [dlq, setDlq] = useState(false);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [bad, setBad] = useState<Bad>("always");

  const p = makePlan(dlq, limit, bad);
  const verdict = verdictFor(p);
  const s = snapshot(p, clock.reduced ? Infinity : clock.seconds);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const pulse = clock.reduced ? 1 : Math.round((0.65 + 0.35 * Math.sin(clock.seconds * 7)) * 100) / 100;

  const blockedNow = p.outcome === "blocked" && s.tryNo > 0;
  const working = s.done < MESSAGES;
  let consumerStatus = working ? "working" : "all done";
  let consumerTone: Tone = working ? "accent" : "good";
  if (s.tryNo > 0 && s.current === BAD_AT && !s.parked && s.done < BAD_AT + 1) {
    if (p.outcome === "blocked" && s.finished) {
      consumerStatus = "retrying";
      consumerTone = "bad";
    } else if (s.failing) {
      consumerStatus = dlq ? `try ${s.tryNo} of ${limit}` : `try ${s.tryNo} failed`;
      consumerTone = "bad";
    } else {
      consumerStatus = p.outcome === "worked" && s.tryNo === WORKS_ON ? `try ${WORKS_ON} works` : "waiting 1 s";
      consumerTone = p.outcome === "worked" && s.tryNo === WORKS_ON ? "good" : "warn";
    }
  }
  const oldest = p.outcome === "blocked" ? (s.finished ? "for ever" : `${(s.ms / 1000).toFixed(1)} s and counting`) : s.finished ? seconds2(p.totalMs ?? 0) : `${(s.ms / 1000).toFixed(1)} s`;
  const waitingTone: Tone | null = p.outcome === "blocked" && blockedNow ? "bad" : null;
  const parkedCount = s.parked ? 1 : 0;
  const limitText = limit === 1 ? "1 try" : `${limit} tries`;

  const description = `One partition of ${MESSAGES} messages handled in order. Message ${BAD_AT} is ${bad === "always" ? "always bad" : `flaky: it fails twice, then works on try ${WORKS_ON}`}. The dead letter queue is ${dlq ? `on with a retry limit of ${limit}` : "off"}. ${p.totalMs === null ? "The line never moves past message 10." : `All other messages are done after ${seconds2(p.totalMs)}.`} ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Start with the <b>dead letter queue</b> off. Then switch it on and move the <b>retry limit</b>.</>}
      controls={
        <>
          <BeatButton pressed={dlq} onClick={() => setDlq((v) => !v)}>
            Dead letter queue
          </BeatButton>
          <BeatChoice<Bad>
            label="Message 10"
            options={[
              { id: "always", label: "Always fails" },
              { id: "flaky", label: "Fails twice, then works" },
            ]}
            value={bad}
            onChange={setBad}
          />
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The line of messages: the first 22 as squares, then a bar for all 1,000. */}
          {Array.from({ length: SQ.n }, (_, k) => {
            const i = k + 1;
            const st = squareState(i, s, p);
            const x = r1(SQ.x0 + k * SQ.pitch);
            return (
              <rect
                key={i}
                x={x}
                y={SQ.y}
                width={SQ.size}
                height={SQ.size}
                rx={4}
                opacity={st === "active" || st === "failing" ? pulse : 1}
                className={cn(SQUARE_FILL[st], st === "failing" || st === "parked" ? "stroke-card" : "", "transition-colors duration-200 motion-reduce:transition-none")}
                strokeWidth={st === "failing" || st === "parked" ? 1.5 : 0}
              />
            );
          })}
          <text x={r1(SQ.x0 + SQ.size / 2)} y={SQ.y + SQ.size + 16} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>1</text>
          <text x={r1(SQ.x0 + (BAD_AT - 1) * SQ.pitch + SQ.size / 2)} y={SQ.y + SQ.size + 16} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-bold tabular-nums")}>10</text>
          <text x={r1(SQ.x0 + SQ.n * SQ.pitch + 2)} y={SQ.y + 12} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium tabular-nums")}>{`… ${withCommas(MESSAGES)}`}</text>
          <rect x={BAR.x0} y={BAR.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={4} className="fill-muted" />
          <rect x={BAR.x0} y={BAR.y} width={Math.max(0, r1(((BAR.x1 - BAR.x0) * s.done) / MESSAGES))} height={BAR.h} rx={4} className={TONES.good.solidFill} />
          <text x={BAR.x0} y={BAR.y + 26} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{`one partition, ${withCommas(MESSAGES)} messages, handled in order`}</text>

          {/* The consumer and the dead letter queue, with the way between them. */}
          {dlq ? (
            <g>
              <line x1={CONSUMER_X + 56 + 6} x2={DLQ_X - 56 - 6} y1={CARD_Y} y2={CARD_Y} strokeWidth={2} strokeDasharray={s.parked ? undefined : "4 4"} className={s.parked ? TONES.warn.stroke : NEUTRAL.faintStroke} />
              <path d={`M${DLQ_X - 56 - 12} ${CARD_Y - 5} l7 5 l-7 5`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={s.parked ? TONES.warn.stroke : NEUTRAL.faintStroke} />
              <rect x={166} y={CARD_Y - 11} width={88} height={22} rx={11} className="fill-card" />
              <rect x={166} y={CARD_Y - 11} width={88} height={22} rx={11} strokeWidth={1.5} className={cn(NEUTRAL.line, "fill-none")} />
              <text x={210} y={CARD_Y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{`after ${limitText}`}</text>
            </g>
          ) : null}
          <SvgNode x={CONSUMER_X} y={CARD_Y} label="Consumer" kind="worker" status={consumerStatus} statusTone={consumerTone} mark={consumerTone === "bad" ? "bad" : undefined} />
          <g opacity={dlq ? 1 : 0.45}>
            <SvgNode x={DLQ_X} y={CARD_Y} label="DLQ" kind="queue" status={dlq ? (parkedCount ? "1 parked" : "empty") : "off"} statusTone={dlq ? (parkedCount ? "warn" : "good") : undefined} />
          </g>

          {/* The retry limit, inside the picture; only the dead letter queue uses it. */}
          <text x={22} y={RAIL.y - 28} className={cn(dlq ? NEUTRAL.text : NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>{dlq ? `retry limit: park it after ${limitText}` : "retry limit: needs the dead letter queue"}</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={LIMITS.map((v) => ({ value: v, label: String(v) }))}
            value={limit}
            onChange={setLimit}
            ariaLabel="Retry limit"
            valueText={`${limitText} before the message is parked`}
            disabled={!dlq}
            onGrab={grab}
          />

          {/* Two counters. */}
          {[
            { x: 14, label: "waiting behind it", value: withCommas(s.waiting), tone: waitingTone },
            { x: 214, label: "oldest has waited", value: oldest, tone: p.outcome === "blocked" && blockedNow ? ("bad" as Tone) : null },
          ].map((c) => (
            <g key={c.label}>
              <rect x={c.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx={13} strokeWidth={c.tone ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone ? TONES[c.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={c.x + 12} y={CHIP.y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
              <text x={c.x + 12} y={CHIP.y + 37} className={cn(c.tone ? TONES[c.tone].text : NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{c.value}</text>
            </g>
          ))}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
