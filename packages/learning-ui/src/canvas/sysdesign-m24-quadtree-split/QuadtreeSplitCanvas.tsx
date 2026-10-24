"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow } from "../primitives/radio-chip-row";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgStat } from "../primitives/svg-stat";
import { NEUTRAL, TONES } from "../primitives/tones";
import { withCommas } from "../models/picture-controls";
import {
  BACKGROUND,
  CROWD_STOPS,
  crowdDots,
  DEFAULT_CROWD,
  DEFAULT_LIMIT,
  FIXED_GRID_WARNING,
  fixedGridFullest,
  fixedGridWarns,
  HOT,
  quadtree,
  quadVerdict,
  scatter,
  valueText,
  type Leaf,
} from "../models/quadtree-split";

const W = 420;
const H = 404;
const CITY = { x: 14, y: 50, size: 206 };
const SIDE_X = 232;
const SIDE_W = 176;
const RAIL = { x0: 40, x1: 380, y: 366 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const LIMITS = [
  { id: "100", text: "100", label: "A box may hold up to 100 drivers" },
  { id: "500", text: "500", label: "A box may hold up to 500 drivers" },
] as const;

const BACKGROUND_DOTS = scatter(BACKGROUND);

/** 24.2 beat 5: drag the stadium crowd and watch a quadtree cut only the crowded box, again and again. */
export function QuadtreeSplitCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [crowd, setCrowd] = useState<number>(DEFAULT_CROWD);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);

  const q = useMemo(() => quadtree(crowd, limit), [crowd, limit]);
  const verdict = quadVerdict(crowd, q);
  const warns = fixedGridWarns(crowd);
  const text = valueText(crowd, q);
  const crowdPoints = useMemo(() => scatter(crowdDots(crowd)), [crowd]);

  const px = (v: number) => r1(CITY.x + v * CITY.size);
  const py = (v: number) => r1(CITY.y + v * CITY.size);
  const side = (l: Leaf) => CITY.size / 2 ** l.level;
  const leafX = (l: Leaf) => r1(CITY.x + l.ix * side(l));
  const leafY = (l: Leaf) => r1(CITY.y + l.iy * side(l));

  // The fullest box gets a ring and its count. A tiny box has its count in a pill with a leader line.
  const f = q.fullestLeaf;
  const fs = side(f);
  const big = fs > CITY.size * 0.4;
  const fcx = r1(leafX(f) + fs / 2);
  const fcy = r1(leafY(f) + fs / 2);
  const pill = big ? { x: fcx, y: fcy } : { x: CITY.x + CITY.size * 0.72, y: CITY.y + CITY.size * 0.22 };
  const pillText = `${withCommas(q.fullest)} drivers`;
  const pillW = Math.ceil(pillText.length * 7.2 + 18);

  const description = `A city of ${BACKGROUND} drivers with a stadium crowd of ${withCommas(crowd)} in the north-west square. Box limit ${limit}. Quadtree: ${q.boxes} ${q.boxes === 1 ? "box" : "boxes"}, fullest ${q.fullest}, cut ${q.levels} ${q.levels === 1 ? "level" : "levels"} deep. A fixed grid: fullest box ${withCommas(fixedGridFullest(crowd))}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>crowd</b> and pick the <b>limit</b>. Only crowded boxes are cut.</>}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* The city, with the stadium square shaded. */}
        <rect x={CITY.x} y={CITY.y} width={CITY.size} height={CITY.size} rx={4} className={cn(NEUTRAL.surface)} />
        <rect x={CITY.x} y={CITY.y} width={CITY.size * HOT} height={CITY.size * HOT} className={cn(TONES.accent.softFill, "transition-colors duration-200 motion-reduce:transition-none")} />

        {/* Drivers: a few spread over the city, a crowd in the stadium. */}
        <g aria-hidden>
          {BACKGROUND_DOTS.map((p, i) => (
            <circle key={`b-${i}`} cx={px(p.x)} cy={py(p.y)} r={1.7} className={NEUTRAL.doneFill} opacity={0.55} />
          ))}
          {crowdPoints.map((p, i) => (
            <circle key={`c-${i}`} cx={px(p.x * HOT)} cy={py(p.y * HOT)} r={1.5} className={TONES.accent.solidFill} />
          ))}
        </g>

        {/* The boxes of the quadtree. Deeper cuts appear a little later, so the cutting can be seen. */}
        <g aria-hidden>
          {q.leaves.map((l) => (
            <rect
              key={`${l.level}-${l.ix}-${l.iy}`}
              x={leafX(l)}
              y={leafY(l)}
              width={r1(side(l))}
              height={r1(side(l))}
              strokeWidth={l.level > 4 ? 0.8 : 1.25}
              style={{ animationDelay: `${l.level * 90}ms` }}
              className={cn("animate-in fade-in fill-none duration-300 fill-mode-backwards motion-reduce:animate-none", NEUTRAL.doneStroke)}
            />
          ))}
        </g>
        <rect x={CITY.x} y={CITY.y} width={CITY.size} height={CITY.size} rx={4} strokeWidth={2} className={cn("fill-none", NEUTRAL.line)} aria-hidden />

        {/* The fullest box, ringed, with its count. */}
        {!big ? <line x1={fcx} y1={fcy} x2={pill.x - pillW / 2} y2={pill.y} strokeWidth={1.25} strokeDasharray="3 3" className={TONES.warn.stroke} aria-hidden /> : null}
        <rect x={r1(leafX(f) - 1.5)} y={r1(leafY(f) - 1.5)} width={r1(fs + 3)} height={r1(fs + 3)} rx={2} strokeWidth={2.25} className={cn("fill-none transition-all duration-200 motion-reduce:transition-none", TONES.warn.stroke)} aria-hidden />
        <g aria-hidden>
          <rect x={r1(pill.x - pillW / 2)} y={r1(pill.y - 11)} width={pillW} height={22} rx={11} className="fill-card" />
          <rect x={r1(pill.x - pillW / 2)} y={r1(pill.y - 11)} width={pillW} height={22} rx={11} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
          <text x={pill.x} y={r1(pill.y + 4.3)} textAnchor="middle" className={cn(TONES.warn.text, "text-[12px] font-bold tabular-nums")}>{pillText}</text>
        </g>

        {/* What the picture shows, in words. */}
        <g aria-hidden>
          <rect x={CITY.x} y={CITY.y + CITY.size + 11} width={11} height={11} rx={2.5} strokeWidth={1.25} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
          <text x={CITY.x + 17} y={CITY.y + CITY.size + 21} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>stadium</text>
          <rect x={CITY.x + 82} y={CITY.y + CITY.size + 11} width={11} height={11} rx={2.5} strokeWidth={2} className={cn("fill-none", TONES.warn.stroke)} />
          <text x={CITY.x + 99} y={CITY.y + CITY.size + 21} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>fullest box</text>
        </g>

        {/* The two numbers, then the limit. */}
        <SvgStat x={SIDE_X} y={CITY.y} width={SIDE_W} label="Fixed grid: one big box" value={`fullest ${withCommas(fixedGridFullest(crowd))}`} tone={warns ? "warn" : null} height={50} />
        <SvgStat x={SIDE_X} y={CITY.y + 60} width={SIDE_W} label={`Quadtree: ${q.boxes} ${q.boxes === 1 ? "box" : "boxes"}`} value={`fullest ${withCommas(q.fullest)}`} tone="good" height={50} />
        <text x={SIDE_X} y={CITY.y + 140} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>most drivers in a box</text>
        <RadioChipRow x={SIDE_X} y={CITY.y + 166} options={LIMITS.map((l) => ({ id: l.id, text: l.text, label: l.label }))} value={String(limit) as "100" | "500"} onChange={(id) => setLimit(Number(id))} ariaLabel="Most drivers a box may hold" />

        {warns ? <VerdictBanner width={W} text={FIXED_GRID_WARNING} tone="warn" y={CITY.y + CITY.size + 28} /> : null}

        {/* The crowd rail. */}
        <text x={RAIL.x0 - 26} y={RAIL.y - 30} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>drivers in the stadium crowd</text>
        <SnapStopsRail
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          y={RAIL.y}
          stops={CROWD_STOPS.map((v) => ({ value: v, label: withCommas(v) }))}
          value={crowd}
          onChange={setCrowd}
          ariaLabel="Drivers in the stadium crowd"
          valueText={text}
        />

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
