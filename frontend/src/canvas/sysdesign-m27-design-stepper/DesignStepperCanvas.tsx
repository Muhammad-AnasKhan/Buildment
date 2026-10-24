"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeDesignFrame, designFrame, nextPhase } from "../models/design-stepper";
import { lamhaDesign, SHARD_BOXES, SHARDS_SHOWN } from "../models/lamha-design";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DesignPicture } from "../primitives/design-stepper";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useStepper } from "../primitives/use-stepper";

// 27.2: step Lamha's design at peak, one block at a time. The picture is the
// house design-stepper picture; this canvas adds the hit-rate toggle of step 3
// (the house action) and the row of 16 shard boxes under the Counter in step 5.

const STEP_COUNTERS = 4;

export function DesignStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const design = useMemo(() => lamhaDesign(), []);
  const stepper = useStepper(design.steps.length);
  const { active, isLast } = stepper;
  const [phaseOf, setPhaseOf] = useState({ step: 0, phase: 0 });
  const phase = phaseOf.step === active ? phaseOf.phase : 0;
  const frame = designFrame(design, active, phase);

  const ref = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLOListElement>(null);
  // Keep the focus ring on the current step's chip when Back, Next or an arrow key moves the step.
  useEffect(() => {
    const list = chips.current;
    const current = list?.querySelectorAll("button")[active];
    if (list && current && list.contains(document.activeElement) && document.activeElement !== current) current.focus({ preventScroll: true });
  }, [active]);
  const clock = useBeatClock(ref);
  const { restart } = clock;
  useEffect(() => {
    restart();
  }, [active, phase, restart]);
  const advance = () => setPhaseOf({ step: active, phase: nextPhase(design, active, phase) });

  const showShards = active >= STEP_COUNTERS;
  const { perRow, size, gap } = SHARD_BOXES;
  const rowW = perRow * size + (perRow - 1) * gap;

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
        <ol ref={chips} aria-label="Design steps" className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
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
          <DesignPicture design={design} frame={frame} seconds={clock.seconds} reduced={clock.reduced} onTap={advance}>
            {showShards ? (
              <g aria-hidden>
                {SHARD_BOXES.y.map((y, row) =>
                  Array.from({ length: perRow }, (_, i) => (
                    <rect
                      key={`${row}-${i}`}
                      x={SHARD_BOXES.centerX - rowW / 2 + i * (size + gap)}
                      y={y - size / 2}
                      width={size}
                      height={size}
                      rx={3}
                      strokeWidth={1.5}
                      className={cn(TONES.good.softFill, TONES.good.stroke)}
                    />
                  ))
                )}
                <text x={SHARD_BOXES.centerX} y={SHARD_BOXES.labelY} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                  {`${SHARDS_SHOWN} shards`}
                </text>
              </g>
            ) : null}
          </DesignPicture>
        </div>

        <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 px-1">
          {frame.action ? (
            <BeatButton pressed={frame.action.toggle ? frame.action.pressed : undefined} onClick={advance}>
              {frame.action.label}
            </BeatButton>
          ) : null}
          <p aria-live="polite" className="min-w-0 flex-1 text-sm text-foreground">
            <span className="sr-only">{`Step ${active + 1}, ${frame.title}. ${describeDesignFrame(frame, design.steps.length)} `}</span>
            {frame.says}
          </p>
        </div>
      </div>
    </BeatFrame>
  );
}
