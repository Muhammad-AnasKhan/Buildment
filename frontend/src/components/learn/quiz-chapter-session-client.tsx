"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playFeedback } from "@/lib/sound-feedback";
import { apiFetch } from "@/lib/api-client";
import { markChapterComplete } from "@/server/actions/progress";
import { cn } from "@/lib/utils";
import { QuizSessionContext, type QuizBlockGrade } from "@/components/learn/quiz-session-context";
import { QuizIntegrityPanel } from "@/components/learn/quiz-integrity-panel";
import { useQuizIntegrity } from "@/lib/integrity/use-quiz-integrity";

type QuizResultSummary = { score: number; maxScore: number; questions: number };

type QuizSubmitResponse = QuizResultSummary & {
  grades: Array<{ blockId: string; isCorrect: boolean | null; score: number | null; maxScore: number | null; selected: string[] }>;
};

function isPerfectScore(summary: QuizResultSummary | null) {
  return Boolean(summary && summary.maxScore > 0 && summary.score === summary.maxScore);
}

export function QuizChapterSessionClient({
  children,
  chapterId,
  chapterTitle,
  quizBlockIds,
  stepIds,
  individualActivityCount = 0,
  draftStoragePrefix,
  initialAnswers,
  initialScoreSummary,
  initialBlockGrades,
  nextHref,
  nextLocked,
  canMarkComplete,
  chapterComplete,
}: {
  children: React.ReactNode;
  chapterId: string;
  chapterTitle: string;
  quizBlockIds: string[];
  stepIds: string[];
  individualActivityCount?: number;
  draftStoragePrefix: string;
  initialAnswers: Record<string, string[]>;
  initialScoreSummary: QuizResultSummary | null;
  initialBlockGrades: Record<string, QuizBlockGrade>;
  nextHref?: string;
  nextLocked: boolean;
  canMarkComplete: boolean;
  chapterComplete: boolean;
}) {
  const router = useRouter();
  const steps = React.Children.toArray(children).filter(Boolean);
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [movingNext, setMovingNext] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scoreSummary, setScoreSummary] = useState<QuizResultSummary | null>(initialScoreSummary);
  const [blockGrades, setBlockGrades] = useState<Record<string, QuizBlockGrade>>(initialBlockGrades);
  const [dirtyBlockIds, setDirtyBlockIds] = useState<Set<string>>(() => new Set());
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string[]>>({});

  const perfectScore = useMemo(() => isPerfectScore(scoreSummary), [scoreSummary]);
  const reviewMode = scoreSummary !== null;

  // Integrity signals run while the quiz is still open; a finished quiz is not watched.
  const sectionRef = useRef<HTMLElement>(null);
  const integrity = useQuizIntegrity({
    chapterId,
    enabled: total > 0 && !chapterComplete && !(isPerfectScore(initialScoreSummary) && individualActivityCount === 0),
    rootRef: sectionRef,
    currentBlockId: stepIds[index] ?? null,
  });

  const [lastServerState, setLastServerState] = useState({ summary: initialScoreSummary, grades: initialBlockGrades });
  if (lastServerState.summary !== initialScoreSummary || lastServerState.grades !== initialBlockGrades) {
    setLastServerState({ summary: initialScoreSummary, grades: initialBlockGrades });
    setScoreSummary(initialScoreSummary);
    setBlockGrades(initialBlockGrades);
    setDirtyBlockIds(new Set());
  }

  useEffect(() => {
    if (isPerfectScore(initialScoreSummary) && individualActivityCount === 0) {
      window.dispatchEvent(new Event("buildment:quiz-perfect"));
    }
  }, [initialScoreSummary, individualActivityCount]);

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
    },
    [total]
  );

  useEffect(() => {
    const onAnswerChange = (event: Event) => {
      const detail = (event as CustomEvent<{ blockId: string; selected: string[] }>).detail;
      if (!detail || !Array.isArray(detail.selected)) return;
      setDraftAnswers((previous) => ({ ...previous, [detail.blockId]: detail.selected }));
      setDirtyBlockIds((previous) => {
        const next = new Set(previous);
        next.add(detail.blockId);
        return next;
      });
      setScoreSummary((previous) => (isPerfectScore(previous) ? previous : null));
      setSubmitError(null);
    };
    window.addEventListener("buildment:quiz-answer-change", onAnswerChange);
    return () => {
      window.removeEventListener("buildment:quiz-answer-change", onAnswerChange);
    };
  }, []);

  const submitQuiz = async () => {
    if (submitting || perfectScore || quizBlockIds.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    const answers = quizBlockIds.map((blockId) => {
      let selected = draftAnswers[blockId] ?? initialAnswers[blockId] ?? [];
      if (!Object.prototype.hasOwnProperty.call(draftAnswers, blockId)) {
        try {
          const saved = window.localStorage.getItem(`${draftStoragePrefix}:${blockId}`);
          if (saved !== null) {
            const parsed: unknown = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
              selected = parsed;
            }
          }
        } catch {
          // The active quiz component reports its selection through the page event.
        }
      }
      return { blockId, selected };
    });
    const unanswered = answers.filter((answer) => answer.selected.length === 0).length;
    if (
      unanswered > 0 &&
      !integrity.withoutFlags(() =>
        window.confirm(
          `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Submit anyway? Unanswered questions will be marked incorrect.`
        )
      )
    ) {
      setSubmitting(false);
      return;
    }
    integrity.checkPace(reviewMode ? quizBlockIds.filter((blockId) => dirtyBlockIds.has(blockId)) : quizBlockIds);

    try {
      const body = await apiFetch<QuizSubmitResponse>(`/api/v1/chapters/${encodeURIComponent(chapterId)}/quiz/submit`, {
        method: "POST",
        json: { answers },
      });

      const summary = { score: body.score, maxScore: body.maxScore, questions: body.questions };
      setScoreSummary(summary);
      setDirtyBlockIds(new Set());

      const gradesFromApi = Array.isArray(body.grades)
        ? (body.grades as Array<{
            blockId: string;
            isCorrect: boolean | null;
            selected?: string[];
          }>)
        : [];
      if (gradesFromApi.length > 0) {
        setBlockGrades((previous) => {
          const next = { ...previous };
          for (const grade of gradesFromApi) {
            const existing = previous[grade.blockId];
            next[grade.blockId] = {
              selected: Array.isArray(grade.selected)
                ? grade.selected.filter((item): item is string => typeof item === "string")
                : (existing?.selected ?? []),
              isCorrect: grade.isCorrect,
              explanation: existing?.explanation,
            };
          }
          return next;
        });
      }

      if (isPerfectScore(summary)) {
        playFeedback("celebration");
        if (individualActivityCount === 0) {
          integrity.finish();
          window.dispatchEvent(new Event("buildment:quiz-perfect"));
        }
        for (const blockId of quizBlockIds) {
          try {
            window.localStorage.removeItem(`${draftStoragePrefix}:${blockId}`);
          } catch {
            // Server is the source of truth after a perfect run.
          }
        }
      } else if (summary.score <= 0) {
        playFeedback("error");
      }
      if (!isPerfectScore(summary)) void integrity.nextAttempt();

      setDraftAnswers({});
      router.refresh();
    } catch (error) {
      playFeedback("error");
      setSubmitError(error instanceof Error ? error.message : "Could not submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const moveToNextChapter = async () => {
    if (!nextHref || movingNext) return;
    if (chapterComplete || (!nextLocked && (!perfectScore || !canMarkComplete))) {
      router.push(nextHref);
      return;
    }
    if (!perfectScore || !canMarkComplete) return;
    setMovingNext(true);
    setSubmitError(null);
    try {
      const result = await markChapterComplete({ chapterId });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      router.push(nextHref);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not open the next chapter.");
    } finally {
      setMovingNext(false);
    }
  };


  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  const sessionValue = useMemo(
    () => ({
      chapterTitle,
      questionTotal: total,
      reviewMode,
      dirtyBlockIds,
      blockGrades,
    }),
    [chapterTitle, total, reviewMode, dirtyBlockIds, blockGrades]
  );

  if (total === 0) return null;

  return (
    <QuizSessionContext.Provider value={sessionValue}>
      <section ref={sectionRef} id="quiz-chapter-session" className="not-prose mb-10 scroll-mt-24" aria-label="Quiz session">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quiz: {chapterTitle}
          </h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Question {index + 1} of {total}
          </p>
          <QuizIntegrityPanel integrity={integrity} />
          {individualActivityCount > 0 && <p className="mt-2 text-sm text-muted-foreground">Submit each open question, prediction, or code exercise with its own button. Written answers are reviewed separately; the score below covers multiple-choice questions.</p>}
          {scoreSummary ? (
            <p className="mt-2 text-sm text-foreground">
              Multiple-choice score {scoreSummary.score}/{scoreSummary.maxScore}
              {perfectScore ? " · all correct" : " · update answers and submit again"}
            </p>
          ) : null}
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label="Quiz progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out dark:bg-emerald-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        <div className="relative min-h-[12rem]">
          {steps.map((step, stepIndex) => (
            <div
              key={stepIds[stepIndex] ?? stepIndex}
              className={cn(stepIndex === index ? "block" : "hidden")}
              aria-hidden={stepIndex !== index}
              data-integrity-step={stepIds[stepIndex]}
            >
              {step}
            </div>
          ))}
        </div>

        {scoreSummary ? (
          <div
            className={cn(
              "mt-8 rounded-xl border px-4 py-3 text-sm",
              perfectScore
                ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                : "border-border bg-muted/40 text-foreground"
            )}
            role="status"
          >
            {perfectScore
              ? `${individualActivityCount > 0 ? "Multiple-choice complete" : "Quiz complete"} · ${scoreSummary.score}/${scoreSummary.maxScore} correct.`
              : `${scoreSummary.score}/${scoreSummary.maxScore} correct so far. Change any answer above, then submit again.`}
          </div>
        ) : null}

        <footer className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            className="gap-1"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Button>
          {index < total - 1 ? (
            <Button type="button" size="sm" onClick={() => go(index + 1)} className="gap-1">
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : perfectScore && nextHref ? (
            <Button
              type="button"
              size="sm"
              disabled={movingNext || (nextLocked && !chapterComplete && !canMarkComplete)}
              loading={movingNext}
              onClick={() => void moveToNextChapter()}
              className="gap-1.5"
            >
              {movingNext ? "Opening next chapter…" : nextLocked && !chapterComplete && !canMarkComplete ? "Finish remaining activities" : "Next chapter"}
              {!movingNext && (!nextLocked || chapterComplete || canMarkComplete) ? <ChevronRight className="size-4" aria-hidden /> : null}
            </Button>
          ) : quizBlockIds.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="sm"
                disabled={submitting || perfectScore}
                loading={submitting}
                onClick={() => void submitQuiz()}
              >
                {submitting ? "Submitting…" : perfectScore ? "Quiz complete" : scoreSummary ? "Submit again" : individualActivityCount > 0 ? "Submit multiple-choice answers" : "Submit quiz"}
              </Button>
              {!nextLocked && nextHref ? (
                <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={() => void moveToNextChapter()} className="gap-1.5">
                  Next chapter <ChevronRight className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <p className="text-sm text-muted-foreground">Submit each activity above. Its result or review status appears on the activity.</p>
              {!nextLocked && nextHref ? (
                <Button type="button" size="sm" variant="outline" onClick={() => void moveToNextChapter()} className="gap-1.5">
                  Next chapter <ChevronRight className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          )}
        </footer>
        {submitError ? <p className="mt-3 text-sm text-destructive">{submitError}</p> : null}
      </section>
    </QuizSessionContext.Provider>
  );
}
