"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import { DEFAULT_KEY, EVENT_COUNT, EVEN_SHARE, KEYS, PARTITION_COUNT, analyse, barTone, describe, exactPercent, verdictFor, type KeyId } from "./model";

const W = 420;
const H = 366;
const CARD = { x0: 10, w: 94, gap: 8, y: 48, h: 46 };
const BADGE = { y: 106, h: 26, w: 196 };
const PLOT = { base: 308, scale: 150, x0: 58, w: 56, gap: 28, dropTop: 150 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const barX = (i: number) => PLOT.x0 + i * (PLOT.w + PLOT.gap);

/** 15.4 beat 5: tap a key and see which events stay together and how evenly four partitions are loaded. */
export function PartitionKeyPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [key, setKey] = useState<KeyId>(DEFAULT_KEY);

  const a = analyse(key);
  const verdict = verdictFor(a);
  const lineY = r1(PLOT.base - EVEN_SHARE * PLOT.scale);
  const description = `${EVENT_COUNT} events in ${PARTITION_COUNT} partitions, ${describe(a)}. ${verdict.text}.`;

  const badges: { label: string; yes: boolean; tone: Tone | null }[] = [
    { label: "orders in order", yes: a.ordersInOrder, tone: a.ordersInOrder ? "good" : "bad" },
    { label: "customers in order", yes: a.customersInOrder, tone: a.customersInOrder ? "good" : null },
  ];

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a <b>key</b>. Watch the four bars, and the two badges.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The four keys: tap a card. */}
          {KEYS.map((k, i) => {
            const x = CARD.x0 + i * (CARD.w + CARD.gap);
            const on = k.id === key;
            return (
              <SvgButton key={k.id} x={x} y={CARD.y} width={CARD.w} height={CARD.h} label={`Key: ${k.label}`} pressed={on} onPress={() => setKey(k.id)}>
                <rect x={x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={on ? 2.5 : 1.5} className={cn(NEUTRAL.surface, on ? TONES.accent.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                {on ? <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} className={TONES.accent.softFill} /> : null}
                <text x={x + CARD.w / 2} y={CARD.y + 21} textAnchor="middle" className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[13px] font-bold")}>{k.label}</text>
                <text x={x + CARD.w / 2} y={CARD.y + 37} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{`e.g. ${k.sample}`}</text>
              </SvgButton>
            );
          })}

          {/* Two questions about the key. */}
          {badges.map((b, i) => {
            const x = 10 + i * (BADGE.w + 8);
            const tone = b.tone;
            return (
              <g key={b.label}>
                <rect x={x} y={BADGE.y} width={BADGE.w} height={BADGE.h} rx={13} className="fill-card" />
                <rect x={x} y={BADGE.y} width={BADGE.w} height={BADGE.h} rx={13} strokeWidth={1.5} className={cn(tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn("fill-muted", NEUTRAL.line), "transition-colors duration-200 motion-reduce:transition-none")} />
                {b.yes ? (
                  <path d={`M${x + 11} ${BADGE.y + 13.5} l4.5 4.5 l8 -9`} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.good.stroke} />
                ) : (
                  <g strokeWidth={2.5} strokeLinecap="round" className={tone ? TONES[tone].stroke : NEUTRAL.doneStroke}>
                    <line x1={x + 12} y1={BADGE.y + 8.5} x2={x + 22} y2={BADGE.y + 18.5} />
                    <line x1={x + 12} y1={BADGE.y + 18.5} x2={x + 22} y2={BADGE.y + 8.5} />
                  </g>
                )}
                <text x={x + 31} y={BADGE.y + 17.5} className={cn(tone ? TONES[tone].text : NEUTRAL.text, "text-[12px] font-semibold")}>{`${b.label}: ${b.yes ? "yes" : "no"}`}</text>
              </g>
            );
          })}

          {/* The four partitions as bars; the dashed line is an even quarter. */}
          <line x1={PLOT.x0 - 14} x2={barX(PARTITION_COUNT - 1) + PLOT.w + 14} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          <line x1={PLOT.x0 - 14} x2={barX(PARTITION_COUNT - 1) + PLOT.w + 14} y1={lineY} y2={lineY} strokeWidth={1.5} strokeDasharray="5 4" className={NEUTRAL.doneStroke} />
          <text x={PLOT.x0 - 18} y={r1(lineY + 4)} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>25%</text>

          {a.counts.map((count, i) => {
            const share = count / EVENT_COUNT;
            const h = r1(share * PLOT.scale);
            const top = r1(PLOT.base - h);
            const tone = barTone(share, i === a.hottest);
            const cx = barX(i) + PLOT.w / 2;
            const dropCount = Math.max(1, Math.round(share * 10));
            return (
              <g key={i}>
                <rect x={barX(i)} y={PLOT.dropTop - 8} width={PLOT.w} height={PLOT.base - PLOT.dropTop + 8} rx={10} className="fill-muted/60" />
                <rect
                  x={barX(i)}
                  y={top}
                  width={PLOT.w}
                  height={Math.max(h, 2)}
                  rx={6}
                  className={cn(tone === "accent" ? "fill-blue-600/80 dark:fill-blue-400/80" : TONES[tone].solidFill, "transition-colors duration-200 motion-reduce:transition-none")}
                />
                {clock.reduced
                  ? null
                  : Array.from({ length: dropCount }, (_, j) => {
                      const phase = (clock.seconds * 0.6 + j / dropCount + i * 0.13) % 1;
                      const side = j % 2 === 0 ? -19 : 19;
                      const y = r1(PLOT.dropTop + (top - PLOT.dropTop) * phase);
                      return <circle key={j} cx={cx + side} cy={y} r={3} opacity={Math.min(1, (1 - phase) * 5)} className={tone === "accent" ? TONES.accent.solidFill : TONES[tone].solidFill} />;
                    })}
                <text x={cx} y={r1(top - 7)} textAnchor="middle" className={cn(tone === "accent" ? NEUTRAL.text : TONES[tone].text, "text-[13px] font-bold tabular-nums")}>{withCommas(count)}</text>
                <text x={cx} y={PLOT.base + 18} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{`P${i}`}</text>
                <text x={cx} y={PLOT.base + 34} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{exactPercent(share)}</text>
              </g>
            );
          })}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
