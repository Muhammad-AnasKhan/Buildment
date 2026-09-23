import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleUserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenteeEvaluation } from "./types";

export function EvaluationHeader({ evaluation }: { evaluation: MenteeEvaluation }) {
  const { course, mentee, enrollment } = evaluation;
  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/92 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href={`/courses/${course.slug}/mentees`} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All mentees
          </Link>
          <div className="mt-2 flex items-start gap-3">
            <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border bg-muted/60 text-muted-foreground">
              <CircleUserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{mentee.name}</h1>
                <Badge variant="outline" className="capitalize">{enrollment.status.toLowerCase().replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{mentee.email ?? "No email"} · {course.title}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="mr-1 text-left lg:text-right">
            <p className="text-xs font-medium text-muted-foreground">{enrollment.lastActiveLabel}</p>
            <p className="max-w-72 truncate text-sm font-medium">{enrollment.currentChapter ?? "No chapter started"}</p>
          </div>
          {evaluation.reviewNextHref ? (
            <Link href={evaluation.reviewNextHref} className={cn(buttonVariants({ size: "lg" }), "gap-2")}>Review next <ArrowRight /></Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "lg" }), "pointer-events-none text-muted-foreground")}>Review queue clear</span>
          )}
        </div>
      </div>
    </header>
  );
}
