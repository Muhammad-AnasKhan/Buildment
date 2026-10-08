"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PartyPopper, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AnimatedCourseProgressBar({
  courseCompleted,
  courseTotal,
  animate,
}: {
  courseCompleted: number;
  courseTotal: number;
  animate: boolean;
}) {
  const nextCompleted = Math.min(courseTotal, courseCompleted + 1);
  const targetPct = courseTotal > 0 ? Math.round((nextCompleted / courseTotal) * 100) : 0;
  const startPct = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;
  const [widthPct, setWidthPct] = useState(startPct);

  useEffect(() => {
    if (!animate) {
      setWidthPct(targetPct);
      return;
    }
    setWidthPct(startPct);
    const start = window.setTimeout(() => setWidthPct(targetPct), 120);
    return () => window.clearTimeout(start);
  }, [animate, startPct, targetPct]);

  return (
    <div
      className="chapter-complete-stagger mt-5 rounded-xl border border-border bg-muted/35 p-4"
      style={{ animationDelay: "420ms" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">Course progress</span>
        <span className="text-sm font-semibold tabular-nums">
          {nextCompleted}/{courseTotal}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-[width] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] dark:from-emerald-500 dark:to-emerald-300"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-muted-foreground">{widthPct}% of the course</p>
    </div>
  );
}

export function ChapterCompleteCelebrationModal({
  open,
  onClose,
  recap,
  streakMilestone,
  courseCompleted,
  courseTotal,
  nextHref,
  nextTitle,
}: {
  open: boolean;
  onClose: () => void;
  recap?: { checks: string; open: string; next: string };
  streakMilestone?: number | null;
  courseCompleted: number;
  courseTotal: number;
  nextHref?: string;
  nextTitle?: string;
}) {
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setContentReady(false);
      return;
    }
    setContentReady(false);
    const t = window.requestAnimationFrame(() => setContentReady(true));
    return () => cancelAnimationFrame(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="chapter-complete-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-complete-title"
    >
      <div className="chapter-complete-panel w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div
            className="chapter-complete-stagger flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            style={{ animationDelay: "80ms" }}
          >
            <PartyPopper className="chapter-complete-popper size-8" aria-hidden />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close celebration"
          >
            <X className="size-4" />
          </button>
        </div>

        <p
          className="chapter-complete-stagger mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Progress saved
        </p>
        <h2
          id="chapter-complete-title"
          className="chapter-complete-stagger mt-1 text-2xl font-semibold tracking-tight"
          style={{ animationDelay: "220ms" }}
        >
          Great work — chapter complete
        </h2>

        {recap ? (
          <ul
            className="chapter-complete-stagger mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            <li>{recap.checks}</li>
            <li>{recap.open}</li>
            <li>{recap.next}</li>
          </ul>
        ) : (
          <p
            className="chapter-complete-stagger mt-2 text-sm leading-relaxed text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            You can continue when you&apos;re ready. Small, verified steps add up.
          </p>
        )}

        {streakMilestone ? (
          <p
            className="chapter-complete-stagger mt-3 text-sm font-medium text-foreground"
            style={{ animationDelay: "360ms" }}
          >
            {streakMilestone}-day streak — keep it going.
          </p>
        ) : null}

        <AnimatedCourseProgressBar
          courseCompleted={courseCompleted}
          courseTotal={courseTotal}
          animate={contentReady}
        />

        {nextHref ? (
          <Link
            href={nextHref}
            className={cn(
              buttonVariants(),
              "chapter-complete-stagger mt-5 w-full",
            )}
            style={{ animationDelay: "540ms" }}
          >
            {nextTitle ? `Continue to ${nextTitle}` : "Continue to the next lesson"}
            <ArrowRight data-icon="inline-end" />
          </Link>
        ) : (
          <Button
            type="button"
            className="chapter-complete-stagger mt-5 w-full rounded-md"
            style={{ animationDelay: "540ms" }}
            onClick={onClose}
          >
            Keep going
          </Button>
        )}
      </div>
    </div>
  );
}
