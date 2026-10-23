"use client";

import { useState } from "react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { Metric, Metrics, RangeControl, ResetButton, SegmentedControl, ToggleControl, WhatChanged } from "../primitives/controls";
import { TimelinePlayer } from "../renderers/timeline/TimelinePlayer";
import {
  describeTrueTimeChange,
  simulateTrueTime,
  trueTimeTrace,
  TRUETIME_BOUNDS,
  TRUETIME_DEFAULTS,
  type ClockErrors,
  type TrueTimeInputs,
} from "./model";

export function TrueTimeCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [inputs, setInputs] = useState<TrueTimeInputs>(TRUETIME_DEFAULTS);
  const [change, setChange] = useState("");
  const outcome = simulateTrueTime(inputs);
  const trace = trueTimeTrace(outcome);
  const atDefault = JSON.stringify(inputs) === JSON.stringify(TRUETIME_DEFAULTS);

  const update = (next: TrueTimeInputs) => {
    setChange(describeTrueTimeChange(inputs, next));
    setInputs(next);
  };

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <div className="space-y-5">
        <Metrics>
          <Metric label="Uncertainty, epsilon" value={outcome.inputs.epsilonMs} unit="ms" />
          <Metric label="Ranges overlap" value={outcome.rangesOverlap ? "Yes" : "No"} />
          <Metric label="Commit wait added" value={outcome.waitMs} unit="ms" />
          <Metric
            label="Order by timestamp"
            value={outcome.orderCorrect ? "Correct" : "Broken"}
            tone={outcome.orderCorrect ? "good" : "bad"}
          />
        </Metrics>

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Change the clocks</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">Predict first, then step through the run below.</p>
            </div>
            <ResetButton
              disabled={atDefault}
              onClick={() => {
                setInputs(TRUETIME_DEFAULTS);
                setChange("Back to epsilon 4 ms, a 2 ms gap, worst-case clocks and no commit wait.");
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeControl
              label="Clock uncertainty (epsilon)"
              value={outcome.inputs.epsilonMs}
              unit="ms"
              min={TRUETIME_BOUNDS.epsilonMs.min}
              max={TRUETIME_BOUNDS.epsilonMs.max}
              onChange={(epsilonMs) => update({ ...inputs, epsilonMs })}
            />
            <RangeControl
              label="Gap before Alice posts"
              value={outcome.inputs.gapMs}
              unit="ms"
              min={TRUETIME_BOUNDS.gapMs.min}
              max={TRUETIME_BOUNDS.gapMs.max}
              onChange={(gapMs) => update({ ...inputs, gapMs })}
            />
            <SegmentedControl<ClockErrors>
              label="How wrong are the clocks?"
              value={outcome.inputs.errors}
              options={[
                { value: "a-fast", label: "A fast, B slow" },
                { value: "exact", label: "Both exact" },
                { value: "a-slow", label: "A slow, B fast" },
              ]}
              onChange={(errors) => update({ ...inputs, errors })}
            />
            <ToggleControl
              label="Commit wait"
              description="A waits until T1's timestamp is surely in the past before saying done."
              checked={outcome.inputs.commitWait}
              onChange={(commitWait) => update({ ...inputs, commitWait })}
            />
          </div>
        </div>

        <TimelinePlayer trace={trace} title={title} runKey={JSON.stringify(outcome.inputs)} />

        <WhatChanged text={change} fallback="Try turning on commit wait, then try shrinking epsilon to 1 ms." />
        <CanvasNotes
          tryThis={[
            "Leave commit wait off and raise the gap until the order becomes correct. It flips once the gap is larger than how far apart the two clocks are.",
            "Turn commit wait on and set the gap to 1 ms. The order stays correct whatever the clocks do, and T1 pays 2 times epsilon in waiting.",
            "With commit wait on, move epsilon from 10 ms down to 1 ms. The wait shrinks with it: better clocks make every commit faster.",
          ]}
          limits={limits}
        />
      </div>
    </CanvasFrame>
  );
}
