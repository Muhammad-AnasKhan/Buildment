import type { CSSProperties } from "react";
import { Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAGUE_TIER_LABELS, nextLeagueTier, prevLeagueTier } from "@/shared/gamification/leagues";
import type { LeagueInfo, LeagueTier } from "@/shared/api/gamification";
import { formatNumber, formatScore, resetLabel } from "./leaderboard-format";

// The learner's league: current tier, rank inside it, the promotion and demotion zones as a bar
// with their position marked, and what last week's reset did to them. Shines hardest on first
// place and on promotion.

const TIER_STYLES: Record<LeagueTier, { badge: string; dot: string }> = {
  BRONZE: { badge: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300", dot: "bg-orange-500" },
  SILVER: { badge: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200", dot: "bg-slate-400" },
  GOLD: { badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300", dot: "bg-amber-400" },
  PLATINUM: { badge: "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300", dot: "bg-cyan-400" },
  DIAMOND: { badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300", dot: "bg-sky-400" },
};

function LeagueOutcomeBanner({ league }: { league: LeagueInfo }) {
  const lastWeek = league.lastWeek;
  if (!lastWeek) return null;
  if (lastWeek.outcome === "PROMOTED") {
    const to = nextLeagueTier(lastWeek.fromTier);
    return (
      <p className="flex items-center gap-2 rounded-xl border border-ok/40 bg-ok-soft px-3.5 py-2.5 text-sm font-medium text-ok">
        <TrendingUp className="size-4 shrink-0" aria-hidden />
        Promoted to {to ? LEAGUE_TIER_LABELS[to] : "the next league"} last week. Keep climbing.
      </p>
    );
  }
  if (lastWeek.outcome === "DEMOTED") {
    const to = prevLeagueTier(lastWeek.fromTier);
    return (
      <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
        <TrendingDown className="size-4 shrink-0" aria-hidden />
        Demoted to {to ? LEAGUE_TIER_LABELS[to] : "a lower league"} last week. This week is a fresh start.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
      <Minus className="size-4 shrink-0" aria-hidden />
      You held {LEAGUE_TIER_LABELS[league.tier]} last week.
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
  const tier = TIER_STYLES[league.tier];
  const promotePct = league.groupSize > 0 ? Math.min(100, (league.promotionZone / league.groupSize) * 100) : 0;
  const demoteCount = league.demotionZone <= league.groupSize ? Math.max(0, league.groupSize - league.demotionZone + 1) : 0;
  const demotePct = league.groupSize > 0 ? Math.min(100, (demoteCount / league.groupSize) * 100) : 0;
  const viewerPct = league.groupSize > 0 ? Math.min(100, Math.max(0, ((league.rank - 0.5) / league.groupSize) * 100)) : 0;
  const beaten = bestScore !== null && bestScore > 0 && score > bestScore;
  const bestPct = bestScore !== null && bestScore > 0 ? Math.min(100, Math.round((score / bestScore) * 100)) : 0;

  return (
    <section aria-labelledby="league-heading" className="leaderboard-rise overflow-hidden rounded-2xl border bg-card" style={{ "--d": "0s" } as CSSProperties}>
      <div className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-5 py-4 sm:px-6">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", tier.badge)}>
          <span className={cn("leaderboard-sparkle size-2 rounded-full", tier.dot)} aria-hidden />
          {LEAGUE_TIER_LABELS[league.tier]}
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <h2 id="league-heading" className="text-sm font-medium text-muted-foreground">Your league</h2>
        <p className="ml-auto text-sm tabular-nums text-muted-foreground" suppressHydrationWarning>
          {resetsAt ? resetLabel(resetsAt) : ""}
        </p>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Your place in {LEAGUE_TIER_LABELS[league.tier]}</p>
            <h3 className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl font-bold tabular-nums tracking-[-0.04em] text-foreground sm:text-5xl">#{league.rank}</span>
              <span className="text-base text-muted-foreground">of {formatNumber(league.groupSize)} learners</span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">This week</p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.02em]">{formatScore(score, metricLabel)}</p>
          </div>
        </div>

        <div>
          <div
            className="relative h-2.5 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`Rank ${league.rank} of ${league.groupSize}. Promotion zone: top ${league.promotionZone}. Demotion zone: bottom ${demoteCount}.`}
          >
            {promotePct > 0 && nextLeagueTier(league.tier) ? <span className="absolute inset-y-0 left-0 rounded-full bg-ok/70" style={{ width: `${promotePct}%` }} /> : null}
            {demotePct > 0 && prevLeagueTier(league.tier) ? <span className="absolute inset-y-0 right-0 rounded-full bg-destructive/50" style={{ width: `${demotePct}%` }} /> : null}
            <span
              className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card"
              style={{ left: `calc(${viewerPct}% - 0.4375rem)` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {nextLeagueTier(league.tier) && league.promotionZone > 0 ? (
              <span className="flex items-center gap-1.5 font-medium text-ok">
                <span className="size-2 rounded-full bg-ok" aria-hidden />
                Top {league.promotionZone} promote to {LEAGUE_TIER_LABELS[nextLeagueTier(league.tier)!]}
              </span>
            ) : null}
            {prevLeagueTier(league.tier) && demoteCount > 0 ? (
              <span className="flex items-center gap-1.5 font-medium text-destructive">
                <span className="size-2 rounded-full bg-destructive" aria-hidden />
                Bottom {demoteCount} demote to {LEAGUE_TIER_LABELS[prevLeagueTier(league.tier)!]}
              </span>
            ) : null}
            {league.tier === "DIAMOND" ? <span className="text-muted-foreground">Diamond is the top league — nothing to promote to.</span> : null}
            {league.tier === "BRONZE" ? <span className="text-muted-foreground">Bronze is the floor — you cannot demote.</span> : null}
            {league.promotionZone === 0 && league.tier !== "DIAMOND" ? <span className="text-muted-foreground">Promotion opens once your league has 3 learners.</span> : null}
            {demoteCount === 0 && league.tier !== "BRONZE" && league.tier !== "DIAMOND" ? <span className="text-muted-foreground">Small league — no demotion this week.</span> : null}
          </div>
        </div>

        <LeagueOutcomeBanner league={league} />

        {bestScore !== null && bestScore > 0 ? (
          <div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className={cn("font-medium", beaten ? "text-primary" : "text-foreground")}>
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
              <div className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${bestPct}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
