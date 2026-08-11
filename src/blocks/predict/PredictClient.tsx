"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Route, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizOptions } from "@/components/learn/quiz-options";
import { LearnPanelShell } from "@/components/learn/content-blocks/learn-panel-shell";
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
  PUT: "bg-violet-600 text-white",
  DELETE: "bg-red-600 text-white",
};

function methodBadgeClass(method: string) {
  return METHOD_STYLES[method.toUpperCase()] ?? "bg-indigo-600 text-white";
}

export function PredictClient({ id, config }: { id: string; config: SanitizedPredictConfig }) {
  const [selected, setSelected] = useState<string>("");
  const [result, setResult] = useState<RespondResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PREDICT", selected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canRetry = result && !result.isCorrect && config.allowRetry;
  const hasAnswered = result !== null;
  const ctx = config.context;

  return (
    <LearnPanelShell eyebrow="Predict" title={config.prompt} className="my-8">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Route className="size-4" />
          </div>
          <p className="text-[15px] font-medium leading-snug text-neutral-900 sm:text-base">
            What happens next?
          </p>
        </div>
        {ctx?.method || ctx?.url ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-xs">
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
            {ctx.url ? <span className="text-neutral-700">{ctx.url}</span> : null}
            {ctx.bearer ? (
              <span className="text-neutral-400">Bearer {ctx.bearer}</span>
            ) : null}
            {ctx.responseHint ? (
              <span className="w-full text-neutral-500">{ctx.responseHint}</span>
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

      <div className="border-t border-neutral-100 bg-neutral-50/40 px-5 py-4 sm:px-6">
        {hasAnswered && result ? (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg p-3 text-sm",
                result.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div>
                <p className="font-semibold">{result.isCorrect ? "Correct!" : "Not quite"}</p>
                {result.explanation ? (
                  <p className="mt-1 leading-relaxed text-neutral-700">{result.explanation}</p>
                ) : null}
              </div>
            </div>
            {canRetry ? (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-neutral-600 hover:text-neutral-900"
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
              className="h-9 gap-1.5 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
            >
              {submitting ? "Checking…" : "Predict"}
            </Button>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-xs text-neutral-400">
                {selected ? "Ready to check" : "Pick an outcome"}
              </p>
            )}
          </div>
        )}
      </div>
    </LearnPanelShell>
  );
}
