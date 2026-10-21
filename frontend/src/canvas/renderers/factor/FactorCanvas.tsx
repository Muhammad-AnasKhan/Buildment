"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasFrame, CanvasNotes } from "../../primitives/canvas-frame";
import { defaultWeights, describeChange, maxTotal, scoreOptions, standing, type Weights } from "./model";
import type { FactorSpec } from "./types";

/** A small weighted comparison: change priorities and see the result recalculate. */
export function FactorCanvas({ spec }: { spec: FactorSpec }) {
  const initial = defaultWeights(spec);
  const [weights, setWeights] = useState<Weights>(initial);
  const [change, setChange] = useState("");
  const scored = scoreOptions(spec, weights);
  const result = standing(spec, scored.totals);
  const isDefault = spec.criteria.every((criterion) => weights[criterion.id] === initial[criterion.id]);
  const leader = spec.options.find((option) => option.id === result.leaders[0]);
  const resultText = result.tie
    ? `Tie at ${scored.totals[result.leaders[0]!]} ${spec.unit}`
    : `${leader?.name} leads by ${result.margin} ${result.margin === 1 ? spec.unit.replace(/s$/, "") : spec.unit}`;

  function update(next: Weights) {
    setChange(describeChange(spec, weights, next));
    setWeights(next);
  }

  return (
    <CanvasFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose}>
      <p className="text-sm leading-relaxed text-foreground/85">{spec.whatThisShows}</p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {spec.options.map((option) => {
          const leading = !result.tie && result.leaders[0] === option.id;
          return (
            <div key={option.id} className={cn("rounded-xl border px-3.5 py-3", leading ? "border-blue-500/60 bg-blue-500/10" : "border-border bg-muted/25")}>
              <dt className="text-xs font-medium text-muted-foreground">{option.name}</dt>
              <dd className="mt-1 text-2xl font-semibold leading-none tabular-nums text-foreground">{scored.totals[option.id]} <span className="text-xs font-normal text-muted-foreground">{spec.unit}</span></dd>
            </div>
          );
        })}
        <div className="col-span-2 rounded-xl border border-border bg-muted/25 px-3.5 py-3 sm:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">Current result</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug text-foreground">{resultText}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-5">
        <TotalBars spec={spec} totals={scored.totals} leaders={result.tie ? [] : result.leaders} className="order-2 sm:order-1" />
        <div className="order-1 sm:order-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Change what matters</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Set each weight, then compare the totals above.</p>
            </div>
            <button type="button" onClick={() => { setWeights(initial); setChange("Returned to the starting weights."); }} disabled={isDefault} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10">
              <RotateCcw className="size-3.5" aria-hidden /> Reset
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label="Weight scale">
            {spec.weightLevels.map((level) => <span key={level.value}><strong className="text-foreground">{level.value}</strong> {level.label}</span>)}
          </div>
          <div className="mt-3 space-y-2">
            {spec.criteria.map((criterion) => (
              <WeightControl
                key={criterion.id}
                spec={spec}
                criterionId={criterion.id}
                value={weights[criterion.id]!}
                onChange={(value) => update({ ...weights, [criterion.id]: value })}
                cells={spec.options.map((option) => ({ name: option.name, ...scored.cells[criterion.id]![option.id]! }))}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3">
        <h4 className="text-sm font-semibold text-foreground">What changed</h4>
        <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-foreground/85">{change || "Nothing yet. Change one weight to see how each offer's total moves."}</p>
      </div>
      <div className="mt-5"><CanvasNotes tryThis={spec.tryThis} limits={spec.limits} /></div>
    </CanvasFrame>
  );
}

function WeightControl({ spec, criterionId, value, onChange, cells }: {
  spec: FactorSpec;
  criterionId: string;
  value: number;
  onChange: (value: number) => void;
  cells: { name: string; score: number; weight: number; points: number }[];
}) {
  const name = useId();
  const criterion = spec.criteria.find((item) => item.id === criterionId)!;
  return (
    <fieldset className="rounded-xl border border-border bg-muted/15 px-3.5 py-3">
      <legend className="sr-only">{criterion.name} weight</legend>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{criterion.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Weight {value} · {spec.weightLevels.find((level) => level.value === value)?.label}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:w-52">
          {spec.weightLevels.map((level) => (
            <label key={level.value} className="relative cursor-pointer">
              <input type="radio" name={name} value={level.value} checked={value === level.value} onChange={() => onChange(level.value)} aria-label={`${criterion.name}: ${level.value}, ${level.label}`} className="peer sr-only" />
              <span className="flex min-h-11 items-center justify-center rounded-md text-sm font-semibold tabular-nums text-muted-foreground transition-colors hover:bg-card peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring sm:min-h-9">{level.value}</span>
            </label>
          ))}
        </div>
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-relaxed text-muted-foreground">
        {cells.map((cell) => <span key={cell.name}>{cell.name}: {cell.score} × {cell.weight} = <strong className="font-semibold tabular-nums text-foreground">{cell.points}</strong></span>)}
      </p>
    </fieldset>
  );
}

function TotalBars({ spec, totals, leaders, className }: {
  spec: FactorSpec;
  totals: Record<string, number>;
  leaders: string[];
  className?: string;
}) {
  const maximum = Math.max(maxTotal(spec), 1);
  return (
    <div className={cn("rounded-xl border border-border bg-muted/15 px-4 py-4", className)} role="img" aria-label={spec.options.map((option) => `${option.name}: ${totals[option.id]} ${spec.unit}`).join("; ")}>
      <div className="flex items-baseline justify-between gap-2"><h4 className="text-xs font-semibold text-foreground">Total score</h4><span className="text-xs text-muted-foreground">Out of {maximum} possible</span></div>
      <div className="mt-3 space-y-3">
        {spec.options.map((option) => <div key={option.id} className="grid grid-cols-[5rem_minmax(0,1fr)_2.25rem] items-center gap-2 text-xs sm:grid-cols-[6rem_minmax(0,1fr)_2.25rem]">
          <span className="truncate font-medium text-foreground">{option.name}</span>
          <div className="h-3 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none", leaders.includes(option.id) ? "bg-blue-500" : "bg-foreground/45")} style={{ width: `${Math.max(0, Math.min(100, (totals[option.id] ?? 0) / maximum * 100))}%` }} /></div>
          <strong className="text-right font-semibold tabular-nums text-foreground">{totals[option.id]}</strong>
        </div>)}
      </div>
    </div>
  );
}
