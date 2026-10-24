"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeDesignFrame, designFrame } from "../models/design-stepper";
import { CHOICE_ROW_Y, dardashaDesign, PARTITION_CHOICES, PARTITION_ROW, PARTITIONS_DEFAULT } from "../models/dardasha-design";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DesignPicture } from "../primitives/design-stepper";
import { OverlayButton } from "../primitives/slider-zone";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useStepper } from "../primitives/use-stepper";

// 22.2: step Dardasha's design at peak, one block at a time. The picture is the
// house design-stepper picture; this canvas adds the partition choice in
// step 3 (three chips inside the picture, real buttons laid over them) and the
// row of partitions under the store.

const STEP_PARTITIONS = 2;
const CHIP_W = 104;
const CHIP_H = 30;
const CHIP_GAP = 10;

export function DesignStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [k, setK] = useState<number>(PARTITIONS_DEFAULT);
  const design = useMemo(() => dardashaDesign(k), [k]);
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

  const choosing = active === STEP_PARTITIONS;
  const showPartitions = active >= STEP_PARTITIONS;
  const totalW = PARTITION_CHOICES.length * CHIP_W + (PARTITION_CHOICES.length - 1) * CHIP_GAP;
  const left = (design.width - totalW) / 2;
  const chipX = (i: number) => left + i * (CHIP_W + CHIP_GAP);
  const nodes = Array.from({ length: k }, (_, i) => i);
  const nodesW = k * PARTITION_ROW.size + (k - 1) * PARTITION_ROW.gap;
  const storePill = frame.actors.find((a) => a.id === "store")?.status?.text;

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
            {showPartitions ? (
              <g aria-hidden>
                {nodes.map((i) => {
                  const x = PARTITION_ROW.centerX - nodesW / 2 + i * (PARTITION_ROW.size + PARTITION_ROW.gap);
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={PARTITION_ROW.y - 8}
                      width={PARTITION_ROW.size}
                      height={16}
                      rx={4}
                      strokeWidth={1.5}
                      className={cn(TONES.good.softFill, TONES.good.stroke)}
                    />
                  );
                })}
              </g>
            ) : null}
            {choosing ? (
              <g aria-hidden>
                {PARTITION_CHOICES.map((n, i) => {
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
                        {n} partitions
                      </text>
                    </g>
                  );
                })}
              </g>
            ) : null}
          </DesignPicture>
          {choosing
            ? PARTITION_CHOICES.map((n, i) => (
                <OverlayButton
                  key={n}
                  view={{ w: design.width, h: design.height }}
                  box={{ x: chipX(i), y: CHOICE_ROW_Y - 22, w: CHIP_W, h: 44 }}
                  label={`Step 3, split the store, ${n} partitions${n === k && storePill ? `, store at ${storePill}` : ""}`}
                  pressed={n === k}
                  onClick={() => setK(n)}
                />
              ))
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
