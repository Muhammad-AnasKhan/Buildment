"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Clock3, LockKeyhole, MessageSquareText, Search, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatStudyAmount } from "@/lib/format-study-duration";
import { cn } from "@/lib/utils";
import type { EvaluationChapter, EvaluationModule } from "@/shared/api/teach";
import type { IntegrityAttemptSummary } from "@/shared/api/integrity";

function date(value: string | null) { return value ? new Date(value).toLocaleDateString() : null; }

function ChapterRow({ chapter, flags }: { chapter: EvaluationChapter; flags: number }) {
  const Icon = chapter.locked ? LockKeyhole : chapter.status === "COMPLETED" ? CheckCircle2 : chapter.status === "IN_PROGRESS" ? Clock3 : Circle;
  return (
    <div className="grid gap-2 border-t px-4 py-3 text-sm sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0"><p className="font-medium">{chapter.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{chapter.blocksCompleted}/{chapter.blocksTotal} checkpoints · {formatStudyAmount(chapter.timeSpentSeconds)}</p></div>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>{chapter.maxScore ? `${chapter.score}/${chapter.maxScore} points` : "No score yet"}</p>
        <p>{chapter.completedAt ? `Completed ${date(chapter.completedAt)}` : chapter.startedAt ? `Started ${date(chapter.startedAt)}` : "Not opened"}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        <Badge variant="outline" className="capitalize">{chapter.locked ? "Locked" : chapter.status.toLowerCase().replaceAll("_", " ")}</Badge>
        {chapter.pendingReviews > 0 ? <Badge variant="secondary"><MessageSquareText /> {chapter.pendingReviews} review</Badge> : chapter.requiresReview ? <Badge variant="outline">Has rubric review</Badge> : null}
        {flags > 0 ? <a href="#quiz-integrity" className="rounded-full focus-visible:outline-2 focus-visible:outline-ring"><Badge variant="secondary"><ShieldAlert /> {flags} {flags === 1 ? "flag" : "flags"}</Badge></a> : null}
      </div>
    </div>
  );
}

export function CourseProgressMap({ modules, integrity = [], currentChapterTitle }: { modules: EvaluationModule[]; integrity?: IntegrityAttemptSummary[]; currentChapterTitle?: string | null }) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const flagsByChapter = useMemo(() => {
    const flags = new Map<string, number>();
    for (const attempt of integrity) flags.set(attempt.chapterId, (flags.get(attempt.chapterId) ?? 0) + attempt.flagCount);
    return flags;
  }, [integrity]);
  const completedModules = modules.filter((module) => module.chapters.length > 0 && module.completedCount === module.chapters.length).length;
  const currentIndex = modules.findIndex((module) => module.chapters.some((chapter) => chapter.title === currentChapterTitle));
  const activeIndex = currentIndex >= 0 ? currentIndex : Math.max(0, modules.findIndex((module) => module.chapters.some((chapter) => chapter.status === "IN_PROGRESS")));
  const currentModule = modules[activeIndex];
  const windowStart = Math.max(0, Math.min(activeIndex - 2, modules.length - 6));
  const visibleModules = query.trim()
    ? modules.filter((module) => [module.title, ...module.chapters.map((chapter) => chapter.title)].some((title) => title.toLowerCase().includes(query.trim().toLowerCase())))
    : showAll ? modules : modules.slice(windowStart, windowStart + 6);

  return (
    <section id="progress" aria-labelledby="progress-title" className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Curriculum</p>
          <h2 id="progress-title" className="mt-1 text-xl font-semibold">Module progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">{completedModules} of {modules.length} modules complete. Open a module to see chapters, scores, and review status.</p>
        </div>
        <label className="relative block w-full shrink-0 sm:w-56">
          <span className="sr-only">Find a module or chapter</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a module" className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
      </div>

      {currentModule ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/25 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current focus · Module {currentModule.order}</p>
            <p className="mt-1 text-sm font-semibold">{currentModule.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{currentModule.completedCount}/{currentModule.chapters.length} chapters complete</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => { setQuery(""); setOpenModuleId(currentModule.id); }}>
            View chapters
          </Button>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{query ? "Search results" : showAll ? "All modules" : "Modules around current work"}</h3>
        {!query && modules.length > 6 ? <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show nearby modules" : `Browse all ${modules.length} modules`}</Button> : null}
      </div>

      <div className="mt-2 space-y-2">
        {visibleModules.map((module) => {
          const open = openModuleId === module.id;
          const percent = module.chapters.length ? Math.round((module.completedCount / module.chapters.length) * 100) : 0;
          return (
            <div key={module.id} className={cn("overflow-hidden rounded-xl border bg-background", module.id === currentModule?.id && "border-foreground/25")}>
              <button type="button" aria-expanded={open} aria-controls={`module-chapters-${module.id}`} onClick={() => setOpenModuleId(open ? null : module.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted font-mono text-xs font-semibold tabular-nums">{String(module.order).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{module.title}</span>
                  <span className="mt-1.5 block h-1.5 max-w-md overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground"><span className="block font-medium text-foreground">{percent}%</span>{module.completedCount}/{module.chapters.length} chapters</span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
              </button>
              {open ? <div id={`module-chapters-${module.id}`} className="border-t bg-muted/10">{module.chapters.map((chapter) => <ChapterRow key={chapter.id} chapter={chapter} flags={flagsByChapter.get(chapter.id) ?? 0} />)}</div> : null}
            </div>
          );
        })}
        {!visibleModules.length ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{modules.length ? "No modules match your search." : "No published curriculum is available for this course."}</p> : null}
      </div>
    </section>
  );
}
