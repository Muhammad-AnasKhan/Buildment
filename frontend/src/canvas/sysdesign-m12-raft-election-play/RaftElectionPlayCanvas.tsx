"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SvgAction } from "../primitives/svg-action";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useRaftRun, type SettleSpec, type Speed } from "../primitives/use-raft-run";
import {
  NAMES,
  cutS4,
  electionVerdict,
  forceTie,
  initCluster,
  killLeader,
  killNext,
  leaderNow,
  liveLeaders,
  nextVictim,
  reconnect,
  stateLines,
  timerLeft,
  type Cluster,
  type ElectionContext,
  type Server,
} from "../models/raft-cluster";

const W = 420;
const H = 392;
const POS = [
  { x: 64, y: 102 },
  { x: 210, y: 102 },
  { x: 356, y: 102 },
  { x: 137, y: 198 },
  { x: 283, y: 198 },
];
const CARD_HALF_H = 30;
const STRIP_Y = 268;
const ROW1_Y = 316;
const ROW2_Y = 362;

const init = () => initCluster(3);
const lerp = (a: number, b: number, t: number) => Math.round((a + (b - a) * t) * 10) / 10;

const hasLeader = (c: Cluster) => liveLeaders(c).length > 0;
const SETTLE: Record<string, SettleSpec> = {
  elected: { done: (c) => hasLeader(c), cap: 1500, extra: 80 },
  cut: { done: (c) => c.servers[3].term >= 5, cap: 1200, extra: 0 },
  back: { done: (c) => c.stepDown?.by === 3 && hasLeader(c), cap: 800, extra: 80 },
  now: { done: () => true, cap: 0, extra: 0 },
};

function statusOf(s: Server): { text: string; tone?: Tone } {
  if (!s.up) return { text: "down", tone: "bad" };
  if (s.role === "leader") return { text: `leader t${s.term}`, tone: "good" };
  if (s.role === "candidate") return { text: `candidate t${s.term}`, tone: "warn" };
  return { text: `follower t${s.term}` };
}

