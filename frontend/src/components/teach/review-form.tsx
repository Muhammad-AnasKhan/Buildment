"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { generateAiReviewDraft } from "@/server/actions/ai-review";
import type { AiReviewDraft } from "@/server/ai/review-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReviewFormProps = {
  responseId: string;
  maxScore: number;
  action: (formData: FormData) => Promise<void>;
};

function verdictLabel(verdict: AiReviewDraft["suggestedVerdict"]) {
  return verdict === "APPROVED" ? "Approve" : "Needs revision";
}

export function ReviewForm({ responseId, maxScore, action }: ReviewFormProps) {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [draft, setDraft] = useState<AiReviewDraft | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();

  function generateDraft() {
    setError(null);
    startGenerating(async () => {
      const result = await generateAiReviewDraft({ responseId });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDraft(result.draft);
      setModel(result.model);
      setFeedback(result.draft.feedback);
      setScore(String(result.draft.suggestedScore));
    });
  }

  return (
    <form className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm" action={action}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Your review</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            You make the final decision. Drafted feedback is never submitted automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateDraft}
          disabled={isGenerating}
        >
          {draft ? <RefreshCw className={isGenerating ? "animate-spin" : ""} /> : <Sparkles />}
          {isGenerating ? "Drafting…" : draft ? "Draft again" : "Draft with AI"}
        </Button>
      </div>

      <p className="mt-3 rounded-lg border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        When you click <span className="font-medium text-foreground">Draft with AI</span>, this
        answer, its question, the mentor-only rubric/reference answer, and recent feedback are sent
        to OpenRouter. Verify the result before using it.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {draft ? (
        <div className="mt-3 rounded-lg border bg-muted/25 p-3" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Suggested: {verdictLabel(draft.suggestedVerdict)}</Badge>
            <Badge variant="outline">{draft.confidence.toLowerCase()} confidence</Badge>
            <span className="text-xs text-muted-foreground">{model}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{draft.summary}</p>
          {(draft.strengths.length > 0 || draft.improvements.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {draft.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Evidence that works</p>
                  <ul className="mt-1 space-y-1 text-xs leading-relaxed">
                    {draft.strengths.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              )}
              {draft.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Check before sending</p>
                  <ul className="mt-1 space-y-1 text-xs leading-relaxed">
                    {draft.improvements.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Feedback</span>
          <Textarea
            name="feedback"
            required
            rows={6}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="What worked, what to fix, what to read next…"
          />
        </label>

        <label className="flex max-w-52 flex-col gap-1.5 text-sm font-medium">
          Score <span className="font-normal text-muted-foreground">0–{maxScore}, optional</span>
          <Input
            type="number"
            name="score"
            min={0}
            max={maxScore}
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" name="verdict" value="APPROVED">
          <CheckCircle2 />
          Approve
        </Button>
        <Button type="submit" name="verdict" value="NEEDS_REVISION" variant="outline">
          Needs revision
        </Button>
        <p className="text-xs text-muted-foreground">
          The mentee sees your feedback when they reopen the chapter.
        </p>
      </div>
    </form>
  );
}
