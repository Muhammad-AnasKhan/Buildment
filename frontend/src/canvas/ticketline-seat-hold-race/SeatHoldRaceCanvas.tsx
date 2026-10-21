"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { describeHoldRaceChange, HOLD_RACE_BOUNDS, simulateHoldRace, type HoldRaceInputs } from "./model";

const initial: HoldRaceInputs = { buyers: HOLD_RACE_BOUNDS.buyers.default, seats: HOLD_RACE_BOUNDS.seats.default };

export function SeatHoldRaceCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const buyerId = useId();
  const seatId = useId();
  const [inputs, setInputs] = useState<HoldRaceInputs>(initial);
  const [change, setChange] = useState("");
  const result = simulateHoldRace(inputs);
  const unchanged = inputs.buyers === initial.buyers && inputs.seats === initial.seats;

  function update(next: HoldRaceInputs) {
    setChange(describeHoldRaceChange(inputs, next));
    setInputs(next);
  }

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-relaxed text-foreground/85">Imagine all buyer requests arrive together and see the same remaining-seat count. Compare an unguarded check with one atomic reservation.</p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Buyer requests" value={result.buyers} unit="buyers" />
        <Metric label="Seats left" value={result.seats} unit="seats" />
        <Metric label="Unguarded" value={result.naive.oversold} unit="overbooked" warning={result.naive.oversold > 0} />
        <Metric label="Atomic" value={result.atomic.oversold} unit="overbooked" />
      </dl>

      <div className="mt-5 flex flex-col gap-5">
        <div className="order-2 rounded-xl border border-border bg-muted/15 px-4 py-4 sm:order-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-sm font-semibold text-foreground">Same requests, different result</h4><span className="text-xs text-muted-foreground">Each bar represents {result.buyers} buyer requests</span></div>
          <div className="mt-4 space-y-5">
            <RequestBar label="Separate read, then write" withinCapacity={Math.min(result.naive.accepted, result.seats)} overbooked={result.naive.oversold} refused={result.naive.rejected} total={result.buyers} />
            <RequestBar label="Atomic hold" withinCapacity={result.atomic.accepted} overbooked={0} refused={result.atomic.rejected} total={result.buyers} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Blue = within capacity · Red = accepted beyond capacity · Gray = refused</p>
        </div>

        <div className="order-1 sm:order-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h4 className="text-sm font-semibold text-foreground">Change the batch</h4><p className="mt-0.5 text-xs text-muted-foreground">Watch where the requests go when demand meets the remaining seats.</p></div>
            <button type="button" onClick={() => { setInputs(initial); setChange("Returned to six buyers and four seats."); }} disabled={unchanged} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10"><RotateCcw className="size-3.5" aria-hidden /> Reset</button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <RangeControl id={buyerId} label="Buyer requests" value={result.buyers} unit="buyers" min={HOLD_RACE_BOUNDS.buyers.min} max={HOLD_RACE_BOUNDS.buyers.max} onChange={(buyers) => update({ ...inputs, buyers })} />
            <RangeControl id={seatId} label="Available seats" value={result.seats} unit="seats" min={HOLD_RACE_BOUNDS.seats.min} max={HOLD_RACE_BOUNDS.seats.max} onChange={(seats) => update({ ...inputs, seats })} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3">
        <h4 className="text-sm font-semibold text-foreground">What changed</h4>
        <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-foreground/85">{change || "Try increasing buyer requests past the number of available seats."}</p>
      </div>
      <div className="mt-5"><CanvasNotes tryThis={["Set buyer requests to 3 while four seats remain. Both paths can accept everyone.", "Set available seats to 0. No request can pass either method.", "Raise buyers to 12 with four seats left. Compare the possible overbooking with the atomic refusals."]} limits={limits} /></div>
    </CanvasFrame>
  );
}

function Metric({ label, value, unit, warning = false }: { label: string; value: number; unit: string; warning?: boolean }) {
  return <div className={`rounded-xl border px-3 py-3 ${warning ? "border-red-500/35 bg-red-500/[0.07]" : "border-border bg-muted/25"}`}><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-semibold leading-none tabular-nums text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></dd></div>;
}

function RangeControl({ id, label, value, unit, min, max, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; onChange: (value: number) => void }) {
  return <div className="rounded-xl border border-border bg-muted/15 px-4 py-3"><div className="flex items-baseline justify-between gap-2"><label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label><span className="text-sm font-semibold tabular-nums text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></span></div><input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-valuetext={`${value} ${unit}`} className="mt-3 h-11 w-full cursor-pointer accent-blue-600 dark:accent-blue-400" /><div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>{min}</span><span>{max}</span></div></div>;
}

function RequestBar({ label, withinCapacity, overbooked, refused, total }: { label: string; withinCapacity: number; overbooked: number; refused: number; total: number }) {
  const share = (count: number) => total === 0 ? 0 : count / total * 100;
  return <div role="img" aria-label={`${label}: ${withinCapacity} within capacity, ${overbooked} accepted beyond capacity, ${refused} requests refused`}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs"><span className="font-semibold text-foreground">{label}</span><span className="text-muted-foreground">{withinCapacity} within · {overbooked} overbooked · {refused} refused</span></div>
    <div className="mt-2 flex h-5 overflow-hidden rounded-md bg-muted" aria-hidden>
      <span className="bg-blue-500 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${share(withinCapacity)}%` }} />
      <span className="bg-red-500 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${share(overbooked)}%` }} />
      <span className="bg-muted-foreground/40 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${share(refused)}%` }} />
    </div>
  </div>;
}