/** 12.5 beat 6: kill the leader, force a tie, cut S4 off and bring it back; watch terms, votes and the gap with no leader. */
export function RaftElectionPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState<Speed>(1);
  const { c, ctx, act, reset, reduced } = useRaftRun<ElectionContext>(box, init, "start", speed);
  const titleId = useId();
  const descId = useId();

  const verdict = electionVerdict(c, ctx);
  const leader = leaderNow(c);
  const anyCut = c.servers.some((s) => s.group !== 0);
  const lines = stateLines(c);
  const live = `${verdict.text}. ${lines.join(", ")}.`;

  // The strip under the cards: the gap with no leader, counting up, then the last gap.
  const gap = c.leaderlessSince !== null ? Math.floor(c.now - c.leaderlessSince) : null;
  const strip: { text: string; tone: Tone } =
    gap !== null
      ? { text: `no leader for ${gap} ms`, tone: "bad" }
      : c.lastGap !== null
        ? { text: `last gap: ${Math.round(c.lastGap)} ms`, tone: "good" }
        : { text: `${NAMES[leader?.id ?? 0]} leads, beating every 50 ms`, tone: "good" };

  const buttons: { key: string; text: string; label: string; disabled: boolean; tone?: "bad"; press: () => void }[][] = [
    [
      { key: "kill", text: "Kill the leader", label: "Kill the leader", disabled: !leader, tone: "bad", press: () => act(killLeader, "kill", SETTLE.elected) },
      { key: "tie", text: "Force a tie", label: "Force a tie, then kill the leader", disabled: !leader, tone: "bad", press: () => act(forceTie, "tie", SETTLE.elected) },
      { key: "cut", text: "Cut off S4", label: "Cut off S4", disabled: !c.servers[3].up || c.servers[3].group !== 0, press: () => act(cutS4, "cut", SETTLE.cut) },
    ],
    [
      { key: "back", text: "Reconnect S4", label: "Reconnect S4", disabled: !anyCut, press: () => act(reconnect, "reconnect", SETTLE.back) },
      { key: "other", text: "Kill another server", label: "Kill another server", disabled: !nextVictim(c), tone: "bad", press: () => act(killNext, "other", SETTLE.now) },
      { key: "reset", text: "Reset", label: "Reset the cluster", disabled: false, press: reset },
    ],
  ];

  const hint =
    ctx === "start"
      ? "Press Kill the leader, then count the milliseconds with no leader."
      : ctx === "kill"
        ? "Reset and try Force a tie, or cut S4 off and watch its term climb alone."
        : ctx === "tie"
          ? "Two timers fired together. A tie costs one more timer."
          : ctx === "cut"
            ? "S4 keeps raising its term. Press Reconnect S4 to see what that does."
            : ctx === "reconnect"
              ? "The old term reached the leader, which stepped down. S4's log is behind, so it cannot win."
              : "Three servers down is no majority: nobody can win.";

  const description = `Five Raft servers. ${lines.join(", ")}. ${verdict.text}.`;
  const recent = c.trace.slice(-6);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hint}
      controls={
        <>
          <BeatButton pressed={speed === 1} onClick={() => setSpeed(1)}>1x</BeatButton>
          <BeatButton pressed={speed === 0.5} onClick={() => setSpeed(0.5)}>0.5x</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* Links: a cut link is drawn broken and red. */}
          {c.servers.flatMap((a) =>
            c.servers
              .filter((b) => b.id > a.id)
              .map((b) => {
                const cut = a.group !== b.group;
                return (
                  <LinkLine
                    key={`${a.id}-${b.id}`}
                    x1={POS[a.id].x}
                    y1={POS[a.id].y}
                    x2={POS[b.id].x}
                    y2={POS[b.id].y}
                    className={cut ? cn(TONES.bad.stroke, "[stroke-dasharray:2_8]") : "stroke-muted-foreground/25"}
                    strokeWidth={cut ? 2.25 : 1.5}
                  />
                );
              })
          )}

          {/* Messages on their way. They slide under the cards at both ends. */}
          {!reduced
            ? c.msgs.map((m) => {
                if (m.kind === "aer" && m.ok) return null;
                const t = Math.max(0, Math.min(1, (c.now - m.sentAt) / (m.arriveAt - m.sentAt)));
                const a = POS[m.from];
                const b = POS[m.to];
                const beat = m.kind === "ae" && (m.entries ?? []).length === 0;
                const cls =
                  m.kind === "rv" ? TONES.accent.solidFill : m.kind === "rvr" ? (m.granted ? TONES.good.solidFill : TONES.bad.solidFill) : m.kind === "aer" ? TONES.bad.solidFill : beat ? NEUTRAL.faintFill : TONES.accent.solidFill;
                return <circle key={m.id} cx={lerp(a.x, b.x, t)} cy={lerp(a.y, b.y, t)} r={m.kind === "rv" || m.kind === "rvr" ? 6 : beat ? 3.5 : 4.5} className={cn(cls, "stroke-card")} strokeWidth={1.5} />;
              })
            : null}

          {c.servers.map((s) => {
            const p = POS[s.id];
            const st = statusOf(s);
            const mark: Tone | undefined = !s.up ? undefined : s.group !== 0 ? "bad" : s.role === "leader" ? "good" : s.role === "candidate" ? "warn" : undefined;
            const left = timerLeft(c, s);
            const showVotes = s.up && (s.role === "candidate" || (s.role === "leader" && s.votes.length > 1));
            return (
              <g key={s.id} role="img" aria-label={lines[s.id]}>
                <SvgNode x={p.x} y={p.y} label={NAMES[s.id]} kind="server" status={st.text} statusTone={st.tone} mark={mark} />
                {s.up && s.role !== "leader" ? (
                  <g aria-hidden>
                    <circle cx={p.x + 39} cy={p.y - 14} r={9} fill="none" strokeWidth={3} className="stroke-muted" />
                    <circle
                      cx={p.x + 39}
                      cy={p.y - 14}
                      r={9}
                      fill="none"
                      strokeWidth={3}
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray={`${Math.round(left * 100)} 100`}
                      transform={`rotate(-90 ${p.x + 39} ${p.y - 14})`}
                      className={s.role === "candidate" ? TONES.warn.stroke : TONES.accent.stroke}
                    />
                  </g>
                ) : null}
                {s.up && s.role === "leader" ? <circle cx={p.x + 39} cy={p.y - 14} r={5} className={TONES.good.solidFill} aria-hidden /> : null}
                {!s.up ? (
                  <g aria-hidden>
                    <line x1={p.x + 31} x2={p.x + 47} y1={p.y - 22} y2={p.y - 6} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />
                    <line x1={p.x + 47} x2={p.x + 31} y1={p.y - 22} y2={p.y - 6} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />
                  </g>
                ) : null}
                {showVotes ? (
                  <g aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <circle key={i} cx={p.x - 28 + i * 14} cy={p.y + CARD_HALF_H + 12} r={4.5} strokeWidth={1.5} className={s.votes.length > i ? cn(TONES.good.solidFill, "stroke-card") : cn("fill-card", NEUTRAL.faintStroke)} />
                    ))}
                  </g>
                ) : null}
              </g>
            );
          })}

          <g>
            <rect x={W / 2 - 128} y={STRIP_Y - 16} width={256} height={32} rx={16} className={cn(NEUTRAL.surface, TONES[strip.tone].stroke)} strokeWidth={2} />
            <text x={W / 2} y={STRIP_Y + 4.5} textAnchor="middle" className={cn(TONES[strip.tone].text, "text-[13.5px] font-bold tabular-nums")}>{strip.text}</text>
          </g>

          {buttons.map((row, r) => {
            const widths = row.map((b) => chipWidth(b.text));
            const total = widths.reduce((a, b) => a + b, 0) + 8 * (row.length - 1);
            const xs = rowPositions(widths, (W - total) / 2, 8);
            return (
              <g key={r}>
                {row.map((b, i) => (
                  <SvgAction key={b.key} x={xs[i]} y={r === 0 ? ROW1_Y : ROW2_Y} text={b.text} width={widths[i]} label={b.label} disabled={b.disabled} tone={b.tone} onPress={b.press} />
                ))}
              </g>
            );
          })}
        </svg>
        <p className="sr-only" aria-live="polite">{live}</p>
        {reduced ? (
          <ul className="mt-1 space-y-0.5 px-3 pb-2 text-sm text-foreground">
            {recent.map((t, i) => (
              <li key={`${t.t}-${i}`}>{t.text}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </BeatFrame>
  );
}
