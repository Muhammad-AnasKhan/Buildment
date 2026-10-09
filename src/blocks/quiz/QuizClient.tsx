"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
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

function ResultBanner({
  result,
  canRetry,
  onRetry,
}: {
  result: RespondResult;
  canRetry: boolean;
  onRetry: () => void;
}) {
  const correct = result.isCorrect === true;
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border px-4 py-3.5 text-sm transition-all duration-300",
          correct
            ? "border-emerald-300 bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-teal-50/40 text-emerald-950 shadow-sm shadow-emerald-500/10 dark:border-emerald-800 dark:from-emerald-950/40 dark:via-emerald-950/25 dark:to-teal-950/20 dark:text-emerald-100"
            : "border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-50"
        )}
      >
        <div className="flex items-start gap-3">
          {correct ? (
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm dark:bg-emerald-400 dark:text-emerald-950">
              <CheckCircle2 className="size-4" />
            </div>
          ) : (
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <XCircle className="size-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold tracking-tight">
                {correct ? "Correct! Well done" : "Review your answer"}
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
      {canRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 border-border/80 text-muted-foreground hover:text-foreground"
          onClick={onRetry}
        >
          <RotateCcw className="size-3.5" />
          Try again
        </Button>
      ) : null}
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
  const cardRef = useRef<HTMLDivElement>(null);
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
    setSelected(initialState.selected);
    setResult({
      isCorrect: initialState.isCorrect,
      score: initialState.score,
      maxScore: initialState.maxScore,
      explanation: initialState.explanation,
    });
  }, [initialState]);

  useEffect(() => {
    if (presentation !== "wizard" || !draftStorageKey) {
      setDraftLoaded(true);
      return;
    }
    try {
      const saved = window.localStorage.getItem(draftStorageKey);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
          setSelected(parsed);
          setResult(null);
          window.dispatchEvent(new CustomEvent("buildment:quiz-answer-change", { detail: { blockId: id, selected: parsed } }));
        }
      }
    } catch {
      // Draft persistence is best-effort; selections still work in memory.
    }
    setDraftLoaded(true);
  }, [presentation, draftStorageKey, initialState, id]);

  useEffect(() => {
    if (presentation !== "wizard" || !draftStorageKey || !draftLoaded || result) return;
    try {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(selected));
    } catch {
      // The quiz remains usable when browser storage is unavailable.
    }
  }, [presentation, draftStorageKey, draftLoaded, result, selected]);

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
      window.dispatchEvent(new CustomEvent("buildment:quiz-answer-change", { detail: { blockId: id, selected: next } }));
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (id === "preview-quiz" || (correctOptionIds && correctOptionIds.length > 0 && id.startsWith("preview"))) {
        const correctSet = new Set(correctOptionIds ?? []);
        const selectedSet = new Set(selected);
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
        setResult(data);

        if (data.isCorrect === true) {
          setIsSuccessGlow(true);
          setIsShaking(false);
          firePartyPops({ withSound: false });
          playFeedback("success");
        } else if (data.isCorrect === false) {
          setIsSuccessGlow(false);
          setIsShaking(true);
          playFeedback("error");
        }

        router.refresh();
        return;
      }

      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "QUIZ", selected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 404 && correctOptionIds && correctOptionIds.length > 0) {
          const correctSet = new Set(correctOptionIds);
          const selectedSet = new Set(selected);
          const isCorrect =
            correctSet.size === selectedSet.size && [...selectedSet].every((optionId) => correctSet.has(optionId));
          const data: RespondResult = {
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            explanation: config.explanation,
          };
          setResult(data);

          if (data.isCorrect === true) {
            setIsSuccessGlow(true);
            setIsShaking(false);
            firePartyPops({ withSound: false });
            playFeedback("success");
          } else if (data.isCorrect === false) {
            setIsSuccessGlow(false);
            setIsShaking(true);
            playFeedback("error");
          }

          router.refresh();
          return;
        }
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as RespondResult;
      setResult(data);

      if (data.isCorrect === true) {
        setIsSuccessGlow(true);
        setIsShaking(false);
        firePartyPops({ withSound: false });
        playFeedback("success");
      } else if (data.isCorrect === false) {
        setIsSuccessGlow(false);
        setIsShaking(true);
        playFeedback("error");
      }

      router.refresh();
    } catch (err) {
      playFeedback("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canRetry = Boolean(result && !result.isCorrect && config.allowRetry);
  const hasAnswered = result !== null;
  const settled = hasAnswered && (result.isCorrect === true || config.allowRetry === false);

  const optionsBlock = (
    <div
      className={cn(
        presentation === "wizard" ? "overflow-hidden rounded-xl border border-border" : ""
      )}
    >
      <QuizOptions
        options={config.options}
        selected={selected}
        onToggle={toggle}
        disabled={hasAnswered}
        multiple={isMultiple}
      />
    </div>
  );

  const actionsBlock = hasAnswered && result ? (
    <ResultBanner
      result={result}
      canRetry={canRetry}
      onRetry={() => {
        setResult(null);
        setSelected([]);
        setIsShaking(false);
        if (presentation === "wizard") {
          window.dispatchEvent(new CustomEvent("buildment:quiz-answer-change", { detail: { blockId: id, selected: [] } }));
          window.dispatchEvent(new Event("buildment:quiz-retry"));
        }
      }}
    />
  ) : presentation === "wizard" ? (
    <p className="text-xs text-muted-foreground" aria-live="polite">
      {selected.length === 0 ? "Choose an answer. You can review it before submitting the quiz." : `${selected.length} selected · saved as a draft on this device`}
    </p>
  ) : (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Button
        type="button"
        size="sm"
        onClick={submit}
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
          "not-prose scroll-mt-24 space-y-6 transition-all duration-300",
          isShaking && "animate-feedback-shake",
          isSuccessGlow && "animate-feedback-success"
        )}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Knowledge check
          </p>
          <p className="mt-2 text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
            {config.prompt}
          </p>
        </div>
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
          <p className={cn("mt-0.5", readerTitle)}>{config.prompt}</p>
        </div>
      </div>
      {optionsBlock}
      <div className={readerCardFooter}>{actionsBlock}</div>
    </div>
  );
}
