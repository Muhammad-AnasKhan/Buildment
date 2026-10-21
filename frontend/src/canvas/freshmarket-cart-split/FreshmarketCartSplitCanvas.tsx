"use client";

import { useId, useState } from "react";
import { RotateCcw, ShoppingBasket } from "lucide-react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { splitCart, type CartSplitInputs } from "./model";

const initial: CartSplitInputs = { northItems: 2, southItems: 1 };

export function FreshmarketCartSplitCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [inputs, setInputs] = useState(initial);
  const northId = useId();
  const southId = useId();
  const result = splitCart(inputs);

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground/85">The customer sees one basket. FreshMarket groups its lines by store on the server, so each vendor receives only their own order.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/25 px-3 py-2 font-medium text-foreground"><ShoppingBasket className="size-4" aria-hidden /> {result.totalItems} cart items</span>
        <span aria-hidden className="text-muted-foreground">→</span>
        <span className="rounded-lg border border-blue-500/30 bg-blue-500/[0.07] px-3 py-2 font-medium text-foreground">{result.orderCount} store {result.orderCount === 1 ? "order" : "orders"}</span>
        <span aria-hidden className="text-muted-foreground">·</span>
        <span className="rounded-lg border border-border bg-muted/25 px-3 py-2 font-medium text-foreground">{result.paymentCount} checkout {result.paymentCount === 1 ? "attempt" : "attempts"}</span>
      </div>

      <div aria-live="polite" className="mt-5 grid gap-3 sm:grid-cols-2">
        {result.orders.length ? result.orders.map((order) => (
          <div key={order.store} className="rounded-xl border border-border bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vendor order</p>
            <p className="mt-1 text-base font-semibold text-foreground">{order.store}</p>
            <p className="mt-2 text-sm text-foreground/80">{order.items} {order.items === 1 ? "item" : "items"} from this store only</p>
          </div>
        )) : <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground sm:col-span-2">The basket is empty, so checkout creates no order.</p>}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <StoreControl id={northId} label="North Farm items" value={result.northItems} onChange={(northItems) => setInputs((old) => ({ ...old, northItems }))} />
        <StoreControl id={southId} label="South Bakery items" value={result.southItems} onChange={(southItems) => setInputs((old) => ({ ...old, southItems }))} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-6 text-foreground/85">What changed? {result.orderCount === 0 ? "An empty cart makes no orders or checkout attempt." : result.orderCount === 1 ? "One active store makes one vendor order and one checkout attempt." : "Two active stores make two vendor orders and one checkout attempt."}</p>
        <button type="button" onClick={() => setInputs(initial)} disabled={inputs.northItems === initial.northItems && inputs.southItems === initial.southItems} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw className="size-3.5" aria-hidden /> Reset</button>
      </div>

      <div className="mt-5"><CanvasNotes tryThis={["Set South Bakery to zero. Expected: only the North Farm order remains.", "Add one South Bakery item. Expected: a second vendor order appears, but checkout stays at one attempt.", "Clear both stores. Expected: no order or checkout attempt remains."]} limits={limits} /></div>
    </CanvasFrame>
  );
}

function StoreControl({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: number) => void }) {
  return <div className="rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center justify-between gap-2"><label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label><span className="text-sm font-semibold tabular-nums text-foreground">{value} items</span></div><input id={id} type="range" min={0} max={4} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-valuetext={`${value} items`} className="mt-3 h-10 w-full cursor-pointer accent-blue-600 dark:accent-blue-400" /><div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>0</span><span>4</span></div></div>;
}
