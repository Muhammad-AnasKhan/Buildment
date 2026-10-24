"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgChip } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import {
  autoMiss,
  canConfirm,
  confirm,
  header,
  INITIAL,
  N,
  NEW_VALUE,
  readResult,
  tap,
  value,
  verdict,
  version,
  writeStalled,
  type State,
} from "./model";

const W = 420;
const H = 424;
const POS = [
  { x: 70, y: 244 },
  { x: 210, y: 244 },
  { x: 350, y: 244 },
  { x: 140, y: 324 },
  { x: 280, y: 324 },
];
const CLIENT = { x: 210, y: 128 };

/** Beat 2 of 8.7: write to some of five nodes, read from some, see when a read can miss. */
export function QuorumNodesCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [state, setState] = useState<State>(INITIAL);
  const [downMode, setDownMode] = useState(false);
  const v = verdict(state);
  const h = header(state);
  const result = readResult(state);
  const stalled = writeStalled(state);

  const clientStatus: { text: string; tone: Tone | undefined } =
    state.phase === "write"
      ? { text: `writing x = ${NEW_VALUE}`, tone: "accent" }
      : result.kind === "none"
        ? { text: "reading", tone: undefined }
        : result.kind === "stalled"
          ? { text: "no answer", tone: "bad" }
          : { text: `read x = ${result.value}`, tone: result.kind === "found" ? "good" : "warn" };

  const press = (i: number) => setState((s) => tap(s, i, downMode ? "down" : "pick"));
  const reset = () => {
    setState(INITIAL);
    setDownMode(false);
  };

  const summary = `${h.line}. ${v.text}. ${Array.from({ length: N }, (_, i) => `Node ${i + 1} holds x = ${value(state, i)}${state.down.includes(i) ? " and is down" : ""}`).join(". ")}.`;

  const confirmText = state.phase === "read" ? "Write confirmed" : stalled ? "Cannot confirm" : "Confirm write";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint="Pick write nodes, tap Confirm, then pick read nodes."
      controls={
        <>
          <BeatButton onClick={() => setState((s) => autoMiss(s))}>Auto-miss</BeatButton>
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
        <DotGrid width={W} height={H} />
        <VerdictBanner width={W} tone={v.tone} text={v.text} />

        <text x={W / 2} y={62} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13.5px] font-semibold tabular-nums")}>{h.line}</text>
        {h.verdict ? (
          <text x={W / 2} y={82} textAnchor="middle" className={cn(TONES[h.verdict.tone].text, "text-[12.5px] font-semibold")}>{h.verdict.text}</text>
        ) : null}

        <line x1={CLIENT.x} x2={CLIENT.x} y1={CLIENT.y + 30} y2={176} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
        <SvgNode x={CLIENT.x} y={CLIENT.y} label="Client" kind="user" status={clientStatus.text} statusTone={clientStatus.tone} />

        {/* The group of five copies. */}
        <rect x={3} y={176} width={W - 6} height={192} rx={18} strokeWidth={1.5} className={cn("fill-muted/40", NEUTRAL.line)} />
        <text x={16} y={196} className={cn(NEUTRAL.mutedText, "text-[12px]")}>5 copies of one key (N = {N})</text>

        {POS.map((p, i) => {
          const isDown = state.down.includes(i);
          const inWrite = state.writeSet.includes(i);
          const inRead = state.phase === "read" && state.readSet.includes(i);
          const v2 = version(state, i) === 2;
          const status = isDown ? "down" : `x = ${value(state, i)} (v${version(state, i)})`;
          const parts = [`Node ${i + 1}`, isDown ? "down" : `x = ${value(state, i)}, version ${version(state, i)}`, inWrite ? "in the write set" : "", inRead ? "in the read set" : ""].filter(Boolean);
          return (
            <g key={i}>
              {inWrite ? <rect x={p.x - 61} y={p.y - 35} width={122} height={70} rx={19} strokeWidth={2.5} strokeDasharray={isDown ? "5 4" : undefined} className={cn("fill-none", SHAPE_TRANSITION, isDown ? TONES.bad.stroke : TONES.accent.stroke)} /> : null}
              {inRead ? <rect x={p.x - 65} y={p.y - 39} width={130} height={78} rx={23} strokeWidth={2.5} strokeDasharray={isDown ? "5 4" : undefined} className={cn("fill-none", SHAPE_TRANSITION, isDown ? TONES.bad.stroke : TONES.warn.stroke)} /> : null}
              <g opacity={isDown ? 0.5 : 1}>
                <SvgButton x={p.x - 56} y={p.y - 30} width={112} height={60} label={`${parts.join(", ")}. ${downMode ? "Tap to switch it off or on." : "Tap to pick it."}`} onPress={() => press(i)}>
                  <SvgNode x={p.x} y={p.y} label={`Node ${i + 1}`} kind="database" status={status} statusTone={isDown ? "bad" : v2 ? "accent" : undefined} />
                </SvgButton>
              </g>
            </g>
          );
        })}

        {/* Buttons that belong to the picture. */}
        <SvgChip x={14} y={396} width={128} text={confirmText} label={state.phase === "read" ? "The write is confirmed" : stalled ? "A node in the write set is down, so the write cannot be confirmed" : "Confirm the write on the picked nodes"} pressed={state.phase === "read"} onPress={() => setState((s) => (canConfirm(s) ? confirm(s) : s))} />
        <SvgChip x={152} y={396} width={150} text="Switch off nodes" label="Switch off nodes: tap a node to turn it off or on" pressed={downMode} onPress={() => setDownMode((m) => !m)} />
      </svg>
    </BeatFrame>
  );
}
