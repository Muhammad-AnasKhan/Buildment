import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
};

function ProgressRing({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center">
      <svg className="-rotate-90 size-12" viewBox="0 0 48 48" aria-hidden>
        <circle
          className="text-neutral-200"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
        <circle
          className="text-indigo-600 transition-[stroke-dashoffset] duration-700"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-bold tabular-nums text-neutral-950">
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
}: CourseOverviewHeroProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {difficulty ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                  <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden />
                  {difficulty}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Hands-on project course
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl lg:leading-[1.15]">
              {title}
            </h1>

            {description ? (
              <p className="max-w-xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">
                {description}
              </p>
            ) : null}

            {projectGoal ? (
              <p className="max-w-xl rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 text-sm leading-relaxed text-neutral-600">
                <span className="font-semibold text-neutral-900">You&apos;ll ship:</span>{" "}
                {projectGoal}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-6">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-2.5 pr-4">
              <ProgressRing percent={percentComplete} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Your progress
                </p>
                <p className="text-xs font-medium text-neutral-700">{percentComplete}% complete</p>
              </div>
            </div>

            {continueHref ? (
              <Link
                href={continueHref}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-10 gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
                )}
              >
                {continueLabel}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[220px] border-t border-neutral-200 lg:col-span-5 lg:min-h-full lg:border-l lg:border-t-0">
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 420px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.12),transparent_60%)] bg-neutral-50" />
          )}
        </div>
      </div>
    </section>
  );
}
