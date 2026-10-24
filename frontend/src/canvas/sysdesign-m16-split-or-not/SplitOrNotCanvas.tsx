"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import {
  CLARITY_NAMES,
  COLLISION_STOPS,
  DEFAULTS,
  MAX_POINTS,
  MAX_TOTAL,
  TEAM_STOPS,
  clarityValueText,
  collisionValueText,
  teamValueText,
  weigh,
  type Shape,
} from "./model";

const W = 420;
const H = 540;
const CARD_Y = 92;
const CARDS: { shape: Shape; x: number; label: string; status: string; kind: "server" | "note" | "router" }[] = [
  { shape: "monolith", x: 70, label: "Monolith", status: "one program", kind: "server" },
  { shape: "modular", x: 210, label: "Modular", status: "hard walls", kind: "note" },
  { shape: "split", x: 350, label: "Services", status: "split parts", kind: "router" },
];
const STRIP = { x0: 86, cell: 28, gap: 4, y: 150, h: 16 };
const BLOCK_Y0 = 214;
const BLOCK_PITCH = 108;
const RAIL = { x0: 60, x1: 360 };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A short run of cells that fills up to `points`; the bar that sits next to a rail. */
function PointBar({ x, y, points, max, tone }: { x: number; y: number; points: number; max: number; tone: Tone }) {
  return (
    <g aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <rect key={i} x={x + i * 28} y={y} width={24} height={12} rx={4} className={cn(i < points ? TONES[tone].solidFill : "fill-muted", SHAPE_TRANSITION)} />
      ))}
    </g>
  );
}

/** 16.2 beat 5: three rails, three point bars, and the shape of system they point to. */
export function SplitOrNotCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [people, setPeople] = useState<number>(DEFAULTS.team);
  const [releases, setReleases] = useState<number>(DEFAULTS.collisions);
  const [clarity, setClarity] = useState<number>(DEFAULTS.clarity);

  const w = weigh(people, releases, clarity);
  const tone: Tone = w.capped ? "warn" : w.shape === "monolith" ? "good" : "accent";
  const description = `Team of ${people}, ${releases} releases that waited last month, boundaries ${CLARITY_NAMES[w.clarity].toLowerCase()}. Points: team ${w.team}, releases ${w.collisions}, boundaries ${w.clarity}, total ${w.total} of ${MAX_TOTAL}. ${w.verdict.text}.`;

  const blocks = [
    {
      title: `Team: ${people} people`,
      points: w.team,
      max: MAX_POINTS.team,
      stops: TEAM_STOPS.map((v) => ({ value: v, label: String(v) })),
      value: people,
      onChange: setPeople,
      aria: "Team size",
      text: teamValueText(people),
    },
    {
      title: `Releases that waited: ${releases} last month`,
      points: w.collisions,
      max: MAX_POINTS.collisions,
      stops: COLLISION_STOPS.map((v) => ({ value: v, label: String(v) })),
      value: releases,
      onChange: setReleases,
      aria: "Releases that waited for another team last month",
      text: collisionValueText(releases),
    },
    {
      title: `Walls: ${CLARITY_NAMES[w.clarity].toLowerCase()}`,
      points: w.clarity,
      max: MAX_POINTS.clarity,
      stops: [
        { value: 0, label: ["New", "idea"] },
        { value: 1, label: ["Mostly", "clear"] },
        { value: 2, label: ["Stable", "for a year"] },
      ],
      value: clarity,
      onChange: setClarity,
      aria: "Boundary clarity",
      text: clarityValueText(clarity),
    },
  ];

  const stripW = MAX_TOTAL * STRIP.cell + (MAX_TOTAL - 1) * STRIP.gap;
  const cellX = (i: number) => STRIP.x0 + i * (STRIP.cell + STRIP.gap);
  const zones = [
    { from: 0, to: 1, label: "monolith" },
    { from: 2, to: 4, label: "modular" },
    { from: 5, to: 7, label: "split" },
  ];

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag each <b>rail</b>. The bar next to it fills, and the ringed card is the answer.</>}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* The three shapes: the recommended one is ringed, the others are dim. */}
        {CARDS.map((c) => {
          const on = c.shape === w.shape;
          return (
            <g key={c.shape}>
              <rect
                x={c.x - 61}
                y={CARD_Y - 35}
                width={122}
                height={70}
                rx={19}
                strokeWidth={3}
                className={cn(TONES[tone].softFill, TONES[tone].stroke, "transition-opacity duration-200 motion-reduce:transition-none", on ? "opacity-100" : "opacity-0")}
              />
              <g className={cn("transition-opacity duration-200 motion-reduce:transition-none", on ? "opacity-100" : "opacity-40")}>
                <SvgNode x={c.x} y={CARD_Y} label={c.label} kind={c.kind} status={c.status} statusTone={on ? tone : undefined} />
              </g>
            </g>
          );
        })}

        {/* Total points out of eight, in three zones. */}
        <text x={16} y={STRIP.y + 13} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>points</text>
        {Array.from({ length: MAX_TOTAL }, (_, i) => (
          <rect key={i} x={cellX(i)} y={STRIP.y} width={STRIP.cell} height={STRIP.h} rx={5} className={cn(i < w.total ? TONES[tone].solidFill : "fill-muted", SHAPE_TRANSITION)} />
        ))}
        <text x={STRIP.x0 + stripW + 12} y={STRIP.y + 14} className={cn(NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>{`${w.total} of ${MAX_TOTAL}`}</text>
        {zones.map((z) => (
          <text key={z.label} x={(cellX(z.from) + cellX(z.to) + STRIP.cell) / 2} y={STRIP.y + 34} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{z.label}</text>
        ))}
        {[2, 5].map((i) => (
          <line key={i} x1={r1(cellX(i) - STRIP.gap / 2)} x2={r1(cellX(i) - STRIP.gap / 2)} y1={STRIP.y - 4} y2={STRIP.y + STRIP.h + 4} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
        ))}

        {/* One block per factor: its words and point bar over its own rail. */}
        {blocks.map((b, i) => {
          const top = BLOCK_Y0 + i * BLOCK_PITCH;
          return (
            <g key={b.aria}>
              <text x={16} y={top + 14} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{b.title}</text>
              <PointBar x={W - 16 - (b.max * 28 - 4)} y={top + 4} points={b.points} max={b.max} tone={tone} />
              <SnapStopsRail
                svgRef={svg}
                x0={RAIL.x0}
                x1={RAIL.x1}
                y={top + 52}
                stops={b.stops}
                value={b.value}
                onChange={b.onChange}
                ariaLabel={b.aria}
                valueText={b.text}
                below={52}
              />
            </g>
          );
        })}

        <VerdictBanner width={W} text={w.verdict.text} tone={w.verdict.tone} />
      </svg>
      <p className="sr-only" aria-live="polite">{w.verdict.text}</p>
    </BeatFrame>
  );
}
