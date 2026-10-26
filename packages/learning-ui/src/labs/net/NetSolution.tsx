"use client";

// A lab's solution, hidden until the learner opens it. Labs are for playing,
// not for marks, so the answer is always there, but it waits behind a
// deliberate click so the learner tries first. Each step says why.

import { useState } from "react";
import type { NetSolution } from "../types";
import type { PlanSpec } from "./plan";
import { checkPlan } from "./plan";

export function Reveal({ children, label }: { children: React.ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">Stuck, or done and want to compare? Try it yourself first.</p>
          <button type="button" onClick={() => setOpen(true)} className="ml-auto rounded-lg border border-border px-3 py-1 text-sm font-medium hover:bg-muted">
            {label}
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="rounded-xl border border-violet-300 bg-violet-50/60 p-3 dark:border-violet-500/40 dark:bg-violet-500/10" aria-label="Solution">
      <div className="mb-2 flex items-center">
        <h3 className="text-sm font-semibold">Solution</h3>
        <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-muted-foreground hover:underline">
          Hide
        </button>
      </div>
      {children}
    </section>
  );
}

export function FaultSolution({ solution, onApply }: { solution: NetSolution; onApply: () => void }) {
  return (
    <Reveal label="Show the solution">
      <p className="mb-3 text-sm">{solution.summary}</p>
      <ol className="space-y-2">
        {(solution.steps ?? []).map((step, i) => (
          <li key={i} className="text-sm">
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[12px] text-zinc-100">
              <span className="text-emerald-400">{step.device}#</span> {step.command}
            </code>
            <p className="mt-0.5 text-muted-foreground">{step.why}</p>
          </li>
        ))}
      </ol>
      <button type="button" onClick={onApply} className="mt-3 rounded-lg bg-violet-600 px-3 py-1 text-sm font-medium text-white">
        Run these commands on the network
      </button>
    </Reveal>
  );
}

export function PlanSolution({ solution, plan, answers, onFill }: { solution: NetSolution; plan: PlanSpec; answers: Record<string, string>; onFill: () => void }) {
  const yours = checkPlan(plan, answers);
  return (
    <Reveal label="Show a solution">
      <p className="mb-3 text-sm">{solution.summary}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-1 pr-3 font-medium">Group</th>
              <th className="py-1 pr-3 font-medium">Yours</th>
              <th className="py-1 pr-3 font-medium">This solution</th>
              <th className="py-1 font-medium">Why</th>
            </tr>
          </thead>
          <tbody>
            {plan.needs.map((need, i) => {
              const mine = (answers[need.id] ?? "").trim();
              const theirs = solution.blocks?.[need.id];
              const same = mine === theirs?.block;
              const works = yours.needs[i].ok;
              return (
                <tr key={need.id} className="border-t border-border align-top">
                  <td className="py-1.5 pr-3 font-medium">{need.label}</td>
                  <td className="py-1.5 pr-3 font-mono text-[12px]">
                    {mine || <span className="text-muted-foreground">empty</span>}
                    {mine && (
                      <span className={`block font-sans text-[11px] ${works ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                        {same ? "same" : works ? "different, and it works" : "does not work yet"}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-[12px]">{theirs?.block}</td>
                  <td className="py-1.5 text-muted-foreground">{theirs?.why}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Other plans can be right too: any blocks that fit, start where their size starts and do not overlap pass.</p>
      <button type="button" onClick={onFill} className="mt-3 rounded-lg bg-violet-600 px-3 py-1 text-sm font-medium text-white">
        Fill in this solution
      </button>
    </Reveal>
  );
}
