"use client";

import { useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import { APPLY_MS, SPAN_MS, readName, simulate, type NodeId } from "../models/session-reads";

const W = 420;
const X0 = 68;
const X1 = 408;
const x = (ms: number) => X0 + (ms / SPAN_MS) * (X1 - X0);
const ROW_H = 30;
const STRIP_H = 34;
const READER_MID = { Amna: 66, Omar: 100 } as const;
const NODES: { id: NodeId; label: string; mid: number }[] = [
  { id: "r1", label: "Replica 1", mid: 146 },
  { id: "r2", label: "Replica 2", mid: 186 },
  { id: "leader", label: "Leader", mid: 226 },
];
const NODE_MID = Object.fromEntries(NODES.map((n) => [n.id, n.mid])) as Record<NodeId, number>;
const AXIS_Y = 252;
const H = 304;
const OFFSET = { Amna: -19, Omar: 19 } as const;
const SWEEP_S = 5.5;
const PERIOD_S = 9;
const r1 = (v: number) => Math.round(v * 10) / 10;
const TICKS = [0, 100, 200, 300, 400, 500, 600, 700];

/** 11.5 beat 2: switch each promise on and watch where five reads go and what they show. */
export function SessionReadsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [ownWrites, setOwnWrites] = useState(false);
  const [noGoingBack, setNoGoingBack] = useState(false);
  const titleId = useId();
  const descId = useId();

  const out = simulate({ ownWrites, noGoingBack });
  const T = clock.reduced || settled ? SPAN_MS : Math.min(SPAN_MS, ((clock.seconds % PERIOD_S) / SWEEP_S) * SPAN_MS);
  const nodeName = (n: NodeId) => (n === "leader" ? "the leader" : n === "r1" ? "replica 1" : "replica 2");
  const description = `Amna writes a comment that the leader has at 0 ms, replica 1 at 150 ms and replica 2 at 600 ms. ${out.reads
    .map((r) => `${r.who} read ${readName(r)} at ${r.at} ms went to ${nodeName(r.node)} and ${r.shows ? "showed" : "did not show"} the comment`)
    .join(". ")}. ${out.verdict.text}.`;

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
          <BeatButton pressed={ownWrites} onClick={() => toggle(setOwnWrites, !ownWrites)}>My own writes</BeatButton>
          <BeatButton pressed={noGoingBack} onClick={() => toggle(setNoGoingBack, !noGoingBack)}>No going back</BeatButton>
        </>
      }
      hint="Switch each promise on and compare."
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={out.verdict.text} tone={out.verdict.tone} />

          {/* Readers. */}
          {(["Amna", "Omar"] as const).map((who) => (
            <g key={who}>
              <rect x={X0} y={READER_MID[who] - ROW_H / 2} width={X1 - X0} height={ROW_H} rx={10} className="fill-muted/40" />
              <text x={8} y={READER_MID[who] + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{who}</text>
            </g>
          ))}

          {/* The leader and the replicas: empty until the comment is applied. */}
          {NODES.map((n) => {
            const applied = T >= APPLY_MS[n.id];
            return (
              <g key={n.id}>
                <rect x={X0} y={n.mid - STRIP_H / 2} width={X1 - X0} height={STRIP_H} rx={10} className="fill-muted/40" />
                <rect
                  x={r1(x(APPLY_MS[n.id]))}
                  y={n.mid - STRIP_H / 2}
                  width={r1(X1 - x(APPLY_MS[n.id]))}
                  height={STRIP_H}
                  rx={10}
                  opacity={applied ? 1 : 0}
                  className={cn(TONES.accent.softFill, TONES.accent.stroke, "transition-opacity duration-300 motion-reduce:transition-none")}
                  strokeWidth={1.5}
                />
                <text x={8} y={n.mid + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{n.label}</text>
              </g>
            );
          })}

          {/* Arrows from each read to the node that answered it: the leader is the longest. */}
          {out.reads.map((r) => {
            const cx = x(r.at) + OFFSET[r.who];
            const y0 = READER_MID[r.who] + 9;
            const y1 = NODE_MID[r.node] - 12;
            return (
              <g key={`arrow-${r.id}`} opacity={T >= r.at ? 1 : 0} className={cn(r.shows ? TONES.good.stroke : TONES.warn.stroke, "transition-opacity duration-300 motion-reduce:transition-none")}>
                <line x1={r1(cx)} x2={r1(cx)} y1={y0} y2={y1} strokeWidth={r.toLeader ? 2.5 : 1.75} strokeLinecap="round" />
                <polygon points={`${r1(cx - 4.5)},${y1 - 5} ${r1(cx + 4.5)},${y1 - 5} ${r1(cx)},${y1 + 1}`} className={cn(r.shows ? TONES.good.solidFill : TONES.warn.solidFill, "stroke-none")} />
              </g>
            );
          })}

          {/* Read pills on the readers' rows, and the answer pills on the nodes. */}
          {out.reads.map((r) => {
            const cx = x(r.at) + OFFSET[r.who];
            const tone = TONES[r.shows ? "good" : "warn"];
            const Icon = r.shows ? Check : X;
            return (
              <g key={`pill-${r.id}`} opacity={T >= r.at ? 1 : 0} className="transition-opacity duration-300 motion-reduce:transition-none">
                <rect x={r1(cx - 14)} y={READER_MID[r.who] - 9} width={28} height={18} rx={9} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                <text x={r1(cx)} y={READER_MID[r.who] + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{readName(r)}</text>
                <rect x={r1(cx - 18)} y={NODE_MID[r.node] - 9} width={36} height={18} rx={9} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                <Icon x={r1(cx - 15)} y={NODE_MID[r.node] - 5.5} width={11} height={11} strokeWidth={3} className={cn(tone.stroke, "fill-none")} aria-hidden />
                <text x={r1(cx + 4)} y={NODE_MID[r.node] + 4.2} textAnchor="middle" className={cn(tone.text, "text-[11.5px] font-semibold")}>{readName(r)}</text>
              </g>
            );
          })}

          {/* The clock: a cursor sweeping 0 to 700 ms. */}
          <line x1={r1(x(T))} x2={r1(x(T))} y1={46} y2={AXIS_Y} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.doneStroke} />

          <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={2} className={NEUTRAL.line} />
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={AXIS_Y} y2={AXIS_Y + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={x(t)} y={AXIS_Y + 21} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t}</text>
            </g>
          ))}
          <text x={8} y={AXIS_Y + 21} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>ms</text>
          <text x={W / 2} y={AXIS_Y + 42} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>Applied at: leader 0 ms, replica 1 150 ms, replica 2 600 ms</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
