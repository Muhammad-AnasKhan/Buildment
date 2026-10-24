"use client";

import { useState } from "react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { Metric, Metrics, RangeControl, ResetButton, SegmentedControl, WhatChanged } from "../primitives/controls";
import { TimelinePlayer } from "../renderers/timeline/TimelinePlayer";
import { describeLagChange, lagTrace, LAG_BOUNDS, LAG_DEFAULTS, NAMES, READ_SPACING_MS, ROUTING_LABEL, simulateLag, type LagInputs, type Routing } from "./model";

export function ReplicaLagCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [inputs, setInputs] = useState<LagInputs>(LAG_DEFAULTS);
  const [change, setChange] = useState("");
  const outcome = simulateLag(inputs);
  const trace = lagTrace(outcome);
  const atDefault = JSON.stringify(inputs) === JSON.stringify(LAG_DEFAULTS);

  const update = (next: LagInputs) => {
    setChange(describeLagChange(inputs, next));
    setInputs(next);
  };

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <div className="space-y-5">
        <Metrics>
          <Metric label="Slow replica lag" value={outcome.slowLagMs} unit="ms" />
          <Metric label="Missed own write" value={`${outcome.missedOwnWrite} of 3`} tone={outcome.missedOwnWrite > 0 ? "bad" : "good"} />
          <Metric label="Went back in time" value={`${outcome.wentBackInTime} of 3`} tone={outcome.wentBackInTime > 0 ? "bad" : "good"} />
          <Metric label="Reads on the leader" value={`${outcome.leaderReads} of 3`} />
        </Metrics>

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Change the lag and the routing</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">Amna refreshes three times, {READ_SPACING_MS} ms apart. Predict, then step through.</p>
            </div>
            <ResetButton
              disabled={atDefault}
              onClick={() => {
                setInputs(LAG_DEFAULTS);
                setChange("Back to 600 ms of lag, a first refresh at 200 ms, and reads from any replica.");
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeControl
              label="Slow replica lag"
              value={outcome.inputs.lagMs}
              unit="ms"
              min={LAG_BOUNDS.lagMs.min}
              max={LAG_BOUNDS.lagMs.max}
              step={LAG_BOUNDS.lagMs.step}
              onChange={(lagMs) => update({ ...inputs, lagMs })}
            />
            <RangeControl
              label="First refresh after posting"
              value={outcome.inputs.firstReadMs}
              unit="ms"
              min={LAG_BOUNDS.firstReadMs.min}
              max={LAG_BOUNDS.firstReadMs.max}
              step={LAG_BOUNDS.firstReadMs.step}
              onChange={(firstReadMs) => update({ ...inputs, firstReadMs })}
            />
          </div>
          <SegmentedControl<Routing>
            label="Where do Amna's reads go?"
            value={outcome.inputs.routing}
            options={(["any", "leader", "token"] as const).map((value) => ({ value, label: ROUTING_LABEL[value] }))}
            onChange={(routing) => update({ ...inputs, routing })}
          />
        </div>

        <TimelinePlayer trace={trace} title={title} runKey={JSON.stringify(outcome.inputs)} />

        <ol className="grid gap-1.5 text-sm text-foreground sm:grid-cols-3" aria-label="What each refresh showed">
          {outcome.reads.map((read, i) => (
            <li key={read.at} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <span className="font-semibold tabular-nums">Refresh {i + 1}</span> at {read.at} ms, {NAMES[read.target]}:{" "}
              <span className="font-semibold">{read.saw ? "shows the comment" : "comment missing"}</span>
            </li>
          ))}
        </ol>

        <WhatChanged text={change} fallback="Try routing to the replica at my position, then compare reads on the leader." />
        <CanvasNotes
          tryThis={[
            "With any replica, set the lag to 0. Nothing breaks, because there is no lag to see. Lag, not replication, causes the bug.",
            "With any replica, move the first refresh to 450 ms. Nothing breaks, even though that is before the 600 ms lag: only refresh 2 goes to replica 2, and it now lands after replica 2 catches up.",
            "Compare leader for own reads with replica at my position. Both fix the bug, but only one keeps her reads off the leader once a replica catches up.",
          ]}
          limits={limits}
        />
      </div>
    </CanvasFrame>
  );
}
