"use client";

// The lab's goals as a checklist. Before the first run each one waits; after
// it, each shows passed or not, with the reason read from the engine.

import type { GoalResult } from "./build-goals";
import type { BuildGoal } from "./build-model";

export function BuildGoals({ goals, results }: { goals: BuildGoal[]; results: GoalResult[] | null }) {
  const passed = results ? results.filter((r) => r.pass).length : 0;
  return (
    <section className="rounded-xl border border-border bg-card p-3" aria-label="Goals">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Goals</h3>
        <span className={`text-xs font-semibold ${results && passed === goals.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {results ? `${passed} of ${goals.length} pass` : "Press Run to check"}
        </span>
      </div>
      <ul className="space-y-2">
        {goals.map((goal, i) => {
          const r = results?.[i];
          const state = !r ? "not checked yet" : r.pass ? "passed" : "not passed";
          return (
            <li key={goal.id} className="flex items-start gap-2 text-sm">
              <span
                role="img"
                aria-label={state}
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                  !r ? "border border-border text-muted-foreground" : r.pass ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {!r ? "" : r.pass ? "✓" : "✗"}
              </span>
              <span>
                {goal.label}
                {r && <span className={`block text-xs ${r.pass ? "text-muted-foreground" : "text-red-700 dark:text-red-400"}`}>{r.reason}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
