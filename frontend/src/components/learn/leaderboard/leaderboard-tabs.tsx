"use client";

import { cn } from "@/lib/utils";
import type { LeaderboardCategory, LeaderboardScope } from "@/shared/api/gamification";

export type HubSelection = {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
  courseId: string | null;
};

const CATEGORIES: Array<{
  id: LeaderboardCategory;
  label: string;
}> = [
  { id: "weekly_xp", label: "Weekly XP" },
  { id: "all_time_xp", label: "All-time XP" },
  { id: "speed", label: "Speed" },
  { id: "streak", label: "Streak" },
];

export function LeaderboardTabs({
  selection,
  pending,
  onSelect,
}: {
  selection: HubSelection;
  pending: boolean;
  onSelect: (next: HubSelection) => void;
}) {
  const isWeekly = selection.category === "weekly_xp";

  return (
    <div className="space-y-3">
      {/* Category Tabs: matches ProfileSettingsTabs design */}
      <div
        role="tablist"
        aria-label="Leaderboard category"
        className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1"
      >
        {CATEGORIES.map((cat) => {
          const selected = selection.category === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={pending}
              onClick={() =>
                onSelect({
                  category: cat.id,
                  scope: cat.id === "weekly_xp" ? selection.scope : "global",
                  courseId: cat.id === "weekly_xp" ? selection.courseId : null,
                })
              }
              className={cn(
                "min-h-10 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                "disabled:opacity-50"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Scope sub-selector on Weekly XP: Global League vs Course */}
      {isWeekly ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="inline-flex gap-1 rounded-lg bg-muted/60 p-0.5 text-xs font-medium">
            <button
              type="button"
              disabled={pending}
              onClick={() => onSelect({ ...selection, scope: "global", courseId: null })}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selection.scope === "global"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Global League
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => onSelect({ ...selection, scope: "course" })}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selection.scope === "course"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Course Classmates
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {selection.scope === "global"
              ? "Ranked with learners in your league tier"
              : "Ranked among learners in your course"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
