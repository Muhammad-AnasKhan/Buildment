import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardView } from "@/shared/api/gamification";

const numberFormat = new Intl.NumberFormat();

/** Compact dashboard preview that sends learners to the full leaderboard page. */
export function LeaderboardTeaser({ view }: { view: LeaderboardView | null }) {
  if (!view || view.status === "disabled") return null;

  const ready = view.status === "ready";
  const title =
    ready
      ? `You are #${view.you.rank} this week`
      : view.status === "opt_in_required"
        ? "Join the weekly board"
        : "Leaderboard";
  const detail =
    ready
      ? `${numberFormat.format(view.you.xp)} XP · ${view.groupSize} learners`
      : view.status === "opt_in_required"
        ? "See how your week compares with classmates."
        : view.reason === "organization_disabled"
          ? "Turned off for this course by your organization."
          : "Available while your enrollment is active.";

  return (
    <Link
      href="/leaderboard"
      className={cn(
        "group flex items-start gap-3 rounded-2xl border bg-card p-5 outline-none transition-colors",
        "hover:border-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Trophy className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">Weekly leaderboard</span>
        <span className="mt-1 block text-base font-semibold tracking-[-0.02em] text-foreground">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{detail}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Open leaderboard
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
