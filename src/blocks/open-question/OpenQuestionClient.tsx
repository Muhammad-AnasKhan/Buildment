"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SanitizedOpenQuestionConfig } from "./schema";

export function OpenQuestionClient({
  id,
  config,
}: {
  id: string;
  config: SanitizedOpenQuestionConfig;
}) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = wordCount < config.minWords;

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

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        In your own words
      </p>
      <p className="mt-2 text-base font-medium leading-snug">{config.prompt}</p>

      {submitted ? (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>Answer submitted.</p>
        </div>
      ) : (
        <>
          <Textarea
            className="mt-4"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer…"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" onClick={submit} disabled={tooShort || submitting}>
              {submitting ? "Submitting…" : "Submit answer"}
            </Button>
            {config.minWords > 0 ? (
              <p className="text-xs text-muted-foreground">
                {wordCount}/{config.minWords} words minimum
              </p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </>
      )}
    </div>
  );
}
