"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  applied,
  behindText,
  copiesInFlight,
  EMPTY_RUN,
  isDown,
  KILL_STAMP,
  LONG_AGO,
  MAX_ENTRIES,
  NODE_LABEL,
  NODES,
  readNode,
  requestsInFlight,
  verdict,
  type Action,
  type NodeId,
  type ReadResult,
  type Run,
} from "./model";

const W = 420;
const H = 432;
const APP = { x: 58, y: 98 };
const LEADER = { x: 250, y: 98 };
const POS: Record<NodeId, { x: number; y: number }> = { leader: LEADER, f1: { x: 116, y: 226 }, f2: { x: 320, y: 226 } };
const BUS_Y = 164;
const CELL = { w: 24, h: 22, gap: 3, x0: 92 };
const ROW_Y: Record<NodeId, number> = { leader: 344, f1: 370, f2: 396 };

/** Where a copy dot sits on its way from the leader's card down to a follower's card. */
function copyPoint(node: "f1" | "f2", p: number): { x: number; y: number } {
  const end = POS[node].x;
  const a = BUS_Y - 128;
  const b = Math.abs(LEADER.x - end);
  const c = 184 - BUS_Y;
  let d = p * (a + b + c);
  if (d <= a) return { x: LEADER.x, y: 128 + d };
  d -= a;
  if (d <= b) return { x: LEADER.x + Math.sign(end - LEADER.x) * d, y: BUS_Y };
  d -= b;
  return { x: end, y: BUS_Y + d };
}

type Chip = { text: string; note: string; tone: Tone };

