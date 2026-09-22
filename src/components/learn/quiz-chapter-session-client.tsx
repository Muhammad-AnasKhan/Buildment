"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuizChapterSessionClient({ children }: { children: React.ReactNode }) {
  const steps = React.Children.toArray(children).filter(Boolean);
  const total = steps.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [total]);

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [total]
  );

  if (total === 0) return null;

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <section
      className="not-prose mb-10 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
      aria-label="Quiz session"
    >
      <header className="border-b border-border bg-muted/40 px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Focus check-in</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              One question at a time — answer before you continue.
            </p>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {index + 1} / {total}
          </p>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Quiz progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-8">{steps[index]}</div>

      <footer className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-8">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="gap-1"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back
        </Button>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Use Check answer on each step, then Next
        </span>
        <Button
          type="button"
          size="sm"
          disabled={index >= total - 1}
          onClick={() => go(index + 1)}
          className="gap-1"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </footer>
    </section>
  );
}
