import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers, Rocket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CourseOverviewHeroProps = {
  difficulty: string | null;
  title: string;
  description: string | null;
  projectGoal: string | null;
  coverUrl: string | null;
  percentComplete: number;
  continueHref: string | null;
  continueLabel: string;
  moduleCount: number;
  chapterCount: number;
  estimatedHours: number | null;
};

function splitTitle(title: string) {
  const parts = title.split(" — ");
  if (parts.length < 2) return { lead: null, rest: title };
  return { lead: parts[0], rest: parts.slice(1).join(" — ") };
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center">
      <svg className="-rotate-90 size-14" viewBox="0 0 52 52" aria-hidden>
        <circle
          className="text-neutral-200"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="26"
          cy="26"
        />
        <circle
          className="text-indigo-600 transition-[stroke-dashoffset] duration-700"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="26"
          cy="26"
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold tabular-nums text-neutral-950">
        {percent}%
      </span>
    </div>
  );
}

export function CourseOverviewHero({
  difficulty,
  title,
  description,
  projectGoal,
  coverUrl,
  percentComplete,
  continueHref,
  continueLabel,
  moduleCount,
  chapterCount,
  estimatedHours,
}: CourseOverviewHeroProps) {
  const { lead, rest } = splitTitle(title);

  const quickStats = [
    { icon: Layers, label: `${moduleCount} modules` },
    { icon: BookOpen, label: `${chapterCount} lessons` },
    ...(estimatedHours ? [{ icon: Clock, label: `${estimatedHours}h estimated` }] : []),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Top — cover banner */}
      <div className="relative aspect-[2/1] w-full min-h-[180px] max-h-[280px] sm:max-h-[320px]">
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/5" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.18),transparent_60%)] bg-neutral-100" />
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-5 sm:p-6">
          {difficulty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 shadow-sm backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden />
              {difficulty}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 shadow-sm backdrop-blur-sm">
            Hands-on project
          </span>
        </div>
      </div>

      {/* Bottom — course details */}
      <div className="relative bg-gradient-to-b from-indigo-50/40 to-white p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 top-0 size-40 rounded-full bg-indigo-100/30 blur-3xl" aria-hidden />

        <div className="relative space-y-5">
          <div className="space-y-2">
            {lead ? (
              <p className="text-sm font-semibold tracking-wide text-indigo-600">{lead}</p>
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl sm:leading-[1.2]">
              {rest}
            </h1>
          </div>

          {description ? (
            <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">
              {description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {quickStats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm"
              >
                <stat.icon className="size-3.5 text-indigo-500" aria-hidden />
                {stat.label}
              </span>
            ))}
          </div>

          {projectGoal ? (
            <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Rocket className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    You&apos;ll ship
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-700">{projectGoal}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative mt-8 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ProgressRing percent={percentComplete} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Your progress
              </p>
              <p className="text-sm font-medium text-neutral-800">{percentComplete}% complete</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {continueHref ? (
            <Link
              href={continueHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-11 shrink-0 gap-2 self-start rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white shadow-md shadow-neutral-900/10 hover:bg-neutral-800 sm:self-center"
              )}
            >
              {continueLabel}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
