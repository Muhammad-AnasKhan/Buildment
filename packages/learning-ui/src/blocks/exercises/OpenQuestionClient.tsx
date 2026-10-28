"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { BookOpen, CheckCircle2, Clock3, KeyRound, Lightbulb, Link2, PenLine, RotateCcw, SendHorizontal, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { parseSafeSubmissionUrl } from "../../shared/lib/safe-submission-url";
import { AnswerTextareaWithMic } from "../../components/learn/answer-textarea-with-mic";
import { readerBlockGrouped, readerBlockInner } from "../../components/learn/reader-block-styles";
import { fireMiniConfetti } from "../../components/learn/mini-confetti";
import { checkpointAttrs } from "../../components/learn/checkpoint-marker";
import { AI_SETTINGS_HREF } from "../ai-interview/interview-model";
import { useQuizSession } from "../../components/learn/quiz-session-context";
import type { OpenQuestionGroupPosition } from "../../shared/blocks/open-question/group-position";
import type { SanitizedOpenQuestionConfig } from "../../shared/blocks/open-question/schema";
import { openQuestionUrlPresentation, validateOpenQuestionPayload } from "../../shared/blocks/open-question/schema";

export type OpenQuestionInitialState = {
  status: string;
  attempt: number;
  text: string;
  url?: string | null;
  feedback: string | null;
  verdict: "APPROVED" | "NEEDS_REVISION" | null;
  isCorrect?: boolean | null;
  explanation?: string | null;
  hint?: string | null;
  guidance?: string | null;
};

export type OpenQuestionAiStatus = {
  configured: boolean;
  hasKey: boolean;
};

export type OpenQuestionRespondResult = {
  isCorrect?: boolean | null;
  status?: string;
  explanation?: string;
  hint?: string;
  guidance?: string;
  attempt?: number;
};

