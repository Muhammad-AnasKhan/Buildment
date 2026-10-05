"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Link2, PenLine, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseSafeSubmissionUrl } from "@/lib/safe-submission-url";
import { AnswerTextareaWithMic } from "@/components/learn/answer-textarea-with-mic";
import { readerBlockGrouped, readerBlockInner } from "@/components/learn/reader-block-styles";
import { firePartyPops } from "@/components/learn/party-pops";
import { playFeedbackSound } from "@/lib/sound-feedback";
import type { OpenQuestionGroupPosition } from "./group-position";
import type { SanitizedOpenQuestionConfig } from "./schema";
import { openQuestionUrlPresentation, validateOpenQuestionPayload } from "./schema";

export type OpenQuestionInitialState = {
  status: string;
  attempt: number;
  text: string;
  url?: string | null;
  feedback: string | null;
  verdict: "APPROVED" | "NEEDS_REVISION" | null;
};

export function OpenQuestionClient({
  id,
  config,
  groupPosition,
  questionIndex,
  questionTotal,
  initialState,
}: {
  id: string;
  config: SanitizedOpenQuestionConfig;
  groupPosition: OpenQuestionGroupPosition;
  questionIndex: number;
  questionTotal: number;
  initialState?: OpenQuestionInitialState | null;
}) {
  const needsRevision = initialState?.status === "NEEDS_REVISION";
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(
    needsRevision ? initialState.text : initialState && !needsRevision ? initialState.text : ""
  );
  const [url, setUrl] = useState(initialState?.url ?? "");
  const [submitted, setSubmitted] = useState(Boolean(initialState) && !needsRevision);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);

  useEffect(() => {
    if (isSuccessGlow) {
      const timer = window.setTimeout(() => setIsSuccessGlow(false), 800);
      return () => window.clearTimeout(timer);
    }
  }, [isSuccessGlow]);

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const tooShort =
    config.minWords > 0 &&
    wordCount < config.minWords &&
    !(config.speechPrimary && config.allowSpeechInput);
  const isGrouped = groupPosition !== "single";
  const speechEnabled = config.allowSpeechInput ?? false;
  const urlMeta = openQuestionUrlPresentation(config);
  const submittedUrl = parseSafeSubmissionUrl(url || initialState?.url || "")?.toString() ?? null;

  const clientValidation = useMemo(
    () => validateOpenQuestionPayload(config, { text, url: url.trim() || undefined }),
    [config, text, url]
  );

  async function submit() {
    if (clientValidation) {
      setError(clientValidation);
      playFeedbackSound("failure");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "OPEN_QUESTION",
          text,
          url: url.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setSubmitted(true);
      setIsSuccessGlow(true);
      firePartyPops({ withSound: true });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      playFeedbackSound("failure");
    } finally {
      setSubmitting(false);
    }
  }

  const wordProgress = config.minWords > 0 ? Math.min((wordCount / config.minWords) * 100, 100) : 100;
  const canSubmit =
    !clientValidation &&
    !tooShort &&
    !submitting &&
    (text.trim().length > 0 || (urlMeta.showUrl && url.trim().length > 0));

  return (
    <div
      ref={containerRef}
      className={cn(
        readerBlockGrouped(groupPosition),
        "transition-all duration-300",
        isSuccessGlow && "animate-feedback-success"
      )}
    >
      <div
        className={cn(
          readerBlockInner,
          isGrouped && groupPosition !== "last" && "border-b border-border"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums",
              submitted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-200"
                : needsRevision
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-500/15 dark:text-amber-100"
                  : "border-border bg-muted text-foreground"
            )}
            aria-hidden
          >
            {submitted ? <CheckCircle2 className="size-4" /> : questionIndex + 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isGrouped ? `Question ${questionIndex + 1} of ${questionTotal}` : "Your turn"}
              </p>
              {!submitted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <PenLine className="size-3" aria-hidden />
                  {urlMeta.showUrl ? "Answer or link" : "Short answer"}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-[15px] font-medium leading-snug text-foreground sm:text-base">
              {config.prompt}
            </p>

            {needsRevision && !submitted && initialState?.feedback && (
              <div className="mt-4 overflow-hidden rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-400/25 dark:bg-amber-500/10">
                <div className="flex items-center gap-2 border-b border-amber-200/70 px-4 py-2.5 dark:border-amber-400/20">
                  <RotateCcw className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Your mentor asked for a revision (attempt {initialState.attempt})
                  </p>
                </div>
                <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground/90">
                  {initialState.feedback}
                </p>
              </div>
            )}

            {submitted ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-400/25 dark:bg-emerald-500/10">
                <div className="flex items-center gap-2 border-b border-emerald-200/60 px-4 py-2.5 dark:border-emerald-400/20">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Answer submitted</p>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-card/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-200">
                    <Clock3 className="size-3" aria-hidden />
                    {initialState?.verdict === "APPROVED"
                      ? "Approved by your mentor"
                      : "Awaiting mentor review"}
                  </span>
                </div>
                {(text || initialState?.text) && (
                  <p className="whitespace-pre-wrap px-4 py-3 text-[15px] leading-relaxed text-foreground/90">
                    {text || initialState?.text}
                  </p>
                )}
                {submittedUrl && (
                  <p className="border-t border-emerald-200/60 px-4 py-3 text-sm">
                    <span className="font-medium text-emerald-800 dark:text-emerald-100">Link: </span>
                    <a
                      href={submittedUrl}
                      className="break-all text-indigo-700 underline dark:text-indigo-300"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {submittedUrl}
                    </a>
                  </p>
                )}
                {initialState?.verdict === "APPROVED" && initialState.feedback && (
                  <p className="border-t border-emerald-200/60 whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-muted-foreground dark:border-emerald-400/20">
                    <span className="font-medium text-emerald-800 dark:text-emerald-100">Mentor feedback: </span>
                    {initialState.feedback}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <AnswerTextareaWithMic
                    value={text}
                    onChange={setText}
                    enableSpeech={speechEnabled}
                    placeholder={
                      needsRevision
                        ? "Rewrite your answer using your mentor's feedback…"
                        : "Write your answer in your own words…"
                    }
                    ariaLabel={`Answer for question ${questionIndex + 1}`}
                    rows={5}
                    className="min-h-[7.5rem] rounded-lg border-border bg-muted/40 focus-visible:border-indigo-400 focus-visible:bg-background focus-visible:ring-indigo-500/20"
                  />
                </div>

                {urlMeta.showUrl ? (
                  <div className="mt-4 space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Link2 className="size-4 text-muted-foreground" aria-hidden />
                      {urlMeta.urlLabel}
                      {urlMeta.urlRequired ? (
                        <span className="text-xs font-normal text-rose-600">Required</span>
                      ) : null}
                    </label>
                    {urlMeta.urlHint ? (
                      <p className="text-xs text-muted-foreground">{urlMeta.urlHint}</p>
                    ) : null}
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://…"
                      className="bg-background"
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {config.minWords > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className={cn(tooShort && wordCount > 0 && "text-amber-700")}>
                          {wordCount} / {config.minWords} words minimum
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
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
                      className="gap-1.5"
                      onClick={submit}
                      disabled={!canSubmit}
                    >
                      {submitting ? (
                        "Submitting…"
                      ) : (
                        <>
                          {needsRevision ? "Resubmit answer" : "Submit answer"}
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
