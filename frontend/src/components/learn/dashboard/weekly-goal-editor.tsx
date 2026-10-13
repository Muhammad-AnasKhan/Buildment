"use client";

import { useState, useTransition } from "react";
import { clearWeeklyGoal, setWeeklyGoal } from "@/server/actions/weekly-goal";
import { Button } from "@/components/ui/button";
import type { LearnerHabit } from "@/server/progress/streak";

export function WeeklyGoalEditor({ goal }: { goal: LearnerHabit["weeklyGoal"] }) {
  const [kind, setKind] = useState<"SESSIONS" | "CHAPTERS">(goal?.kind ?? "SESSIONS");
  const [target, setTarget] = useState(String(goal?.target ?? 3));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unit = goal?.kind === "CHAPTERS" ? "chapters" : "sessions";
  const filled = goal ? Math.min(goal.progress, goal.target) : 0;
  const width = goal && goal.target > 0 ? Math.round((filled / goal.target) * 100) : 0;

  function onSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const nextTarget = Number(target);
    startTransition(async () => {
      const result = await setWeeklyGoal({ kind, target: nextTarget });
      if (!result.ok) setError(result.error);
    });
  }

  function onClear() {
    setError(null);
    startTransition(async () => {
      await clearWeeklyGoal();
    });
  }

  return (
    <form onSubmit={onSave} className="mt-5 border-t border-border pt-4">
      <p className="text-sm font-medium">Weekly goal</p>
      {goal ? (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            {filled} of {goal.target} {unit} this week
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${width}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Sessions or chapters, counted over the last 7 days.</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          aria-label="Goal type"
          value={kind}
          onChange={(event) => setKind(event.target.value as "SESSIONS" | "CHAPTERS")}
          className="h-8 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="SESSIONS">Sessions</option>
          <option value="CHAPTERS">Chapters</option>
        </select>
        <input
          aria-label="Weekly target"
          type="number"
          min={1}
          max={50}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="h-8 w-16 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {goal ? (
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
