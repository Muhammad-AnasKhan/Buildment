"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizResultSummary = { score: number; maxScore: number; questions: number };

export function QuizChapterSessionClient({
  children,
  chapterId,
  quizBlockIds,
  draftStoragePrefix,
  initialAnswers,
  initialQuizResult,
}: {
  children: React.ReactNode;
  chapterId: string;
  quizBlockIds: string[];
  draftStoragePrefix: string;
  initialAnswers: Record<string, string[]>;
  initialQuizResult: QuizResultSummary | null;
}) {
  const router = useRouter();
  const steps = React.Children.toArray(children).filter(Boolean);
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResultSummary | null>(initialQuizResult);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setIndex(0);
  }, [total]);

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [total]
  );

  useEffect(() => {
    setResult(initialQuizResult);
  }, [initialQuizResult]);

  useEffect(() => {
    const onRetry = () => setResult(null);
    const onAnswerChange = (event: Event) => {
      const detail = (event as CustomEvent<{ blockId: string; selected: string[] }>).detail;
      if (!detail || !Array.isArray(detail.selected)) return;
      setDraftAnswers((previous) => ({ ...previous, [detail.blockId]: detail.selected }));
    };
    window.addEventListener("buildment:quiz-retry", onRetry);
    window.addEventListener("buildment:quiz-answer-change", onAnswerChange);
    return () => {
      window.removeEventListener("buildment:quiz-retry", onRetry);
      window.removeEventListener("buildment:quiz-answer-change", onAnswerChange);
    };
  }, []);

  const submitQuiz = async () => {
    if (submitting || result || quizBlockIds.length === 0) return;
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
    if (unanswered > 0 && !window.confirm(`${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Submit anyway? Unanswered questions will be marked incorrect.`)) {
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/chapters/${encodeURIComponent(chapterId)}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status})`);
      setResult({ score: body.score, maxScore: body.maxScore, questions: body.questions });
      setDraftAnswers({});
      for (const blockId of quizBlockIds) {
        try {
          window.localStorage.removeItem(`${draftStoragePrefix}:${blockId}`);
        } catch {
          // A stale draft is ignored because the server now has the submitted response.
        }
      }
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (total === 0) return null;

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <section
      className="not-prose mb-10 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
      aria-label="Quiz session"
    >
      <header className="border-b border-border bg-muted/40 px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Knowledge check</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Select your answers, then submit at the end to see quiz feedback. Other activities save separately.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs tabular-nums text-muted-foreground">{index + 1} / {total}</p>
            {result ? <p className="mt-1 text-xs font-semibold text-foreground">Score {result.score}/{result.maxScore}</p> : null}
          </div>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Quiz progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-8">{steps[index]}</div>

      {result ? (
        <div className="border-t border-border bg-emerald-500/10 px-5 py-3 text-sm font-medium text-foreground sm:px-8" role="status">
          Quiz submitted · {result.score}/{result.maxScore} correct. Review each answer for feedback.
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-8">
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
        <span className="hidden text-xs text-muted-foreground sm:inline">
          You can change answers before submitting.
        </span>
        {index < total - 1 ? (
          <Button type="button" size="sm" onClick={() => go(index + 1)} className="gap-1">
            Next <ChevronRight className="size-4" aria-hidden />
          </Button>
        ) : quizBlockIds.length > 0 ? (
          <Button type="button" size="sm" disabled={submitting || Boolean(result)} onClick={() => void submitQuiz()}>
            {submitting ? "Submitting…" : result ? "Submitted" : "Submit quiz"}
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={index >= total - 1} onClick={() => go(index + 1)} className="gap-1">
            Next <ChevronRight className="size-4" aria-hidden />
          </Button>
        )}
      </footer>
      {submitError ? <p className="border-t border-border px-5 py-3 text-sm text-destructive sm:px-8">{submitError}</p> : null}
    </section>
  );
}
