"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "./tones";
import type { Stepper } from "./use-stepper";

type StepControlsProps = {
  stepper: Stepper;
  /** Step titles, so each numbered button says where it goes. */
  titles: string[];
};

// 44px touch targets on phones, the app's compact size from sm up.
const size = "h-11 min-w-11 gap-1.5 px-3 sm:h-8 sm:min-w-8";
const control = cn(buttonVariants({ variant: "outline" }), size, FOCUS_RING);
const primary = cn(buttonVariants({ variant: "default" }), size, FOCUS_RING);

/** Previous, Next, Play and Start over, then one numbered button per step. */
export function StepControls({ stepper, titles }: StepControlsProps) {
  const { active, playing, isFirst, isLast } = stepper;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} onClick={stepper.prev} disabled={isFirst}>
          <ChevronLeft aria-hidden />
          Back
        </button>
        <button
          type="button"
          className={primary}
          onClick={stepper.next}
          disabled={isLast}
        >
          Next
          <ChevronRight aria-hidden />
        </button>
        <button type="button" className={control} onClick={stepper.togglePlay} aria-pressed={playing}>
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={control} onClick={stepper.reset} disabled={isFirst && !playing}>
          <RotateCcw aria-hidden />
          Start over
        </button>
      </div>
      <ol className="flex flex-wrap gap-1.5" aria-label="Steps">
        {titles.map((title, i) => {
          const on = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => stepper.go(i)}
                aria-label={`Step ${i + 1}: ${title}`}
                aria-current={on ? "step" : undefined}
                className={cn(
                  "size-11 rounded-full border font-mono text-xs tabular-nums transition-colors sm:size-8",
                  FOCUS_RING,
                  on
                    ? "border-blue-600 bg-blue-600 font-bold text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950"
                    : i < active
                      ? "border-border bg-muted text-foreground hover:bg-muted/70"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
