"use client";

import { useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgNode } from "../primitives/svg-node";
import { NEUTRAL, TONES } from "../primitives/tones";
import { textWidth } from "../models/history-layout";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import {
  EDIT1,
  EDIT2,
  HANA_QUESTIONS_AT,
  HANA_REPLIES_AT,
  HOLD_WINDOW,
  PANEL1_SPAN_MS,
  PANEL2_SPAN_MS,
  QUESTION_AT_MS,
  REPLY_AT_MS,
  nameAt,
  panel2,
  writesVerdict,
} from "../models/session-writes";

const W = 420;
const SWEEP_S = 5.5;
const PERIOD_S = 9;
const r1 = (v: number) => Math.round(v * 10) / 10;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Panel 1: Amna and the leader, two tracks for the two edits.
const P1 = { amnaX: 64, leaderX: 356, cardY: 96, track: [80, 112] as const, from: 124, to: 296, chipH: 20 };
// Panel 2: rows for Hana's reads, the two shards and the leader.
const P2_TOP = 172;
const X0 = 76;
const X1 = 408;
const x2 = (ms: number) => X0 + (ms / PANEL2_SPAN_MS) * (X1 - X0);
const ROWS = { hana: P2_TOP + 66, replies: P2_TOP + 112, questions: P2_TOP + 152, leader: P2_TOP + 192 } as const;
const AXIS_Y = P2_TOP + 216;
const H = AXIS_Y + 52;
const TICKS2 = [0, 30, 60, 90, 120];

