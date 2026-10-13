import { CheckCircle2, Circle, Clock3, LockKeyhole, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type { EvaluationModule } from "./types";

function date(value: string | null) { return value ? new Date(value).toLocaleDateString() : null; }

export function CourseProgressMap({ modules }: { modules: EvaluationModule[] }) {
  return <section id="progress" aria-labelledby="progress-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Entire curriculum</p><h2 id="progress-title" className="mt-1 text-lg font-semibold">Course progress map</h2><p className="mt-1 text-sm text-muted-foreground">Every chapter, checkpoint, score, and review state in course order.</p></div>
    <div className="mt-5 space-y-3">
      {modules.map((module) => <details key={module.id} open={module.openByDefault} className="group overflow-hidden rounded-xl border bg-background">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 marker:hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">{String(module.order).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{module.title}</span><span className="block text-xs text-muted-foreground">{module.completedCount}/{module.chapters.length} chapters complete</span></span>
          <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="border-t sm:grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
          {module.chapters.map((chapter) => {
            const Icon = chapter.locked ? LockKeyhole : chapter.status === "COMPLETED" ? CheckCircle2 : chapter.status === "IN_PROGRESS" ? Clock3 : Circle;
            const score = chapter.maxScore ? `${chapter.score}/${chapter.maxScore}` : "No score";
            return <div key={chapter.id} className="grid gap-3 border-b px-4 py-3 last:border-b-0 sm:col-span-3 sm:grid-cols-subgrid sm:items-center">
              <div className="flex min-w-0 items-start gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-sm font-medium">{chapter.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{chapter.blocksCompleted}/{chapter.blocksTotal} checkpoints · {formatStudyAmount(chapter.timeSpentSeconds)}</p></div></div>
              <div className="text-xs text-muted-foreground"><p>{score}</p><p>{chapter.completedAt ? `Completed ${date(chapter.completedAt)}` : chapter.startedAt ? `Started ${date(chapter.startedAt)}` : "Not opened"}</p></div>
              <div className="flex flex-wrap gap-1.5 sm:justify-end"><Badge variant="outline" className="capitalize">{chapter.locked ? "Locked" : chapter.status.toLowerCase().replaceAll("_", " ")}</Badge>{chapter.pendingReviews > 0 ? <Badge variant="secondary"><MessageSquareText /> {chapter.pendingReviews} review</Badge> : chapter.requiresReview ? <Badge variant="outline">Has rubric review</Badge> : null}</div>
            </div>;
          })}
        </div>
      </details>)}
      {!modules.length ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No published curriculum is available for this course.</p> : null}
    </div>
  </section>;
}
