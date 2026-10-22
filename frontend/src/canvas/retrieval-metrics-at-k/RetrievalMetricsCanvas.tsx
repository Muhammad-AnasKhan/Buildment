"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { describeChange, formatMetric, K_BOUNDS, metricsAtK, RANKED_CHUNKS, type MetricsAtK } from "./model";

const TRY_THIS = [
  "Move k from 1 to 2. Expected: recall, precision and reciprocal rank all jump, because the first relevant chunk is at rank 2.",
  "Move k from 3 to 5. Expected: recall stays at 0.50 and precision falls, because ranks 4 and 5 add no relevant chunk.",
  "Find the smallest k where recall reaches 1.00. Expected: k = 9, with precision 0.44.",
];

export function RetrievalMetricsCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [state, setState] = useState<{ k: number; previous: MetricsAtK | null }>({ k: K_BOUNDS.default, previous: null });
  const sliderId = useId();
  const result = metricsAtK(state.k);
  const changed = describeChange(state.previous, result);

  const update = (next: number) => setState((old) => ({ k: next, previous: metricsAtK(old.k) }));

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground/85">
        Question: <span className="font-medium text-foreground">How many families got food parcels in March?</span> The retriever returned these 10 chunks in this order, and 4 of them are relevant. Predict what happens to recall and precision as you raise k, then move the slider.
      </p>

      <div aria-live="polite" className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Recall@k" value={formatMetric(result.recall)} detail={`${result.hits} of ${result.totalRelevant} relevant found`} />
        <Stat label="Precision@k" value={formatMetric(result.precision)} detail={`${result.hits} of ${result.k} kept are relevant`} />
        <Stat label="Reciprocal rank" value={formatMetric(result.reciprocalRank)} detail={result.firstRelevantRank === null ? "no relevant chunk yet" : `first relevant at rank ${result.firstRelevantRank}`} />
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={sliderId} className="text-sm font-medium text-foreground">Chunks to keep (k)</label>
          <span className="text-sm font-semibold tabular-nums text-foreground">k = {result.k}</span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={K_BOUNDS.min}
          max={K_BOUNDS.max}
          step={1}
          value={result.k}
          onChange={(event) => update(Number(event.target.value))}
          aria-valuetext={`k equals ${result.k}`}
          className="mt-3 h-10 w-full cursor-pointer accent-blue-600 dark:accent-blue-400"
        />
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground"><span>{K_BOUNDS.min}</span><span>{K_BOUNDS.max}</span></div>
      </div>

      <ol className="mt-5 space-y-1.5" aria-label={`Ranked results. The top ${result.k} are kept.`}>
        {RANKED_CHUNKS.map((chunk, index) => {
          const rank = index + 1;
          const kept = rank <= result.k;
          return (
            <li
              key={chunk.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-opacity motion-reduce:transition-none ${kept ? "border-border bg-card" : "border-dashed border-border/70 opacity-55"}`}
            >
              <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-foreground">{chunk.gist}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">{chunk.id}</span>
              </span>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${chunk.relevant ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/25" : "bg-muted text-muted-foreground ring-border"}`}>
                {chunk.relevant ? "relevant" : "not relevant"}
              </span>
              <span className="sr-only">{kept ? "kept" : "not kept"}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/85">What changed? {changed}</p>
        <button
          type="button"
          onClick={() => update(K_BOUNDS.default)}
          disabled={result.k === K_BOUNDS.default}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Reset
        </button>
      </div>

      <div className="mt-5"><CanvasNotes tryThis={TRY_THIS} limits={limits} /></div>
    </CanvasFrame>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-3 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p>
    </div>
  );
}