/** 11.5 beat 3: switch on write numbers and dependencies, and watch an edit and a reply stay in order. */
export function SessionWritesCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [numbers, setNumbers] = useState(false);
  const [deps, setDeps] = useState(false);
  const titleId = useId();
  const descId = useId();

  const phase = clock.reduced || settled ? 1 : clamp01((clock.seconds % PERIOD_S) / SWEEP_S);
  const T1 = phase * PANEL1_SPAN_MS;
  const T2 = phase * PANEL2_SPAN_MS;
  const v1 = writesVerdict(numbers);
  const p2 = panel2(deps);
  const name = nameAt(numbers, T1);
  const holding = numbers && T1 >= HOLD_WINDOW.from && T1 < HOLD_WINDOW.until;

  const chips = [
    { edit: EDIT1, track: P1.track[0] },
    { edit: EDIT2, track: P1.track[1] },
  ].map(({ edit, track }) => {
    const w = Math.ceil(textWidth(edit.label, 11.5, true) + 18);
    const p = clamp01((T1 - edit.sentAt) / (edit.arrivesAt - edit.sentAt));
    const left = P1.from + p * (P1.to - P1.from - w);
    return { edit, track, w, left, visible: T1 >= edit.sentAt && T1 < edit.arrivesAt };
  });

  const hanaPills = [
    { id: "h1", label: "H1", at: HANA_REPLIES_AT, node: "replies" as const, shows: p2.replies.shows },
    { id: "h2", label: "H2", at: HANA_QUESTIONS_AT, node: p2.questions.node, shows: p2.questions.shows },
  ];
  const description = `Panel 1. Amna sends edit 1, name Amna, at 0 ms and edit 2, name Amna K., at 10 ms. Edit 2 reaches the leader at 20 ms and edit 1 at 35 ms. ${
    numbers ? "With write numbers the leader holds edit 2 until edit 1 is applied" : "Without write numbers the leader applies them in arrival order"
  }. ${v1.text}. Panel 2. Omar replied to question 1. The reply is on the Replies copy at ${REPLY_AT_MS} ms and the question on the Questions copy at ${QUESTION_AT_MS} ms. Hana reads replies at ${HANA_REPLIES_AT} ms and questions at ${HANA_QUESTIONS_AT} ms. ${p2.verdict.text}.`;

  const toggle = (set: (v: boolean) => void, v: boolean) => {
    set(v);
    clock.restart();
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatButton pressed={numbers} onClick={() => toggle(setNumbers, !numbers)}>Write numbers</BeatButton>
          <BeatButton pressed={deps} onClick={() => toggle(setDeps, !deps)}>Dependencies</BeatButton>
        </>
      }
      hint="Switch each promise on and compare."
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Panel 1: two edits cross on the way to the leader. */}
          <VerdictBanner width={W} text={v1.text} tone={v1.tone} />
          {P1.track.map((y) => (
            <line key={y} x1={P1.from} x2={P1.to} y1={y} y2={y} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 6" className={NEUTRAL.faintStroke} />
          ))}
          <SvgNode x={P1.amnaX} y={P1.cardY} label="Amna" kind="user" status={T1 >= EDIT2.sentAt ? "sent 2 edits" : T1 >= EDIT1.sentAt ? "sent edit 1" : "editing"} />
          <SvgNode x={P1.leaderX} y={P1.cardY} label="Leader" kind="server" status={`name: ${name}`} statusTone={name === "Amna" && !numbers ? "bad" : name === "none" ? undefined : "good"} />
          {chips.map((c) => (
            <g key={c.edit.label} opacity={c.visible ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
              <rect x={r1(c.left)} y={c.track - P1.chipH / 2} width={c.w} height={P1.chipH} rx={P1.chipH / 2} className="fill-card" />
              <rect x={r1(c.left)} y={c.track - P1.chipH / 2} width={c.w} height={P1.chipH} rx={P1.chipH / 2} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
              <text x={r1(c.left + c.w / 2)} y={c.track + 4.2} textAnchor="middle" className={cn(TONES.accent.text, "text-[11.5px] font-semibold")}>{c.edit.label}</text>
            </g>
          ))}
          <g opacity={holding ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
            <rect x={P1.leaderX - 56} y={134} width={112} height={20} rx={10} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
            <text x={P1.leaderX} y={148.2} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>holding edit 2</text>
          </g>
          <text x={W / 2} y={150} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`time ${Math.round(T1)} ms`}</text>

          {/* Panel 2: a reply and the question it answers. */}
          <VerdictBanner width={W} text={p2.verdict.text} tone={p2.verdict.tone} y={P2_TOP + 8} />
          {(
            [
              { id: "hana", label: "Hana", mid: ROWS.hana, h: 30 },
              { id: "replies", label: "Replies", mid: ROWS.replies, h: 34, from: REPLY_AT_MS },
              { id: "questions", label: "Questions", mid: ROWS.questions, h: 34, from: QUESTION_AT_MS },
              { id: "leader", label: "Leader", mid: ROWS.leader, h: 34, from: 0 },
            ] as { id: string; label: string; mid: number; h: number; from?: number }[]
          ).map((row) => (
            <g key={row.id}>
              <rect x={X0} y={row.mid - row.h / 2} width={X1 - X0} height={row.h} rx={10} className="fill-muted/40" />
              {row.from !== undefined ? (
                <rect x={r1(x2(row.from))} y={row.mid - row.h / 2} width={r1(X1 - x2(row.from))} height={row.h} rx={10} opacity={T2 >= row.from ? 1 : 0} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke, "transition-opacity duration-300 motion-reduce:transition-none")} />
              ) : null}
              <text x={8} y={row.mid + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{row.label}</text>
            </g>
          ))}
          {hanaPills.map((p) => {
            const cx = x2(p.at);
            const nodeY = ROWS[p.node];
            const tone = TONES[p.shows ? "good" : "warn"];
            const Icon = p.shows ? Check : X;
            const toLeader = p.node === "leader";
            const y1 = nodeY - 12;
            return (
              <g key={p.id} opacity={T2 >= p.at ? 1 : 0} className="transition-opacity duration-300 motion-reduce:transition-none">
                <g className={tone.stroke}>
                  <line x1={r1(cx)} x2={r1(cx)} y1={ROWS.hana + 9} y2={y1} strokeWidth={toLeader ? 2.5 : 1.75} strokeLinecap="round" />
                  <polygon points={`${r1(cx - 4.5)},${y1 - 5} ${r1(cx + 4.5)},${y1 - 5} ${r1(cx)},${y1 + 1}`} className={cn(tone.solidFill, "stroke-none")} />
                </g>
                <rect x={r1(cx - 12)} y={ROWS.hana - 9} width={24} height={18} rx={9} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                <text x={r1(cx)} y={ROWS.hana + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{p.label}</text>
                <rect x={r1(cx - 12)} y={nodeY - 9} width={24} height={18} rx={9} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke)} />
                <Icon x={r1(cx - 6)} y={nodeY - 6} width={12} height={12} strokeWidth={3} className={cn(tone.stroke, "fill-none")} aria-hidden />
              </g>
            );
          })}
          <g opacity={deps && p2.inherits && T2 >= HANA_REPLIES_AT ? 1 : 0} className="transition-opacity duration-300 motion-reduce:transition-none">
            <rect x={262} y={ROWS.hana - 10} width={142} height={20} rx={10} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
            <text x={333} y={ROWS.hana + 4.2} textAnchor="middle" className={cn(TONES.accent.text, "text-[11.5px] font-semibold")}>needs question 1</text>
          </g>
          <line x1={r1(x2(T2))} x2={r1(x2(T2))} y1={P2_TOP + 46} y2={AXIS_Y} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />

          <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={2} className={NEUTRAL.line} />
          {TICKS2.map((t) => (
            <g key={t}>
              <line x1={x2(t)} x2={x2(t)} y1={AXIS_Y} y2={AXIS_Y + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={x2(t)} y={AXIS_Y + 21} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t}</text>
            </g>
          ))}
          <text x={8} y={AXIS_Y + 21} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>ms</text>
          <text x={W / 2} y={AXIS_Y + 42} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`Reply applied at ${REPLY_AT_MS} ms, question 1 at ${QUESTION_AT_MS} ms`}</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
