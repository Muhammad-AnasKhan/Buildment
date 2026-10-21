"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Route, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
import { LearnPanelShell } from "@/components/learn/content-blocks/learn-panel-shell";
import { playFeedback } from "@/lib/sound-feedback";
import { ApiError, apiFetch } from "@/lib/api-client";
import type { SanitizedPredictConfig } from "@/shared/blocks/predict/schema";

type RespondResult = {
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-500 text-white",
  POST: "bg-blue-600 text-white",
  PATCH: "bg-amber-500 text-white",
  PUT: "bg-slate-700 text-white dark:bg-slate-500",
  DELETE: "bg-red-600 text-white",
};

function methodBadgeClass(method: string) {
  return METHOD_STYLES[method.toUpperCase()] ?? "bg-slate-700 text-white dark:bg-slate-500";
}

export type PredictInitialState = {
  selected: string;
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

export function PredictClient({
  id,
  config,
  initialState,
  correctOptionId,
}: {
  id: string;
  config: SanitizedPredictConfig;
  initialState?: PredictInitialState | null;
  correctOptionId?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(initialState?.selected ?? "");
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
  const [wrongSelection, setWrongSelection] = useState<string[]>(
    initialState?.isCorrect === false && initialState.selected ? [initialState.selected] : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitSelection(optionId: string) {
    if (submitting) return;
    if (result?.isCorrect === true) return;

    setSelected(optionId);
    setSubmitting(true);
    setError(null);

    try {
      if (id === "preview-predict" || (correctOptionId && id.startsWith("preview"))) {
        const isCorrect = correctOptionId ? optionId === correctOptionId : true;
        applyOutcome(
          {
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            explanation: config.explanation,
          },
          optionId
        );
        return;
      }

      let outcome: RespondResult;
      try {
        outcome = await apiFetch<RespondResult>(`/api/v1/blocks/${id}/respond`, {
          method: "POST",
          json: { type: "PREDICT", selected: optionId },
        });
      } catch (err) {
        // Stale block on the server: grade locally when the answer key is available.
        if (!(err instanceof ApiError && err.status === 404 && correctOptionId)) throw err;
        const isCorrect = optionId === correctOptionId;
        outcome = { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, explanation: config.explanation };
      }
      applyOutcome(outcome, optionId);
      router.refresh();
    } catch (err) {
      playFeedback("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function applyOutcome(outcome: RespondResult, optionId: string) {
    setResult(outcome);
    if (outcome.isCorrect === true) {
      setWrongSelection([]);
      playFeedback("success");
    } else if (outcome.isCorrect === false) {
      setWrongSelection([optionId]);
      playFeedback("error");
    }
  }

  function onPick(optionId: string) {
    if (result?.isCorrect === true) return;
    if (result?.isCorrect === false && config.allowRetry) {
      setResult(null);
      setWrongSelection([]);
      void submitSelection(optionId);
      return;
    }
    if (!result) {
      void submitSelection(optionId);
    }
  }

  const hasAnswered = result !== null;
  const settled = hasAnswered && (result.isCorrect === true || config.allowRetry === false);
  const optionsLocked = result?.isCorrect === true || submitting;
  const showWrongOptions = result?.isCorrect === false;
  const showCorrectOptions = result?.isCorrect === true;
  const ctx = config.context;

  return (
    <LearnPanelShell eyebrow="Predict" title={config.prompt} className="my-8 scroll-mt-24" checkpointId={id} checkpointDone={settled}>
      <div className="border-b border-border bg-muted/50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
            <Route className="size-4" />
          </div>
          <p className="text-[15px] font-medium leading-snug text-foreground sm:text-base">
            What happens next?
          </p>
        </div>
        {ctx?.method || ctx?.url ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-xs">
            {ctx.method ? (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  methodBadgeClass(ctx.method)
                )}
              >
                {ctx.method}
              </span>
            ) : null}
            {ctx.url ? <span className="text-foreground">{ctx.url}</span> : null}
            {ctx.bearer ? (
              <span className="text-muted-foreground">Bearer {ctx.bearer}</span>
            ) : null}
            {ctx.responseHint ? (
              <span className="w-full text-muted-foreground">{ctx.responseHint}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="px-5 py-4 sm:px-6">
        <QuizOptions
          options={config.options}
          selected={selected ? [selected] : []}
          onToggle={onPick}
          disabled={optionsLocked}
          multiple={false}
          incorrectOptionIds={showWrongOptions ? wrongSelection : []}
          correctOptionIds={showCorrectOptions && selected ? [selected] : []}
          showAnswerState={showWrongOptions || showCorrectOptions}
        />
      </div>

      <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
        {hasAnswered && result ? (
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-lg p-3 text-sm",
              result.isCorrect
                ? "border border-emerald-200 bg-emerald-50/60 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100"
                : "border border-red-300 bg-red-500/10 text-red-950 dark:border-red-900/80 dark:bg-red-950/30 dark:text-red-50"
            )}
            role="status"
          >
            {result.isCorrect ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="font-semibold">
                {result.isCorrect
                  ? "Correct"
                  : config.allowRetry
                    ? "Not quite — pick another outcome."
                    : "Review your prediction"}
              </p>
              {result.explanation ? (
                <p className="mt-1 leading-relaxed">{result.explanation}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {submitting ? "Checking…" : "Choose an outcome to see if your prediction is correct."}
          </p>
        )}
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>
    </LearnPanelShell>
  );
}
