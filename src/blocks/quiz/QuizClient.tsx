"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
import { readerCard, readerCardFooter, readerCardHeader, readerTitle } from "@/components/learn/reader-theme";
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

function ResultBanner({ result, canRetry, onRetry }: {
  result: RespondResult;
  canRetry: boolean;
  onRetry: () => void;
}) {
  const correct = result.isCorrect === true;
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl border p-4 text-sm",
          correct
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
            : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50"
        )}
      >
        {correct ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <div className="min-w-0">
          <p className="font-semibold">{correct ? "Correct!" : "Not quite right"}</p>
          {result.explanation ? (
            <p className="mt-1.5 leading-relaxed opacity-90">{result.explanation}</p>
          ) : null}
        </div>
      </div>
      {canRetry ? (
        <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={onRetry}>
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
}: {
  id: string;
  config: SanitizedQuizConfig;
  initialState?: QuizInitialState | null;
  presentation?: "standalone" | "wizard";
}) {
  const router = useRouter();
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

  function toggle(optionId: string) {
    if (isMultiple) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((o) => o !== optionId) : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "QUIZ", selected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setResult(await res.json());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canRetry = Boolean(result && !result.isCorrect && config.allowRetry);
  const hasAnswered = result !== null;

  const optionsBlock = (
    <div className={cn(presentation === "wizard" ? "overflow-hidden rounded-xl border border-border" : "")}>
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
      }}
    />
  ) : (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Button
        type="button"
        size="sm"
        onClick={submit}
        disabled={selected.length === 0 || submitting}
        className="h-9 rounded-full px-6"
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
      <div className="not-prose space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Knowledge check</p>
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
    <div className={cn("not-prose my-8", readerCard)}>
      <div className={cn(readerCardHeader, "flex items-start gap-3")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <span className="text-sm font-bold">?</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Knowledge check</p>
          <p className={cn("mt-0.5", readerTitle)}>{config.prompt}</p>
        </div>
      </div>
      {optionsBlock}
      <div className={readerCardFooter}>{actionsBlock}</div>
    </div>
  );
}
