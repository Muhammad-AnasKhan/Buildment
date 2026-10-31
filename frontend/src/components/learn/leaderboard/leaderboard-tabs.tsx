"use client";

import { Flame, Medal, Trophy, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardCategory, LeaderboardScope } from "@/shared/api/gamification";

// The category tabs plus, on the weekly board, the Global/Course scope switch. Button-based tabs
// (the repo has no shadcn Tabs primitive) with the same focus rings as the rest of the app.

export type HubSelection = {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
  courseId: string | null;
};

const CATEGORIES: Array<{ id: LeaderboardCategory; label: string; icon: LucideIcon; hint: string }> = [
  { id: "weekly_xp", label: "Weekly XP", icon: Trophy, hint: "This week's XP race. The global board is your league: the top 10% promote and the bottom 20% demote when the week closes on Monday." },
  { id: "all_time_xp", label: "All-time XP", icon: Medal, hint: "Total XP earned across every course. Recognition only — leagues reset weekly." },
  { id: "speed", label: "Speed", icon: Zap, hint: "Most chapters completed this week. Ties go to the lower average study time per chapter." },
  { id: "streak", label: "Streak", icon: Flame, hint: "Current run of study days, counted in each learner's own timezone. Streak freezes keep a run alive." },
];

const SCOPE_OPTIONS: Array<{ id: LeaderboardScope; label: string }> = [
  { id: "global", label: "Global" },
  { id: "course", label: "Course" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex items-center gap-1 rounded-xl border bg-muted/50 p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-9 rounded-lg px-3.5 text-sm font-medium outline-none transition-colors motion-reduce:transition-none",
            value === option.id ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function LeaderboardTabs({
  selection,
  pending,
  onSelect,
}: {
  selection: HubSelection;
  pending: boolean;
  onSelect: (next: HubSelection) => void;
}) {
  const weekly = selection.category === "weekly_xp";
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Leaderboard category" className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const active = selection.category === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={category.hint}
              disabled={pending}
              onClick={() => onSelect({ category: category.id, scope: category.id === "weekly_xp" ? selection.scope : "global", courseId: category.id === "weekly_xp" ? selection.courseId : null })}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium outline-none transition-colors motion-reduce:transition-none",
                active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              )}
            >
              <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
              {category.label}
            </button>
          );
        })}
      </div>

      {weekly ? (
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            ariaLabel="Board scope"
            options={SCOPE_OPTIONS}
            value={selection.scope}
            disabled={pending}
            onChange={(scope) => onSelect({ ...selection, scope, courseId: scope === "course" ? selection.courseId : null })}
          />
          <p className="text-xs text-muted-foreground">
            {selection.scope === "global" ? "Your league: ranked with learners in your tier." : "One board per course, shared with classmates who joined."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
