"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CanvasFrame, CanvasNotes } from "../../primitives/canvas-frame";
import { FOCUS_RING, NEUTRAL, TONES } from "../../primitives/tones";
import { defaultWeights, describeChange, maxTotal, scoreOptions, standing, type Weights } from "./model";
import type { FactorSpec } from "./types";

/**
 * Flip a factor and see the effect: the learner changes how much each
 * criterion matters, and the totals, the bars and a "what changed" sentence
 * update at once. HTML radio groups are the controls; the SVG only draws bars.
 */
export function FactorCanvas({ spec }: { spec: FactorSpec }) {
  const initial = defaultWeights(spec);
  const [weights, setWeights] = useState<Weights>(initial);
  const [change, setChange] = useState("");
  const scored = scoreOptions(spec, weights);
  const result = standing(spec, scored.totals);
  const isDefault = spec.criteria.every((c) => weights[c.id] === initial[c.id]);

  function update(next: Weights) {
    setChange(describeChange(spec, weights, next));
    setWeights(next);
  }

  const resultText = result.tie
    ? `Tie at ${scored.totals[result.leaders[0]!]} ${spec.unit}`
    : `${spec.options.find((o) => o.id === result.leaders[0])?.name} ahead by ${result.margin}`;

  return (
    <CanvasFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose}>
      <p className="text-sm leading-relaxed text-foreground/85">{spec.whatThisShows}</p>

      {/* Summary first: the numbers the learner wants before anything else. */}
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {spec.options.map((o) => {
          const leading = !result.tie && result.leaders[0] === o.id;
          return (
            <div
              key={o.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                leading ? "border-blue-600/60 bg-blue-50/60 dark:border-blue-400/40 dark:bg-blue-500/10" : "border-border bg-muted/40"
              )}
            >
              <dt className="text-xs font-medium text-muted-foreground">{o.name}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {scored.totals[o.id]} <span className="text-xs font-normal text-muted-foreground">{spec.unit}</span>
              </dd>
            </div>
          );
        })}
        <div className="col-span-2 rounded-lg border border-border bg-muted/40 px-3 py-2 sm:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">Result</dt>
          <dd className="mt-0.5 text-base font-semibold text-foreground">{resultText}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-4">
        <TotalsChart spec={spec} totals={scored.totals} leaders={result.tie ? [] : result.leaders} className="order-2 sm:order-1" />

        <div className="order-1 space-y-3 sm:order-2">
          {spec.criteria.map((c) => (
            <WeightControl
              key={c.id}
              spec={spec}
              criterionId={c.id}
              value={weights[c.id]!}
              onChange={(value) => update({ ...weights, [c.id]: value })}
              cells={spec.options.map((o) => ({ name: o.name, ...scored.cells[c.id]![o.id]! }))}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">What changed</h4>
          <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-foreground/85">
            {change || "Nothing yet. Change one weight and watch the totals."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => update(initial)}
          disabled={isDefault}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-1.5 px-3 sm:h-8", FOCUS_RING)}
        >
          <RotateCcw aria-hidden />
          Reset weights
        </button>
      </div>

      <div className="mt-4">
        <CanvasNotes tryThis={spec.tryThis} limits={spec.limits} />
      </div>
    </CanvasFrame>
  );
}

function WeightControl({
  spec,
  criterionId,
  value,
  onChange,
  cells,
}: {
  spec: FactorSpec;
  criterionId: string;
  value: number;
  onChange: (value: number) => void;
  cells: { name: string; score: number; weight: number; points: number }[];
}) {
  const name = useId();
  const criterion = spec.criteria.find((c) => c.id === criterionId)!;
  return (
    <fieldset className="rounded-lg border border-border px-3 pb-3 pt-2">
      <legend className="px-1 text-sm font-semibold text-foreground">
        {criterion.name}
        <span className="ml-1.5 font-normal text-muted-foreground">weight {value}</span>
      </legend>
      <div className={cn("grid gap-1.5")} style={{ gridTemplateColumns: `repeat(${spec.weightLevels.length}, minmax(0, 1fr))` }}>
        {spec.weightLevels.map((level) => (
          <label key={level.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={level.value}
              checked={value === level.value}
              onChange={() => onChange(level.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-md border border-border bg-card px-1 py-1 text-center transition-colors",
                "hover:bg-muted peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-900",
                "dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-500/15 dark:peer-checked:text-blue-100",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card dark:peer-focus-visible:ring-blue-400"
              )}
            >
              <span className="text-sm font-semibold tabular-nums">{level.value}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">{level.label}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        {cells.map((cell) => (
          <span key={cell.name}>
            {cell.name}: {cell.score} x {cell.weight} = <span className="font-semibold text-foreground">{cell.points}</span>
          </span>
        ))}
      </p>
    </fieldset>
  );
}

// Two fixed sizes, shown one at a time by CSS, so the labels stay readable
// on a phone without the picture being measured in JavaScript.
const CHART = {
  narrow: { width: 320, labelW: 74, valueRoom: 64, rowH: 34, font: 13, axisFont: 11 },
  wide: { width: 640, labelW: 110, valueRoom: 90, rowH: 36, font: 14, axisFont: 12 },
} as const;

function TotalsChart({
  spec,
  totals,
  leaders,
  className,
}: {
  spec: FactorSpec;
  totals: Record<string, number>;
  leaders: string[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-background/60 px-2 py-2", className)}>
      <TotalsSvg spec={spec} totals={totals} leaders={leaders} size="narrow" className="block sm:hidden" />
      <TotalsSvg spec={spec} totals={totals} leaders={leaders} size="wide" className="hidden sm:block" />
    </div>
  );
}

function TotalsSvg({
  spec,
  totals,
  leaders,
  size,
  className,
}: {
  spec: FactorSpec;
  totals: Record<string, number>;
  leaders: string[];
  size: keyof typeof CHART;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "") + size;
  const c = CHART[size];
  const max = Math.max(maxTotal(spec), 1);
  const plotW = c.width - c.labelW - c.valueRoom;
  const height = spec.options.length * c.rowH + 24;
  const description = spec.options.map((o) => `${o.name}: ${totals[o.id]} ${spec.unit}`).join(". ");

  return (
    <svg
      viewBox={`0 0 ${c.width} ${height}`}
      preserveAspectRatio="xMidYMin meet"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
    >
      <title id={`${uid}-title`}>{`Total ${spec.unit} for each option`}</title>
      <desc id={`${uid}-desc`}>{`${description}.`}</desc>
      {spec.options.map((o, i) => {
        const y = i * c.rowH + 6;
        const total = totals[o.id] ?? 0;
        const ratio = Math.max(0, Math.min(1, total / max));
        const lead = leaders.includes(o.id);
        return (
          <g key={o.id}>
            <text x={c.labelW - 8} y={y + 18} textAnchor="end" fontSize={c.font} fontWeight={600} className={NEUTRAL.text}>
              {o.name}
            </text>
            <rect x={c.labelW} y={y + 4} width={plotW} height={20} rx={3} className="fill-muted" />
            {/* Scale a full-width bar instead of changing its width, so the change can animate. */}
            <rect
              x={c.labelW}
              y={y + 4}
              width={plotW}
              height={20}
              rx={3}
              style={{ transform: `scaleX(${ratio})` }}
              className={cn(
                "origin-left transition-transform duration-200 [transform-box:fill-box] motion-reduce:transition-none",
                lead ? TONES.accent.solidFill : NEUTRAL.doneFill
              )}
            />
            <text
              x={c.labelW + ratio * plotW + 6}
              y={y + 19}
              fontSize={c.font}
              fontWeight={700}
              className={cn("tabular-nums", NEUTRAL.text)}
            >
              {total}
              {lead ? " ahead" : ""}
            </text>
          </g>
        );
      })}
      <text x={c.labelW} y={height - 4} fontSize={c.axisFont} className={NEUTRAL.mutedText}>
        0
      </text>
      <text x={c.labelW + plotW} y={height - 4} fontSize={c.axisFont} textAnchor="end" className={NEUTRAL.mutedText}>
        {`${max} most possible`}
      </text>
    </svg>
  );
}
