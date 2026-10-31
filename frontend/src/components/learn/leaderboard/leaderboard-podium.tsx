import type { CSSProperties } from "react";
import { Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardHubEntry } from "@/shared/api/gamification";
import { formatScore, initials } from "./leaderboard-format";

// The top three as an animated podium: second, first, third on wide screens (first elevated and
// shining), stacked in rank order on phones. Entrance rises are staggered; first place gets the
// shimmer sweep, glow ring and crown.

const MEDAL_TONES: Record<number, { medal: string; ring: string; icon: string }> = {
  1: { medal: "bg-brand-yellow text-foreground", ring: "ring-brand-yellow", icon: "text-amber-500 dark:text-amber-300" },
  2: { medal: "bg-muted text-foreground", ring: "ring-muted-foreground/40", icon: "text-slate-400 dark:text-slate-400" },
  3: { medal: "bg-brand-yellow/40 text-foreground", ring: "ring-brand-yellow/60", icon: "text-orange-500 dark:text-orange-400" },
};

function PodiumCard({ entry, metricLabel, delay, orderClass }: { entry: LeaderboardHubEntry; metricLabel: string; delay: string; orderClass: string }) {
  const tone = MEDAL_TONES[entry.rank] ?? MEDAL_TONES[3]!;
  const first = entry.rank === 1;
  return (
    <li
      className={cn(
        "leaderboard-rise flex flex-col items-center rounded-2xl border bg-card px-4 pb-5 pt-6 text-center sm:px-5",
        first ? "leaderboard-shimmer leaderboard-glow border-brand-yellow/70 sm:pb-7" : "border-border",
        entry.isYou && "ring-2 ring-primary/40",
        orderClass
      )}
      style={{ "--d": delay } as CSSProperties}
      aria-current={entry.isYou ? "true" : undefined}
    >
      {first ? <Crown className="leaderboard-sparkle size-5 text-brand-yellow" aria-hidden /> : <span className="size-5" aria-hidden />}
      <Avatar size="lg" className={cn("mt-2 ring-2", tone.ring)}>
        <AvatarImage src={entry.avatarUrl ?? undefined} alt="" />
        <AvatarFallback>{initials(entry.name)}</AvatarFallback>
      </Avatar>
      <span className={cn("mt-3 grid place-items-center rounded-full text-xs font-bold tabular-nums", first ? "size-8" : "size-7", tone.medal)} aria-hidden>
        {entry.rank}
      </span>
      <p className={cn("mt-2 w-full truncate text-base", first ? "font-semibold" : "font-medium")}>
        <span className="sr-only">Place {entry.rank}: </span>
        {entry.isYou ? "You" : entry.name}
      </p>
      <p className="mt-1 text-sm tabular-nums text-muted-foreground">{formatScore(entry.score, metricLabel)}</p>
      {first ? <Medal className="mt-2 size-4 text-brand-yellow" aria-hidden /> : null}
    </li>
  );
}

export function LeaderboardPodium({ entries, metricLabel }: { entries: LeaderboardHubEntry[]; metricLabel: string }) {
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));
  // DOM order is rank order (phones stack 1-2-3); on wide screens the order utilities swap the
  // first-place card into the raised middle slot.
  const slots = [byRank.get(1), byRank.get(2), byRank.get(3)].filter((entry): entry is LeaderboardHubEntry => Boolean(entry));
  if (slots.length === 0) return null;
  return (
    <section aria-label="Top three">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        {slots.map((entry) => (
          <PodiumCard
            key={entry.rank}
            entry={entry}
            metricLabel={metricLabel}
            delay={entry.rank === 1 ? "0.15s" : entry.rank === 2 ? "0.05s" : "0.25s"}
            orderClass={entry.rank === 1 ? "order-1 sm:order-2" : entry.rank === 2 ? "order-2 sm:order-1" : "order-3"}
          />
        ))}
      </ol>
    </section>
  );
}
