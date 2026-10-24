"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { describeDesignFrame, designFrame } from "../models/design-stepper";
import { CHOICE_ROW_Y, checksText, crawlDesign, gbText, shardNumbers, SHARD_CHOICES, SHARDS_DEFAULT } from "../models/crawl-design";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DesignPicture } from "../primitives/design-stepper";
import { OverlayButton } from "../primitives/slider-zone";
import { FOCUS_RING, NEUTRAL } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useStepper } from "../primitives/use-stepper";

// 26.2: step DalilBot's design at peak, one block at a time. The picture is the
// house design-stepper picture; this canvas adds the shard choice in step 4
// (three chips inside the picture, real buttons laid over them).

const STEP_SHARDS = 3;
const CHIP_W = 104;
const CHIP_H = 30;
const CHIP_GAP = 10;

export function DesignStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [k, setK] = useState<number>(SHARDS_DEFAULT);
  const design = useMemo(() => crawlDesign(k), [k]);
  const stepper = useStepper(design.steps.length);
  const { active, isLast } = stepper;
  const frame = designFrame(design, active, 0);

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
  }, [active, k, restart]);

  const choosing = active === STEP_SHARDS;
  const totalW = SHARD_CHOICES.length * CHIP_W + (SHARD_CHOICES.length - 1) * CHIP_GAP;
  const left = (design.width - totalW) / 2;
  const chipX = (i: number) => left + i * (CHIP_W + CHIP_GAP);

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

        <div ref={ref} className="relative mt-2" onPointerDown={clock.freeze} onPointerUp={clock.unfreeze} onPointerLeave={clock.unfreeze} onPointerCancel={clock.unfreeze}>
          <DesignPicture design={design} frame={frame} seconds={clock.seconds} reduced={clock.reduced}>
            {choosing ? (
              <g aria-hidden>
                {SHARD_CHOICES.map((n, i) => {
                  const on = n === k;
                  return (
                    <g key={n}>
                      <rect
                        x={chipX(i)}
                        y={CHOICE_ROW_Y - CHIP_H / 2}
                        width={CHIP_W}
                        height={CHIP_H}
                        rx={CHIP_H / 2}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-colors duration-200 motion-reduce:transition-none",
                          on ? "fill-blue-600 stroke-blue-600 dark:fill-blue-400 dark:stroke-blue-400" : cn(NEUTRAL.surface, NEUTRAL.line)
                        )}
                      />
                      <text x={chipX(i) + CHIP_W / 2} y={CHOICE_ROW_Y + 4.5} textAnchor="middle" className={cn("text-[12.5px] font-semibold", on ? "fill-white dark:fill-blue-950" : NEUTRAL.text)}>
                        {n} shards
                      </text>
                    </g>
                  );
                })}
              </g>
            ) : null}
          </DesignPicture>
          {choosing
            ? SHARD_CHOICES.map((n, i) => {
                const s = shardNumbers(n);
                return (
                  <OverlayButton
                    key={n}
                    view={{ w: design.width, h: design.height }}
                    box={{ x: chipX(i), y: CHOICE_ROW_Y - 22, w: CHIP_W, h: 44 }}
                    label={`${n} shards, each ${gbText(s.gb)} and ${checksText(s.checks)} checks a second`}
                    pressed={n === k}
                    onClick={() => setK(n)}
                  />
                );
              })
            : null}
        </div>

        <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 px-1">
          <p aria-live="polite" className="min-w-0 flex-1 text-sm text-foreground">
            <span className="sr-only">{`Step ${active + 1}, ${frame.title}. ${describeDesignFrame(frame, design.steps.length)} `}</span>
            {frame.says}
          </p>
        </div>
      </div>
    </BeatFrame>
  );
}
