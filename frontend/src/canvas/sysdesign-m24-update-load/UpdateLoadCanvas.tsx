"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow } from "../primitives/radio-chip-row";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots } from "../models/server-load";
import { formatCount } from "../models/envelope-estimate";
import {
  DEFAULT_DRIVERS,
  DEFAULT_GAP,
  DRIVER_STEPS,
  GAP_STEPS,
  iconSplit,
  laneDotsPerSecond,
  nodesFor,
  nodesText,
  reportsText,
  updateLoad,
  updateVerdict,
  valueText,
  type Store,
} from "../models/safar-update-load";

const W = 420;
const H = 402;
const NODE = { x: 70, y: 96 };
const LANE_Y = NODE.y;
const LANE_X0 = NODE.x + NODE_W / 2;
const BLOCK = { x: 236, y: 46, w: 172, h: 186 };
const ICON = 20;
const ICON_GAP = 6;
const COLS = 5;
const RAIL = { x0: 40, x1: 380 };
const DRIVER_RAIL_Y = 284;
const GAP_RAIL_Y = 362;

const STORES = [
  { id: "disk" as const, text: "Disk database", label: "Keep the latest places in a disk database" },
  { id: "memory" as const, text: "Memory map", label: "Keep the latest places in a memory map" },
];

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 24.3 beat 3: the same stream of location reports, planned on disk database nodes or memory nodes. */
export function UpdateLoadCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [drivers, setDrivers] = useState<number>(DEFAULT_DRIVERS);
  const [gap, setGap] = useState<number>(DEFAULT_GAP);
  const [store, setStore] = useState<Store>("disk");

  const load = updateLoad(drivers, gap);
  const nodes = nodesFor(load, store);
  const verdict = updateVerdict(load, store);
  const { shown, more } = iconSplit(nodes);
  const text = valueText(drivers, gap, store);
  const tone: Tone = verdict.tone;

  // Dots leave the phones at a rate that follows the reports; a still picture rests with a few spread along the lane.
  const laneEnd = BLOCK.x;
  const dots = clock.reduced
    ? [0.15, 0.4, 0.65, 0.9].map((p, id) => ({ id, progress: p }))
    : flowDots(clock.seconds, laneDotsPerSecond(load.reports), 1.1);
  const chipX = 14;
  const iconsX0 = BLOCK.x + (BLOCK.w - (COLS * ICON + (COLS - 1) * ICON_GAP)) / 2;
  const iconsY0 = BLOCK.y + 62;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>drivers</b> and <b>seconds between reports</b>, and switch the store.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{`${text}. ${verdict.text}.`}</desc>
          <DotGrid width={W} height={H} />

          {/* The lane from the phones to the store, with a dot for a share of the reports. */}
          <line x1={LANE_X0} x2={laneEnd} y1={LANE_Y} y2={LANE_Y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dots.map((d) => (
            <circle key={d.id} cx={r1(LANE_X0 + (laneEnd - LANE_X0) * d.progress)} cy={LANE_Y} r={4.2} className={TONES.accent.solidFill} />
          ))}

          <SvgNode x={NODE.x} y={NODE.y} label="Drivers" kind="phone" status={reportsText(load.reports)} statusTone="accent" />
          <text x={NODE.x} y={NODE.y + 50} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{formatCount(drivers)} drivers</text>
          <text x={NODE.x} y={NODE.y + 66} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>a report every {gap} s</text>

          {/* The store block: a row of node icons, up to twenty. */}
          <rect x={BLOCK.x} y={BLOCK.y + 3} width={BLOCK.w} height={BLOCK.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={BLOCK.x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} rx={14} strokeWidth={verdict.tone === "bad" ? 2 : 1.5} className={cn(NEUTRAL.surface, verdict.tone === "bad" ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={BLOCK.x + 14} y={BLOCK.y + 22} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{store === "disk" ? "Disk database" : "Memory map"}</text>
          <text x={BLOCK.x + 14} y={BLOCK.y + 47} className={cn(TONES[tone].text, "text-[17px] font-bold tabular-nums")}>{nodesText(nodes)}</text>
          {Array.from({ length: shown }, (_, i) => {
            const x = iconsX0 + (i % COLS) * (ICON + ICON_GAP);
            const y = iconsY0 + Math.floor(i / COLS) * (ICON + ICON_GAP);
            return (
              <g key={i} aria-hidden className="animate-in fade-in duration-300 motion-reduce:animate-none">
                <rect x={x} y={y} width={ICON} height={ICON} rx={5} strokeWidth={1.5} className={cn(TONES[tone].softFill, TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                {store === "disk" ? (
                  <>
                    <line x1={x + 5} x2={x + ICON - 5} y1={y + 7} y2={y + 7} strokeWidth={1.75} strokeLinecap="round" className={TONES[tone].stroke} />
                    <line x1={x + 5} x2={x + ICON - 5} y1={y + 13} y2={y + 13} strokeWidth={1.75} strokeLinecap="round" className={TONES[tone].stroke} />
                  </>
                ) : (
                  <rect x={x + 6} y={y + 6} width={ICON - 12} height={ICON - 12} rx={2} className={TONES[tone].solidFill} />
                )}
              </g>
            );
          })}
          {more > 0 ? <text x={BLOCK.x + BLOCK.w / 2} y={BLOCK.y + BLOCK.h - 14} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>+ {formatCount(more)} more</text> : null}

          {/* The store switch sits under the phones. */}
          <text x={chipX} y={180} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>keep the latest places in</text>
          <RadioChipRow x={chipX} y={206} options={STORES.map((s) => ({ id: s.id, text: s.text, label: s.label }))} value={store} onChange={setStore} ariaLabel="Store for the latest places" />

          {/* Two rails: how many drivers, how often they report. */}
          <text x={RAIL.x0 - 26} y={DRIVER_RAIL_Y - 30} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>drivers online</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={DRIVER_RAIL_Y}
            stops={DRIVER_STEPS.map((v) => ({ value: v, label: v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1000}K` }))}
            value={drivers}
            onChange={setDrivers}
            ariaLabel="Drivers online"
            valueText={text}
          />
          <text x={RAIL.x0 - 26} y={GAP_RAIL_Y - 30} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>seconds between reports</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={GAP_RAIL_Y}
            stops={GAP_STEPS.map((v) => ({ value: v, label: `${v} s` }))}
            value={gap}
            onChange={setGap}
            ariaLabel="Seconds between reports"
            valueText={text}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{`${nodesText(nodes)} on ${store === "disk" ? "disk database" : "memory"} for ${reportsText(load.reports)}. ${verdict.text}.`}</p>
      </div>
    </BeatFrame>
  );
}
