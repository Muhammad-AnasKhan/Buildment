"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SvgAction } from "../primitives/svg-action";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useRaftRun, type SettleSpec, type Speed } from "../primitives/use-raft-run";
import {
  MAX_LOG,
  NAMES,
  cutHalf,
  heal,
  initCluster,
  killNext,
  leaderNow,
  liveLeaders,
  logText,
  logVerdict,
  nextVictim,
  sendEntry,
  type Entry,
  type LogContext,
  type Server,
} from "../models/raft-cluster";

const W = 420;
const H = 504;
const ROW_Y = [104, 168, 232, 296, 360];
const CARD_X = 64;
const BUS_X = 130;
const BX = 142;
const PITCH = 33;
const BOX_W = 29;
const BOX_H = 42;
const HEAD_Y = 62;
const LEGEND_Y = 408;
const ROW_A_Y = 436;
const ROW_B_Y = 482;

const init = () => initCluster(0);
const lerp = (a: number, b: number, t: number) => Math.round((a + (b - a) * t) * 10) / 10;
const termTone = (term: number): Tone => (term <= 1 ? "accent" : term === 2 ? "good" : "warn");

const SETTLE: Record<string, SettleSpec> = {
  sent: { done: (c) => { const l = leaderNow(c); return !l || l.commit >= l.log.length || c.servers.filter((s) => s.up).length < 3; }, cap: 200, extra: 60 },
  cut: { done: (c) => { const s = c.servers[2]; return s.role === "leader" && s.commit >= s.log.length; }, cap: 800, extra: 60 },
  healed: { done: (c) => c.matchSince !== null, cap: 600, extra: 0 },
  now: { done: () => true, cap: 0, extra: 0 },
};

function statusOf(s: Server): { text: string; tone?: Tone } {
  if (!s.up) return { text: "down", tone: "bad" };
  if (s.role === "leader") return { text: `leader t${s.term}`, tone: "good" };
  return { text: `follower t${s.term}` };
}

function LogBox({ entry, slot, committed, y }: { entry: Entry; slot: number; committed: boolean; y: number }) {
  const x = BX + slot * PITCH;
  const tone = termTone(entry.term);
  const t = TONES[tone];
  return (
    <g>
      <rect
        x={x}
        y={y - BOX_H / 2}
        width={BOX_W}
        height={BOX_H}
        rx={7}
        strokeWidth={2}
        strokeDasharray={committed ? undefined : "4 3"}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", committed ? t.softFill : "fill-card", t.stroke)}
      />
      {entry.cmd ? (
        <text x={x + BOX_W / 2} y={y - 1} textAnchor="middle" className={cn(t.text, "text-[14px] font-bold")}>{entry.cmd}</text>
      ) : (
        <circle cx={x + BOX_W / 2} cy={y - 6} r={3.5} className={t.solidFill} />
      )}
      <text x={x + BOX_W / 2} y={y + 14} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`t${entry.term}`}</text>
    </g>
  );
}

