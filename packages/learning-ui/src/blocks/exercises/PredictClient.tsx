"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Route, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { QuizOptions } from "../../components/learn/quiz-options";
import { LearnPanelShell } from "../../components/learn/content-blocks/learn-panel-shell";
import type { SanitizedPredictConfig } from "../../shared/blocks/predict/schema";

type RespondResult = {
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-ok text-white",
  POST: "bg-primary text-white",
  PATCH: "bg-brand-yellow text-white",
  PUT: "bg-muted-foreground text-white",
  DELETE: "bg-destructive text-white",
};

function methodBadgeClass(method: string) {
  return METHOD_STYLES[method.toUpperCase()] ?? "bg-muted-foreground text-white";
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
  onRespond,
  onComplete,
  onFeedback,
}: {
  id: string;
  config: SanitizedPredictConfig;
  initialState?: PredictInitialState | null;
  correctOptionId?: string;
  onRespond?: (payload: { type: "PREDICT"; selected: string }) => Promise<RespondResult>;
  onComplete?: () => void;
  onFeedback?: (kind: "success" | "error") => void;
}) {
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
  const rootRef = useRef<HTMLDivElement>(null);

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
        if (!onRespond) throw new Error("Prediction submission is unavailable.");
        outcome = await onRespond({ type: "PREDICT", selected: optionId });
      } catch (err) {
        // Stale block on the server: grade locally when the answer key is available.
        if (!((err as { status?: number })?.status === 404 && correctOptionId)) throw err;
        const isCorrect = optionId === correctOptionId;
        outcome = { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, explanation: config.explanation };
      }
      applyOutcome(outcome, optionId);
      onComplete?.();
    } catch (err) {
      onFeedback?.("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function applyOutcome(outcome: RespondResult, optionId: string) {
    setResult(outcome);
    if (outcome.isCorrect === true) {
      setWrongSelection([]);
      onFeedback?.("success");
    } else if (outcome.isCorrect === false) {
      setWrongSelection([optionId]);
      onFeedback?.("error");
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

  // 1-N selects a prediction, mirroring the Quiz keyboard. Scoped to this block's focus so keys on a
  // page with several interactive blocks never hit more than one.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], dialog[open]")) return;
      const active = document.activeElement;
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const index = Number(event.key) - 1;
      if (index < 0 || index >= config.options.length) return;
      if (optionsLocked || submitting) return;
      event.preventDefault();
      onPick(config.options[index].id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [config.options, optionsLocked, submitting, onPick]);

  return (
    <div ref={rootRef}>
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
                  "rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
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
                ? "border border-ok bg-ok-soft text-ok"
                : "border border-destructive bg-destructive/10 text-destructive"
            )}
            role="status"
          >
            {result.isCorrect ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
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
    </div>
  );
}
