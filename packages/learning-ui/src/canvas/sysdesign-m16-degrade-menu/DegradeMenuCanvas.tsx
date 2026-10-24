"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { CHIP_H, rowPositions } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { FEATURES, START_CHOICE, START_DOWN, cycleChoice, evaluate, fallbackOf, fallbackShort, featureLabel, serviceLabel, toggleService } from "./model";

const W = 420;
const H = 560;
const CHIP_Y = 88;
const PHONE = { x: 70, y: 124, w: 280, h: 424 };
const CARD = { x: 82, y0: 168, w: 256, h: 46, pitch: 52 };
const ORDER = { y: 486, w: 196, h: 32 };

const chipW = (text: string) => text.length * 7 + 18;

/** 16.6 beat 2: break services, choose fallbacks, and see whether the customer can still order. */
export function DegradeMenuCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const [down, setDown] = useState(START_DOWN);
  const [choice, setChoice] = useState(START_CHOICE);

  const out = evaluate(down, choice);
  const brokenNames = FEATURES.filter((_, i) => down[i]).map((f) => f.service);
  const widths = FEATURES.map((f) => chipW(f.service));
  const total = widths.reduce((a, b) => a + b, 0) + 6 * (widths.length - 1);
  const xs = rowPositions(widths, (W - total) / 2, 6);
  const description = `A phone screen with six features: ${FEATURES.map((f, i) => `${f.name} (${out.cards[i].text})`).join(", ")}. Broken services: ${brokenNames.length ? brokenNames.join(", ") : "none"}. ${out.verdict.text}.`;
  const frameTone: Tone = out.pageFails ? "bad" : "good";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap a <b>service</b> to break it. Tap a <b>feature</b> to choose what it does when its service is down.</>}
      controls={
        <BeatActionButton
          onClick={() => {
            setDown(START_DOWN);
            setChoice(START_CHOICE);
          }}
        >
          Reset
        </BeatActionButton>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* Six services: tap one to break it. */}
        <text x={W / 2} y={64} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>services: tap to break one (red and dashed means down)</text>
        {FEATURES.map((f, i) => {
          const isDown = down[i];
          return (
            <SvgButton key={f.id} x={xs[i]} y={CHIP_Y - 22} width={widths[i]} height={44} rx={22} label={serviceLabel(i, down)} pressed={isDown} onPress={() => setDown((d) => toggleService(d, i))}>
              <rect
                x={xs[i]}
                y={CHIP_Y - CHIP_H / 2}
                width={widths[i]}
                height={CHIP_H}
                rx={CHIP_H / 2}
                strokeWidth={1.75}
                strokeDasharray={isDown ? "4 3" : undefined}
                className={cn(isDown ? cn(TONES.bad.softFill, TONES.bad.stroke) : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted"), SHAPE_TRANSITION)}
              />
              <text x={xs[i] + widths[i] / 2} y={CHIP_Y + 4.5} textAnchor="middle" className={cn(isDown ? TONES.bad.text : NEUTRAL.text, "text-[12.5px] font-semibold")}>{f.service}</text>
            </SvgButton>
          );
        })}

        {/* The phone screen. */}
        <rect x={PHONE.x} y={PHONE.y + 3} width={PHONE.w} height={PHONE.h} rx={30} className="fill-foreground/[0.06]" />
        <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={30} strokeWidth={2.5} className={cn(NEUTRAL.surface, out.pageFails ? TONES.bad.stroke : NEUTRAL.line, SHAPE_TRANSITION)} />
        <rect x={W / 2 - 22} y={PHONE.y + 10} width={44} height={6} rx={3} className="fill-muted" />
        <text x={W / 2} y={PHONE.y + 38} textAnchor="middle" className={cn(out.pageFails ? TONES.bad.text : NEUTRAL.text, "text-[14px] font-bold")}>{out.pageFails ? "Something went wrong" : "Tawseel"}</text>

        {FEATURES.map((f, i) => {
          const c = out.cards[i];
          const y = CARD.y0 + i * CARD.pitch;
          const fb = fallbackOf(i, choice);
          const tone = c.tone;
          const failsPage = out.failed.includes(i);
          const dim = out.pageFails && !failsPage;
          const canCycle = f.fallbacks.length > 1;
          const body = (
            <g opacity={dim ? 0.4 : 1} className="transition-opacity duration-200 motion-reduce:transition-none">
              <rect x={CARD.x} y={y + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
              <rect x={CARD.x} y={y} width={CARD.w} height={CARD.h} rx={12} strokeWidth={tone ? 2 : 1.5} className={cn(tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn("fill-muted", NEUTRAL.line), SHAPE_TRANSITION)} />
              <text x={CARD.x + 12} y={y + 19} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{f.name}</text>
              <text x={CARD.x + CARD.w - 12} y={y + 19} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{f.tier}</text>
              <text x={CARD.x + 12} y={y + 37} className={cn(tone ? TONES[tone].text : NEUTRAL.mutedText, "text-[12px] font-semibold")}>{c.text}</text>
              {!down[i] ? (
                <text x={CARD.x + CARD.w - 12} y={y + 37} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                  {canCycle ? `if down: ${fallbackShort(f, fb)}` : "no fallback exists"}
                </text>
              ) : null}
            </g>
          );
          return canCycle ? (
            <SvgButton key={f.id} x={CARD.x} y={y} width={CARD.w} height={CARD.h} rx={12} label={featureLabel(i, down, choice)} onPress={() => setChoice((ch) => cycleChoice(ch, i))}>
              {body}
            </SvgButton>
          ) : (
            <g key={f.id} role="group" aria-label={featureLabel(i, down, choice)}>
              {body}
            </g>
          );
        })}

        {/* The order button: lit only when the customer can still order. */}
        <rect x={(W - ORDER.w) / 2} y={ORDER.y} width={ORDER.w} height={ORDER.h} rx={ORDER.h / 2} className={cn(out.canOrder ? "fill-blue-600 dark:fill-blue-400" : "fill-muted", SHAPE_TRANSITION)} />
        <text x={W / 2} y={ORDER.y + 21} textAnchor="middle" className={cn("text-[13px] font-bold", out.canOrder ? "fill-white dark:fill-blue-950" : NEUTRAL.mutedText)}>{out.canOrder ? "Place order" : "Cannot order"}</text>
        <text x={W / 2} y={PHONE.y + PHONE.h - 12} textAnchor="middle" className={cn(TONES[frameTone].text, "text-[11.5px]")}>{out.pageFails ? "a feature failed the whole page" : out.degraded === 0 ? "every feature is live" : `${out.degraded} ${out.degraded === 1 ? "feature" : "features"} degraded`}</text>

        <VerdictBanner width={W} text={out.verdict.text} tone={out.verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
