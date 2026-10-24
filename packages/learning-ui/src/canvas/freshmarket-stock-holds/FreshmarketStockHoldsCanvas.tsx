"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { calculateStockHold, STOCK_HOLD_BOUNDS, type StockHoldInputs } from "./model";

const initial: StockHoldInputs = {
  stock: STOCK_HOLD_BOUNDS.stock.default,
  held: STOCK_HOLD_BOUNDS.held.default,
  request: STOCK_HOLD_BOUNDS.request.default,
};

export function FreshmarketStockHoldsCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [inputs, setInputs] = useState(initial);
  const stockId = useId();
  const heldId = useId();
  const requestId = useId();
  const result = calculateStockHold(inputs);

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground/85">A shopper asks for {result.request} units. Predict whether FreshMarket can hold them, then change the numbers below.</p>

      <div aria-live="polite" className={`mt-5 rounded-xl border px-4 py-3 ${result.accepted ? "border-blue-500/30 bg-blue-500/[0.06]" : "border-amber-500/35 bg-amber-500/[0.07]"}`}>
        <p className="text-sm font-semibold text-foreground">{result.accepted ? `Hold accepted: ${result.request} units` : "Hold refused: not enough available"}</p>
        <p className="mt-1 text-sm leading-6 text-foreground/80">{result.accepted ? `${result.available} were available. The hold leaves ${result.afterHold.available} available for the next shopper.` : `Only ${result.available} are available. No counters change when the request is refused.`}</p>
      </div>

      <div className="mt-5 space-y-4 rounded-xl border border-border bg-muted/15 p-4">
        <InventoryBar label="Before checkout" stock={result.stock} held={result.held} available={result.available} sold={0} scale={result.stock} />
        <InventoryBar label={result.accepted ? "While payment is pending" : "No hold was created"} stock={result.afterHold.stock} held={result.afterHold.held} available={result.afterHold.available} sold={0} scale={result.stock} />
        <InventoryBar label={result.accepted ? "After payment succeeds" : "Request refused"} stock={result.afterPayment.stock} held={result.afterPayment.held} available={result.afterPayment.available} sold={result.accepted ? result.request : 0} scale={result.stock} />
        <p className="text-xs leading-5 text-muted-foreground">Blue = available · Amber = held · Gray = sold. Each bar uses the same original shelf size.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <RangeControl id={stockId} label="On the shelf" value={result.stock} min={0} max={20} onChange={(stock) => setInputs((old) => ({ ...old, stock, held: Math.min(old.held, stock) }))} />
        <RangeControl id={heldId} label="Already held" value={result.held} min={0} max={result.stock} onChange={(held) => setInputs((old) => ({ ...old, held }))} />
        <RangeControl id={requestId} label="New request" value={result.request} min={1} max={10} onChange={(request) => setInputs((old) => ({ ...old, request }))} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/85">What changed? {result.accepted ? "Payment removes the new hold and the sold units together. Available stock does not jump." : "The request exceeds available stock, so no hold or payment starts."}</p>
        <button type="button" onClick={() => setInputs(initial)} disabled={inputs.stock === initial.stock && inputs.held === initial.held && inputs.request === initial.request} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw className="size-3.5" aria-hidden /> Reset</button>
      </div>

      <div className="mt-5"><CanvasNotes tryThis={["Set the new request above the available units. Expected: the hold is refused and no counter changes.", "Set already held to zero. Expected: only the new request is held during payment.", "Set on the shelf to zero. Expected: every new request is refused."]} limits={limits} /></div>
    </CanvasFrame>
  );
}

function RangeControl({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <div className="rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center justify-between gap-2"><label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label><span className="text-sm font-semibold tabular-nums text-foreground">{value} units</span></div><input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-valuetext={`${value} units`} className="mt-3 h-10 w-full cursor-pointer accent-blue-600 dark:accent-blue-400" /><div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>{min}</span><span>{max}</span></div></div>;
}

function InventoryBar({ label, stock, held, available, sold, scale }: { label: string; stock: number; held: number; available: number; sold: number; scale: number }) {
  const pct = (count: number) => scale === 0 ? 0 : count / scale * 100;
  return <div role="img" aria-label={`${label}: ${stock} on shelf, ${held} held, ${available} available, ${sold} sold by this checkout`}><div className="flex flex-wrap items-baseline justify-between gap-1 text-xs"><span className="font-semibold text-foreground">{label}</span><span className="tabular-nums text-muted-foreground">{stock} shelf · {held} held · {available} available</span></div><div aria-hidden className="mt-2 flex h-5 overflow-hidden rounded-md bg-muted"><span className="bg-blue-500 transition-[width] motion-reduce:transition-none" style={{ width: `${pct(available)}%` }} /><span className="bg-amber-500 transition-[width] motion-reduce:transition-none" style={{ width: `${pct(held)}%` }} /><span className="bg-muted-foreground/45 transition-[width] motion-reduce:transition-none" style={{ width: `${pct(sold)}%` }} /></div></div>;
}
