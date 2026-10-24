"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { formatCount, sig3 } from "../models/envelope-estimate";
import {
  bigCount,
  collision,
  collisionValueText,
  collisionVerdict,
  extraPerSecondText,
  LENGTH_DEFAULT,
  LENGTHS,
  LINK_DEFAULT,
  LINK_LADDER,
  LINK_SNAPS,
  linkFraction,
  linkFromFraction,
  oneInText,
  takenLabel,
} from "../models/wasla-collision";

const W = 420;
const H = 380;
const BAR = { x0: 20, x1: 400, y: 70, h: 30 };
const CARD = { y: 128, h: 48, w: 185, gap: 10 };
const N_RAIL = { x0: 26, x1: 386, y: 240 };
const L_RAIL = { x0: 40, x1: 380, y: 338 };
const MARK_LABELS: Record<number, string> = { 1e6: "1M", 1e8: "100M", 1e9: "1B", 3e10: "30B" };

const r1 = (v: number) => Math.round(v * 10) / 10;
const railX = (n: number) => r1(N_RAIL.x0 + linkFraction(n) * (N_RAIL.x1 - N_RAIL.x0));

/** The first-clash count in words, to two or three figures: "about 2.4 million links". */
function clashText(n: number): string {
  return `about ${n >= 1e6 ? formatCount(n) : sig3(n)} links`;
}

/** 20.3: drag the code length and the stored links; the bar of taken codes shows the chance of a clash. */
export function CollisionPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [length, setLength] = useState<number>(LENGTH_DEFAULT);
  const [links, setLinks] = useState<number>(LINK_DEFAULT);
  const c = collision(length, links);
  const verdict = collisionVerdict(c);
  const tone = TONES[verdict.tone];
  const valueText = collisionValueText(c);

  // The shaded share: a thin minimum so a tiny share is still seen.
  const barW = BAR.x1 - BAR.x0;
  const shade = c.full ? barW : Math.max(4, c.share * barW);
  const knobX = railX(links);
  const clashX = railX(c.firstClash);
  const textHalf = 82;
  const clashLabelX = Math.max(8 + textHalf, Math.min(W - 8 - textHalf, clashX));

  const summary = `Random codes of ${length} characters give ${bigCount(c.codes)} possible codes. With ${formatCount(links)} links stored, ${takenLabel(c)}. ${verdict.text}. The first clash is expected after ${clashText(c.firstClash)}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>stored links</b> and the <b>code length</b> rails in the picture.</>}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
        <DotGrid width={W} height={H} />

        {/* The keyspace: every possible code is the whole bar, taken codes are shaded from the left. */}
        <text x={BAR.x0} y={BAR.y - 8} className={cn(NEUTRAL.text, "text-[13.5px] font-bold tabular-nums")}>
          {bigCount(c.codes)} codes
        </text>
        <rect x={BAR.x0} y={BAR.y} width={barW} height={BAR.h} rx={8} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
        <rect x={BAR.x0} y={BAR.y} width={r1(shade)} height={BAR.h} rx={8} opacity={0.9} className={tone.solidFill} />
        <rect x={BAR.x0} y={BAR.y} width={barW} height={BAR.h} rx={8} strokeWidth={1.5} className={cn("fill-none", NEUTRAL.line)} />
        <text x={BAR.x0} y={BAR.y + BAR.h + 19} className={cn(tone.text, "text-[13px] font-bold tabular-nums")}>
          {takenLabel(c)}
        </text>

        {/* Two numbers: how often a create retries, and the extra tries a second. */}
        {[
          { x: 20, value: oneInText(c), label: "creates must retry" },
          { x: 20 + CARD.w + CARD.gap, value: extraPerSecondText(c), label: "extra tries a second" },
        ].map((card) => (
          <g key={card.label}>
            <rect x={card.x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
            <rect x={card.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={card.x + CARD.w / 2} y={CARD.y + 23} textAnchor="middle" className={cn(tone.text, "text-[17px] font-bold tabular-nums")}>
              {card.value}
            </text>
            <text x={card.x + CARD.w / 2} y={CARD.y + 40} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
              {card.label}
            </text>
          </g>
        ))}

        {/* Stored links on a log rail, with the first-clash marker. */}
        <text x={N_RAIL.x0} y={N_RAIL.y - 38} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
          Stored links: {formatCount(links)}
        </text>
        <RailSlider
          svgRef={svg}
          x0={N_RAIL.x0}
          x1={N_RAIL.x1}
          y={N_RAIL.y}
          label="Stored links"
          valueText={valueText}
          value={links}
          ladder={LINK_LADDER}
          fromFraction={linkFromFraction}
          onChange={setLinks}
        >
          <g aria-hidden>
            <line x1={N_RAIL.x0} x2={N_RAIL.x1} y1={N_RAIL.y} y2={N_RAIL.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
            <line x1={N_RAIL.x0} x2={knobX} y1={N_RAIL.y} y2={N_RAIL.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
            {LINK_SNAPS.map((s) => (
              <line key={s} x1={railX(s)} x2={railX(s)} y1={N_RAIL.y - 9} y2={N_RAIL.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
            ))}
            {LINK_SNAPS.filter((s) => MARK_LABELS[s]).map((s) => (
              <text key={s} x={railX(s)} y={N_RAIL.y - 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {MARK_LABELS[s]}
              </text>
            ))}
            <circle cx={knobX} cy={N_RAIL.y} r={17} className={TONES.accent.softFill} />
            <circle cx={knobX} cy={N_RAIL.y} r={11} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
            <line x1={knobX - 3} x2={knobX - 3} y1={N_RAIL.y - 4.5} y2={N_RAIL.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
            <line x1={knobX + 3} x2={knobX + 3} y1={N_RAIL.y - 4.5} y2={N_RAIL.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
          </g>
        </RailSlider>
        <g aria-hidden>
          <path d={`M${clashX} ${N_RAIL.y + 11} l-6 9 h12 Z`} className={TONES.warn.solidFill} />
          <text x={clashLabelX} y={N_RAIL.y + 37} textAnchor="middle" className={cn(TONES.warn.text, "text-[12px] font-bold")}>
            first clash expected here
          </text>
          <text x={clashLabelX} y={N_RAIL.y + 51} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
            {clashText(c.firstClash)}
          </text>
        </g>

        {/* Code length: 4 to 9 characters. */}
        <text x={L_RAIL.x0} y={L_RAIL.y - 32} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
          Code length: {length} characters
        </text>
        <SnapStopsRail
          svgRef={svg}
          x0={L_RAIL.x0}
          x1={L_RAIL.x1}
          y={L_RAIL.y}
          stops={LENGTHS.map((n) => ({ value: n, label: String(n) }))}
          value={length}
          onChange={setLength}
          ariaLabel="Code length"
          valueText={valueText}
        />

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
