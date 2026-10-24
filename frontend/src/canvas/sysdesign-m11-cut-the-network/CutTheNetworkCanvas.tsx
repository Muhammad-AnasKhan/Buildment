"use client";

import { useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { BeatChoice } from "../primitives/beat-choice";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { textWidth } from "../models/history-layout";
import {
  MEND_DONE_S,
  MEND_START_S,
  SCRIPT,
  TRIP_S,
  accepted,
  buttonLabel,
  clashAt,
  copiesAt,
  nextPhase,
  rowsAt,
  verdictFor,
  type Mode,
  type Phase,
} from "../models/cut-network";

const W = 420;
const H = 424;
const CLIENTS = { ada: { x: 97, y: 96 }, bao: { x: 283, y: 96 }, cam: { x: 371, y: 96 } } as const;
const CARDS = { w1: { x: 97, y: 168 }, w2: { x: 97, y: 240 }, e: { x: 323, y: 204 } } as const;
const LANDING = { ada: { x: 97, y: 138 }, bao: { x: 300, y: 174 }, cam: { x: 346, y: 174 } } as const;
const CABLE = { a: { x: 153, y: 240 }, bx: 210, c: { x: 267, y: 204 } };
const ROW_Y = [318, 344, 370, 396] as const;
const r1 = (v: number) => Math.round(v * 10) / 10;
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

/** A small label travelling between two points. */
function Chip({ x, y, text, tone }: { x: number; y: number; text: string; tone: Tone }) {
  const w = Math.ceil(textWidth(text, 11.5, true) + 16);
  return (
    <g>
      <rect x={r1(x - w / 2)} y={r1(y - 10)} width={w} height={20} rx={10} className="fill-card" />
      <rect x={r1(x - w / 2)} y={r1(y - 10)} width={w} height={20} rx={10} strokeWidth={1.5} className={cn(TONES[tone].softFill, TONES[tone].stroke)} />
      <text x={r1(x)} y={r1(y + 4.2)} textAnchor="middle" className={cn(TONES[tone].text, "text-[11.5px] font-semibold")}>{text}</text>
    </g>
  );
}

/** 11.7 beat 1: cut the cable between two regions, then choose to refuse or to answer. */
export function CutTheNetworkCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [phase, setPhase] = useState<Phase>("up");
  const [mode, setMode] = useState<Mode>("refuse");
  const titleId = useId();
  const descId = useId();

  const s = clock.seconds;
  const copies = copiesAt(phase, mode, s);
  const clash = clashAt(phase, mode, s);
  const rows = rowsAt(phase, mode, s);
  const verdict = verdictFor(phase, mode);
  const cut = phase === "cut";
  const diverged = phase !== "up" && copies.e !== copies.w1 && (mode === "answer" || (phase === "cut" && copies.w1 === 1));

  const press = () => {
    setPhase(nextPhase(phase));
    clock.restart();
  };
  const choose = (m: Mode) => {
    setMode(m);
    if (phase !== "up") clock.restart();
  };

  // Request chips in flight (cut), and the swap of values after mending.
  const flights: { key: string; x: number; y: number; text: string; tone: Tone }[] = [];
  if (cut) {
    for (const step of SCRIPT) {
      const from = CLIENTS[step.id];
      const to = LANDING[step.id];
      const label = step.id === "ada" ? "x = 1" : step.id === "bao" ? "x = 2" : "read x";
      const t1 = (s - step.at) / TRIP_S;
      const t2 = (s - step.at - TRIP_S) / TRIP_S;
      if (t1 >= 0 && t1 < 1) flights.push({ key: step.id, x: lerp(from.x, to.x, t1), y: lerp(from.y + 14, to.y, t1), text: label, tone: "accent" });
      if (t2 >= 0 && t2 < 1 && step.id !== "ada") {
        const ok = accepted(mode, step.id);
        if (!ok) flights.push({ key: `${step.id}-back`, x: lerp(to.x, from.x, t2), y: lerp(to.y, from.y + 14, t2), text: "try again later", tone: "bad" });
        else if (step.id === "cam") flights.push({ key: "cam-back", x: lerp(to.x, from.x, t2), y: lerp(to.y, from.y + 14, t2), text: "x = 2", tone: "good" });
      }
    }
  }
  if (phase === "mended" && s >= MEND_START_S && s < MEND_DONE_S) {
    const t = (s - MEND_START_S) / (MEND_DONE_S - MEND_START_S);
    flights.push({ key: "swap-w", x: lerp(CABLE.a.x + 28, CABLE.c.x - 28, t), y: lerp(CABLE.a.y - 8, CABLE.c.y + 8, t), text: "x = 1", tone: "accent" });
    if (mode === "answer") flights.push({ key: "swap-e", x: lerp(CABLE.c.x - 28, CABLE.a.x + 28, t), y: lerp(CABLE.c.y + 8, CABLE.a.y - 8, t), text: "x = 2", tone: "warn" });
  }

  const cardStatus = (v: number, id: "w1" | "w2" | "e") => {
    const tone: Tone | undefined = clash ? "bad" : diverged && (id === "e" || mode === "answer") ? "warn" : undefined;
    return { status: `x = ${v}`, tone };
  };
  const description = `Three copies of x: West 1 and West 2 in the West region and East in the East region. The cable between the regions is ${cut ? "cut" : phase === "mended" ? "mended" : "up"}. Mode: ${mode === "refuse" ? "refuse" : "answer"}. ${rows
    .filter((r) => r.text)
    .map((r) => r.text)
    .join(". ")}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatChoice label="What East does while cut off" options={[{ id: "refuse", label: "Refuse" }, { id: "answer", label: "Answer" }]} value={mode} onChange={choose} />
          <BeatButton onClick={press}>{buttonLabel(phase)}</BeatButton>
        </>
      }
      hint="Cut the cable, then switch the mode."
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The two regions. */}
          <rect x={6} y={48} width={182} height={248} rx={16} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-none", NEUTRAL.faintStroke)} />
          <rect x={232} y={48} width={182} height={248} rx={16} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-none", NEUTRAL.faintStroke)} />
          <text x={16} y={66} className={cn(NEUTRAL.mutedText, "text-[12px] font-bold")}>West region</text>
          <text x={242} y={66} className={cn(NEUTRAL.mutedText, "text-[12px] font-bold")}>East region</text>

          {/* The cable: whole, or broken with a cross in the gap. */}
          <g aria-hidden className={cut ? TONES.bad.stroke : TONES.good.stroke}>
            <line x1={97} x2={97} y1={198} y2={210} strokeWidth={3} strokeLinecap="round" className={NEUTRAL.doneStroke} />
            <line x1={CABLE.a.x} x2={CABLE.bx} y1={CABLE.a.y} y2={CABLE.a.y} strokeWidth={3} strokeLinecap="round" />
            <line x1={CABLE.c.x} x2={CABLE.bx} y1={CABLE.c.y} y2={CABLE.c.y} strokeWidth={3} strokeLinecap="round" />
            {cut ? (
              <>
                <line x1={CABLE.bx} x2={CABLE.bx} y1={CABLE.a.y} y2={232} strokeWidth={3} strokeLinecap="round" />
                <line x1={CABLE.bx} x2={CABLE.bx} y1={212} y2={CABLE.c.y} strokeWidth={3} strokeLinecap="round" />
              </>
            ) : (
              <line x1={CABLE.bx} x2={CABLE.bx} y1={CABLE.a.y} y2={CABLE.c.y} strokeWidth={3} strokeLinecap="round" />
            )}
          </g>
          {cut ? (
            <g>
              <circle cx={CABLE.bx} cy={222} r={9} strokeWidth={2} className={cn(TONES.bad.solidFill, "stroke-card")} />
              <X x={CABLE.bx - 5} y={217} width={10} height={10} strokeWidth={3.5} className="fill-none stroke-white dark:stroke-red-950" aria-hidden />
            </g>
          ) : null}

          {/* Clients. */}
          {(["ada", "bao", "cam"] as const).map((id) => (
            <g key={id}>
              <rect x={CLIENTS[id].x - 28} y={CLIENTS[id].y - 12} width={56} height={24} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={CLIENTS[id].x} y={CLIENTS[id].y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{SCRIPT.find((x) => x.id === id)?.client}</text>
            </g>
          ))}

          {/* The three copies. */}
          {(["w1", "w2", "e"] as const).map((id) => {
            const st = cardStatus(copies[id], id);
            return <SvgNode key={id} x={CARDS[id].x} y={CARDS[id].y} label={id === "w1" ? "West 1" : id === "w2" ? "West 2" : "East"} kind="database" status={st.status} statusTone={st.tone} />;
          })}

          {flights.map((f) => (
            <Chip key={f.key} x={f.x} y={f.y} text={f.text} tone={f.tone} />
          ))}

          {/* What each request ended with. */}
          {rows.map((row, i) => {
            const tone: Tone | undefined = row.state === "ok" ? "good" : row.state === "refused" ? "bad" : row.state === "clash" ? "bad" : undefined;
            const Icon = row.state === "ok" ? Check : X;
            const shown = row.text !== "";
            return (
              <g key={row.id} opacity={shown ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
                <rect x={8} y={ROW_Y[i] - 11} width={404} height={22} rx={11} className="fill-muted/40" />
                {tone ? <Icon x={16} y={ROW_Y[i] - 6} width={12} height={12} strokeWidth={3} className={cn(TONES[tone].stroke, "fill-none")} aria-hidden /> : <circle cx={22} cy={ROW_Y[i]} r={3} className={NEUTRAL.faintFill} />}
                <text x={36} y={ROW_Y[i] + 4.2} className={cn(tone ? TONES[tone].text : NEUTRAL.mutedText, "text-[12px] font-semibold")}>{row.text}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </BeatFrame>
  );
}