function chipFor(r: ReadResult): Chip {
  if (r.kind === "down") return { text: "none", note: "leader is down", tone: "bad" };
  return r.fresh ? { text: `x = ${r.value}`, note: "up to date", tone: "good" } : { text: `x = ${r.value}`, note: behindText(r.behind), tone: "warn" };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

function Dot({ x, y, entry }: { x: number; y: number; entry: number }) {
  return (
    <g>
      <circle cx={r1(x)} cy={r1(y)} r={9} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
      <text x={r1(x)} y={r1(y) + 4} textAnchor="middle" className="fill-white text-[11.5px] font-bold dark:fill-blue-950">
        {entry}
      </text>
    </g>
  );
}

/** Beat 4 of 8.2: send writes, read from any copy, kill the leader. */
export function LeaderFollowersCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [run, setRun] = useState<Run>(EMPTY_RUN);
  const [reads, setReads] = useState<Partial<Record<NodeId, Chip>>>({});
  const [action, setAction] = useState<Action>({ kind: "none" });

  const now = clock.seconds;
  const stamp = (kind: "write" | "kill") => (clock.reduced ? (kind === "write" ? LONG_AGO : KILL_STAMP) : now);
  const down = isDown(run, now);
  const full = run.writes.length >= MAX_ENTRIES;
  const leaderN = applied(run, "leader", now);
  const counts: Record<NodeId, number> = { leader: leaderN, f1: applied(run, "f1", now), f2: applied(run, "f2", now) };
  const v = verdict(action);

  const reset = () => {
    setRun(EMPTY_RUN);
    setReads({});
    setAction({ kind: "none" });
    clock.restart();
  };
  const write = () => {
    if (run.killedAt !== null) return setAction({ kind: "refused" });
    if (full) return reset();
    setRun((r) => ({ ...r, writes: [...r.writes, stamp("write")] }));
    setReads({});
    setAction({ kind: "write" });
  };
  const kill = () => {
    if (run.killedAt !== null) return;
    setRun((r) => ({ ...r, killedAt: stamp("kill") }));
    setReads({});
    setAction({ kind: "kill" });
  };
  const read = (node: NodeId) => {
    const result = readNode(run, node, now);
    setReads({ [node]: chipFor(result) });
    setAction({ kind: "read", result });
  };

  const requests = requestsInFlight(run, now);
  const copies = copiesInFlight(run, now);
  const summary = `Leader ${down ? "is down, last value" : "value"} x = ${counts.leader}. Follower 1 x = ${counts.f1}. Follower 2 x = ${counts.f2}. ${v.text}.`;

  const pillOf = (id: NodeId): { text: string; tone: Tone } => {
    if (id === "leader") return down ? { text: "down", tone: "bad" } : { text: `x = ${counts.leader}`, tone: "accent" };
    return { text: `x = ${counts[id]}`, tone: counts[id] === leaderN ? "good" : "warn" };
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap <b>Write</b>, then tap any node to read from it.</>}
      controls={
        <>
          <BeatButton pressed={run.killedAt !== null} onClick={kill}>Kill leader</BeatButton>
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} tone={v.tone} text={v.text} />

          {/* Links: the app to the leader, and the leader to each follower. */}
          <line x1={APP.x + 56} x2={LEADER.x - 56} y1={APP.y} y2={APP.y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={cn(down ? TONES.bad.stroke : NEUTRAL.faintStroke, SHAPE_TRANSITION)} />
          <path d={`M${LEADER.x} 128 V${BUS_Y} H${POS.f1.x} V196`} fill="none" strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <path d={`M${LEADER.x} ${BUS_Y} H${POS.f2.x} V196`} fill="none" strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />

          {requests.map((r) => (
            <Dot key={`q${r.entry}`} x={APP.x + 56 + 11 + r.p * (LEADER.x - APP.x - 112 - 22)} y={APP.y} entry={r.entry} />
          ))}
          {copies.map((c) => {
            const pt = copyPoint(c.node, c.p);
            return <Dot key={`${c.node}${c.entry}`} x={pt.x} y={pt.y} entry={c.entry} />;
          })}

          <SvgNode x={APP.x} y={APP.y} label="App" kind="user" status={full ? "log full" : `next: entry ${run.writes.length + 1}`} />

          <g opacity={down ? 0.6 : 1}>
            <SvgButton x={LEADER.x - 56} y={LEADER.y - 30} width={112} height={60} label={`Read from ${NODE_LABEL.leader}${down ? ", it is down" : ""}`} onPress={() => read("leader")}>
              <SvgNode x={LEADER.x} y={LEADER.y} label="Leader" kind="database" status={pillOf("leader").text} statusTone={pillOf("leader").tone} mark={down ? "bad" : undefined} />
            </SvgButton>
          </g>
          {(["f1", "f2"] as const).map((id) => (
            <SvgButton key={id} x={POS[id].x - 56} y={POS[id].y - 30} width={112} height={60} label={`Read from ${NODE_LABEL[id]}`} onPress={() => read(id)}>
              <SvgNode x={POS[id].x} y={POS[id].y} label={NODE_LABEL[id]} kind="database" status={pillOf(id).text} statusTone={pillOf(id).tone} />
            </SvgButton>
          ))}

          {/* The Write button, beside the app. */}
          <SvgButton x={APP.x - 40} y={BUS_Y - 26} width={80} height={44} rx={18} label={full ? "Log is full: reset" : "Write: send the next change to the leader"} onPress={write}>
            <rect x={APP.x - 40} y={BUS_Y - 18} width={80} height={30} rx={15} className={cn(TONES.accent.solidFill, TONES.accent.stroke)} strokeWidth={1.5} />
            <text x={APP.x} y={BUS_Y + 2.5} textAnchor="middle" className="fill-white text-[12.5px] font-semibold dark:fill-blue-950">
              {full ? "Reset log" : "Write"}
            </text>
          </SvgButton>

          {action.kind === "refused" ? (
            <g>
              <rect x={118} y={52} width={72} height={24} rx={12} className={cn(TONES.bad.softFill, TONES.bad.stroke)} strokeWidth={1.5} />
              <text x={154} y={68} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold")}>no leader</text>
            </g>
          ) : null}

          {/* What a Read tap answered. */}
          {NODES.map((id) => {
            const chip = reads[id];
            if (!chip) return null;
            const cx = id === "leader" ? 348 : POS[id].x;
            const cy = id === "leader" ? 88 : 278;
            return (
              <g key={`chip-${id}`}>
                <rect x={cx - 29} y={cy - 12} width={58} height={24} rx={12} className={cn(TONES[chip.tone].softFill, TONES[chip.tone].stroke)} strokeWidth={1.5} />
                <text x={cx} y={cy + 4} textAnchor="middle" className={cn(TONES[chip.tone].text, "text-[12px] font-semibold tabular-nums")}>{chip.text}</text>
                <text x={cx} y={cy + 30} textAnchor="middle" className={cn(TONES[chip.tone].text, "text-[12px] font-semibold")}>{chip.note}</text>
              </g>
            );
          })}

          {/* The logs: one numbered box per entry, filled once the node has applied it. */}
          {NODES.map((id) => (
            <g key={`log-${id}`}>
              <text x={12} y={ROW_Y[id] + 4.5} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{NODE_LABEL[id]}</text>
              {Array.from({ length: MAX_ENTRIES }, (_, i) => {
                const has = i < counts[id];
                const missing = !has && i < leaderN;
                const x = CELL.x0 + i * (CELL.w + CELL.gap);
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={ROW_Y[id] - CELL.h / 2}
                      width={CELL.w}
                      height={CELL.h}
                      rx={5}
                      strokeWidth={1.5}
                      strokeDasharray={missing ? "4 3" : undefined}
                      className={cn(SHAPE_TRANSITION, has ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, missing ? TONES.warn.stroke : NEUTRAL.line))}
                    />
                    <text x={x + CELL.w / 2} y={ROW_Y[id] + 4.2} textAnchor="middle" className={cn("text-[11.5px] font-semibold tabular-nums", has ? TONES.accent.text : NEUTRAL.mutedText)}>
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          <text x={CELL.x0} y={426} className={cn(NEUTRAL.mutedText, "text-[12px]")}>dashed box: the leader has it, this copy does not yet</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
