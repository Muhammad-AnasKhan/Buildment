"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SanitizedQuizConfig } from "./schema";

type RespondResult = {
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  explanation?: string;
};

export function QuizClient({ id, config }: { id: string; config: SanitizedQuizConfig }) {
  const isMultiple = config.quizType === "multiple";
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<RespondResult | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canRetry = result && !result.isCorrect && config.allowRetry;
  const hasAnswered = result !== null;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-neutral-100 bg-neutral-50/60 px-5 py-4 sm:px-6">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <HelpCircle className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
            Knowledge check
          </p>
          <p className="mt-0.5 text-[15px] font-medium leading-snug text-neutral-900 sm:text-base">
            {config.prompt}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="divide-y divide-neutral-100">
        {config.options.map((option, index) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !hasAnswered && toggle(option.id)}
              disabled={hasAnswered}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left text-sm transition-colors sm:px-6",
                !hasAnswered && "hover:bg-neutral-50",
                hasAnswered && "cursor-default",
                isSelected && !hasAnswered && "bg-indigo-50/50",
              )}
            >
              <span className="shrink-0">
                {isMultiple ? (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    {isSelected ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-indigo-600"
                        : "border-neutral-300"
                    )}
                  >
                    {isSelected ? (
                      <span className="size-2 rounded-full bg-indigo-600" />
                    ) : null}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 leading-relaxed",
                  isSelected && !hasAnswered && "font-medium text-neutral-900",
                  !isSelected && !hasAnswered && "text-neutral-700",
                  hasAnswered && "text-neutral-700",
                )}
              >
                {option.label}
              </span>
              {hasAnswered && isSelected ? (
                <CheckCircle2 className="size-4 shrink-0 text-indigo-600" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Result / Actions */}
      <div className="border-t border-neutral-100 bg-neutral-50/40 px-5 py-4 sm:px-6">
        {hasAnswered && result ? (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg p-3 text-sm",
                result.isCorrect
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-amber-50 text-amber-900"
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div>
                <p className="font-semibold">
                  {result.isCorrect ? "Correct!" : "Not quite right"}
                </p>
                {result.explanation ? (
                  <p className="mt-1 leading-relaxed text-neutral-700">
                    {result.explanation}
                  </p>
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
                  setSelected([]);
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
              disabled={selected.length === 0 || submitting}
              className="h-9 gap-1.5 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
            >
              {submitting ? "Checking…" : "Check answer"}
            </Button>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-xs text-neutral-400">
                {selected.length === 0
                  ? "Select an option to continue"
                  : `${selected.length} option${selected.length > 1 ? "s" : ""} selected`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
