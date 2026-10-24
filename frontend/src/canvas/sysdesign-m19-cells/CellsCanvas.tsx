"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { CELL_COUNTS, CUSTOMERS, DEFAULT_CELLS, POISON_CUSTOMER, affectedCustomers, cellOf, gridSpot, turnedCount, verdictFor } from "./model";

const W = 420;
const H = 424;
const GRID = { x0: 30, y0: 112, step: 24, r: 9 };
const ROUTER = { x: 18, y: 50, w: 240, h: 24 };
const PANEL = { x: 274, y: 100, w: 134 };
const RAIL = { x0: 60, x1: 360, y: 388 };

// One colour for each cell (red is kept for the cell that fails).
const CELL_FILL = [
  "fill-blue-500 dark:fill-blue-400",
  "fill-orange-500 dark:fill-orange-400",
  "fill-violet-500 dark:fill-violet-400",
  "fill-emerald-500 dark:fill-emerald-400",
  "fill-pink-500 dark:fill-pink-400",
  "fill-cyan-500 dark:fill-cyan-400",
  "fill-lime-500 dark:fill-lime-400",
  "fill-fuchsia-600 dark:fill-fuchsia-400",
  "fill-slate-500 dark:fill-slate-400",
  "fill-yellow-500 dark:fill-yellow-400",
];

const dotX = (col: number) => GRID.x0 + col * GRID.step;
const dotY = (row: number) => GRID.y0 + row * GRID.step;