export function OpenQuestionClient({
  id,
  config,
  groupPosition,
  questionIndex,
  questionTotal,
  initialState,
  ai,
  onRespond,
  onComplete,
  onFeedback,
  onRetryAttempt,
}: {
  id: string;
  config: SanitizedOpenQuestionConfig;
  groupPosition: OpenQuestionGroupPosition;
  questionIndex: number;
  questionTotal: number;
  initialState?: OpenQuestionInitialState | null;
  ai?: OpenQuestionAiStatus | null;
  onRespond?: (payload: {
    type: "OPEN_QUESTION";
    text: string;
    url?: string;
  }) => Promise<OpenQuestionRespondResult | unknown>;
  onComplete?: () => void;
  onFeedback?: (kind: "error" | "notification" | "success") => void;
  /** Fired after a wrong LLM attempt so quiz integrity can advance. */
  onRetryAttempt?: () => void;
}) {
  const quizSession = useQuizSession();
  const llmMode = config.autoGrade === "llm";
  const needsRevision = initialState?.status === "NEEDS_REVISION";
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(() => {
    if (!initialState) return "";
    if (needsRevision) return initialState.text;
    if (llmMode && initialState.isCorrect === true) return initialState.text;
    if (llmMode) return initialState.text;
    return initialState.text;
  });
  const [url, setUrl] = useState(initialState?.url ?? "");
  const [hasKey, setHasKey] = useState(ai?.hasKey ?? false);
  const [llmResult, setLlmResult] = useState<OpenQuestionRespondResult | null>(() => {
    if (!llmMode || !initialState || initialState.isCorrect == null) return null;
    return {
      isCorrect: initialState.isCorrect,
      explanation: initialState.explanation ?? undefined,
      hint: initialState.hint ?? undefined,
      guidance: initialState.guidance ?? undefined,
      attempt: initialState.attempt,
      status: initialState.status,
    };
  });
  const [submitted, setSubmitted] = useState(() => {
    if (llmMode) return initialState?.isCorrect === true;
    return Boolean(initialState) && !needsRevision;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);

  useEffect(() => {
    if (isSuccessGlow) {
      const timer = window.setTimeout(() => setIsSuccessGlow(false), 800);
      return () => window.clearTimeout(timer);
    }
  }, [isSuccessGlow]);

  useEffect(() => {
    setHasKey(ai?.hasKey ?? false);
  }, [ai?.hasKey]);

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

  const keyBlocked = llmMode && ai?.configured !== false && !hasKey;
  const aiUnavailable = llmMode && ai?.configured === false;

  async function submit() {
    if (clientValidation) {
      setError(clientValidation);
      onFeedback?.("error");
      return;
    }
    if (aiUnavailable) {
      setError("Instant short-answer grading is not set up on this server.");
      onFeedback?.("error");
      return;
    }
    if (keyBlocked) {
      setError("Add your AI provider key in settings to get instant feedback.");
      onFeedback?.("error");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (id.startsWith("preview-")) {
        setSubmitted(true);
        return;
      }
      if (!onRespond) throw new Error("Answer submission is unavailable.");
      const raw = await onRespond({ type: "OPEN_QUESTION", text, url: url.trim() || undefined });
      const data = (raw ?? {}) as OpenQuestionRespondResult;

      if (llmMode) {
        setLlmResult(data);
        if (data.isCorrect === true) {
          setSubmitted(true);
          setIsSuccessGlow(true);
          if (containerRef.current) fireMiniConfetti(containerRef.current);
          onFeedback?.("success");
          onComplete?.();
        } else {
          onFeedback?.("error");
          onRetryAttempt?.();
          quizSession?.reportWrongAttempt?.();
        }
        return;
      }

      setSubmitted(true);
      setIsSuccessGlow(true);
      if (containerRef.current) fireMiniConfetti(containerRef.current);
      onFeedback?.("notification");
      onComplete?.();
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "AI_KEY_REQUIRED") {
        setHasKey(false);
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      onFeedback?.("error");
    } finally {
      setSubmitting(false);
    }
  }

  const wordProgress = config.minWords > 0 ? Math.min((wordCount / config.minWords) * 100, 100) : 100;
  const canSubmit =
    !clientValidation &&
    !tooShort &&
    !submitting &&
    !aiUnavailable &&
    !keyBlocked &&
    (text.trim().length > 0 || (urlMeta.showUrl && url.trim().length > 0));

  const showEditor = !submitted;
  const wrongLlm = llmMode && llmResult?.isCorrect === false;
  const attempt = llmResult?.attempt ?? initialState?.attempt ?? 0;
  const exhausted = llmMode && wrongLlm && attempt >= config.maxAttempts;
  const attemptsRemaining = Math.max(0, config.maxAttempts - attempt);

  return (
    <div
      ref={containerRef}
      {...(id.startsWith("preview-") ? {} : checkpointAttrs(id, submitted))}
      className={cn(
        readerBlockGrouped(groupPosition),
        "scroll-mt-24 transition-all duration-300",
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
                ? "border-ok bg-ok-soft text-ok"
                : wrongLlm
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : needsRevision
                    ? "border-brand-yellow bg-brand-yellow/15 text-foreground"
                    : "border-border bg-muted text-foreground"
            )}
            aria-hidden
          >
            {submitted ? <CheckCircle2 className="size-4" /> : wrongLlm ? <XCircle className="size-4" /> : questionIndex + 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {isGrouped ? `Question ${questionIndex + 1} of ${questionTotal}` : "Your turn"}
              </p>
              {!submitted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <PenLine className="size-3" aria-hidden />
                  {llmMode ? "Instant short answer" : urlMeta.showUrl ? "Answer or link" : "Short answer"}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-[15px] font-medium leading-snug text-foreground sm:text-base">
              {config.prompt}
            </p>

            {aiUnavailable ? (
              <div className="mt-4 rounded-lg border border-brand-yellow bg-brand-yellow/15 px-4 py-3 text-sm text-foreground">
                Instant short-answer grading is not available on this server yet.
              </div>
            ) : null}

            {keyBlocked ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/40">
                <div className="flex items-start gap-3 px-4 py-3">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">Add your AI provider key for instant feedback</p>
                    <p className="text-sm text-muted-foreground">
                      This short answer is graded with your own key. Paste it in settings, then come back and submit.
                    </p>
                    <a
                      href={AI_SETTINGS_HREF}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
                    >
                      Open AI key settings
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {needsRevision && !submitted && initialState?.feedback && (
              <div className="mt-4 overflow-hidden rounded-lg border border-brand-yellow bg-brand-yellow/15">
                <div className="flex items-center gap-2 border-b border-brand-yellow px-4 py-2.5">
                  <RotateCcw className="size-4 shrink-0 text-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Your mentor asked for a revision (attempt {initialState.attempt})
                  </p>
                </div>
                <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground">
                  {initialState.feedback}
                </p>
              </div>
            )}

            {wrongLlm && llmResult ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-destructive bg-destructive/10">
                <div className="flex items-center gap-2 border-b border-destructive px-4 py-2.5">
                  <XCircle className="size-4 shrink-0 text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    Not quite{typeof llmResult.attempt === "number" ? ` (try ${llmResult.attempt})` : ""}
                  </p>
                </div>
                {llmResult.explanation ? (
                  <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground">
                    {llmResult.explanation}
                  </p>
                ) : null}
                {llmResult.hint ? (
                  <div className="border-t border-destructive px-4 py-3">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                      <Lightbulb className="size-3.5" aria-hidden />
                      Hint
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{llmResult.hint}</p>
                  </div>
                ) : null}
                {llmResult.guidance ? (
                  <div className="border-t border-rose-200/70 px-4 py-3 dark:border-rose-400/20">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                      <BookOpen className="size-3.5" aria-hidden />
                      Guided review
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{llmResult.guidance}</p>
                    {config.reviewChapterSlugs.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {config.reviewChapterSlugs.map((slug) => (
                          <a key={slug} href={`../${encodeURIComponent(slug)}`} className="inline-flex h-8 items-center rounded-md border bg-background px-3 text-xs font-medium hover:bg-muted">
                            Review {slug.replaceAll("-", " ")}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {submitted ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-ok bg-ok-soft">
                <div className="flex items-center gap-2 border-b border-ok px-4 py-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-ok" />
                  <p className="text-sm font-medium text-ok">
                    {llmMode ? "Correct" : "Answer submitted"}
                  </p>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-card/80 px-2 py-0.5 text-xs font-medium text-ok">
                    {llmMode ? (
                      "Instant feedback"
                    ) : (
                      <>
                        <Clock3 className="size-3" aria-hidden />
                        {initialState?.verdict === "APPROVED"
                          ? "Approved by your mentor"
                          : "Your mentor will reply"}
                      </>
                    )}
                  </span>
                </div>
                {(text || initialState?.text) && (
                  <p className="whitespace-pre-wrap px-4 py-3 text-[15px] leading-relaxed text-foreground">
                    {text || initialState?.text}
                  </p>
                )}
                {llmMode && (llmResult?.explanation || initialState?.explanation) ? (
                  <p className="border-t border-ok px-4 py-3 text-sm leading-relaxed text-foreground">
                    {llmResult?.explanation || initialState?.explanation}
                  </p>
                ) : null}
                {submittedUrl && (
                  <p className="border-t border-ok px-4 py-3 text-sm">
                    <span className="font-medium text-ok">Link: </span>
                    <a
                      href={submittedUrl}
                      className="break-all text-primary underline"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {submittedUrl}
                    </a>
                  </p>
                )}
                {!llmMode && initialState?.verdict !== "APPROVED" ? (
                  <p className="border-t border-ok px-4 py-3 text-sm leading-relaxed text-foreground">
                    Submitted. You can continue to the next lesson. Your mentor will still reply.
                  </p>
                ) : null}
                {!llmMode && initialState?.verdict === "APPROVED" && initialState.feedback && (
                  <p className="border-t border-ok whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground">
                    <span className="font-medium text-ok">Mentor feedback: </span>
                    {initialState.feedback}
                  </p>
                )}
              </div>
            ) : null}

            {showEditor ? (
              <>
                <div className="mt-4">
                  <AnswerTextareaWithMic
                    value={text}
                    onChange={setText}
                    enableSpeech={speechEnabled}
                    placeholder={
                      needsRevision
                        ? "Rewrite your answer using your mentor's feedback…"
                        : wrongLlm
                          ? "Revise your answer using the feedback above…"
                          : "Write your answer in your own words…"
                    }
                    ariaLabel={`Answer for question ${questionIndex + 1}`}
                    rows={5}
                    className="min-h-[7.5rem] rounded-lg border-border bg-muted/40 focus-visible:border-border focus-visible:bg-background focus-visible:ring-ring"
                  />
                </div>

                {urlMeta.showUrl ? (
                  <div className="mt-4 space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Link2 className="size-4 text-muted-foreground" aria-hidden />
                      {urlMeta.urlLabel}
                      {urlMeta.urlRequired ? (
                        <span className="text-xs font-normal text-destructive">Required</span>
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
                        <span className={cn(tooShort && wordCount > 0 && "text-foreground")}>
                          {wordCount} / {config.minWords} words minimum
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              wordProgress >= 100 ? "bg-ok" : "bg-primary"
                            )}
                            style={{ width: `${wordProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span>
                        {llmMode
                          ? exhausted
                            ? "Three graded attempts used. Use the guided review to rewrite in your own words, then ask your mentor if you need another graded attempt."
                            : `Instant AI feedback · ${attemptsRemaining} graded attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
                          : "No word minimum — aim for a clear, complete answer."}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={submit}
                      loading={submitting}
                      disabled={!canSubmit || exhausted}
                    >
                      {submitting ? (
                        llmMode ? "Checking…" : "Submitting…"
                      ) : (
                        <>
                          {exhausted ? "Attempt limit reached" : needsRevision || wrongLlm ? "Try again" : llmMode ? "Check answer" : "Submit answer"}
                          <SendHorizontal className="size-3.5" aria-hidden />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
