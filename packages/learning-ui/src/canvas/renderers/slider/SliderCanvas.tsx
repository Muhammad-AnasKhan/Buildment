"use client";

import { useId, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CanvasFrame, CanvasNotes } from "../../primitives/canvas-frame";
import { ACCENT_CONTROL, FOCUS_RING, TONES } from "../../primitives/tones";
import { getCanvasSpec } from "../../registry";
import { buildSliderSpec, type PortableSliderData } from "../../models/portable";
import { barPercent, defaultValues, isDefault, withValue } from "./model";
import type { SliderInput, SliderSpec, SliderValues } from "./types";

/**
 * A small numeric model: move a slider, watch the outputs recalculate, read what changed.
 * The spec holds functions, which cannot cross from a server component to this client
 * component, so the canvas receives its slug and looks the spec up here.
 */
export function SliderCanvas({ slug }: { slug: string }) {
  const spec = getCanvasSpec(slug);
  if (!spec || spec.kind !== "slider") return null;
  return <SliderModel spec={spec} />;
}

/**
 * Declarative slider driven by plain data from a ```canvas fence (no functions across the RSC boundary).
 */
export function PortableSliderCanvas({ data }: { data: PortableSliderData }) {
  const spec = useMemo(() => buildSliderSpec(data), [data]);
  return <SliderModel spec={spec} />;
}

function SliderModel({ spec }: { spec: SliderSpec }) {
  const [values, setValues] = useState<SliderValues>(() => defaultValues(spec));
  const [change, setChange] = useState("");
  const result = spec.compute(values);
  const barMax = result.barMax ?? Math.max(1, ...(result.bars ?? []).map((bar) => bar.value));

  function update(next: SliderValues) {
    setChange(spec.describeChange(values, next));
    setValues(next);
  }

  return (
    <CanvasFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose}>
      <p className="text-sm leading-relaxed text-foreground/85">{spec.intro}</p>

      <dl aria-live="polite" className={cn("mt-5 grid gap-2 sm:gap-3", result.stats.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
        {result.stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-muted/15 px-3 py-3">
            <dt className="text-xs font-medium text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">{stat.value}</dd>
            {stat.detail ? <dd className="mt-1 text-[11px] leading-4 text-muted-foreground">{stat.detail}</dd> : null}
          </div>
        ))}
      </dl>
      <p className="sr-only">{result.summary}</p>

      {result.bars && result.bars.length > 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-muted/15 px-4 py-4" role="img" aria-label={result.bars.map((bar) => `${bar.label}: ${bar.display}`).join("; ")}>
          {spec.barsTitle ? <h4 className="text-xs font-semibold text-foreground">{spec.barsTitle}</h4> : null}
          <div className="mt-3 space-y-3">
            {result.bars.map((bar) => (
              <div key={bar.label} className="text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate font-medium text-foreground">{bar.label}</span>
                  <strong className="shrink-0 font-semibold tabular-nums text-foreground">{bar.display}</strong>
                </div>
                <div aria-hidden className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none", bar.tone ? TONES[bar.tone].bar : "bg-foreground/45")}
                    style={{ width: `${barPercent(bar.value, barMax)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {spec.inputs.map((input) => (
          <SliderControl key={input.id} input={input} value={values[input.id]!} onChange={(value) => update(withValue(spec, values, input.id, value))} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">What changed</h4>
          <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-foreground/85">{change || "Nothing yet. Predict first, then move one slider."}</p>
        </div>
        <button
          type="button"
          onClick={() => { setValues(defaultValues(spec)); setChange("Returned to the starting values."); }}
          disabled={isDefault(spec, values)}
          className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50", FOCUS_RING)}
        >
          <RotateCcw className="size-3.5" aria-hidden /> Reset
        </button>
      </div>

      <div className="mt-5"><CanvasNotes tryThis={spec.tryThis} limits={spec.limits} /></div>
    </CanvasFrame>
  );
}

function SliderControl({ input, value, onChange }: { input: SliderInput; value: number; onChange: (value: number) => void }) {
  const id = useId();
  const text = `${value.toLocaleString("en-US")} ${input.unit}`.trim();
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">{input.label}</label>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{text}</span>
      </div>
      <input
        id={id}
        type="range"
        min={input.min}
        max={input.max}
        step={input.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={text}
        className={cn("mt-3 h-10 w-full cursor-pointer rounded-md", ACCENT_CONTROL, FOCUS_RING)}
      />
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{input.min.toLocaleString("en-US")}</span>
        <span>{input.max.toLocaleString("en-US")}</span>
      </div>
    </div>
  );
}