/** 19.2 beat 4: drag the cell count, tap the poison customer, and count who is hit. */
export function CellsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [cells, setCells] = useState<number>(DEFAULT_CELLS);
  const [hit, setHit] = useState<{ since: number } | null>(null);

  const sent = hit !== null;
  const affected = affectedCustomers(cells);
  const elapsed = !hit ? 0 : clock.reduced ? Infinity : clock.seconds - hit.since;
  const turned = sent ? turnedCount(affected.length, elapsed) : 0;
  const verdict = verdictFor(cells, sent);
  const poisonCell = cellOf(POISON_CUSTOMER, cells);
  const poison = gridSpot(POISON_CUSTOMER);
  const pulse = sent || clock.reduced ? 0 : 2 * Math.sin(clock.seconds * 4);

  const send = () => setHit({ since: clock.seconds });
  const changeCells = (v: number) => {
    setCells(v);
    setHit((cur) => (cur ? { since: clock.seconds } : cur));
  };
  const reset = () => {
    setCells(DEFAULT_CELLS);
    setHit(null);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    send();
  };

  const description = sent
    ? `${cells} ${cells === 1 ? "cell" : "cells"}. The poison request from customer ${POISON_CUSTOMER} broke cell ${poisonCell}. ${affected.length} of ${CUSTOMERS} customers are affected.`
    : `${cells} ${cells === 1 ? "cell" : "cells"}, 100 customers dealt to the cells in turn. Tap customer ${POISON_CUSTOMER}, the poison request, to break its cell.`;

  const panelNote = sent ? ["red: broken cell", "grey: untouched"] : cells === 1 ? ["one cell holds", "all 100 customers"] : ["each colour is", "one cell"];

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the rail to choose the <b>cells</b>, then tap the poison customer.
        </>
      }
      controls={<BeatButton onClick={reset}>Reset</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The router sits in front of the cells once there is more than one. */}
          {cells >= 2 ? (
            <g aria-hidden>
              <rect x={ROUTER.x} y={ROUTER.y} width={ROUTER.w} height={ROUTER.h} rx={ROUTER.h / 2} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
              <text x={ROUTER.x + ROUTER.w / 2} y={ROUTER.y + 16.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12.5px] font-semibold")}>cell router</text>
            </g>
          ) : (
            <g aria-hidden>
              <rect x={ROUTER.x} y={ROUTER.y} width={ROUTER.w} height={ROUTER.h} rx={ROUTER.h / 2} strokeWidth={1.5} strokeDasharray="4 4" className={cn("fill-transparent", NEUTRAL.faintStroke)} />
              <text x={ROUTER.x + ROUTER.w / 2} y={ROUTER.y + 16.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>no router, one cell</text>
            </g>
          )}

          {/* The 100 customers. Cells are interleaved: the router decides, not the map. */}
          <g aria-hidden>
            {Array.from({ length: CUSTOMERS }, (_, k) => {
              const c = k + 1;
              const { row, col } = gridSpot(c);
              const cell = cellOf(c, cells);
              const idx = sent ? affected.indexOf(c) : -1;
              const red = idx >= 0 && idx < turned;
              const colour = !sent || (idx >= 0 && !red) ? CELL_FILL[cell - 1] : red ? TONES.bad.solidFill : "fill-muted-foreground/30";
              return (
                <g key={c}>
                  <circle cx={dotX(col)} cy={dotY(row)} r={GRID.r} className={cn(colour, "transition-colors duration-200 motion-reduce:transition-none")} />
                  {red && c !== POISON_CUSTOMER ? (
                    <path d={`M${dotX(col) - 3.5} ${dotY(row) - 3.5} l7 7 M${dotX(col) + 3.5} ${dotY(row) - 3.5} l-7 7`} strokeWidth={1.75} strokeLinecap="round" fill="none" className="stroke-white dark:stroke-red-950" />
                  ) : null}
                </g>
              );
            })}
          </g>

          {/* The poison customer: a halo, a warning icon and a tap target of 44 units. */}
          <g role="button" tabIndex={0} aria-label={`Customer ${POISON_CUSTOMER} sends the poison request`} aria-pressed={sent} className={cn("group cursor-pointer", FOCUS_RING)} onClick={send} onKeyDown={onKeyDown}>
            <circle cx={dotX(poison.col)} cy={dotY(poison.row)} r={22} className="fill-transparent" />
            {!sent ? <circle cx={dotX(poison.col)} cy={dotY(poison.row)} r={15 + pulse} strokeWidth={2} className={cn("fill-none", TONES.warn.stroke)} /> : null}
            <circle cx={dotX(poison.col)} cy={dotY(poison.row)} r={GRID.r + 1.5} strokeWidth={2} className={cn(sent && turned > 0 ? TONES.bad.solidFill : CELL_FILL[poisonCell - 1], "stroke-card transition-colors duration-200 motion-reduce:transition-none")} />
            <TriangleAlert x={dotX(poison.col) - 7} y={dotY(poison.row) - 7.5} width={14} height={14} strokeWidth={2.4} className="text-white dark:text-slate-950" aria-hidden />
            <circle cx={dotX(poison.col)} cy={dotY(poison.row)} r={19} className="fill-none opacity-0 group-focus-visible:opacity-100 stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
          </g>

          {/* The counter, and a key to the colours. */}
          <g>
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={68} rx={12} strokeWidth={sent ? 2 : 1.5} className={cn(NEUTRAL.surface, sent ? TONES[verdict.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={PANEL.x + 10} y={PANEL.y + 18} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>customers affected</text>
            <text x={PANEL.x + 10} y={PANEL.y + 54} className={cn(sent ? TONES[verdict.tone].text : NEUTRAL.text, "text-[28px] font-bold tabular-nums")}>{turned}</text>
            <text x={PANEL.x + PANEL.w - 10} y={PANEL.y + 54} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold tabular-nums")}>of {CUSTOMERS}</text>
          </g>
          <g aria-hidden>
            <TriangleAlert x={PANEL.x + 4} y={PANEL.y + 88} width={16} height={16} strokeWidth={2.2} className="text-amber-600 dark:text-amber-400" />
            <text x={PANEL.x + 26} y={PANEL.y + 101} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>poison request</text>
            <text x={PANEL.x + 26} y={PANEL.y + 117} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>customer {POISON_CUSTOMER}</text>
            {panelNote.map((line, i) => (
              <text key={line} x={PANEL.x + 4} y={PANEL.y + 150 + i * 15} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{line}</text>
            ))}
          </g>

          <text x={34} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>cells</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={CELL_COUNTS.map((v) => ({ value: v, label: String(v) }))}
            value={cells}
            onChange={changeCells}
            ariaLabel="Number of cells"
            valueText={`${cells} ${cells === 1 ? "cell" : "cells"}, ${100 / cells} customers in each`}
            knob={<text y={4.5} textAnchor="middle" className="fill-white text-[12.5px] font-bold dark:fill-blue-950">{cells}</text>}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
