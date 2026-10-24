"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { InfoChip, infoChipWidth } from "../primitives/svg-info-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { BLOCKS, FIT_LABEL, NEEDS, fitOf, formatUsd, priceOf, reasonOf, verdictFor, type BlockId, type Fit, type NeedId } from "./model";

const W = 420;
const H = 524;
const NEED = { x: 12, w: 156, h: 44, pitch: 52, y: 52 };
const BLOCK = { x: 240, w: 168, h: 34, pitch: 40, y: 52 };
const PANEL = { x: 12, y: 378, w: 396, h: 118 };
const LIFT = 6;

const FIT_TONE: Record<Fit, Tone> = { best: "good", ok: "warn", wrong: "bad" };

/** 18.7 beat 3: tap a need, then tap a block, and read how well the block fits and what it costs. */
export function CloudExplorerCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const [needId, setNeedId] = useState<NeedId>("api");
  const [blockId, setBlockId] = useState<BlockId | null>(null);

  const need = NEEDS.find((n) => n.id === needId) ?? NEEDS[0];
  const block = BLOCKS.find((b) => b.id === blockId) ?? null;
  const fit = block ? fitOf(need.id, block.id) : null;
  const tone: Tone | null = fit ? FIT_TONE[fit] : null;
  const verdict = verdictFor(fit);
  const price = block ? priceOf(need.id, block.id) : null;
  const reason = block ? reasonOf(need.id, block.id) : "";

  const needCentre = (i: number) => NEED.y + i * NEED.pitch + NEED.h / 2;
  const blockCentre = (j: number) => BLOCK.y + j * BLOCK.pitch + BLOCK.h / 2;
  const needIndex = NEEDS.findIndex((n) => n.id === need.id);
  const blockIndex = block ? BLOCKS.findIndex((b) => b.id === block.id) : -1;

  const priceText = !block ? "" : price ? `About ${formatUsd(price.usd)} a month for ${price.units}` : "No price: it cannot do this job";
  const description = block
    ? `${verdict.text}. For ${need.name} (${need.detail}) you picked ${block.name}, ${block.aws}. ${reason}. ${priceText}, illustrative, not AWS prices.`
    : `${verdict.text}. Need selected: ${need.name}. ${need.detail}`;

  const chipText = fit ? FIT_LABEL[fit] : "";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>need</b> on the left, then tap a <b>block</b> on the right.
        </>
      }
      controls={
        <BeatButton
          onClick={() => {
            setNeedId("api");
            setBlockId(null);
          }}
        >
          Reset
        </BeatButton>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* The line from the need to the block, in the colour of the fit. */}
        {block && tone ? (
          <g aria-hidden>
            <line x1={NEED.x + NEED.w} x2={BLOCK.x - LIFT} y1={needCentre(needIndex)} y2={blockCentre(blockIndex)} strokeWidth={3.5} strokeLinecap="round" className={cn(TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            <circle cx={NEED.x + NEED.w} cy={needCentre(needIndex)} r={4.5} className={TONES[tone].solidFill} />
            <circle cx={BLOCK.x - LIFT} cy={blockCentre(blockIndex)} r={4.5} className={TONES[tone].solidFill} />
          </g>
        ) : null}

        <g role="group" aria-label="Needs">
          {NEEDS.map((n, i) => {
            const y = NEED.y + i * NEED.pitch;
            const on = n.id === need.id;
            return (
              <SvgButton key={n.id} x={NEED.x} y={y} width={NEED.w} height={NEED.h} rx={13} label={`Need: ${n.name}, ${n.load}`} pressed={on} onPress={() => setNeedId(n.id)}>
                <rect x={NEED.x} y={y + 3} width={NEED.w} height={NEED.h} rx={13} className="fill-foreground/[0.06]" />
                <rect x={NEED.x} y={y} width={NEED.w} height={NEED.h} rx={13} strokeWidth={on ? 2.5 : 1.5} className={cn(on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={NEED.x + 12} y={y + 19} className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[12.5px] font-semibold")}>{n.name}</text>
                <text x={NEED.x + 12} y={y + 35} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{n.load}</text>
              </SvgButton>
            );
          })}
        </g>

        <g role="group" aria-label="Cloud blocks">
          {BLOCKS.map((b, j) => {
            const y = BLOCK.y + j * BLOCK.pitch;
            const on = b.id === blockId;
            return (
              <g key={b.id} style={{ transform: `translate(${on ? -LIFT : 0}px, 0px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
                <SvgButton x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} rx={12} label={`Block: ${b.name}, ${b.aws}`} pressed={on} onPress={() => setBlockId(b.id)}>
                  <rect x={BLOCK.x} y={y + 3} width={BLOCK.w} height={BLOCK.h} rx={12} className="fill-foreground/[0.06]" />
                  <rect x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} rx={12} strokeWidth={on ? 2.5 : 1.5} className={cn(NEUTRAL.surface, on && tone ? TONES[tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                  {on && tone ? <rect x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} rx={12} className={TONES[tone].softFill} /> : null}
                  <text x={BLOCK.x + 10} y={y + BLOCK.h / 2 + 4.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{b.name}</text>
                  <text x={BLOCK.x + BLOCK.w - 10} y={y + BLOCK.h / 2 + 4.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{b.aws}</text>
                </SvgButton>
              </g>
            );
          })}
        </g>

        {/* The panel: the block, who manages what, the price and the reason. */}
        <g aria-live="polite">
          <rect x={PANEL.x} y={PANEL.y + 3} width={PANEL.w} height={PANEL.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={tone ? 2 : 1.5} className={cn(NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          {block && tone ? (
            <>
              <text x={PANEL.x + 14} y={PANEL.y + 25} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{`${block.name} (${block.aws})`}</text>
              <InfoChip x={PANEL.x + PANEL.w - 12 - infoChipWidth("Wrong shape")} y={PANEL.y + 8} width={infoChipWidth("Wrong shape")} text={chipText} tone={tone} />
              <text x={PANEL.x + 14} y={PANEL.y + 47} className="text-[12px] font-semibold">
                <tspan className={NEUTRAL.mutedText}>You manage: </tspan>
                <tspan className={NEUTRAL.text}>{block.youManage}</tspan>
              </text>
              <text x={PANEL.x + 14} y={PANEL.y + 67} className="text-[12px] font-semibold">
                <tspan className={NEUTRAL.mutedText}>Provider manages: </tspan>
                <tspan className={NEUTRAL.text}>{block.providerManages}</tspan>
              </text>
              <text x={PANEL.x + 14} y={PANEL.y + 88} className={cn(TONES[tone].text, "text-[12.5px] font-bold tabular-nums")}>{priceText}</text>
              <text x={PANEL.x + 14} y={PANEL.y + 108} className={cn(TONES[tone].text, "text-[12px] font-semibold")}>{reason}</text>
            </>
          ) : (
            <>
              <text x={PANEL.x + 14} y={PANEL.y + 25} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{need.name}</text>
              <text x={PANEL.x + 14} y={PANEL.y + 55} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{need.detail}</text>
              <text x={PANEL.x + 14} y={PANEL.y + 82} className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold")}>Tap a block on the right to place it.</text>
            </>
          )}
        </g>
        <text x={W / 2} y={H - 10} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>Prices are made up, not AWS prices.</text>

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
