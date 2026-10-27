"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { setGamificationPreferences } from "@/server/actions/gamification";
import type { GamificationSummary } from "@/shared/api/gamification";

// "Game elements" in profile settings: hide XP, levels, streak freezes and leaderboards, and join
// or leave the weekly leaderboards. Learning progress and the weekly goal stay either way.

export function GamificationPreferences({ initial }: { initial: GamificationSummary }) {
  const [summary, setSummary] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const showGame = !summary.hidden;

  function save(input: { hidden?: boolean; leaderboardOptIn?: boolean }) {
    setError(null);
    startTransition(async () => {
      try {
        setSummary(await setGamificationPreferences(input));
      } catch {
        setError("Your choice could not be saved. Please try again.");
      }
    });
  }

  return (
    <section aria-labelledby="game-elements-heading" className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-5 border-b border-border pb-5">
        <h2 id="game-elements-heading" className="text-lg font-semibold tracking-tight">Game elements</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          XP, levels, streak freezes and leaderboards add a little play to learning. Your progress, streak and weekly goal are kept either way.
        </p>
      </div>
      <div className="space-y-5" aria-busy={pending}>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={showGame}
            disabled={pending}
            onCheckedChange={(checked) => save({ hidden: !checked })}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-medium">Show game elements</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              XP, levels and streak freezes on your dashboard, and XP in the mascot&apos;s messages.
            </span>
          </span>
        </label>
        {summary.features.leaderboards ? (
          <label className={`flex items-start gap-3 ${showGame ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
            <Checkbox
              checked={showGame && summary.leaderboardOptIn}
              disabled={pending || !showGame}
              onCheckedChange={(checked) => save({ leaderboardOptIn: checked })}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium">Join weekly leaderboards</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Appear on a weekly board for each of your courses, shown by first name and last initial. Only learners who join can see it.
              </span>
            </span>
          </label>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
