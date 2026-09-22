"use client";

import { Clock } from "lucide-react";
import { formatStudyClock, formatStudyDuration } from "@/lib/format-study-duration";
import type { StudyClockStatus } from "@/lib/use-study-session";
import { cn } from "@/lib/utils";

export function StudyClock({
  status,
  busy,
  sessionSeconds,
  chapterTotalSeconds,
  estimatedMinutes,
  onStart,
  onPause,
  onResume,
  onStop,
  className,
}: {
  status: StudyClockStatus;
  busy: boolean;
  sessionSeconds: number;
  chapterTotalSeconds: number;
  estimatedMinutes?: number | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
}) {
  const chapterLabel =
    chapterTotalSeconds > 0
      ? `${formatStudyDuration(chapterTotalSeconds)}${
          estimatedMinutes != null && estimatedMinutes > 0 ? ` / ${estimatedMinutes}m` : ""
        }`
      : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-foreground"
        title={
          chapterLabel
            ? `This session. Chapter total ${chapterLabel}.`
            : "Study timer. Time is saved while the clock is running."
        }
      >
        <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-mono text-sm tabular-nums" aria-label="Session time">
          {formatStudyClock(sessionSeconds)}
        </span>
        {chapterLabel ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">{chapterLabel}</span>
        ) : null}
      </div>

      {status === "running" ? (
        <>
          <ClockButton disabled={busy} onClick={onPause}>
            Pause
          </ClockButton>
          <ClockButton disabled={busy} onClick={onStop}>
            Stop
          </ClockButton>
        </>
      ) : status === "paused" ? (
        <>
          <ClockButton disabled={busy} onClick={onResume}>
            Resume
          </ClockButton>
          <ClockButton disabled={busy} onClick={onStop}>
            Stop
          </ClockButton>
        </>
      ) : (
        <ClockButton disabled={busy} onClick={onStart} emphasis>
          Start
        </ClockButton>
      )}
    </div>
  );
}

function ClockButton({
  children,
  onClick,
  disabled,
  emphasis = false,
}: {
  children: string;
  onClick: () => void;
  disabled: boolean;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50",
        emphasis
          ? "bg-foreground text-background hover:opacity-90"
          : "border border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
