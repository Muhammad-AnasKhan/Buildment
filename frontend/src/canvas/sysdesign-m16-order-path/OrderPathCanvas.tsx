"use client";

import { useId, useRef, useState } from "react";
import { Bell, Clock, Database, Send, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgStat } from "../primitives/svg-stat";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { CALLS, START, callLabel, dotProgress, evaluate, formatAvailability, serviceLabel, toggleDown, toggleMode } from "./model";

const W = 420;
const H = 452;
const COLS = [70, 210, 350];
const CHECKOUT = { x: 210, y: 76 };
const CARD = { y: 172, w: 122, h: 56 };
const QUEUE_Y = 252;
const SERVICE_Y = 334;
const LINE = { y0: CARD.y + CARD.h / 2, y1: SERVICE_Y - 30 };
const STAT_Y = 392;
const ICONS = [Database, Server, Bell] as const;
const SERVICE_W = 130;
const SERVICE_H = 60;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A service card like SvgNode, a little wider so the longest name (Notifications) fits. */
function ServiceCard({ x, y, label, Icon, down }: { x: number; y: number; label: string; Icon: typeof Database; down: boolean }) {
  const left = x - SERVICE_W / 2;
  const top = y - SERVICE_H / 2;
  const tone: Tone = down ? "bad" : "good";
  return (
    <g>
      {down ? <rect x={left - 5} y={top - 5} width={SERVICE_W + 10} height={SERVICE_H + 10} rx={19} strokeWidth={2.5} className={cn("fill-none", TONES.bad.stroke)} /> : null}
      <rect x={left} y={top + 3} width={SERVICE_W} height={SERVICE_H} rx={14} className="fill-foreground/[0.06]" />
      <rect x={left} y={top} width={SERVICE_W} height={SERVICE_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      <circle cx={left + 17} cy={top + 16} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
      <Icon x={left + 9} y={top + 8} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
      <text x={left + 33} y={top + 21} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{label}</text>
      <rect x={left + 7} y={top + 33} width={SERVICE_W - 14} height={20} rx={10} className={cn(TONES[tone].softFill, SHAPE_TRANSITION)} />
      <text x={x} y={top + 47} textAnchor="middle" className={cn(TONES[tone].text, "text-[11.5px] font-semibold")}>{down ? "down" : "up"}</text>
    </g>
  );
}

/** 16.3 beat 3: tap a call to wait or send a message, tap a service to fail it. */
export function OrderPathCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [state, setState] = useState(START);

  const r = evaluate(state);
  const failed = r.failedAt !== null;
  const checkoutStatus = failed ? "order failed" : `waits ${r.waitMs} ms`;
  const checkoutTone: Tone = failed ? "bad" : "good";
  const description = `Checkout calls Stock (30 ms), Payments (80 ms) and Notifications (40 ms). ${CALLS.map((c, i) => `${c.label} ${state.modes[i] === "wait" ? "waits for the answer" : "sends a message"}, service ${state.down[i] ? "down" : "up"}`).join("; ")}. The customer waits ${r.waitMs} ms; order availability ${formatAvailability(r.availability)}. ${r.verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap a <b>call</b> to switch it between waiting and a message. Tap a <b>service</b> to make it fail.</>}
      controls={<BeatActionButton onClick={() => setState(START)}>Reset</BeatActionButton>}
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <SvgNode x={CHECKOUT.x} y={CHECKOUT.y} label="Checkout" kind="server" status={checkoutStatus} statusTone={checkoutTone} mark={failed ? "bad" : undefined} />

          {CALLS.map((c, i) => {
            const x = COLS[i];
            const waits = state.modes[i] === "wait";
            const down = state.down[i];
            const skipped = failed && r.failedAt !== null && i > r.failedAt && waits;
            const lineClass = waits ? TONES.accent.stroke : NEUTRAL.faintStroke;
            const dot = clock.reduced ? null : dotProgress(state, i, clock.seconds);
            // A message to a service that is down stops in the queue.
            const reach = waits ? 1 : down ? 0.4 : 1;
            const dotY = dot === null ? null : r1(LINE.y0 + dot * reach * (LINE.y1 - LINE.y0));
            return (
              <g key={c.id}>
                <LinkLine x1={x} y1={CHECKOUT.y + 34} x2={x} y2={CARD.y - CARD.h / 2} className={waits ? TONES.accent.stroke : NEUTRAL.faintStroke} />
                {waits ? (
                  <g opacity={skipped ? 0.35 : 1}>
                    <LinkLine x1={x} y1={LINE.y0} x2={x} y2={LINE.y1} className={lineClass} strokeWidth={2.5} />
                  </g>
                ) : (
                  <g>
                    <line x1={x} x2={x} y1={LINE.y0} y2={QUEUE_Y - 15} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
                    <line x1={x} x2={x} y1={QUEUE_Y + 15} y2={LINE.y1} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
                    <rect x={x - 50} y={QUEUE_Y - 15} width={100} height={30} rx={15} className="fill-card" />
                    <rect x={x - 50} y={QUEUE_Y - 15} width={100} height={30} rx={15} strokeWidth={1.75} className={cn(r.queued.includes(i) ? cn(TONES.warn.softFill, TONES.warn.stroke) : cn("fill-muted", NEUTRAL.line), SHAPE_TRANSITION)} />
                    <text x={x} y={QUEUE_Y + 4.5} textAnchor="middle" className={cn(r.queued.includes(i) ? TONES.warn.text : NEUTRAL.mutedText, "text-[12px] font-semibold")}>
                      {r.queued.includes(i) ? "1 waiting" : "queue: 0"}
                    </text>
                  </g>
                )}
                {waits && down && !skipped ? (
                  <g aria-hidden>
                    <circle cx={x} cy={LINE.y1 - 8} r={9} className={cn("fill-card", TONES.bad.stroke)} strokeWidth={2} />
                    <path d={`M${x - 3.5} ${LINE.y1 - 11.5} l7 7 m0 -7 l-7 7`} strokeWidth={2} strokeLinecap="round" className={cn("fill-none", TONES.bad.stroke)} />
                  </g>
                ) : null}
                {dotY !== null ? <circle cx={x} cy={dotY} r={5} className={cn(down && waits ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} /> : null}

                <SvgButton x={x - CARD.w / 2} y={CARD.y - CARD.h / 2} width={CARD.w} height={CARD.h} label={callLabel(i, state.modes[i])} pressed={!waits} onPress={() => setState((s) => toggleMode(s, i))}>
                  <rect x={x - CARD.w / 2} y={CARD.y - CARD.h / 2 + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                  <rect
                    x={x - CARD.w / 2}
                    y={CARD.y - CARD.h / 2}
                    width={CARD.w}
                    height={CARD.h}
                    rx={14}
                    strokeWidth={2}
                    strokeDasharray={waits ? undefined : "6 4"}
                    className={cn(waits ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.doneStroke), SHAPE_TRANSITION)}
                  />
                  {waits ? (
                    <Clock x={x - CARD.w / 2 + 10} y={CARD.y - CARD.h / 2 + 10} width={16} height={16} strokeWidth={2} className={cn(TONES.accent.stroke, "fill-none")} aria-hidden />
                  ) : (
                    <Send x={x - CARD.w / 2 + 10} y={CARD.y - CARD.h / 2 + 10} width={16} height={16} strokeWidth={2} className={cn(NEUTRAL.doneStroke, "fill-none")} aria-hidden />
                  )}
                  <text x={x - CARD.w / 2 + 32} y={CARD.y - CARD.h / 2 + 23} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{waits ? "Wait" : "Message"}</text>
                  <text x={x} y={CARD.y + 17} textAnchor="middle" className={cn(waits ? TONES.accent.text : NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>
                    {waits ? `${c.ms} ms` : "no wait"}
                  </text>
                </SvgButton>

                <SvgButton x={x - SERVICE_W / 2 - 4} y={SERVICE_Y - SERVICE_H / 2 - 4} width={SERVICE_W + 8} height={SERVICE_H + 8} label={serviceLabel(i, down)} pressed={down} onPress={() => setState((s) => toggleDown(s, i))}>
                  <ServiceCard x={x} y={SERVICE_Y} label={c.label} Icon={ICONS[i]} down={down} />
                </SvgButton>
              </g>
            );
          })}

          <SvgStat x={13} y={STAT_Y} width={194} label="customer waits" value={failed ? "order fails" : `${r.waitMs} ms`} tone={failed ? "bad" : null} />
          <SvgStat x={213} y={STAT_Y} width={194} label={`order availability, ${r.waitCalls} waits`} value={formatAvailability(r.availability)} tone={null} />

          <VerdictBanner width={W} text={r.verdict.text} tone={r.verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
