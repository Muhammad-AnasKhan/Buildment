"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, PenLine, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { OpenQuestionGroupPosition } from "./group-position";
import type { SanitizedOpenQuestionConfig } from "./schema";

export function OpenQuestionClient({
  id,
  config,
  groupPosition,
  questionIndex,
  questionTotal,
}: {
  id: string;
  config: SanitizedOpenQuestionConfig;
  groupPosition: OpenQuestionGroupPosition;
  questionIndex: number;
  questionTotal: number;
}) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const tooShort = config.minWords > 0 && wordCount < config.minWords;
  const isGrouped = groupPosition !== "single";

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "OPEN_QUESTION", text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const wordProgress = config.minWords > 0 ? Math.min((wordCount / config.minWords) * 100, 100) : 100;

  return (
    <div
      className={cn(
        "not-prose bg-white",
        groupPosition === "single" &&
          "my-8 overflow-hidden rounded-xl border border-neutral-200 shadow-sm",
        groupPosition === "first" &&
          "mt-8 overflow-hidden rounded-t-xl border border-b-0 border-neutral-200",
        groupPosition === "middle" && "-mt-px border-x border-neutral-200 bg-white",
        groupPosition === "last" &&
          "-mt-px mb-8 overflow-hidden rounded-b-xl border border-t-0 border-neutral-200 shadow-sm"
      )}
    >
      <div
        className={cn(
          "px-5 py-5 sm:px-6 sm:py-6",
          isGrouped && groupPosition !== "last" && "border-b border-neutral-200"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums",
              submitted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
            )}
            aria-hidden
          >
            {submitted ? <CheckCircle2 className="size-4" /> : questionIndex + 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                {isGrouped ? `Question ${questionIndex + 1} of ${questionTotal}` : "Your turn"}
              </p>
              {!submitted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                  <PenLine className="size-3" aria-hidden />
                  Short answer
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-[15px] font-medium leading-snug text-neutral-950 sm:text-base">
              {config.prompt}
            </p>

            {submitted ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-emerald-200/80 bg-emerald-50/60">
                <div className="flex items-center gap-2 border-b border-emerald-200/60 px-4 py-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-900">Answer submitted</p>
                </div>
                <p className="whitespace-pre-wrap px-4 py-3 text-[15px] leading-relaxed text-neutral-700">
                  {text}
                </p>
              </div>
            ) : (
              <>
                <Textarea
                  className="mt-4 min-h-[7.5rem] resize-y rounded-lg border-neutral-200 bg-neutral-50/80 px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus-visible:border-indigo-300 focus-visible:bg-white focus-visible:ring-indigo-100"
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your answer in your own words…"
                  aria-label={`Answer for question ${questionIndex + 1}`}
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    {config.minWords > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className={cn(tooShort && wordCount > 0 && "text-amber-700")}>
                          {wordCount} / {config.minWords} words minimum
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              wordProgress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                            )}
                            style={{ width: `${wordProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span>No word minimum — aim for a clear, complete answer.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button
                      size="sm"
                      className="gap-1.5 bg-neutral-950 text-white hover:bg-neutral-800"
                      onClick={submit}
                      disabled={tooShort || submitting || text.trim().length === 0}
                    >
                      {submitting ? (
                        "Submitting…"
                      ) : (
                        <>
                          Submit answer
                          <SendHorizontal className="size-3.5" aria-hidden />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