/** 12.6 beat 5: send entries, cut the leader off with one friend, heal, and watch the logs repair. */
export function RaftLogPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState<Speed>(1);
  const [choosing, setChoosing] = useState(false);
  const { c, ctx, act, reset, reduced } = useRaftRun<LogContext>(box, init, "start", speed);
  const titleId = useId();
  const descId = useId();

  const verdict = logVerdict(c, ctx);
  const leaders = liveLeaders(c);
  const top = leaderNow(c);
  const anyCut = c.servers.some((s) => s.group !== 0);
  const logs = c.servers.map((s) => logText(c, s.id));
  const live = `${verdict.text}. ${logs.join(". ")}.`;
  const canSend = !!top && top.log.length < MAX_LOG;

  const sendTo = (id: number) => {
    setChoosing(false);
    act((x) => sendEntry(x, id), "send", SETTLE.sent);
  };
  const pressSend = () => {
    if (leaders.length >= 2) setChoosing(true);
    else if (top) sendTo(top.id);
  };
  const doReset = () => {
    setChoosing(false);
    reset();
  };

  type Btn = { key: string; text: string; label: string; disabled: boolean; tone?: "bad"; press: () => void };
  const rowA: Btn[] =
    choosing && leaders.length >= 2
      ? [
          ...leaders.map((l) => ({ key: `to${l.id}`, text: `Send to ${NAMES[l.id]} (term ${l.term})`, label: `Send the entry to ${NAMES[l.id]}, leader of term ${l.term}`, disabled: l.log.length >= MAX_LOG, press: () => sendTo(l.id) })),
          { key: "cancel", text: "Cancel", label: "Cancel", disabled: false, press: () => setChoosing(false) },
        ]
      : [
          { key: "send", text: "Send an entry", label: "Send an entry to the leader", disabled: !canSend, press: pressSend },
          { key: "cut", text: "Cut S1 and S2 off", label: "Cut S1 and S2 off from the other three", disabled: anyCut, tone: "bad", press: () => act(cutHalf, "cut", SETTLE.cut) },
          { key: "heal", text: "Heal", label: "Heal the cut", disabled: !anyCut, press: () => act(heal, "heal", SETTLE.healed) },
        ];
  const rowB: Btn[] = [
    { key: "kill", text: "Kill a follower", label: "Kill a follower", disabled: !nextVictim(c), tone: "bad", press: () => act(killNext, "kill", SETTLE.now) },
    { key: "reset", text: "Reset", label: "Reset the cluster", disabled: false, press: doReset },
  ];

  const sent = c.letters;
  const hint = (() => {
    if (leaders.length >= 2) return "Two servers think they lead. Send to S3, then press Heal and compare the logs.";
    if (ctx === "heal") return "S1 and S2 dropped their dashed entries and copied the new leader's. Now try Kill a follower.";
    if (ctx === "kill") return "Send an entry with fewer servers up. It needs 3 of 5 to turn solid.";
    if (anyCut) return "Send an entry to S1 and watch it stay dashed: only 2 of 5 hold it.";
    if (sent < 3) return "Press Send an entry three times. A box turns solid when 3 of 5 servers hold it.";
    return "Now press Cut S1 and S2 off, then send an entry to S1.";
  })();

  const description = `Five Raft servers and their logs. ${logs.join(". ")}. ${verdict.text}.`;
  const recent = c.trace.slice(-6);
  const busY = (i: number) => ROW_Y[i];

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

          {Array.from({ length: MAX_LOG }, (_, k) => (
            <text key={k} x={BX + k * PITCH + BOX_W / 2} y={HEAD_Y} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{k + 1}</text>
          ))}

          {/* The network between the servers: a cut is drawn broken and red. */}
          {[0, 1, 2, 3].map((i) => {
            const cut = c.servers[i].group !== c.servers[i + 1].group;
            return <LinkLine key={i} x1={BUS_X} y1={busY(i)} x2={BUS_X} y2={busY(i + 1)} className={cut ? cn(TONES.bad.stroke, "[stroke-dasharray:2_8]") : "stroke-muted-foreground/30"} strokeWidth={cut ? 2.5 : 2} />;
          })}
          {!reduced
            ? c.msgs.map((m) => {
                if (m.kind === "rv" || m.kind === "rvr" || (m.kind === "aer" && m.ok)) return null;
                const t = Math.max(0, Math.min(1, (c.now - m.sentAt) / (m.arriveAt - m.sentAt)));
                const beat = m.kind === "ae" && (m.entries ?? []).length === 0;
                const cls = m.kind === "aer" ? TONES.bad.solidFill : beat ? NEUTRAL.faintFill : TONES.accent.solidFill;
                return <circle key={m.id} cx={BUS_X + ((m.id % 3) - 1) * 5} cy={lerp(busY(m.from), busY(m.to), t)} r={beat ? 3 : 4.5} className={cn(cls, "stroke-card")} strokeWidth={1.5} />;
              })
            : null}

          {c.servers.map((s) => {
            const y = ROW_Y[s.id];
            const st = statusOf(s);
            const mark: Tone | undefined = !s.up ? undefined : s.group !== 0 ? "bad" : s.role === "leader" ? "good" : undefined;
            return (
              <g key={s.id} role="img" aria-label={logs[s.id]}>
                <SvgNode x={CARD_X} y={y} label={NAMES[s.id]} kind="server" status={st.text} statusTone={st.tone} mark={mark} />
                {!s.up ? (
                  <g aria-hidden>
                    <line x1={CARD_X + 31} x2={CARD_X + 47} y1={y - 22} y2={y - 6} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />
                    <line x1={CARD_X + 47} x2={CARD_X + 31} y1={y - 22} y2={y - 6} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />
                  </g>
                ) : null}
                {Array.from({ length: MAX_LOG }, (_, k) => (
                  <rect key={`slot-${k}`} x={BX + k * PITCH} y={y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={7} className="fill-muted-foreground/10" aria-hidden />
                ))}
                {s.up
                  ? s.log.map((e, k) => <LogBox key={`${k}-${e.term}-${e.cmd}`} entry={e} slot={k} committed={k + 1 <= s.commit} y={y} />)
                  : null}
                {s.up ? <line x1={BX + s.commit * PITCH - 2} x2={BX + s.commit * PITCH - 2} y1={y - 25} y2={y + 25} strokeWidth={3.5} strokeLinecap="round" className={cn(TONES.good.stroke, "transition-all duration-200 motion-reduce:transition-none")} aria-hidden /> : null}
              </g>
            );
          })}

          <text x={W / 2} y={LEGEND_Y} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>Solid box: committed. Dashed: stored only. Bar: commit point.</text>

          {[rowA, rowB].map((row, r) => {
            const widths = row.map((b) => chipWidth(b.text));
            const total = widths.reduce((a, b) => a + b, 0) + 8 * (row.length - 1);
            const xs = rowPositions(widths, (W - total) / 2, 8);
            return (
              <g key={r}>
                {row.map((b, i) => (
                  <SvgAction key={b.key} x={xs[i]} y={r === 0 ? ROW_A_Y : ROW_B_Y} text={b.text} width={widths[i]} label={b.label} disabled={b.disabled} tone={b.tone} onPress={b.press} />
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
