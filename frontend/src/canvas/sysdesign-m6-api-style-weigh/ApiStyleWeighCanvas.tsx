"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgChip } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  API_STYLES,
  DEFAULT_WEIGHTS,
  MAX_TOTAL,
  NEEDS,
  PRESETS,
  WEIGHT_WORDS,
  matchingPreset,
  nextWeight,
  styleVerdict,
  totals,
  type Weight,
  type Weights,
} from "../models/api-style-weigh";

const W = 420;
const H = 410;
const TOP = 48;
const CARD = { w: 68, h: 104 };
const COLS = [228, 300, 372] as const;
const BAR = { w: 26, top: 74, h: 54 };
const ROW0 = 162;
const ROW_PITCH = 44;
const ROW_H = 40;
const CHIP = { x: 136, w: 52, h: 24 };

/** 6.2: tap how much each need matters; the totals for REST, GraphQL and gRPC follow. */
export function ApiStyleWeighCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const titleId = useId();
  const descId = useId();
  const t = totals(weights);
  const verdict = styleVerdict(weights);
  const preset = matchingPreset(weights);

  const setOne = (i: number) => setWeights((w) => w.map((v, j) => (j === i ? nextWeight(v) : v)) as Weight[]);
  const description = `${API_STYLES.map((s) => `${s.name} ${t[s.id]}`).join(", ")}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a need to cycle <b>skip, nice, must</b>, or start from a preset.</>}>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* Presets: one tap sets all five needs. */}
        {PRESETS.map((p, i) => (
          <SvgChip key={p.id} x={10} y={TOP + 16 + i * 36} width={176} text={p.name} label={`Start from ${p.name}`} pressed={preset === p.id} onPress={() => setWeights(p.weights)} />
        ))}

        {/* The three styles: a bar that grows with the total, a ring on the leader. */}
        {API_STYLES.map((s, i) => {
          const cx = COLS[i];
          const left = cx - CARD.w / 2;
          const lead = verdict.top.includes(s.id);
          const ring = lead ? (verdict.close ? TONES.warn.stroke : TONES.accent.stroke) : "";
          const frac = Math.max(0, Math.min(1, t[s.id] / MAX_TOTAL));
          return (
            <g key={s.id}>
              <rect x={left - 3} y={TOP - 3} width={CARD.w + 6} height={CARD.h + 6} rx={15} strokeWidth={2.5} className={cn("fill-none transition-opacity duration-300 motion-reduce:transition-none", ring || "stroke-transparent", lead ? "opacity-100" : "opacity-0")} />
              <rect x={left} y={TOP + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
              <rect x={left} y={TOP} width={CARD.w} height={CARD.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={cx} y={TOP + 19} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{s.name}</text>
              <rect x={cx - BAR.w / 2} y={BAR.top} width={BAR.w} height={BAR.h} rx={6} className="fill-muted" />
              <rect
                x={cx - BAR.w / 2}
                y={BAR.top}
                width={BAR.w}
                height={BAR.h}
                rx={6}
                className={cn(lead ? (verdict.close ? TONES.warn.solidFill : TONES.accent.solidFill) : "fill-muted-foreground/55", "motion-reduce:transition-none")}
                style={{ transform: `scaleY(${frac})`, transformOrigin: "50% 100%", transformBox: "fill-box", transition: "transform 350ms ease, fill 200ms" }}
              />
              <text x={cx} y={TOP + CARD.h - 7} textAnchor="middle" className={cn(lead ? (verdict.close ? TONES.warn.text : TONES.accent.text) : NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>{t[s.id]}</text>
            </g>
          );
        })}

        {/* The needs: tap a row to change its weight. The dots are each style's score. */}
        {NEEDS.map((need, i) => {
          const y = ROW0 + i * ROW_PITCH;
          const w = weights[i] as Weight;
          const word = WEIGHT_WORDS[w];
          const chipLook =
            w === 3
              ? { rect: cn(TONES.accent.solidFill, TONES.accent.stroke), text: "fill-white dark:fill-blue-950" }
              : w === 1
                ? { rect: cn(TONES.accent.softFill, TONES.accent.stroke), text: TONES.accent.text }
                : { rect: "fill-muted stroke-transparent", text: NEUTRAL.mutedText };
          return (
            <SvgButton key={need.id} x={6} y={y} width={408} height={ROW_H} rx={12} label={`${need.full}: ${word.full}. Tap to change.`} onPress={() => setOne(i)}>
              <rect x={6} y={y} width={408} height={ROW_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted/60")} />
              <text x={16} y={y + 25} className={cn(w === 0 ? NEUTRAL.mutedText : NEUTRAL.text, "text-[12px] font-medium")}>{need.short}</text>
              <rect x={CHIP.x} y={y + (ROW_H - CHIP.h) / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} strokeWidth={1.5} className={cn(chipLook.rect, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={CHIP.x + CHIP.w / 2} y={y + 25} textAnchor="middle" className={cn(chipLook.text, "text-[12px] font-semibold")}>{word.chip}</text>
              {API_STYLES.map((s, c) =>
                Array.from({ length: 5 }, (_, d) => (
                  <circle
                    key={`${s.id}-${d}`}
                    cx={COLS[c] - 20 + d * 10}
                    cy={y + ROW_H / 2}
                    r={3.4}
                    className={cn("transition-colors duration-200 motion-reduce:transition-none", d < need.scores[s.id] ? (w === 0 ? "fill-muted-foreground/35" : TONES.accent.solidFill) : "fill-muted")}
                  />
                ))
              )}
            </SvgButton>
          );
        })}

        <text x={W / 2} y={H - 8} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>Dots are each style&apos;s score for that need, out of 5</text>
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
