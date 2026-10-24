"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgChip } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  addWrite,
  canWrite,
  countdown,
  history,
  initial,
  judge,
  LONG_AGO,
  promoted,
  roles,
  thrownAway,
  TRAVEL_S,
  verdict,
  type NodeId,
  type State,
} from "./model";

const W = 420;
const H = 432;
const BUS_Y = 64;
const NODE_Y = 136;
const CX: Record<NodeId, number> = { A: 70, B: 210, C: 350 };
const BADGE_Y = 186;
const LOG_Y = 222;
const DB = { x: 210, y: 330 };
const r1 = (v: number) => Math.round(v * 10) / 10;
const CIRC = 2 * Math.PI * 9;

const WRITER_TONE: Record<"A" | "B", Tone> = { A: "accent", B: "good" };

function LogChip({ x, y, label, tone, state }: { x: number; y: number; label: string; tone: Tone; state: "ok" | "refused" | "lost" }) {
  const bad = state !== "ok";
  return (
    <g>
      <rect x={x} y={y - 12} width={30} height={24} rx={8} strokeWidth={1.5} strokeDasharray={bad ? "3 3" : undefined} className={cn(SHAPE_TRANSITION, bad ? cn(NEUTRAL.surface, TONES.bad.stroke) : cn(TONES[tone].softFill, TONES[tone].stroke))} />
      <text x={x + 15} y={y + 4.2} textAnchor="middle" className={cn("text-[12px] font-bold", bad ? TONES.bad.text : TONES[tone].text)}>{label}</text>
    </g>
  );
}

function Dot({ x, y, label, tone }: { x: number; y: number; label: string; tone: Tone }) {
  return (
    <g>
      <circle cx={r1(x)} cy={r1(y)} r={11} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={1.5} />
      <text x={r1(x)} y={r1(y) + 4} textAnchor="middle" className="fill-white text-[11.5px] font-bold dark:fill-slate-950">{label}</text>
    </g>
  );
}

