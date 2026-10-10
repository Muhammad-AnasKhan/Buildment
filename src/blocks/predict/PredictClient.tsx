"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Route, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
import { LearnPanelShell } from "@/components/learn/content-blocks/learn-panel-shell";
import { playFeedback } from "@/lib/sound-feedback";
import type { SanitizedPredictConfig } from "./schema";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (id === "preview-predict" || (correctOptionId && id.startsWith("preview"))) {
        const isCorrect = correctOptionId ? selected === correctOptionId : true;
        const outcome: RespondResult = {
          isCorrect,
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          explanation: config.explanation,
        };
        setResult(outcome);
        playFeedback(outcome.isCorrect ? "success" : "error");
        router.refresh();
        return;
      }

      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PREDICT", selected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 404 && correctOptionId) {
          const isCorrect = selected === correctOptionId;
          const outcome: RespondResult = {
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            explanation: config.explanation,
          };
          setResult(outcome);
          playFeedback(outcome.isCorrect ? "success" : "error");
          router.refresh();
          return;
        }
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const outcome = await res.json() as RespondResult;
      setResult(outcome);
      playFeedback(outcome.isCorrect ? "success" : "error");
      router.refresh();
    } catch (err) {
      playFeedback("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canRetry = result && !result.isCorrect && config.allowRetry;
  const hasAnswered = result !== null;
  const settled = hasAnswered && (result.isCorrect === true || config.allowRetry === false);
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

      <QuizOptions
        options={config.options}
        selected={selected ? [selected] : []}
        onToggle={(optionId) => setSelected(optionId)}
        disabled={hasAnswered}
        multiple={false}
      />

      <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
        {hasAnswered && result ? (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg p-3 text-sm",
                result.isCorrect
                  ? "border border-emerald-200 bg-emerald-50/60 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100"
                  : "border border-amber-200 bg-amber-50/60 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-50"
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className="font-semibold">{result.isCorrect ? "Correct" : "Review your prediction"}</p>
                {result.explanation ? (
                  <p className="mt-1 leading-relaxed opacity-90">{result.explanation}</p>
                ) : null}
              </div>
            </div>
            {canRetry ? (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setResult(null);
                  setSelected("");
                }}
              >
                <RotateCcw className="size-3.5" />
                Try again
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={submit}
              disabled={!selected || submitting}
              className="h-9 gap-1.5 rounded-md bg-foreground px-5 text-sm font-medium text-background shadow-none hover:bg-foreground/90"
            >
              {submitting ? "Checking…" : "Check my prediction"}
            </Button>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {selected ? "Your choice is ready — check it when you are." : "Choose the outcome you expect."}
              </p>
            )}
          </div>
        )}
      </div>
    </LearnPanelShell>
  );
}
