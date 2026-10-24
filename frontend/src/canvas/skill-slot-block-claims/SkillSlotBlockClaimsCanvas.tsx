"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { Metric, Metrics, ResetButton, ToggleControl, WhatChanged } from "../primitives/controls";
import { TONES } from "../primitives/tones";
import { DEFAULT_INPUT, EARLY_CLAIM, LATE_CLAIM, START_BOUNDS, formatMinute, simulateClaims, type ClaimInput, type ClaimRun } from "./model";

const TRY_THIS = [
  "Predict whether a 09:00 service fits with the 09:45 block already claimed. Then check which of its five blocks collides.",
  "Move the start to 10:00. The first existing claim is now outside the occupied interval. Turn on the 10:30 claim and check again.",
  "Turn both claims off, then move the start to 10:15. Its 11:15 buffer block still fits before the 11:30 window end.",
];

export function SkillSlotBlockClaimsCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [state, setState] = useState<{ input: ClaimInput; previous: ClaimRun | null }>({ input: DEFAULT_INPUT, previous: null });
  const run = simulateClaims(state.input);
  const update = (patch: Partial<ClaimInput>) => setState((old) => ({ input: { ...old.input, ...patch }, previous: simulateClaims(old.input) }));
  const reset = () => setState((old) => ({ input: DEFAULT_INPUT, previous: simulateClaims(old.input) }));
  const isDefault = state.input.start === DEFAULT_INPUT.start && state.input.earlyClaim === DEFAULT_INPUT.earlyClaim && state.input.lateClaim === DEFAULT_INPUT.lateClaim;
  const status = run.canHold ? "Candidate fits the visible claims" : `Collision at ${run.collisions.map(formatMinute).join(", ")}`;
  const changed = state.previous ? `${formatMinute(state.previous.input.start)} to ${formatMinute(run.input.start)}: ${status}. This interval needs ${run.needed.length} blocks, including its buffer.` : "";

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground">A 60-minute service plus a 15-minute cleanup buffer needs five provider blocks. Each block is a separate SlotClaim key. A start is a candidate only if every needed block is free, not merely its first block.</p>
      <div className="mt-4" aria-live="polite"><Metrics>
        <Metric label="Service starts" value={formatMinute(run.input.start)} />
        <Metric label="Occupied until" value={formatMinute(run.occupiedEnd)} />
        <Metric label="Claims needed" value={run.needed.length} unit="blocks" />
        <Metric label="Decision" value={run.canHold ? "Fits" : "Collides"} tone={run.canHold ? "good" : "bad"} />
      </Metrics></div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3 sm:p-4">
        <h4 className="text-sm font-semibold text-foreground">Provider grid, 09:00 to 11:30 UTC</h4>
        <p className="mt-1 text-xs text-muted-foreground">Each tile is one half-open 15-minute block. Service and buffer are both occupied time.</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10" role="list" aria-label="Provider claim blocks">
          {run.rows.map((row) => (
            <div key={row.minute} role="listitem" className={cn("min-h-16 rounded-lg border px-1.5 py-2 text-center", row.collision ? TONES.bad.chip : row.needed ? TONES.accent.chip : row.existing ? TONES.warn.chip : "border-border bg-muted/25 text-foreground")}>
              <div className="text-xs font-semibold tabular-nums">{formatMinute(row.minute)}</div>
              <div className="mt-1 text-[10px] leading-tight">{row.collision ? "Collision" : row.purpose === "buffer" ? "Buffer" : row.needed ? "Service" : row.existing ? "Claimed" : "Free"}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground" aria-live="polite">{status}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
          <div className="flex justify-between gap-2 text-sm font-semibold text-foreground">
            <label htmlFor="skill-slot-block-start">Requested start</label>
            <span className="tabular-nums">{formatMinute(run.input.start)} UTC</span>
          </div>
          <input id="skill-slot-block-start" type="range" min={START_BOUNDS.min} max={START_BOUNDS.max} step={15} value={run.input.start} onChange={(event) => update({ start: Number(event.currentTarget.value) })} aria-valuetext={`${formatMinute(run.input.start)} UTC`} className="mt-2 h-11 w-full accent-blue-600 dark:accent-blue-400" />
          <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>09:00</span><span>10:15</span></div>
        </div>
        <div className="rounded-xl border border-border bg-muted/15 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Chosen start: {formatMinute(run.input.start)}</span>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">The slider runs from 09:00 to 10:15 in 15-minute steps. A later start would put its buffer beyond the 11:30 window.</p>
        </div>
        <ToggleControl label={`Existing claim at ${formatMinute(EARLY_CLAIM)}`} description="Another booking owns this provider block." checked={run.input.earlyClaim} onChange={(earlyClaim) => update({ earlyClaim })} />
        <ToggleControl label={`Existing claim at ${formatMinute(LATE_CLAIM)}`} description="Turn this on to move the collision later." checked={run.input.lateClaim} onChange={(lateClaim) => update({ lateClaim })} />
      </div>
      <div className="mt-4 space-y-3">
        <WhatChanged text={changed} fallback="Move the start or a claim to see how the required five-block set changes." />
        <div className="flex justify-end"><ResetButton onClick={reset} disabled={isDefault} /></div>
      </div>
      <div className="mt-5"><CanvasNotes tryThis={TRY_THIS} limits={limits} /></div>
    </CanvasFrame>
  );
}
