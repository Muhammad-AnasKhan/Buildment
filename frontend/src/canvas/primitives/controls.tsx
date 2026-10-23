"use client";

import { useId, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { ACCENT_SELECTED, FOCUS_RING, TONES, type Tone } from "./tones";

// Controls and readouts shared by the kit canvases. The controls are the
// app's shadcn components (Base UI underneath), wrapped so every canvas
// shows a label, a value and a unit, and keeps 44px touch targets on phones.

/** A summary card: a label, a number and its unit. */
export function Metric({ label, value, unit, tone }: { label: string; value: ReactNode; unit?: string; tone?: Tone }) {
  return (
    <div className={cn("rounded-xl border px-3 py-3", tone ? cn("ring-1 ring-inset", TONES[tone].chip) : "border-border bg-muted/25")}>
      <dt className={cn("text-xs font-medium", tone ? "" : "text-muted-foreground")}>{label}</dt>
      <dd className="mt-1 text-xl font-semibold leading-none tabular-nums text-foreground">
        {value} {unit ? <span className="text-xs font-normal text-muted-foreground">{unit}</span> : null}
      </dd>
    </div>
  );
}

export function Metrics({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</dl>;
}

type RangeProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

/** A full-width slider with its label, value and unit always visible. */
export function RangeControl({ label, value, unit, min, max, step = 1, onChange }: RangeProps) {
  const labelId = useId();
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span id={labelId} className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        getAriaLabel={() => label}
        getAriaValueText={(_formatted, current) => `${current} ${unit}`}
        aria-labelledby={labelId}
        className="py-4"
      />
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

type Option<T extends string> = { value: T; label: string };

/** Two to four modes side by side, one always selected. */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Option<T>[]; onChange: (value: T) => void }) {
  const labelId = useId();
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
      <p id={labelId} className="text-sm font-semibold text-foreground">{label}</p>
      <ToggleGroup
        aria-labelledby={labelId}
        value={[value]}
        onValueChange={(next) => {
          // A segmented control never ends with nothing selected.
          const picked = next.find((item) => item !== value) ?? next[0];
          if (picked) onChange(picked as T);
        }}
        variant="outline"
        spacing={1}
        className="mt-3 grid w-full"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn("h-auto min-h-11 whitespace-normal px-2 text-center text-xs leading-tight sm:min-h-10", ACCENT_SELECTED)}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/** An on/off switch with a sentence saying what it does. */
export function ToggleControl({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/15 px-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="flex min-h-11 items-center gap-2 sm:min-h-10">
        <span aria-hidden className="text-xs font-semibold tabular-nums text-foreground">{checked ? "On" : "Off"}</span>
        <Switch id={id} checked={checked} onCheckedChange={onChange} />
      </span>
    </div>
  );
}

export function ResetButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10",
        FOCUS_RING
      )}
    >
      <RotateCcw className="size-3.5" aria-hidden /> Reset
    </button>
  );
}

/** The live "What changed" sentence. Explains the delta in words, not only a number. */
export function WhatChanged({ text, fallback }: { text: string; fallback: string }) {
  return (
    <div className={cn("rounded-xl border border-l-4 border-border bg-card px-4 py-3", TONES.accent.rule)}>
      <h4 className="text-sm font-semibold text-foreground">What changed</h4>
      <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-foreground">{text || fallback}</p>
    </div>
  );
}
