"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Quick check
      </p>
      <p className="mt-2 text-base font-medium leading-snug">{config.prompt}</p>

      {isMultiple ? (
        <div className="mt-4 space-y-2">
          {config.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm",
                selected.includes(option.id) && "border-primary bg-accent"
              )}
            >
              <Checkbox
                checked={selected.includes(option.id)}
                onCheckedChange={() => toggle(option.id)}
                disabled={!!result}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <RadioGroup
          className="mt-4 space-y-2"
          value={selected[0] ?? ""}
          onValueChange={(value) => setSelected([value])}
          disabled={!!result}
        >
          {config.options.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${id}-${option.id}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm font-normal",
                selected[0] === option.id && "border-primary bg-accent"
              )}
            >
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      )}

      {result ? (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-md p-3 text-sm",
            result.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
          )}
        >
          {result.isCorrect ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <div>
            <p className="font-medium">{result.isCorrect ? "Correct" : "Not quite"}</p>
            {result.explanation ? <p className="mt-1 text-muted-foreground">{result.explanation}</p> : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" onClick={submit} disabled={selected.length === 0 || submitting}>
            {submitting ? "Checking…" : "Check answer"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      )}

      {canRetry ? (
        <Button
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={() => {
            setResult(null);
            setSelected([]);
          }}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
