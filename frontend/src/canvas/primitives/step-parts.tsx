"use client";

import { cn } from "@/lib/utils";
import { Chips } from "./canvas-frame";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "./tones";

/** Where a step sits relative to the current one. */
export type StepState = "active" | "done" | "todo";

export function KeyboardTip() {
  return (
    <p className="hidden text-xs text-muted-foreground sm:block">
      Tip: when this panel has focus, the left and right arrow keys move between steps.
    </p>
  );
}

/** The note under a step-through picture. A live region, so each step is read out. */
export function StepNote({
  index,
  count,
  title,
  note,
  chips,
  outcome,
  tone = "accent",
}: {
  index: number;
  count: number;
  title: string;
  note: string;
  chips?: string[];
  outcome?: string;
  tone?: Tone;
}) {
  const t = TONES[tone];
  return (
    <div aria-live="polite" className={cn("rounded-lg border border-l-4 border-border bg-card px-4 py-3", t.rule)}>
      <p className="font-mono text-xs text-muted-foreground">
        Step {index + 1} of {count}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        {outcome ? (
          <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-semibold ring-1 ring-inset", t.chip)}>
            {outcome}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{note}</p>
      <Chips items={chips ?? []} />
    </div>
  );
}

/** The numbered circle on an arrow: solid for the current step, outlined otherwise. */
export function StepBadge({
  x,
  y,
  n,
  state,
  tone = "accent",
}: {
  x: number;
  y: number;
  n: number;
  state: StepState;
  tone?: Tone;
}) {
  const t = TONES[tone];
  const on = state === "active";
  return (
    <g aria-hidden>
      <circle
        cx={x}
        cy={y}
        r={10}
        strokeWidth={1.5}
        className={cn(
          SHAPE_TRANSITION,
          on ? [t.solidFill, t.stroke] : [NEUTRAL.surface, state === "done" ? NEUTRAL.doneStroke : NEUTRAL.faintStroke]
        )}
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        className={cn("tabular-nums", on ? "fill-white dark:fill-gray-950" : NEUTRAL.mutedText)}
      >
        {n}
      </text>
    </g>
  );
}
