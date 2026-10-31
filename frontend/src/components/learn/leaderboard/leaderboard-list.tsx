import type { CSSProperties } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LEAGUE_TIER_LABELS, nextLeagueTier, prevLeagueTier } from "@/shared/gamification/leagues";
import type { LeaderboardHubEntry, LeagueInfo } from "@/shared/api/gamification";
import { formatScore, initials } from "./leaderboard-format";

// Everyone outside the podium: the learner's neighbourhood (the server sends the top three plus
// the people either side of them). On a league board the promotion and demotion zones tint the
// rows, so the stakes are visible in the list itself.

export function LeaderboardList({
  entries,
  metricLabel,
  league,
}: {
  entries: LeaderboardHubEntry[];
  metricLabel: string;
  league?: LeagueInfo | null;
}) {
  const rows = entries.filter((entry) => entry.rank > 3);
  if (rows.length === 0) return null;

  const zoneFor = (rank: number): "promote" | "demote" | null => {
    if (!league) return null;
    if (nextLeagueTier(league.tier) && league.promotionZone > 0 && rank <= league.promotionZone) return "promote";
    if (prevLeagueTier(league.tier) && league.demotionZone <= league.groupSize && rank >= league.demotionZone) return "demote";
    return null;
  };

  return (
    <section aria-labelledby="around-heading" className="leaderboard-rise rounded-2xl border bg-card p-5 sm:p-6" style={{ "--d": "0.3s" } as CSSProperties}>
      <h2 id="around-heading" className="text-lg font-semibold tracking-[-0.02em]">Around you</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {league
          ? `You and the learners nearest your rank in ${LEAGUE_TIER_LABELS[league.tier]}.`
          : "You and the learners nearest your rank."}
      </p>
      <ol className="mt-5 divide-y divide-border overflow-hidden rounded-xl border">
        {rows.map((entry) => {
          const zone = zoneFor(entry.rank);
          return (
            <li
              key={entry.rank}
              aria-current={entry.isYou ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 sm:px-4",
                zone === "promote" && "bg-ok-soft/60",
                zone === "demote" && "bg-destructive/5",
                entry.isYou && "bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
                  entry.isYou ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
                aria-hidden
              >
                {entry.rank}
              </span>
              <Avatar size="sm">
                <AvatarImage src={entry.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initials(entry.name)}</AvatarFallback>
              </Avatar>
              <span className={cn("min-w-0 flex-1 truncate text-sm", entry.isYou ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                {entry.isYou ? "You" : entry.name}
              </span>
              {entry.tier && league ? (
                <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                  {LEAGUE_TIER_LABELS[entry.tier]}
                </span>
              ) : null}
              <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">{formatScore(entry.score, metricLabel)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
