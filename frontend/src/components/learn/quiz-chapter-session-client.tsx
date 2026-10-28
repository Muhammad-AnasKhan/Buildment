"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Dot } from "@/components/brand/dot";
import { Button } from "@/components/ui/button";
import { playFeedback } from "@/lib/sound-feedback";
import { apiFetch } from "@/lib/api-client";
import { markChapterComplete } from "@/server/actions/progress";
import { cn } from "@/lib/utils";
import { QuizSessionContext, type QuizBlockGrade } from "@buildment/learning-ui/components/learn/quiz-session-context";
import { QuizIntegrityPanel } from "@/components/learn/quiz-integrity-panel";
import { useQuizIntegrity } from "@/lib/integrity/use-quiz-integrity";
import { useMascot } from "@/lib/engagement/use-mascot";

type QuizResultSummary = { score: number; maxScore: number; questions: number };

type QuizSubmitResponse = QuizResultSummary & {
  grades: Array<{ blockId: string; isCorrect: boolean | null; score: number | null; maxScore: number | null; selected: string[] }>;
};

function isPerfectScore(summary: QuizResultSummary | null) {
  return Boolean(summary && summary.maxScore > 0 && summary.score === summary.maxScore);
}

function missedQuestionIndices(
  stepIds: string[],
  quizBlockIds: string[],
  grades: Record<string, QuizBlockGrade>
) {
  const quizIds = new Set(quizBlockIds);
  return stepIds.flatMap((id, index) =>
    quizIds.has(id) && grades[id]?.isCorrect !== true ? [index] : []
  );
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
  const { track } = useMascot();
  const steps = React.Children.toArray(children).filter(Boolean);
  const total = steps.length;
  const [index, setIndex] = useState(() =>
    isPerfectScore(initialScoreSummary)
      ? Math.max(0, total - 1)
      : initialScoreSummary
        ? (missedQuestionIndices(stepIds, quizBlockIds, initialBlockGrades)[0] ?? 0)
        : 0
  );
  const [retryMissed, setRetryMissed] = useState(() =>
    Boolean(
      initialScoreSummary &&
      !isPerfectScore(initialScoreSummary) &&
      missedQuestionIndices(stepIds, quizBlockIds, initialBlockGrades).length > 0
    )
  );
  const [submitting, setSubmitting] = useState(false);
  const [movingNext, setMovingNext] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Step indexes of questions with no answer, shown as an inline note instead of a browser pop-up.
  const [unanswered, setUnanswered] = useState<number[]>([]);
  const [scoreSummary, setScoreSummary] = useState<QuizResultSummary | null>(initialScoreSummary);
  const [blockGrades, setBlockGrades] = useState<Record<string, QuizBlockGrade>>(initialBlockGrades);
  const [dirtyBlockIds, setDirtyBlockIds] = useState<Set<string>>(() => new Set());
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string[]>>({});

  const perfectScore = useMemo(() => isPerfectScore(scoreSummary), [scoreSummary]);
  const reviewMode = scoreSummary !== null;
  const missedIndices = useMemo(
    () => missedQuestionIndices(stepIds, quizBlockIds, blockGrades),
    [stepIds, quizBlockIds, blockGrades]
  );
  const visibleIndices = useMemo(
    () => retryMissed && !perfectScore && missedIndices.length > 0
      ? missedIndices
      : Array.from({ length: total }, (_, stepIndex) => stepIndex),
    [retryMissed, perfectScore, missedIndices, total]
  );
  const position = Math.max(0, visibleIndices.indexOf(index));
  const activeIndex = visibleIndices[position] ?? 0;

  // Integrity signals run while the quiz is still open; a finished quiz is not watched.
  const sectionRef = useRef<HTMLElement>(null);
  const integrity = useQuizIntegrity({
    chapterId,
    enabled: total > 0 && !chapterComplete && !(isPerfectScore(initialScoreSummary) && individualActivityCount === 0),
    rootRef: sectionRef,
    currentBlockId: stepIds[activeIndex] ?? null,
  });

  const [lastServerState, setLastServerState] = useState({ summary: initialScoreSummary, grades: initialBlockGrades });
  if (lastServerState.summary !== initialScoreSummary || lastServerState.grades !== initialBlockGrades) {
    setLastServerState({ summary: initialScoreSummary, grades: initialBlockGrades });
    setScoreSummary(initialScoreSummary);
    setBlockGrades(initialBlockGrades);
    setDirtyBlockIds(new Set());
    const firstMissed = missedQuestionIndices(stepIds, quizBlockIds, initialBlockGrades)[0];
    setRetryMissed(Boolean(initialScoreSummary && !isPerfectScore(initialScoreSummary) && firstMissed !== undefined));
    if (initialScoreSummary && !isPerfectScore(initialScoreSummary) && firstMissed !== undefined) {
      setIndex(firstMissed);
    } else if (isPerfectScore(initialScoreSummary)) {
      setIndex(Math.max(0, total - 1));
    }
  }

  useEffect(() => {
    if (isPerfectScore(initialScoreSummary) && individualActivityCount === 0) {
      window.dispatchEvent(new Event("buildment:quiz-perfect"));
    }
  }, [initialScoreSummary, individualActivityCount]);

  const go = (nextPosition: number) => {
    const boundedPosition = Math.max(0, Math.min(visibleIndices.length - 1, nextPosition));
    setIndex(visibleIndices[boundedPosition] ?? 0);
  };

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
      setSubmitError(null);
      setUnanswered((previous) => (previous.length > 0 ? previous.filter((stepIndex) => stepIds[stepIndex] !== detail.blockId) : previous));
    };
    window.addEventListener("buildment:quiz-answer-change", onAnswerChange);
    return () => {
      window.removeEventListener("buildment:quiz-answer-change", onAnswerChange);
    };
  }, [stepIds]);

  const submitQuiz = async (force = false) => {
    if (submitting || perfectScore || quizBlockIds.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    const answers = quizBlockIds.map((blockId) => {
      const savedCorrectAnswer = blockGrades[blockId]?.isCorrect === true
        ? blockGrades[blockId].selected
        : null;
      let selected = savedCorrectAnswer ?? draftAnswers[blockId] ?? initialAnswers[blockId] ?? [];
      if (!savedCorrectAnswer && !Object.prototype.hasOwnProperty.call(draftAnswers, blockId)) {
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
    const missing = answers.flatMap((answer) => (answer.selected.length === 0 ? [stepIds.indexOf(answer.blockId)] : []));
    if (missing.length > 0 && !force) {
      setUnanswered(missing.filter((stepIndex) => stepIndex >= 0));
      setSubmitting(false);
      return;
    }
    setUnanswered([]);
    integrity.checkPace(reviewMode ? quizBlockIds.filter((blockId) => dirtyBlockIds.has(blockId)) : quizBlockIds);

    try {
      const body = await apiFetch<QuizSubmitResponse>(`/api/v1/chapters/${encodeURIComponent(chapterId)}/quiz/submit`, {
        method: "POST",
        json: { answers },
      });

      const summary = { score: body.score, maxScore: body.maxScore, questions: body.questions };
      setScoreSummary(summary);
      track({ type: "quiz_submitted", chapterId });
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

      const nextMissed = missedQuestionIndices(
        stepIds,
        quizBlockIds,
        Object.fromEntries(gradesFromApi.map((grade) => [grade.blockId, { selected: grade.selected ?? [], isCorrect: grade.isCorrect }]))
      );
      setRetryMissed(!isPerfectScore(summary) && nextMissed.length > 0);
      if (isPerfectScore(summary)) setIndex(Math.max(0, total - 1));
      else if (nextMissed.length > 0) setIndex(nextMissed[0]);

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
      track({ type: "chapter_completed", chapterId });
      router.push(nextHref);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not open the next chapter.");
    } finally {
      setMovingNext(false);
    }
  };


  const progressPct = visibleIndices.length > 0 ? ((position + 1) / visibleIndices.length) * 100 : 0;

  const sessionValue = useMemo(
    () => ({
      chapterTitle,
      questionTotal: total,
      reviewMode,
      dirtyBlockIds,
      blockGrades,
      reportWrongAttempt: () => {
        void integrity.nextAttempt();
      },
    }),
    [chapterTitle, total, reviewMode, dirtyBlockIds, blockGrades, integrity]
  );

  if (total === 0) return null;

  return (
    <QuizSessionContext.Provider value={sessionValue}>
      <section ref={sectionRef} id="quiz-chapter-session" className="not-prose mb-10 scroll-mt-24" aria-label="Quiz session">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl tracking-[-0.035em] text-foreground sm:text-3xl">
            Quiz: {chapterTitle}
          </h1>
          <p className="mt-3 text-base font-bold text-muted-foreground">
            Question {position + 1} of {visibleIndices.length}{retryMissed && !perfectScore ? " to retry" : ""}
          </p>
          <QuizIntegrityPanel integrity={integrity} questionCount={total} />
          {individualActivityCount > 0 && (
            <p className="mt-2 text-base text-muted-foreground">
              Open questions and code exercises have their own Submit button.
            </p>
          )}
          <div
            className="mt-4 h-2 overflow-hidden rounded-sm bg-secondary"
            role="progressbar"
            aria-valuenow={position + 1}
            aria-valuemin={1}
            aria-valuemax={visibleIndices.length}
            aria-label="Quiz progress"
          >
            <div
              className="h-full rounded-sm bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        {scoreSummary ? (
          <div role="status" className="mb-8 border border-border bg-card p-5 sm:p-7">
            <p className="text-sm font-bold text-primary">Result</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-[family-name:var(--font-heading)] text-[56px] font-bold leading-none tracking-[-0.035em] sm:text-[72px]">
                {scoreSummary.score} of {scoreSummary.maxScore}
              </span>
              <span className="pb-1 text-xl font-bold">correct</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Dot mood={perfectScore ? "cheer" : "determined"} size={72} />
              <p className="bg-secondary px-4 py-3 text-base font-bold leading-snug">
                {perfectScore
                  ? individualActivityCount > 0
                    ? "All multiple-choice answers are right."
                    : "All correct. Well done."
                  : `${missedIndices.length} ${missedIndices.length === 1 ? "idea" : "ideas"} to look at again. Retry when you are ready.`}
              </p>
            </div>
            {!perfectScore && missedIndices.length > 0 ? (
              <>
                <p className="mt-6 text-lg font-bold">Look at again</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {missedIndices.map((stepIndex) => (
                    <li key={stepIndex}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRetryMissed(true);
                          setIndex(stepIndex);
                        }}
                      >
                        Question {stepIndex + 1}
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => {
                      setRetryMissed(true);
                      setIndex(missedIndices[0] ?? 0);
                    }}
                    className="sm:min-w-64"
                  >
                    <RotateCcw aria-hidden />
                    Retry {missedIndices.length} missed {missedIndices.length === 1 ? "question" : "questions"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRetryMissed(false);
                      setIndex(0);
                    }}
                  >
                    Review all answers
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Your best score is kept.</p>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="relative min-h-[12rem]">
          {steps.map((step, stepIndex) => (
            <div
              key={stepIds[stepIndex] ?? stepIndex}
              className={cn(stepIndex === activeIndex ? "block" : "hidden")}
              aria-hidden={stepIndex !== activeIndex}
              data-integrity-step={stepIds[stepIndex]}
            >
              {step}
            </div>
          ))}
        </div>

        {unanswered.length > 0 ? (
          <div role="status" className="mt-8 border-2 border-brand-yellow bg-brand-yellow/15 p-4 text-base leading-6">
            <p>
              <b>{unanswered.length === 1 ? "1 question has no answer yet." : `${unanswered.length} questions have no answer yet.`}</b>{" "}
              Tap a number to go there.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {unanswered.map((stepIndex) => (
                <Button key={stepIndex} type="button" size="sm" variant="outline" className="min-w-14" onClick={() => setIndex(stepIndex)}>
                  {stepIndex + 1}
                </Button>
              ))}
              <Button type="button" size="sm" variant="ghost" onClick={() => void submitQuiz(true)}>
                Submit anyway
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Questions without an answer are marked wrong.</p>
          </div>
        ) : null}

        <footer className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={position === 0}
            onClick={() => go(position - 1)}
            className="gap-1"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Button>
          {position < visibleIndices.length - 1 ? (
            <Button type="button" size="sm" onClick={() => go(position + 1)} className="gap-1">
              {retryMissed && !perfectScore ? "Next missed question" : "Next"}
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
        {submitError ? <p className="mt-3 text-sm text-destructive" role="alert">{submitError}</p> : null}
      </section>
    </QuizSessionContext.Provider>
  );
}
