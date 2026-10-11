"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
import { QuizPromptBody } from "@/components/learn/quiz-prompt-body";
import { useQuizSession } from "@/components/learn/quiz-session-context";
import { readerCard, readerCardFooter, readerCardHeader, readerTitle } from "@/components/learn/reader-theme";
import { firePartyPops } from "@/components/learn/party-pops";
import { playFeedback } from "@/lib/sound-feedback";
import { checkpointAttrs } from "@/components/learn/checkpoint-marker";
import type { SanitizedQuizConfig } from "./schema";

type RespondResult = {
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

export type QuizInitialState = {
  selected: string[];
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

function ResultBanner({ result }: { result: RespondResult }) {
  const correct = result.isCorrect === true;
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3.5 text-sm",
        correct
          ? "border-emerald-300 bg-emerald-500/10 text-emerald-950 dark:border-emerald-800 dark:text-emerald-100"
          : "border-red-300 bg-red-500/10 text-red-950 dark:border-red-900/80 dark:bg-red-950/30 dark:text-red-50"
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        {correct ? (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950">
            <CheckCircle2 className="size-4" />
          </div>
        ) : (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-700 dark:text-red-400">
            <XCircle className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold tracking-tight">
              {correct ? "Correct! Well done" : "Wrong answer. Select the correct option."}
            </p>
            {correct ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                <Sparkles className="size-3" />
                +100%
              </span>
            ) : null}
          </div>
          {result.explanation ? (
            <p className="mt-1.5 leading-relaxed opacity-90">{result.explanation}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function QuizClient({
  id,
  config,
  initialState,
  presentation = "standalone",
  draftStorageKey,
  correctOptionIds,
}: {
  id: string;
  config: SanitizedQuizConfig;
  initialState?: QuizInitialState | null;
  presentation?: "standalone" | "wizard";
  draftStorageKey?: string;
  correctOptionIds?: string[];
}) {
  const router = useRouter();
  const quizSession = useQuizSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const wizardStorageHydrated = useRef(false);
  const isMultiple = config.quizType === "multiple";
  const [selected, setSelected] = useState<string[]>(initialState?.selected ?? []);
  const [result, setResult] = useState<RespondResult | null>(
    initialState
      ? {
          isCorrect: initialState.isCorrect,
          score: initialState.score,
          maxScore: initialState.maxScore,
          explanation: initialState.explanation,
        }
      : null
  );
  const [wrongSelection, setWrongSelection] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(presentation !== "wizard");

  useEffect(() => {
    if (isShaking) {
      const timer = window.setTimeout(() => setIsShaking(false), 450);
      return () => window.clearTimeout(timer);
    }
  }, [isShaking]);

  useEffect(() => {
    if (isSuccessGlow) {
      const timer = window.setTimeout(() => setIsSuccessGlow(false), 800);
      return () => window.clearTimeout(timer);
    }
  }, [isSuccessGlow]);

  useEffect(() => {
    if (!initialState) return;
    if (presentation !== "wizard") {
      setSelected(initialState.selected);
      setResult({
        isCorrect: initialState.isCorrect,
        score: initialState.score,
        maxScore: initialState.maxScore,
        explanation: initialState.explanation,
      });
      if (initialState.isCorrect === false) {
        setWrongSelection(initialState.selected);
      }
    }
  }, [initialState, presentation]);

  useEffect(() => {
    if (presentation !== "wizard" || !quizSession) return;
    const grade = quizSession.blockGrades[id];
    const showReview = quizSession.reviewMode && grade && !quizSession.dirtyBlockIds.has(id);
    if (!showReview || !grade) return;
    setSelected(grade.selected);
    setResult({
      isCorrect: grade.isCorrect,
      score: grade.isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: grade.explanation,
    });
    setWrongSelection(grade.isCorrect === false ? grade.selected : []);
  }, [presentation, quizSession, id]);

  useEffect(() => {
    if (presentation !== "wizard" || !draftStorageKey) {
      setDraftLoaded(true);
      return;
    }
    if (wizardStorageHydrated.current) {
      setDraftLoaded(true);
      return;
    }
    wizardStorageHydrated.current = true;
    if (quizSession?.reviewMode) {
      setDraftLoaded(true);
      return;
    }
    try {
      const saved = window.localStorage.getItem(draftStorageKey);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
          setSelected(parsed);
        }
      } else if (initialState?.selected.length) {
        setSelected(initialState.selected);
      }
    } catch {
      // Draft persistence is best-effort; selections still work in memory.
    }
    setDraftLoaded(true);
  }, [presentation, draftStorageKey, quizSession?.reviewMode, initialState?.selected, id]);

  useEffect(() => {
    if (!draftStorageKey || !draftLoaded) return;
    if (presentation === "wizard") {
      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(selected));
      } catch {
        // The quiz remains usable when browser storage is unavailable.
      }
      return;
    }
    if (result) return;
    try {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(selected));
    } catch {
      // The quiz remains usable when browser storage is unavailable.
    }
  }, [presentation, draftStorageKey, draftLoaded, result, selected]);

  async function submitSelection(nextSelected: string[]) {
    setSubmitting(true);
    setError(null);
    try {
      if (id === "preview-quiz" || (correctOptionIds && correctOptionIds.length > 0 && id.startsWith("preview"))) {
        const correctSet = new Set(correctOptionIds ?? []);
        const selectedSet = new Set(nextSelected);
        const isCorrect =
          correctSet.size > 0
            ? selectedSet.size === correctSet.size && [...selectedSet].every((optionId) => correctSet.has(optionId))
            : true;
        const data: RespondResult = {
          isCorrect,
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          explanation: config.explanation,
        };
        applyResult(data, nextSelected);
        router.refresh();
        return;
      }

      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "QUIZ", selected: nextSelected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 404 && correctOptionIds && correctOptionIds.length > 0) {
          const correctSet = new Set(correctOptionIds);
          const selectedSet = new Set(nextSelected);
          const isCorrect =
            correctSet.size === selectedSet.size && [...selectedSet].every((optionId) => correctSet.has(optionId));
          const data: RespondResult = {
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            explanation: config.explanation,
          };
          applyResult(data, nextSelected);
          router.refresh();
          return;
        }
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as RespondResult;
      applyResult(data, nextSelected);
      router.refresh();
    } catch (err) {
      playFeedback("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function applyResult(data: RespondResult, nextSelected: string[]) {
    setResult(data);
    if (data.isCorrect === true) {
      setWrongSelection([]);
      setIsSuccessGlow(true);
      setIsShaking(false);
      firePartyPops({ withSound: false });
      playFeedback("success");
    } else if (data.isCorrect === false) {
      setWrongSelection(nextSelected);
      setIsSuccessGlow(false);
      setIsShaking(true);
      playFeedback("error");
    }
  }

  async function submit() {
    await submitSelection(selected);
  }

  function toggle(optionId: string) {
    let next: string[];
    if (isMultiple) {
      next = selected.includes(optionId)
        ? selected.filter((option) => option !== optionId)
        : [...selected, optionId];
    } else {
      next = [optionId];
    }
    setSelected(next);

    if (presentation === "wizard") {
      setResult(null);
      setWrongSelection([]);
      window.dispatchEvent(
        new CustomEvent("buildment:quiz-answer-change", { detail: { blockId: id, selected: next } })
      );
      return;
    }

    if (result?.isCorrect === false) {
      setResult(null);
      setWrongSelection([]);
      if (!isMultiple) {
        void submitSelection(next);
      }
      return;
    }

    if (result?.isCorrect === true) {
      return;
    }
  }

  const wizardReviewGrade =
    presentation === "wizard" && quizSession?.reviewMode && !quizSession.dirtyBlockIds.has(id)
      ? quizSession.blockGrades[id]
      : undefined;
  const wizardShowingReview = Boolean(wizardReviewGrade && wizardReviewGrade.isCorrect !== null);
  const optionsLocked =
    (wizardShowingReview && wizardReviewGrade?.isCorrect === true) || result?.isCorrect === true;
  const hasAnswered = result !== null;
  const settled = hasAnswered && (result.isCorrect === true || config.allowRetry === false);
  const showWrongOptions = result?.isCorrect === false;
  const showCorrectOptions = result?.isCorrect === true;

  const optionsBlock = (
    <QuizOptions
      options={config.options}
      selected={selected}
      onToggle={toggle}
      disabled={optionsLocked}
      multiple={isMultiple}
      incorrectOptionIds={showWrongOptions ? wrongSelection : []}
      correctOptionIds={showCorrectOptions ? selected : []}
      showAnswerState={showWrongOptions || showCorrectOptions}
    />
  );

  const actionsBlock = hasAnswered && result && (presentation !== "wizard" || wizardShowingReview) ? (
      <ResultBanner result={result} />
    ) : presentation === "wizard" ? (
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {selected.length === 0
          ? "Choose an answer. You can change it before submitting the quiz."
          : `${selected.length} selected · saved on this device`}
      </p>
    ) : (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button
          type="button"
          size="sm"
          onClick={() => void submit()}
          disabled={selected.length === 0 || submitting}
          className="h-9 rounded-md px-5 shadow-none transition-all active:scale-[0.98]"
        >
          {submitting ? "Checking…" : "Check answer"}
        </Button>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {selected.length === 0
              ? "Select an option, then check your answer"
              : `${selected.length} selected`}
          </p>
        )}
      </div>
    );

  if (presentation === "wizard") {
    return (
      <div
        ref={cardRef}
        {...checkpointAttrs(id, settled)}
        className={cn(
          "not-prose scroll-mt-24 space-y-8 transition-all duration-300",
          isShaking && "animate-feedback-shake",
          isSuccessGlow && "animate-feedback-success"
        )}
      >
        <QuizPromptBody prompt={config.prompt} className="font-medium sm:text-lg" />
        {optionsBlock}
        {actionsBlock}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      {...checkpointAttrs(id, settled)}
      className={cn(
        "not-prose my-8 scroll-mt-24 transition-all duration-300",
        readerCard,
        isShaking && "animate-feedback-shake",
        isSuccessGlow && "animate-feedback-success"
      )}
    >
      <div className={cn(readerCardHeader, "flex items-start gap-3")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
          <span className="text-xs font-semibold">Q</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Knowledge check
          </p>
          <div className={cn("mt-2", readerTitle)}>
            <QuizPromptBody prompt={config.prompt} />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 sm:px-6">{optionsBlock}</div>
      <div className={readerCardFooter}>{actionsBlock}</div>
    </div>
  );
}
