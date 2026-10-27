import { Trophy } from "lucide-react";
import { CourseCover } from "@/components/learn/course-cover";
import { cn } from "@/lib/utils";
import type { TopThreeFinishes } from "@/shared/api/gamification";

const weekFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

/** "Top 3 finish ×2", with the latest week and course on wider screens. */
function TopThreeBadge({ topThree }: { topThree: TopThreeFinishes }) {
  const { latest, count } = topThree;
  const week = weekFormat.format(new Date(`${latest.weekStart}T00:00:00Z`));
  return (
    <p className="mt-2 flex min-w-0 items-center gap-2 text-xs">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-800 dark:text-amber-300">
        <Trophy className="size-3.5" aria-hidden />
        Top 3 finish
        {count > 1 ? <span className="tabular-nums">×{count}</span> : null}
      </span>
      <span className="hidden truncate text-muted-foreground sm:inline">
        Latest: #{latest.rank} in {latest.courseTitle}, week of {week}
      </span>
      <span className="sr-only sm:hidden">
        Latest: #{latest.rank} in {latest.courseTitle}, week of {week}
      </span>
    </p>
  );
}

function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function ProfileSettingsHero({
  name,
  email,
  image,
  coverUrl,
  coverLabel,
  topThree = null,
  className,
}: {
  name: string | null | undefined;
  email: string;
  image?: string | null;
  coverUrl: string | null | undefined;
  coverLabel: string;
  /** Weekly leaderboard top-three finishes; shown only when the learner shows game elements. */
  topThree?: TopThreeFinishes | null;
  className?: string;
}) {
  const displayName = name?.trim() || email.split("@")[0] || "Learner";

  return (
    <header className={cn("relative w-full", className)}>
      <CourseCover
        coverUrl={coverUrl}
        title={coverLabel}
        aspect="banner"
        className="aspect-auto min-h-[11rem] w-full rounded-none sm:min-h-[13rem] lg:min-h-[15rem]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-background bg-card text-lg font-semibold shadow-md sm:size-[4.5rem]">
            {userImageOrInitials(image ?? null, displayName, email)}
          </span>
          <div className="min-w-0 pb-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{email}</p>
            {topThree ? <TopThreeBadge topThree={topThree} /> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function userImageOrInitials(image: string | null, displayName: string, email: string) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="size-full rounded-[calc(1rem-2px)] object-cover" />;
  }
  return initials(displayName, email);
}
