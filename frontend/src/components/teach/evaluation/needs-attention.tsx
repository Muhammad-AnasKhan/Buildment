"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, CircleAlert, CircleHelp, ClockAlert, RotateCcw, X, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatStudyAmount } from "@/lib/format-study-duration";
import { cn } from "@/lib/utils";
import type { EvaluationAttention, MenteeEvaluation } from "@/shared/api/teach";

const iconByKind = { review: CircleAlert, revision: RotateCcw, help: CircleHelp, incorrect: XCircle, stalled: ClockAlert, inactive: ClockAlert } as const;

function AttentionContext({ item, evaluation }: { item: EvaluationAttention; evaluation: MenteeEvaluation }) {
  const sourceId = item.id.slice(item.id.indexOf("-") + 1);
  const submission = item.kind === "review" || item.kind === "revision" || item.kind === "incorrect"
    ? evaluation.submissions.find((entry) => entry.id === sourceId)
    : null;
  const question = item.kind === "help" ? evaluation.help.find((entry) => entry.id === sourceId) : null;
  const chapter = item.kind === "stalled"
    ? evaluation.modules.flatMap((module) => module.chapters).find((entry) => entry.id === sourceId)
    : null;

  if (submission) {
    return (
      <section aria-labelledby="attention-context-title" className="rounded-xl border bg-card p-4">
        <h3 id="attention-context-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submission context</h3>
        <p className="mt-3 text-xs text-muted-foreground">{submission.moduleTitle} · {submission.chapterTitle}</p>
        <p className="mt-1 text-sm font-semibold leading-6">{submission.prompt ?? submission.type.toLowerCase().replaceAll("_", " ")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{submission.status.toLowerCase().replaceAll("_", " ")}</Badge>
          <span className="text-xs text-muted-foreground">Attempt {submission.attempt} · {new Date(submission.submittedAt).toLocaleString()}</span>
        </div>
        <div className="mt-4 rounded-lg border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">Learner answer</p>
          <p className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap text-sm leading-6">{submission.answer || "No written answer"}</p>
        </div>
        {submission.feedback ? <div className="mt-3 rounded-lg bg-muted/40 p-3"><p className="text-xs font-medium">Previous feedback</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{submission.feedback}</p></div> : null}
      </section>
    );
  }

  if (question) {
    return (
      <section aria-labelledby="attention-context-title" className="rounded-xl border bg-card p-4">
        <h3 id="attention-context-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learner question</h3>
        <p className="mt-3 text-sm font-semibold">{question.chapterTitle}</p>
        <p className="mt-2 whitespace-pre-wrap rounded-lg border bg-background p-3 text-sm leading-6">{question.preview}</p>
        <p className="mt-3 text-xs text-muted-foreground">Updated {new Date(question.updatedAt).toLocaleString()}</p>
      </section>
    );
  }

  if (chapter) {
    return (
      <section aria-labelledby="attention-context-title" className="rounded-xl border bg-card p-4">
        <h3 id="attention-context-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chapter progress</h3>
        <p className="mt-3 text-sm font-semibold">{chapter.title}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Checkpoints</p><p className="mt-1 font-semibold">{chapter.blocksCompleted}/{chapter.blocksTotal}</p></div>
          <div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Study time</p><p className="mt-1 font-semibold">{formatStudyAmount(chapter.timeSpentSeconds)}</p></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Extra time can mean the learner is working through a difficult topic. Check their recent work before reaching out.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="attention-context-title" className="rounded-xl border bg-card p-4">
      <h3 id="attention-context-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learning activity</h3>
      <p className="mt-3 text-sm font-medium">{evaluation.enrollment.lastActiveLabel}</p>
      <p className="mt-1 text-sm text-muted-foreground">{formatStudyAmount(evaluation.enrollment.studyWeekSeconds)} studied this week · {evaluation.enrollment.chaptersCompleted} chapters completed</p>
    </section>
  );
}

export function NeedsAttentionDrawer({ evaluation, selectedIndex, onSelect, onClose, onNavigate }: {
  evaluation: MenteeEvaluation;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onClose: () => void;
  onNavigate: (hash: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const items = evaluation.attention;
  const currentIndex = selectedIndex ?? 0;
  const item = selectedIndex === null ? null : items[currentIndex] ?? null;
  const Icon = item ? iconByKind[item.kind] : CircleAlert;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="attention-drawer-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl border-0 border-l bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60 open:flex open:flex-col"
    >
      {item ? (
        <>
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Mentor queue · {currentIndex + 1} of {items.length}</p>
              <h2 id="attention-drawer-title" className="mt-1 text-xl font-semibold tracking-tight">Needs attention</h2>
              <p className="mt-1 text-sm text-muted-foreground">{evaluation.mentee.name} · {evaluation.course.title}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close attention panel"><X className="size-4" aria-hidden /></Button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"><Icon className="size-5" aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground capitalize">{item.kind.replaceAll("_", " ")}</p>
                <h3 className="mt-0.5 text-lg font-semibold leading-6">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            </div>

            <AttentionContext item={item} evaluation={evaluation} />

            {items.length > 1 ? (
              <details className="rounded-xl border bg-card">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Browse all {items.length} attention items</summary>
                <div className="max-h-56 space-y-1 overflow-y-auto border-t p-2">
                  {items.map((entry, index) => (
                    <button key={entry.id} type="button" onClick={() => onSelect(index)} aria-current={index === currentIndex ? "true" : undefined} className={cn("flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted", index === currentIndex && "bg-muted font-medium")}>
                      <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">{index + 1}.</span>
                      <span><span className="block">{entry.title}</span><span className="block text-xs font-normal text-muted-foreground">{entry.detail}</span></span>
                    </button>
                  ))}
                </div>
              </details>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background px-5 py-4 sm:px-6">
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="icon" onClick={() => onSelect(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} aria-label="Previous attention item"><ChevronLeft className="size-4" aria-hidden /></Button>
              <Button type="button" variant="outline" size="icon" onClick={() => onSelect(Math.min(items.length - 1, currentIndex + 1))} disabled={currentIndex === items.length - 1} aria-label="Next attention item"><ChevronRight className="size-4" aria-hidden /></Button>
            </div>
            {item.href.startsWith("#") ? (
              <Button type="button" onClick={() => onNavigate(item.href)} className="gap-2">{item.action}<ArrowRight className="size-4" aria-hidden /></Button>
            ) : (
              <Link href={item.href} className={cn(buttonVariants({}), "gap-2")}>{item.action === "Reply" ? "Open question to reply" : item.action === "Review" ? "Open full review" : item.action}<ArrowRight className="size-4" aria-hidden /></Link>
            )}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
