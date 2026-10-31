import { Badge } from "@/components/ui/badge";
import { LEAGUE_TIER_LABELS, nextLeagueTier, prevLeagueTier } from "@/shared/gamification/leagues";
import type { LeagueInfo } from "@/shared/api/gamification";
import { formatNumber, formatScore, resetLabel } from "./leaderboard-format";

function LeagueOutcomeBanner({ league }: { league: LeagueInfo }) {
  const lastWeek = league.lastWeek;
  if (!lastWeek) return null;

  if (lastWeek.outcome === "PROMOTED") {
    const to = nextLeagueTier(lastWeek.fromTier);
    return (
      <p className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-2.5 text-sm font-medium text-ok">
        Promoted to {to ? LEAGUE_TIER_LABELS[to] : "a higher league"} last week.
      </p>
    );
  }

  if (lastWeek.outcome === "DEMOTED") {
    const to = prevLeagueTier(lastWeek.fromTier);
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
        Demoted to {to ? LEAGUE_TIER_LABELS[to] : "a lower league"} last week.
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
      You held {LEAGUE_TIER_LABELS[league.tier]} League last week.
    </p>
  );
}

export function LeaderboardLeagueCard({
  league,
  score,
  metricLabel,
  bestScore,
  resetsAt,
}: {
  league: LeagueInfo;
  score: number;
  metricLabel: string;
  bestScore: number | null;
  resetsAt: string | null;
}) {
  const promoteCount = league.promotionZone;
  const isPromoting = promoteCount > 0 && league.rank <= promoteCount && Boolean(nextLeagueTier(league.tier));

  const demoteCount =
    league.demotionZone <= league.groupSize ? Math.max(0, league.groupSize - league.demotionZone + 1) : 0;
  const isDemoting = demoteCount > 0 && league.rank >= league.demotionZone && Boolean(prevLeagueTier(league.tier));

  const beaten = bestScore !== null && bestScore > 0 && score > bestScore;
  const bestPct = bestScore !== null && bestScore > 0 ? Math.min(100, Math.round((score / bestScore) * 100)) : 0;

  return (
    <section aria-labelledby="league-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {LEAGUE_TIER_LABELS[league.tier]} League
            </Badge>
            {isPromoting ? (
              <Badge variant="secondary" className="border-ok/30 bg-ok/10 text-ok font-semibold">
                Promotion zone
              </Badge>
            ) : isDemoting ? (
              <Badge variant="destructive">Demotion zone</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground font-normal">
                Safe zone
              </Badge>
            )}
          </div>
          {resetsAt ? (
            <span className="text-sm tabular-nums text-muted-foreground" suppressHydrationWarning>
              {resetLabel(resetsAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-muted-foreground">Your place in {LEAGUE_TIER_LABELS[league.tier]}</p>
          <h2 id="league-heading" className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-4xl font-bold tabular-nums tracking-[-0.04em] text-foreground sm:text-5xl">
              #{league.rank}
            </span>
            <span className="text-base text-muted-foreground">of {formatNumber(league.groupSize)} learners</span>
          </h2>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{metricLabel === "XP" ? "XP this week" : metricLabel}</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-[-0.02em]">{formatScore(score, metricLabel)}</p>
          </div>
          {nextLeagueTier(league.tier) && promoteCount > 0 ? (
            <p className="text-sm font-medium text-ok">
              Top {promoteCount} promote to {LEAGUE_TIER_LABELS[nextLeagueTier(league.tier)!]}
            </p>
          ) : prevLeagueTier(league.tier) && demoteCount > 0 ? (
            <p className="text-sm font-medium text-destructive">
              Bottom {demoteCount} demote to {LEAGUE_TIER_LABELS[prevLeagueTier(league.tier)!]}
            </p>
          ) : league.tier === "DIAMOND" ? (
            <p className="text-sm text-muted-foreground">Top league — no higher tier to promote to</p>
          ) : (
            <p className="text-sm text-muted-foreground">Base league — protected from demotion</p>
          )}
        </div>

        {bestScore !== null && bestScore > 0 ? (
          <div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className={beaten ? "font-semibold text-primary" : "font-medium text-foreground"}>
                {beaten ? "New personal best!" : "Beat your best week"}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(score)} / {formatNumber(bestScore)} XP
              </span>
            </div>
            <div
              className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="This week compared with your best week"
              aria-valuenow={Math.min(score, bestScore)}
              aria-valuemin={0}
              aria-valuemax={bestScore}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${bestPct}%` }}
              />
            </div>
          </div>
        ) : null}

        <LeagueOutcomeBanner league={league} />
      </div>
    </section>
  );
}
