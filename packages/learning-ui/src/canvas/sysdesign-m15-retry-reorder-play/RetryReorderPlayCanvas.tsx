"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { AXIS_MS, MODES, NAMES, WRITE_MS, boxLabel, flight, run, valueText, verdictFor, type Mode } from "./model";

const W = 420;
const H = 368;
const CARD_X = 62;
const PROD_Y = 92;
const LOG_Y = 160;
const CON_Y = 228;
const LANE = { x0: 124, x1: 406 };
const AX = { x0: 132, x1: 398, y: 266 };
const STRIP_Y = 318;

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(AX.x0 + (Math.max(0, Math.min(AXIS_MS, t)) / AXIS_MS) * (AX.x1 - AX.x0));

/** 15.4 beat 3: make the first send fail and watch the retry land after the second update. */
export function RetryReorderPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [lost, setLost] = useState(true);
  const [mode, setMode] = useState<Mode>("free");

  const r = run(lost, mode);
  const verdict = verdictFor(r);
  const inOrder = r.log.every((l, i) => i === 0 || r.log[i - 1].update < l.update);
  const lastApplied = [...r.log].reverse().find((l) => l.applied);
  const finalTone = r.wrong ? "bad" : "good";
  const logTone = inOrder ? "good" : mode === "version" ? "warn" : "bad";
  const slowTone = mode === "one" && lost ? "warn" : null;

  const lanes = [PROD_Y, LOG_Y, CON_Y];
  const description = `A producer sends two updates for one order: update 1, "${NAMES[1]}", at 0 ms and update 2, "${NAMES[2]}", at 10 ms. ${valueText(r)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Switch <b>First send is lost</b> on and off, then try each way of sending.
        </>
      }
      controls={
        <>
          <BeatButton pressed={lost} onClick={() => setLost((v) => !v)}>
            First send is lost
          </BeatButton>
          <BeatSegmented<Mode> label="Send" options={MODES} value={mode} onChange={setMode} />
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Three lanes on one millisecond axis. */}
          {lanes.map((y) => (
            <line key={y} x1={LANE.x0} x2={LANE.x1} y1={y} y2={y} strokeWidth={1.5} strokeDasharray="3 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          ))}
          <line x1={AX.x0} x2={AX.x1} y1={AX.y} y2={AX.y} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 20, 40, 60].map((t) => (
            <g key={t}>
              <line x1={xOf(t)} x2={xOf(t)} y1={AX.y - 4} y2={AX.y + 4} strokeWidth={1.5} className={NEUTRAL.doneStroke} />
              <text x={xOf(t)} y={AX.y + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t === 60 ? "60 ms" : String(t)}</text>
            </g>
          ))}

          {/* The producer's wait: a bracket above its lane. */}
          {r.wait ? (
            <g>
              <line x1={xOf(r.wait.from)} x2={xOf(r.wait.to)} y1={PROD_Y - 26} y2={PROD_Y - 26} strokeWidth={2} className={TONES.warn.stroke} />
              <line x1={xOf(r.wait.from)} x2={xOf(r.wait.from)} y1={PROD_Y - 30} y2={PROD_Y - 22} strokeWidth={2} className={TONES.warn.stroke} />
              <line x1={xOf(r.wait.to)} x2={xOf(r.wait.to)} y1={PROD_Y - 30} y2={PROD_Y - 22} strokeWidth={2} className={TONES.warn.stroke} />
              <text x={r1((xOf(r.wait.from) + xOf(r.wait.to)) / 2)} y={PROD_Y - 34} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>{r.wait.label}</text>
            </g>
          ) : null}

          {/* Messages: a line from each send to its write; the lost one stops at a cross. */}
          {r.messages.map((m, k) => {
            const x0 = xOf(m.sentAt);
            const y0 = PROD_Y + 10;
            const y1 = LOG_Y - 12;
            if (m.writtenAt === null) {
              const xe = r1(x0 + (xOf(m.sentAt + WRITE_MS) - x0) * 0.55);
              const ye = r1(y0 + (y1 - y0) * 0.55);
              return (
                <g key={k}>
                  <line x1={x0} y1={y0} x2={xe} y2={ye} strokeWidth={2} strokeDasharray="4 3" className={TONES.bad.stroke} />
                  <line x1={xe - 5} y1={ye - 5} x2={xe + 5} y2={ye + 5} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
                  <line x1={xe - 5} y1={ye + 5} x2={xe + 5} y2={ye - 5} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
                </g>
              );
            }
            return <line key={k} x1={x0} y1={y0} x2={xOf(m.writtenAt)} y2={y1} strokeWidth={2} className={cn(m.retry ? TONES.warn.stroke : TONES.accent.stroke)} opacity={0.75} />;
          })}

          {/* From each write, down to the consumer. */}
          {r.log.map((l) => (
            <line key={`d${l.writtenAt}`} x1={xOf(l.writtenAt)} x2={xOf(l.writtenAt)} y1={LOG_Y + 12} y2={CON_Y - 11} strokeWidth={1.75} strokeDasharray={l.applied ? undefined : "3 3"} className={l.applied ? TONES.accent.stroke : NEUTRAL.doneStroke} opacity={0.75} />
          ))}

          {/* Sends on the producer lane. A retry is named on its own pill. */}
          {r.messages.map((m, k) => (
            <g key={`s${k}`}>
              {m.retry ? (
                <g>
                  <rect x={xOf(m.sentAt) - 56} y={PROD_Y - 10} width={44} height={20} rx={10} className="fill-card" />
                  <rect x={xOf(m.sentAt) - 56} y={PROD_Y - 10} width={44} height={20} rx={10} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
                  <text x={xOf(m.sentAt) - 34} y={PROD_Y + 4.5} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>retry</text>
                </g>
              ) : null}
              <circle cx={xOf(m.sentAt)} cy={PROD_Y} r={10} strokeWidth={2} className={cn(NEUTRAL.surface, m.retry ? TONES.warn.stroke : TONES.accent.stroke)} />
              <text x={xOf(m.sentAt)} y={PROD_Y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-bold")}>{m.update}</text>
            </g>
          ))}

          {/* Writes on the log lane, and what the consumer does with each. */}
          {r.log.map((l) => (
            <g key={`w${l.writtenAt}`}>
              <rect x={xOf(l.writtenAt) - 10} y={LOG_Y - 10} width={20} height={20} rx={5} className={cn(NEUTRAL.surface, TONES.accent.stroke)} strokeWidth={2} />
              <text x={xOf(l.writtenAt)} y={LOG_Y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-bold")}>{l.update}</text>
              <circle cx={xOf(l.writtenAt)} cy={CON_Y} r={10} strokeWidth={2} strokeDasharray={l.applied ? undefined : "3 3"} className={cn(l.applied ? (l === lastApplied ? cn(TONES[finalTone].solidFill, TONES[finalTone].stroke) : cn(TONES.accent.solidFill, TONES.accent.stroke)) : cn(NEUTRAL.surface, NEUTRAL.doneStroke), "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={xOf(l.writtenAt)} y={CON_Y + 4.5} textAnchor="middle" className={cn(l.applied ? "fill-white dark:fill-slate-950" : NEUTRAL.mutedText, "text-[12px] font-bold")}>{l.update}</text>
              {!l.applied ? (
                <text x={xOf(l.writtenAt)} y={CON_Y + 28} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>skipped</text>
              ) : null}
            </g>
          ))}

          {/* A dot flies along each message in turn: the story clock, one message after another. */}
          {clock.reduced
            ? null
            : r.messages.map((m, k) => {
                const p = flight(k, r.messages.length, clock.seconds);
                if (p === null) return null;
                const x0 = xOf(m.sentAt);
                const y0 = PROD_Y + 10;
                const x1 = m.writtenAt === null ? r1(x0 + (xOf(m.sentAt + WRITE_MS) - x0) * 0.55) : xOf(m.writtenAt);
                const y1 = m.writtenAt === null ? r1(y0 + (LOG_Y - 12 - y0) * 0.55) : LOG_Y - 12;
                return (
                  <circle key={`f${k}`} cx={r1(x0 + (x1 - x0) * p)} cy={r1(y0 + (y1 - y0) * p)} r={4.5} className={cn(m.writtenAt === null ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
                );
              })}

          {/* The three actors. */}
          <SvgNode x={CARD_X} y={PROD_Y} label="Producer" kind="server" status={lost ? "retries once" : "no retry"} statusTone={lost ? "warn" : "good"} />
          <SvgNode x={CARD_X} y={LOG_Y} label="Broker log" kind="queue" status={`order ${r.log.map((l) => l.update).join(", ")}`} statusTone={logTone} />
          <SvgNode x={CARD_X} y={CON_Y} label="Consumer" kind="worker" status={r.wrong ? `${r.final} (wrong)` : r.final} statusTone={finalTone} mark={r.wrong ? "bad" : undefined} />

          {/* The log as two boxes in the order they were written, and what it cost in time. */}
          <text x={22} y={STRIP_Y - 8} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>log, in the order written</text>
          {r.log.map((l, i) => {
            const x = 22 + i * 138;
            const bad = r.wrong && l === lastApplied;
            return (
              <g key={`b${i}`}>
                <rect x={x} y={STRIP_Y} width={112} height={36} rx={11} strokeWidth={bad ? 2 : 1.5} strokeDasharray={l.applied ? undefined : "4 3"} className={cn(NEUTRAL.surface, bad ? TONES.bad.stroke : l.applied ? NEUTRAL.line : NEUTRAL.doneStroke)} />
                <text x={x + 56} y={STRIP_Y + 23} textAnchor="middle" className={cn(bad ? TONES.bad.text : NEUTRAL.text, "text-[13px] font-semibold")}>{boxLabel(l.update, mode)}</text>
                {i === 0 ? <path d={`M${x + 118} ${STRIP_Y + 18} h14 m-5 -5 l5 5 l-5 5`} fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={NEUTRAL.doneStroke} /> : null}
              </g>
            );
          })}
          <rect x={298} y={STRIP_Y - 2} width={100} height={40} rx={11} strokeWidth={slowTone ? 2 : 1.5} className={cn(NEUTRAL.surface, slowTone ? TONES[slowTone].stroke : NEUTRAL.line)} />
          <text x={308} y={STRIP_Y + 14} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>all written by</text>
          <text x={308} y={STRIP_Y + 32} className={cn(slowTone ? TONES[slowTone].text : NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>{`${r.total} ms`}</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
