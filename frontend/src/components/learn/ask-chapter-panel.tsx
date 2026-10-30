"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { QUESTION_MAX, isAskable, remainingLabel, type ChapterQuestionAnswer, type ChapterQuestionStatus } from "@/lib/chapter-question";

/**
 * A small box under the chapter for quick questions. It stays hidden until the API says
 * questions are available for this learner and chapter, so a switched-off feature leaves no trace.
 */
export function AskChapterPanel({ chapterId }: { chapterId: string }) {
  const [status, setStatus] = useState<ChapterQuestionStatus | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<ChapterQuestionStatus>(`/api/v1/chapters/${chapterId}/ask`)
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => {
        // Any failure means no box: this panel is an extra, never a blocker for reading.
      });
    return () => {
      active = false;
    };
  }, [chapterId]);

  if (!status?.available) return null;

  const outOfQuestions = status.remaining <= 0;

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (asking || outOfQuestions || !isAskable(question)) return;
    setAsking(true);
    setError(null);
    try {
      const result = await apiFetch<ChapterQuestionAnswer>(`/api/v1/chapters/${chapterId}/ask`, {
        method: "POST",
        json: { question: question.trim() },
      });
      setAnswer(result.answer);
      setStatus((current) => (current ? { ...current, remaining: result.remaining, dailyLimit: result.dailyLimit } : current));
    } catch (caught) {
      setAnswer(null);
      setError(caught instanceof Error ? caught.message : "We could not answer that just now.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <section aria-labelledby="ask-chapter-heading" className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 id="ask-chapter-heading" className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Sparkles className="size-4" aria-hidden />
        Ask about this chapter
      </h2>
      <form onSubmit={ask} className="mt-3 space-y-3">
        <label htmlFor="ask-chapter-question" className="sr-only">
          Your question about this chapter
        </label>
        <Textarea
          id="ask-chapter-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={QUESTION_MAX}
          rows={2}
          placeholder="For example: what is a confounder?"
          disabled={asking || outOfQuestions}
          className="min-h-20"
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[13px] text-muted-foreground">{remainingLabel(status.remaining, status.dailyLimit)}</p>
          <Button type="submit" disabled={asking || outOfQuestions || !isAskable(question)} className="w-full sm:w-auto">
            {asking ? "Asking..." : "Ask"}
          </Button>
        </div>
      </form>
      <div aria-live="polite" className="mt-3">
        {answer ? <p className="whitespace-pre-wrap rounded-lg bg-secondary px-4 py-3 text-[15px] leading-relaxed text-foreground">{answer}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">Answers come from AI and can be wrong. Check the chapter.</p>
    </section>
  );
}
