import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Layers3, Target } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CourseOverviewHeroProps = {
  difficulty: string | null;
  title: string;
  description: string | null;
  projectGoal: string | null;
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
  difficulty,
  title,
  description,
  projectGoal,
  percentComplete,
  continueHref,
  continueLabel,
  moduleCount,
  chapterCount,
  estimatedHours,
}: CourseOverviewHeroProps) {
  const { lead, rest } = splitTitle(title);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
      <div className="grid sm:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-6 sm:p-8 lg:p-9">
          <div className="flex flex-wrap items-center gap-2">
            {difficulty ? (
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {difficulty}
              </span>
            ) : null}
            {lead ? <span className="text-xs font-semibold text-muted-foreground">{lead}</span> : null}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] lg:text-4xl">
            {rest}
          </h1>

          {description ? (
            <p className="mt-4 line-clamp-4 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-[15px]">
              {description}
            </p>
          ) : null}

          <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Layers3 className="size-3.5" /><dt className="sr-only">Modules</dt><dd>{moduleCount} modules</dd></div>
            <div className="flex items-center gap-2"><BookOpen className="size-3.5" /><dt className="sr-only">Lessons</dt><dd>{chapterCount} lessons</dd></div>
            {estimatedHours ? <div className="flex items-center gap-2"><Clock3 className="size-3.5" /><dt className="sr-only">Estimated duration</dt><dd>{estimatedHours} hours</dd></div> : null}
          </dl>
        </div>

        <aside className="flex flex-col justify-between border-t border-border bg-muted/20 p-6 sm:border-l sm:border-t-0 sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold"><Target className="size-4" /> Your project</div>
            {projectGoal ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{projectGoal}</p> : null}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-medium text-foreground">Progress</span>
              <span className="font-mono tabular-nums text-muted-foreground">{percentComplete}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${percentComplete}%` }} />
            </div>
            {continueHref ? (
              <Link href={continueHref} className={cn(buttonVariants({ size: "lg" }), "mt-5 h-10 w-full gap-2 px-4")}>
                {continueLabel}<ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
