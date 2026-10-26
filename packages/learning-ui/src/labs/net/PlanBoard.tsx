"use client";

// Plan mode: one parent block drawn as an address line, one input per group.
// Each block the learner writes is drawn on the line where it really sits, so
// a gap, an overlap or a block outside the parent is visible before the
// checks say so.

import { useMemo, useState } from "react";
import type { NetSolution } from "../types";
import { PlanSolution } from "./NetSolution";
import type { PlanSpec } from "./plan";
import { blockRange, checkPlan } from "./plan";
import type { Cidr } from "./ip";
import { networkOf, parseCidr, usableHosts } from "./ip";

const TONES = ["bg-sky-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500", "bg-lime-500", "bg-fuchsia-500"];

export function PlanBoard({ plan, solution }: { plan: PlanSpec; solution?: NetSolution }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const parent = parseCidr(plan.parent) as Cidr;
  const size = 2 ** (32 - parent.prefix);
  const start = networkOf(parent);
  const result = useMemo(() => checkPlan(plan, answers), [plan, answers]);

  return (
    <div className="w-full space-y-3 rounded-2xl border border-border bg-background p-3">
      <section className="rounded-xl border border-border bg-card p-3" aria-label="Address line">
        <div className="mb-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{plan.parent}</span>
          <span>{size} addresses</span>
        </div>
        <div className="relative h-9 overflow-hidden rounded-lg bg-muted">
          {plan.needs.map((need, i) => {
            const r = result.needs[i];
            if (!r.block) return null;
            const from = networkOf(r.block) - start;
            const width = 2 ** (32 - r.block.prefix);
            if (from < 0 || from >= size) return null;
            return (
              <div
                key={need.id}
                title={`${need.label}: ${blockRange(r.block)}`}
                className={`absolute top-0 h-full border-x border-background/70 ${TONES[i % TONES.length]} ${r.ok ? "opacity-90" : "opacity-60 [background-image:repeating-linear-gradient(45deg,transparent_0_6px,rgba(0,0,0,.25)_6px_12px)]"}`}
                style={{ left: `${(from / size) * 100}%`, width: `${Math.min(width, size - from) / size * 100}%` }}
              >
                <span className="block truncate px-1 pt-2 text-[10px] font-semibold text-white">{need.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{result.free} addresses still free.</p>
      </section>
      {result.allPass && (
        <div role="status" className="rounded-xl border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          Every group fits, inside {plan.parent}, with no overlaps.
        </div>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {plan.needs.map((need, i) => {
          const r = result.needs[i];
          const typed = (answers[need.id] ?? "").trim().length > 0;
          return (
            <li key={need.id} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className={`size-3 rounded-full ${TONES[i % TONES.length]}`} />
                <span className="text-sm font-semibold">{need.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{need.hosts} devices</span>
              </div>
              <input
                value={answers[need.id] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [need.id]: e.target.value })}
                placeholder="for example 10.20.0.0/26"
                spellCheck={false}
                aria-label={`Block for ${need.label}`}
                className="w-full rounded-lg border border-border bg-background px-2 py-1 font-mono text-sm"
              />
              {typed && r.block && r.ok && (
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                  {blockRange(r.block)}, {usableHosts(r.block.prefix)} usable. Fits.
                </p>
              )}
              {typed && !r.ok && (
                <ul className="mt-1 space-y-0.5 text-xs text-red-700 dark:text-red-400">
                  {r.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              {!typed && <p className="mt-1 text-xs text-muted-foreground">Write the block as address/prefix.</p>}
            </li>
          );
        })}
      </ul>
      {solution?.blocks && (
        <PlanSolution
          solution={solution}
          plan={plan}
          answers={answers}
          onFill={() => setAnswers(Object.fromEntries(Object.entries(solution.blocks ?? {}).map(([id, b]) => [id, b.block])))}
        />
      )}
    </div>
  );
}
