"use client";

import { useId, useState } from "react";
import { GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import {
  STAGES,
  STAGE_COUNT,
  elapsedTenths,
  formatTime,
  isFinished,
  nextAt,
  statusesOf,
  tokenSlot,
  verdictFor,
  type Scale,
  type Status,
} from "./model";

const W = 420;
const H = 408;
const RAIL_X = 26;
const CARD = { x: 48, w: 358, h: 40 };
const PITCH = 46;
const FIRST_Y = 68;
const START_Y = 54;
const PILL_W = 84;

const cardY = (i: number) => FIRST_Y + i * PITCH;
const centreY = (i: number) => cardY(i) + CARD.h / 2;

const PILL: Record<Status, { text: string; tone: Tone | null }> = {
  pass: { text: "passed", tone: "good" },
  fail: { text: "failed", tone: "bad" },
  skipped: { text: "skipped", tone: null },
  pending: { text: "waiting", tone: null },
};

/** 18.5 beat 2: step a commit through six stages, tap a stage to break it, and read how long you waited to find out. */
export function PipelineStepCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const [at, setAt] = useState(0);
  const [broken, setBroken] = useState<boolean[]>(() => STAGES.map(() => false));
  const [scale, setScale] = useState<Scale>("laptop");

  const statuses = statusesOf(at, broken);
  const verdict = verdictFor(at, broken, scale);
  const slot = tokenSlot(at, broken);
  const tokenY = slot < 0 ? START_Y : centreY(slot);
  const waited = formatTime(elapsedTenths(at, broken), scale);
  const finished = isFinished(at, broken);
  const toggle = (i: number) => setBroken((b) => b.map((v, k) => (k === i ? !v : v)));

  const description = `${verdict.text}. ${STAGES.map((s, i) => `${s.name}: ${broken[i] && statuses[i] === "pending" ? "will fail" : PILL[statuses[i]].text}`).join(". ")}. The commit has waited ${waited}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Press <b>Step</b> to move the commit, and tap a <b>stage</b> to break it.
        </>
      }
      controls={
        <>
          <BeatButton onClick={() => setAt((a) => nextAt(a, broken))}>{finished ? "Run again" : "Step"}</BeatButton>
          <BeatChoice label="Where the pipeline runs" options={[{ id: "laptop", label: "Laptop" }, { id: "runner", label: "Shared runner" }]} value={scale} onChange={setScale} />
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* The conveyor rail, with a branch to each stage. */}
        <line x1={RAIL_X} x2={RAIL_X} y1={START_Y} y2={centreY(STAGE_COUNT - 1)} strokeWidth={4} strokeLinecap="round" className="stroke-muted" />
        <line x1={RAIL_X} x2={RAIL_X} y1={START_Y} y2={tokenY} strokeWidth={4} strokeLinecap="round" className={TONES.accent.stroke} />
        {STAGES.map((s, i) => (
          <line key={`branch-${s.id}`} x1={RAIL_X} x2={CARD.x} y1={centreY(i)} y2={centreY(i)} strokeWidth={2} strokeLinecap="round" className={statuses[i] === "pass" ? TONES.good.stroke : statuses[i] === "fail" ? TONES.bad.stroke : NEUTRAL.faintStroke} />
        ))}

        {STAGES.map((s, i) => {
          const st = statuses[i];
          const willFail = broken[i] && st === "pending";
          const tone: Tone | null = willFail ? "bad" : PILL[st].tone;
          const pillText = willFail ? "will fail" : PILL[st].text;
          const dim = st === "skipped";
          return (
            <SvgButton key={s.id} x={CARD.x} y={cardY(i)} width={CARD.w} height={CARD.h} rx={12} label={`${broken[i] ? "Fix" : "Break"} ${s.name}, now ${pillText}`} pressed={broken[i]} onPress={() => toggle(i)}>
              <rect x={CARD.x} y={cardY(i) + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
              <rect
                x={CARD.x}
                y={cardY(i)}
                width={CARD.w}
                height={CARD.h}
                rx={12}
                strokeWidth={tone && tone !== "good" ? 2 : 1.5}
                strokeDasharray={willFail ? "5 4" : undefined}
                className={cn(dim ? "fill-muted" : NEUTRAL.surface, tone === "bad" ? TONES.bad.stroke : tone === "good" ? TONES.good.stroke : NEUTRAL.line, "transition-colors duration-300 motion-reduce:transition-none")}
              />
              {st === "fail" ? <rect x={CARD.x} y={cardY(i)} width={CARD.w} height={CARD.h} rx={12} className={TONES.bad.softFill} /> : null}
              <text x={CARD.x + 14} y={cardY(i) + CARD.h / 2 + 4.5} className={cn(dim ? NEUTRAL.mutedText : NEUTRAL.text, "text-[12.5px] font-semibold")}>{s.name}</text>
              <text x={CARD.x + CARD.w - PILL_W - 22} y={cardY(i) + CARD.h / 2 + 4.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>{formatTime(s.tenths, scale)}</text>
              <rect x={CARD.x + CARD.w - PILL_W - 8} y={cardY(i) + (CARD.h - 24) / 2} width={PILL_W} height={24} rx={12} strokeWidth={1.5} strokeDasharray={willFail ? "4 3" : undefined} className={cn(tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : "fill-muted stroke-border", "transition-colors duration-300 motion-reduce:transition-none")} />
              <text x={CARD.x + CARD.w - PILL_W / 2 - 8} y={cardY(i) + CARD.h / 2 + 4.5} textAnchor="middle" className={cn(tone ? TONES[tone].text : NEUTRAL.mutedText, "text-[12px] font-bold")}>{pillText}</text>
            </SvgButton>
          );
        })}

        {/* The commit token slides down the rail. */}
        <g aria-hidden style={{ transform: `translate(${RAIL_X}px, ${tokenY}px)` }} className="transition-transform duration-500 motion-reduce:transition-none">
          <circle r={12} className={TONES.accent.softFill} />
          <circle r={9.5} strokeWidth={2} className={cn(statuses.includes("fail") ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} />
          <GitCommitHorizontal x={-6} y={-6} width={12} height={12} strokeWidth={2.4} className="text-white dark:text-blue-950" />
        </g>

        {/* The clock: how long the commit has waited. */}
        <text x={W / 2} y={H - 38} textAnchor="middle" className={cn(NEUTRAL.text, "text-[22px] font-bold tabular-nums")}>{`Waited: ${waited}`}</text>
        <text x={W / 2} y={H - 16} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>time until you know the result</text>

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
