"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { Metric, Metrics, RangeControl, ResetButton, WhatChanged } from "../primitives/controls";
import { TONES } from "../primitives/tones";
import {
  BOUNDS,
  DEFAULT_INPUT,
  TIMELINE_END,
  TIMELINE_START,
  explainResult,
  formatMinute,
  simulateWindow,
  type ArrivalResult,
  type WindowInput,
  type WindowRun,
} from "./model";

const TRY_THIS = [
  "Predict the 11:31 maqluba order before changing anything. It fails the 11:10 dish cutoff, although the kitchen still has space.",
  "Move the first falafel arrival to exactly 12:00. At the cutoff is closed. Move it back to 11:59 to compare.",
  "Raise capacity to 7. The last falafel now fits, but the late maqluba still cannot enter. Explain why capacity and time are separate checks.",
];

function percentage(minute: number): number {
  return ((minute - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

function decisionLabel(row: ArrivalResult): string {
  if (row.decision === "cutoff") return "Past cutoff";
  if (row.decision === "capacity") return "No capacity";
  return "Accepted";
}

function changeSentence(before: WindowRun | null, after: WindowRun): string {
  if (!before) return "";
  const parts: string[] = [];
  if (before.slowCutoff !== after.slowCutoff) parts.push(`Maqluba closes at ${formatMinute(after.slowCutoff)} instead of ${formatMinute(before.slowCutoff)}.`);
  if (before.fastCutoff !== after.fastCutoff) parts.push(`Falafel closes at ${formatMinute(after.fastCutoff)} instead of ${formatMinute(before.fastCutoff)}.`);
  if (before.input.capacity !== after.input.capacity) parts.push(`Capacity is now ${after.input.capacity} units.`);
  if (before.accepted !== after.accepted || before.rejectedCutoff !== after.rejectedCutoff || before.rejectedCapacity !== after.rejectedCapacity) {
    parts.push(`${after.accepted} accepted, ${after.rejectedCutoff} past cutoff and ${after.rejectedCapacity} over capacity.`);
  }
  if (parts.length === 0) parts.push(`The result remains ${after.accepted} accepted, ${after.rejectedCutoff} past cutoff and ${after.rejectedCapacity} over capacity.`);
  return parts.join(" ");
}

export function SufraWindowFillCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [state, setState] = useState<{ input: WindowInput; previous: WindowRun | null }>({ input: DEFAULT_INPUT, previous: null });
  const run = simulateWindow(state.input);
  const update = (patch: Partial<WindowInput>) => setState((old) => ({ input: { ...old.input, ...patch }, previous: simulateWindow(old.input) }));
  const changeArrival = (id: string, minute: number) => update({ arrivals: state.input.arrivals.map((arrival) => arrival.id === id ? { ...arrival, minute } : arrival) });
  const reset = () => setState((old) => ({ input: DEFAULT_INPUT, previous: simulateWindow(old.input) }));
  const isDefault = JSON.stringify(state.input) === JSON.stringify(DEFAULT_INPUT);

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground">
        One dated kitchen window begins at 13:00. The general cutoff is 12:00 by default, but a dish can close earlier when its prep time plus a 20-minute buffer needs more lead. Orders are checked in arrival order. A closed dish stays closed even while capacity remains.
      </p>

      <div aria-live="polite" className="mt-4">
        <Metrics>
          <Metric label="General cutoff" value={formatMinute(run.generalCutoff)} />
          <Metric label="Maqluba cutoff" value={formatMinute(run.slowCutoff)} tone="warn" />
          <Metric label="Falafel cutoff" value={formatMinute(run.fastCutoff)} tone="accent" />
          <Metric label="Window filled" value={`${run.used}/${run.input.capacity}`} unit="units" />
        </Metrics>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3 sm:p-4">
        <h4 className="text-sm font-semibold text-foreground">One kitchen, one 13:00 window</h4>
        <p className="mt-1 text-xs text-muted-foreground">Colored track: arrivals must be earlier than that dish&apos;s cutoff. The 13:00 mark is delivery-window start, not an order deadline.</p>
        <div className="mt-4 space-y-4">
          <CutoffTrack label="Maqluba" cutoff={run.slowCutoff} tone="warn" />
          <CutoffTrack label="Falafel" cutoff={run.fastCutoff} tone="accent" />
        </div>
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground" aria-hidden="true">
          <span>10:30</span><span>11:00</span><span>11:30</span><span>12:00</span><span>12:30</span><span>13:00</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RangeControl label="Kitchen capacity" value={run.input.capacity} unit="units" min={BOUNDS.capacity.min} max={BOUNDS.capacity.max} onChange={(capacity) => update({ capacity })} />
        <RangeControl label="General cutoff lead" value={run.input.generalLead} unit="minutes" min={BOUNDS.generalLead.min} max={BOUNDS.generalLead.max} step={5} onChange={(generalLead) => update({ generalLead })} />
        <RangeControl label="Maqluba prep" value={run.input.slowPrep} unit="minutes" min={BOUNDS.slowPrep.min} max={BOUNDS.slowPrep.max} step={5} onChange={(slowPrep) => update({ slowPrep })} />
        <RangeControl label="Maqluba load" value={run.input.slowLoad} unit="units" min={BOUNDS.slowLoad.min} max={BOUNDS.slowLoad.max} onChange={(slowLoad) => update({ slowLoad })} />
        <RangeControl label="Falafel prep" value={run.input.fastPrep} unit="minutes" min={BOUNDS.fastPrep.min} max={BOUNDS.fastPrep.max} step={5} onChange={(fastPrep) => update({ fastPrep })} />
        <RangeControl label="Falafel load" value={run.input.fastLoad} unit="units" min={BOUNDS.fastLoad.min} max={BOUNDS.fastLoad.max} onChange={(fastLoad) => update({ fastLoad })} />
      </div>

      <h4 className="mt-5 text-sm font-semibold text-foreground">Order arrivals</h4>
      <p className="mt-1 text-xs text-muted-foreground">Each slider is a server receipt time on this dated kitchen day. Simultaneous arrivals use the order shown here.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {run.input.arrivals.map((arrival, index) => (
          <ArrivalControl key={arrival.id} number={index + 1} dish={arrival.dish} minute={arrival.minute} onChange={(minute) => changeArrival(arrival.id, minute)} />
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <h4 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Decision timeline</h4>
        <ol className="divide-y divide-border">
          {run.results.map((row) => (
            <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[5rem_6rem_7rem_1fr] sm:items-center sm:gap-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{formatMinute(row.minute)}</span>
              <span className="text-sm text-foreground">{row.dish === "slow" ? "Maqluba" : "Falafel"}</span>
              <span className={cn("w-fit rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset", TONES[row.decision === "accepted" ? "good" : row.decision === "cutoff" ? "warn" : "bad"].chip)}>{decisionLabel(row)}</span>
              <span className="text-xs leading-5 text-muted-foreground">{explainResult(row)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 space-y-3">
        <WhatChanged text={changeSentence(state.previous, run)} fallback="Move a control to see which cutoff or capacity decision changed." />
        <div className="flex justify-end"><ResetButton onClick={reset} disabled={isDefault} /></div>
      </div>
      <div className="mt-5"><CanvasNotes tryThis={TRY_THIS} limits={limits} /></div>
    </CanvasFrame>
  );
}

function CutoffTrack({ label, cutoff, tone }: { label: string; cutoff: number; tone: "warn" | "accent" }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{label}</span><span className="tabular-nums text-foreground">closes {formatMinute(cutoff)}</span></div>
      <div className="relative mt-1 h-3 rounded-full bg-muted" role="img" aria-label={`${label} accepts arrivals before ${formatMinute(cutoff)}`}>
        <div className={cn("h-3 rounded-full", TONES[tone].bar)} style={{ width: `${percentage(cutoff)}%` }} />
        <span className="absolute top-[-3px] h-[18px] w-0.5 bg-foreground" style={{ left: `${percentage(cutoff)}%` }} aria-hidden="true" />
      </div>
    </div>
  );
}

function ArrivalControl({ number, dish, minute, onChange }: { number: number; dish: "slow" | "fast"; minute: number; onChange: (minute: number) => void }) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
      <div className="flex justify-between gap-2 text-sm font-semibold text-foreground">
        <label htmlFor={`sufra-arrival-${number}`}>Order {number}: {dish === "slow" ? "Maqluba" : "Falafel"}</label>
        <span className="tabular-nums">{formatMinute(minute)}</span>
      </div>
      <input id={`sufra-arrival-${number}`} type="range" min={BOUNDS.arrival.min} max={BOUNDS.arrival.max} step={1} value={minute} onChange={(event) => onChange(Number(event.currentTarget.value))} className="mt-2 h-11 w-full accent-blue-600 dark:accent-blue-400" aria-valuetext={formatMinute(minute)} />
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>10:30</span><span>12:15</span></div>
    </div>
  );
}
