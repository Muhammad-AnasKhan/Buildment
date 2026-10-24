"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import type { Trace } from "../../sim";
import { StepControls } from "../../primitives/step-controls";
import { KeyboardTip, StepNote } from "../../primitives/step-parts";
import { FOCUS_RING } from "../../primitives/tones";
import { useStepper } from "../../primitives/use-stepper";
import { TimelineView } from "./TimelineView";

type TimelinePlayerProps = {
  trace: Trace;
  title: string;
  /**
   * Changes whenever the canvas inputs change. The first run starts at step 1
   * so the learner can predict; after an input changes, the player jumps to
   * the last step so the new outcome shows at once.
   */
  runKey: string;
};

/** A timeline the learner steps or plays through, with the step told in words. */
export function TimelinePlayer({ trace, title, runKey }: TimelinePlayerProps) {
  const count = trace.steps.length;
  const stepper = useStepper(count);
  const firstRun = useRef(runKey);
  const { go } = stepper;

  useEffect(() => {
    if (runKey !== firstRun.current) go(count - 1);
  }, [runKey, count, go]);

  const active = Math.min(stepper.active, count - 1);
  const step = trace.steps[active];
  if (!step) return null;

  return (
    <div
      role="group"
      aria-roledescription="step-through"
      aria-label={title}
      tabIndex={0}
      onKeyDown={stepper.onKeyDown}
      className={cn("space-y-4 rounded-xl", FOCUS_RING)}
    >
      <div className="rounded-xl border border-border bg-background/60 px-1 py-2">
        <TimelineView trace={trace} upToStep={active} layout="narrow" title={title} className="block sm:hidden" />
        <TimelineView trace={trace} upToStep={active} layout="wide" title={title} className="hidden sm:block" />
      </div>
      <StepNote index={active} count={count} title={step.title} note={step.note} outcome={step.outcome} tone={step.tone} />
      <StepControls stepper={{ ...stepper, active, isLast: active >= count - 1 }} titles={trace.steps.map((s) => s.title)} />
      <KeyboardTip />
    </div>
  );
}
