"use client";

import { useId, useState } from "react";
import { scaleLinear } from "d3-scale";
import { cn } from "@/lib/utils";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { Metric, Metrics, RangeControl, ResetButton, ToggleControl, WhatChanged } from "../primitives/controls";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import {
  BAKED_BOUNDS,
  DAYS,
  DEFAULT_INPUT,
  describeChange,
  ORDERS_BOUNDS,
  REACTION_DELAY,
  simulatePile,
  START_BOUNDS,
  type PileInput,
  type PileRun,
} from "./model";

const TRY_THIS = [
  "Before you move anything, predict what the pile does if orders fall from 7 to 6 a day. Then move the orders slider to 6 and check.",
  "Set orders to 5 a day. Expected: the pile of 12 shrinks by 1 a day and is empty by day 12.",
  "Set orders to 8 and the starting pile to 0, then turn on 'Customers react a week late'. Expected: the pile rises to 17, then falls, because customers act on old news.",
];

// The bar chart's drawing box. It scales to the panel width, so it fits a 375px phone.
const W = 320;
const H = 170;
const PAD = { left: 30, right: 8, top: 12, bottom: 26 };

export function OrderPileCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [state, setState] = useState<{ input: PileInput; previous: PileRun | null }>({ input: DEFAULT_INPUT, previous: null });
  const run = simulatePile(state.input);
  const changed = state.previous ? describeChange(state.previous, run) : "";

  const update = (patch: Partial<PileInput>) =>
    setState((old) => ({ input: { ...old.input, ...patch }, previous: simulatePile(old.input) }));
  const reset = () => setState((old) => ({ input: DEFAULT_INPUT, previous: simulatePile(old.input) }));
  const isDefault =
    state.input.ordersPerDay === DEFAULT_INPUT.ordersPerDay &&
    state.input.bakedPerDay === DEFAULT_INPUT.bakedPerDay &&
    state.input.startPile === DEFAULT_INPUT.startPile &&
    state.input.customersReact === DEFAULT_INPUT.customersReact;

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground">
        Huda&apos;s pile of waiting orders is a stock. New orders flow in, and the oven drains the pile by the cakes it bakes each day. The chart shows the orders still waiting at the end of each working day, for four weeks of six days.
      </p>

      <div aria-live="polite" className="mt-4">
        <Metrics>
          <Metric label="In minus out, day 1" value={formatSigned(run.firstDayChange)} unit="orders" />
          <Metric label={`Pile on day ${DAYS}`} value={run.endPile} unit="orders" />
          <Metric label="Highest pile" value={run.peakPile} unit="orders" />
          <Metric label={`Extra wait, day ${DAYS}`} value={run.endWaitDays} unit="days" />
        </Metrics>
      </div>

      <PileChart run={run} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RangeControl
          label="New orders"
          value={run.input.ordersPerDay}
          unit="a day"
          min={ORDERS_BOUNDS.min}
          max={ORDERS_BOUNDS.max}
          onChange={(value) => update({ ordersPerDay: value })}
        />
        <RangeControl
          label="Cakes baked"
          value={run.input.bakedPerDay}
          unit="a day"
          min={BAKED_BOUNDS.min}
          max={BAKED_BOUNDS.max}
          onChange={(value) => update({ bakedPerDay: value })}
        />
        <RangeControl
          label="Orders waiting at the start"
          value={run.input.startPile}
          unit="orders"
          min={START_BOUNDS.min}
          max={START_BOUNDS.max}
          onChange={(value) => update({ startPile: value })}
        />
        <ToggleControl
          label="Customers react a week late"
          description={`Each day of waiting that customers heard about ${REACTION_DELAY} working days ago turns away 1 order a day.`}
          checked={run.input.customersReact}
          onChange={(checked) => update({ customersReact: checked })}
        />
      </div>

      <div className="mt-4 space-y-3">
        <WhatChanged
          text={changed}
          fallback="Move a slider or the switch. This line will say what changed and why, in words."
        />
        <div className="flex justify-end">
          <ResetButton onClick={reset} disabled={isDefault} />
        </div>
      </div>

      <div className="mt-5">
        <CanvasNotes tryThis={TRY_THIS} limits={limits} />
      </div>
    </CanvasFrame>
  );
}

function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function PileChart({ run }: { run: PileRun }) {
  const titleId = useId();
  const descId = useId();
  const maxPile = Math.max(12, ...run.rows.map((row) => row.pile), run.input.startPile);
  const y = scaleLinear().domain([0, maxPile]).range([H - PAD.bottom, PAD.top]).nice();
  const top = y.domain()[1];
  const plotWidth = W - PAD.left - PAD.right;
  const slot = plotWidth / DAYS;
  const barWidth = Math.max(4, slot - 3);
  const weekEnds = run.rows.filter((row) => row.day % 6 === 0);

  return (
    <figure className="mt-4 rounded-xl border border-border bg-card p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby={`${titleId} ${descId}`}>
        <title id={titleId}>Orders waiting at the end of each day</title>
        <desc id={descId}>
          {`Starts at ${run.input.startPile}. End of each week: ${weekEnds.map((row) => `day ${row.day}, ${row.pile}`).join("; ")}.`}
        </desc>
        {y.ticks(4).map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} className={NEUTRAL.line} strokeWidth={1} />
            <text x={PAD.left - 4} y={y(tick) + 3} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[9px] tabular-nums")}>
              {tick}
            </text>
          </g>
        ))}
        {[6, 12, 18].map((day) => (
          <line
            key={day}
            x1={PAD.left + day * slot}
            x2={PAD.left + day * slot}
            y1={PAD.top}
            y2={H - PAD.bottom}
            className={NEUTRAL.faintStroke}
            strokeDasharray="2 3"
            strokeWidth={1}
          />
        ))}
        {run.rows.map((row, index) => {
          const x = PAD.left + index * slot + (slot - barWidth) / 2;
          const barTop = y(row.pile);
          return (
            <rect
              key={row.day}
              x={x}
              y={barTop}
              width={barWidth}
              height={Math.max(0, H - PAD.bottom - barTop)}
              rx={1.5}
              className={cn(TONES.accent.solidFill, SHAPE_TRANSITION)}
            />
          );
        })}
        {[1, 6, 12, 18, 24].map((day) => (
          <text
            key={day}
            x={PAD.left + (day - 0.5) * slot}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            className={cn(NEUTRAL.mutedText, "text-[9px] tabular-nums")}
          >
            {day}
          </text>
        ))}
        <text x={PAD.left + plotWidth / 2} y={H - 2} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[9px]")}>
          working day
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">
        Bars: orders still waiting at the end of each day (0 to {top}). Dotted lines mark the end of each week.
      </figcaption>
    </figure>
  );
}