/** Where a write is on its way from a leader's log to the Database. */
function route(node: "A" | "B", p: number) {
  const from = { x: CX[node], y: 242 };
  const to = node === "A" ? { x: 172, y: 288 } : { x: 210, y: 286 };
  return { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
}

/** Beat 3 of 8.5: cut the link, two leaders, and fencing. */
export function SplitBrainCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [state, setState] = useState<State>(initial(false));
  const now = clock.seconds;
  const stamp = clock.reduced ? LONG_AGO : now;
  const { net, fencing } = state;
  const r = roles(net, now);
  const left = countdown(net, now);
  const judged = judge(state);
  const arrived = history(state).filter((w) => now >= w.arriveAt);
  const lost = new Set(thrownAway(state).map((w) => w.label));
  const refusedNow = judged.filter((w) => !w.accepted && now >= w.arriveAt);
  const lastRefused = refusedNow[refusedNow.length - 1];
  const v = verdict(state, now);

  const replay = (nextFencing: boolean) => {
    setState(initial(nextFencing));
    clock.restart();
  };
  const cutOrHeal = () => {
    setState((s) => {
      if (s.net.phase === "ok") return { ...s, net: { phase: "cut", cutAt: stamp, healAt: null } };
      if (s.net.phase === "cut") {
        // Healing before the timeout ends: nothing changed, the followers heard A again.
        return promoted(s.net, now) ? { ...s, net: { ...s.net, phase: "healed", healAt: stamp } } : { ...s, net: { phase: "ok", cutAt: null, healAt: null } };
      }
      return s;
    });
  };
  const write = (node: "A" | "B") => {
    if (canWrite(state, node, now)) setState((s) => addWrite(s, node, stamp));
  };

  const chipText = net.phase === "ok" ? "Cut" : net.phase === "cut" ? "Heal" : "Healed";
  const cut = net.phase === "cut";
  const summary = `Node A is ${r.A.role} with epoch ${r.A.epoch}, B is ${r.B.role} with epoch ${r.B.epoch}, C is ${r.C.role} with epoch ${r.C.epoch}. The link is ${cut ? "cut" : net.phase === "healed" ? "healed" : "up"} and fencing is ${fencing ? "on" : "off"}. The database holds ${arrived.length} writes. ${v.text}.`;

  const statusA = r.A.role === "follower" ? { text: "follower", tone: undefined } : r.A.stale ? { text: "old leader", tone: "warn" as Tone } : { text: "leader", tone: "accent" as Tone };
  const statusOf = (id: "B" | "C") => {
    const x = r[id];
    if (x.role === "waiting") return { text: "waiting", tone: "warn" as Tone };
    if (x.role === "leader") return { text: "new leader", tone: "good" as Tone };
    return { text: "follower", tone: undefined };
  };
  const badgeTone = (id: NodeId): Tone | undefined => (id === "A" && r.A.stale ? "bad" : id === "B" && r.B.epoch === 2 ? "good" : undefined);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap <b>Cut</b>, wait, then tap both leaders to write.</>}
      controls={
        <>
          <BeatButton pressed={fencing} onClick={() => replay(!fencing)}>Fencing: {fencing ? "on" : "off"}</BeatButton>
          <BeatButton onClick={() => replay(fencing)}>Replay</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} tone={v.tone} text={v.text} />

          {/* The network: A to B (cut here) and B to C. */}
          <line x1={CX.A} x2={CX.B} y1={BUS_Y} y2={BUS_Y} strokeWidth={2} strokeLinecap="round" strokeDasharray={cut ? "5 5" : undefined} className={cn(SHAPE_TRANSITION, cut ? TONES.bad.stroke : NEUTRAL.doneStroke)} />
          <line x1={CX.B} x2={CX.C} y1={BUS_Y} y2={BUS_Y} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.doneStroke} />
          {(["A", "B", "C"] as const).map((id) => (
            <line key={id} x1={CX[id]} x2={CX[id]} y1={BUS_Y} y2={NODE_Y - 30} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.doneStroke} />
          ))}
          <text x={CX.C + 56} y={BUS_Y - 8} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px]")}>network</text>
          <SvgChip x={112} y={BUS_Y} width={56} text={chipText} label={cut ? "Heal the link between A and the others" : net.phase === "ok" ? "Cut the link between A and the others" : "The link is healed"} pressed={cut} onPress={cutOrHeal} />

          {/* Each node writes to the Database; the learner taps a leader to write. */}
          <path d={`M${CX.A} 242 L172 288`} fill="none" strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <path d={`M${CX.B} 242 L210 286`} fill="none" strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />

          {judged.map((w) => {
            const p = (now - w.at) / TRAVEL_S;
            const back = (now - w.arriveAt) / TRAVEL_S;
            if (p >= 0 && p < 1) {
              const pt = route(w.node, p);
              return <Dot key={`go-${w.label}`} x={pt.x} y={pt.y} label={w.label} tone={WRITER_TONE[w.node]} />;
            }
            if (!w.accepted && back >= 0 && back < 1) {
              const pt = route(w.node, 1 - back);
              return <Dot key={`back-${w.label}`} x={pt.x} y={pt.y} label={w.label} tone="bad" />;
            }
            return null;
          })}

          <SvgButton x={CX.A - 56} y={NODE_Y - 30} width={112} height={60} label={`Write from node A, ${statusA.text}, epoch ${r.A.epoch}`} onPress={() => write("A")}>
            <SvgNode x={CX.A} y={NODE_Y} label="Node A" kind="server" status={statusA.text} statusTone={statusA.tone} mark={r.A.stale ? "bad" : undefined} />
          </SvgButton>
          {r.B.role === "leader" ? (
            <SvgButton x={CX.B - 56} y={NODE_Y - 30} width={112} height={60} label="Write from node B, the new leader, epoch 2" onPress={() => write("B")}>
              <SvgNode x={CX.B} y={NODE_Y} label="Node B" kind="server" status={statusOf("B").text} statusTone={statusOf("B").tone} mark="good" />
            </SvgButton>
          ) : (
            <SvgNode x={CX.B} y={NODE_Y} label="Node B" kind="server" status={statusOf("B").text} statusTone={statusOf("B").tone} />
          )}
          <SvgNode x={CX.C} y={NODE_Y} label="Node C" kind="server" status={statusOf("C").text} statusTone={statusOf("C").tone} />

          {/* Epoch badges, and a countdown ring on B and C while they wait out the timeout. */}
          {(["A", "B", "C"] as const).map((id) => {
            const tone = badgeTone(id);
            const epoch = r[id].epoch;
            return (
              <g key={`badge-${id}`}>
                <rect x={CX[id] - 31} y={BADGE_Y - 10} width={62} height={20} rx={10} strokeWidth={1.5} className={cn(SHAPE_TRANSITION, tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn(NEUTRAL.surface, NEUTRAL.line))} />
                <text x={CX[id]} y={BADGE_Y + 4.2} textAnchor="middle" className={cn("text-[11.5px] font-semibold tabular-nums", tone ? TONES[tone].text : NEUTRAL.text)}>epoch {epoch}</text>
              </g>
            );
          })}
          {left !== null
            ? (["B", "C"] as const).map((id) => (
                <g key={`ring-${id}`}>
                  <circle cx={CX[id] - 47} cy={BADGE_Y} r={9} fill="none" strokeWidth={3} className="stroke-muted" />
                  <circle cx={CX[id] - 47} cy={BADGE_Y} r={9} fill="none" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${r1(left * CIRC)} ${r1(CIRC)}`} transform={`rotate(-90 ${CX[id] - 47} ${BADGE_Y})`} className={TONES.warn.stroke} />
                </g>
              ))
            : null}

          {/* The log each leader keeps. */}
          {(["A", "B"] as const).map((id) =>
            judged
              .filter((w) => w.node === id)
              .map((w, i) => {
                const refused = !w.accepted && now >= w.arriveAt;
                return <LogChip key={w.label} x={CX[id] - 51 + i * 34} y={LOG_Y} label={w.label} tone={WRITER_TONE[id]} state={refused ? "refused" : lost.has(w.label) ? "lost" : "ok"} />;
              })
          )}

          <SvgNode x={DB.x} y={DB.y} label="Database" kind="database" status={`${arrived.length} ${arrived.length === 1 ? "write" : "writes"}`} />

          {lastRefused ? (
            <g>
              <rect x={10} y={310} width={72} height={24} rx={12} className={cn(TONES.bad.softFill, TONES.bad.stroke)} strokeWidth={1.5} />
              <text x={46} y={326} textAnchor="middle" className={cn(TONES.bad.text, "text-[12px] font-semibold")}>refused</text>
              <text x={46} y={352} textAnchor="middle" className={cn(TONES.bad.text, "text-[12px] font-semibold tabular-nums")}>{lastRefused.reason}</text>
            </g>
          ) : null}

          {/* What the Database holds, in the order it took the writes. */}
          <text x={12} y={396} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Stored</text>
          {arrived.map((w, i) => (
            <LogChip key={`stored-${w.label}`} x={70 + i * 34} y={392} label={w.label} tone={WRITER_TONE[w.node]} state={lost.has(w.label) ? "lost" : "ok"} />
          ))}
          {lost.size > 0 ? <text x={12} y={422} className={cn(TONES.bad.text, "text-[12px] font-semibold")}>dashed red: thrown away when the link heals</text> : null}
        </svg>
      </div>
    </BeatFrame>
  );
}
