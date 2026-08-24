import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

export function CourseOverviewHero({
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

  const meta =
    `${moduleCount} modules · ${chapterCount} lessons` +
    (estimatedHours ? ` · ${estimatedHours}h estimated` : "");

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="relative aspect-[16/6] w-full overflow-hidden">
        {coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-1">
          {lead ? <p className="text-sm font-medium text-indigo-600">{lead}</p> : null}
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{rest}</h1>
        </div>

        {description ? (
          <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-600">
            {description}
          </p>
        ) : null}

        <p className="text-sm text-neutral-500">{meta}</p>

        {projectGoal ? (
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">You&apos;ll build: </span>
            {projectGoal}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-700">
              {percentComplete}% complete
            </p>
            <div className="mt-2 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {continueHref ? (
            <Link
              href={continueHref}
              className="inline-flex h-11 items-center gap-2 self-start rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 sm:self-center"
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
