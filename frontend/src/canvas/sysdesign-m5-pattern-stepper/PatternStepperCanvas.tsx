"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeDesignFrame, designFrame, nextPhase } from "../models/design-stepper";
import { PATTERNS, patternSpec, type PatternId } from "../models/cache-pattern";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DesignPicture } from "../primitives/design-stepper";
import { FOCUS_RING } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useStepper } from "../primitives/use-stepper";

// 5.3: pick one of five cache patterns, then step through the same four
// moments (read, write, crash the cache node, read again). The picture is the
// house design-stepper picture; this canvas adds the row of pattern chips.

export function PatternStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [pattern, setPattern] = useState<PatternId>("aside");
  const design = useMemo(() => patternSpec(pattern), [pattern]);
  const stepper = useStepper(design.steps.length);
  const { active, isLast } = stepper;
  const [phaseOf, setPhaseOf] = useState({ step: 0, phase: 0 });
  const phase = phaseOf.step === active ? phaseOf.phase : 0;
  const frame = designFrame(design, active, phase);

  const ref = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(ref);
  const { restart } = clock;
  useEffect(() => {
    restart();
  }, [active, phase, pattern, restart]);
  const advance = () => setPhaseOf({ step: active, phase: nextPhase(design, active, phase) });
  const choose = (id: PatternId) => {
    setPattern(id);
    setPhaseOf({ step: active, phase: 0 });
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={frame.hint}
      controls={
        <>
          <BeatButton onClick={stepper.prev}>
            <ChevronLeft aria-hidden className="size-4" />
            Back
          </BeatButton>
          {isLast ? (
            <BeatButton onClick={stepper.reset}>
              <RotateCcw aria-hidden className="size-4" />
              Start over
            </BeatButton>
          ) : (
            <BeatButton pressed onClick={stepper.next}>
              Next
              <ChevronRight aria-hidden className="size-4" />
            </BeatButton>
          )}
        </>
      }
    >
      <div onKeyDown={stepper.onKeyDown}>
        <div role="group" aria-label="Cache pattern" className="flex flex-wrap gap-1.5">
          {PATTERNS.map((p) => {
            const on = p.id === pattern;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => choose(p.id)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-full border px-2.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none sm:h-10",
                  FOCUS_RING,
                  on
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <ol aria-label="Steps" className="mt-1.5 grid grid-cols-4 gap-1.5">
          {design.steps.map((step, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => stepper.go(i)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${step.title}${done ? ", done" : ""}`}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-1 rounded-full border px-1.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none sm:h-10",
                    FOCUS_RING,
                    on
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950"
                      : done
                        ? "border-border bg-muted text-foreground hover:bg-muted/70"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {done ? <Check aria-hidden className="size-3.5 shrink-0" /> : <span aria-hidden className="font-mono text-xs tabular-nums">{i + 1}</span>}
                  <span className="truncate">{step.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div ref={ref} className="mt-2" onPointerDown={clock.freeze} onPointerUp={clock.unfreeze} onPointerLeave={clock.unfreeze} onPointerCancel={clock.unfreeze}>
          <DesignPicture design={design} frame={frame} seconds={clock.seconds} reduced={clock.reduced} onTap={advance} />
        </div>

        <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 px-1">
          {frame.action ? <BeatButton onClick={advance}>{frame.action.label}</BeatButton> : null}
          <p aria-live="polite" className="min-w-0 flex-1 text-sm text-foreground">
            <span className="sr-only">{`${PATTERNS.find((p) => p.id === pattern)?.label}, step ${active + 1}, ${frame.title}. ${describeDesignFrame(frame, design.steps.length)} `}</span>
            {frame.says}
          </p>
        </div>
      </div>
    </BeatFrame>
  );
}
