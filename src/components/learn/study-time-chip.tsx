"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatStudyClock, formatStudyDuration } from "@/lib/format-study-duration";
import type { StudyClockStatus, StudyPauseReason } from "@/lib/use-study-session";
import { cn } from "@/lib/utils";

export function StudyClock({
  status,
  pauseReason,
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
  pauseReason: StudyPauseReason;
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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem("buildment:show-study-clock") !== "false");
    } catch {
      // The timer remains usable when browser storage is unavailable.
    }
  }, []);

  const toggleVisible = () => {
    const next = !visible;
    setVisible(next);
    try {
      window.localStorage.setItem("buildment:show-study-clock", String(next));
    } catch {
      // This preference is optional and only persists when browser storage allows it.
    }
  };

  const chapterLabel =
    chapterTotalSeconds > 0
      ? `Estimated lesson total ${formatStudyDuration(chapterTotalSeconds)}${
          estimatedMinutes != null && estimatedMinutes > 0 ? ` / ${estimatedMinutes}m` : ""
        }`
      : null;

  if (!visible) {
    return (
      <button
        type="button"
        onClick={toggleVisible}
        className={cn("h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground hover:text-foreground", className)}
        title="Show estimated study-time controls"
      >
        Show timer
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-foreground"
        title={
          chapterLabel
            ? `Estimated study time. This session; ${chapterLabel}. Counts while this lesson is visible and you are active. Pauses after two minutes without activity.`
            : "Estimated study time. Counts while this lesson is visible and you are active. Pauses after two minutes without activity."
        }
      >
        <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-mono text-sm tabular-nums" aria-label="Session time">
          {formatStudyClock(sessionSeconds)}
        </span>
        <span className="text-[10px] text-muted-foreground">est.</span>
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
          <span className="sr-only" aria-live="polite">
            {pauseReason === "inactive"
              ? "Study time paused after two minutes without activity."
              : pauseReason === "hidden"
                ? "Study time paused because this lesson was hidden."
                : "Study time paused."}
          </span>
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
      {status === "paused" ? (
        <span className="hidden text-xs text-muted-foreground lg:inline">
          {pauseReason === "inactive"
            ? "Paused after 2 min idle"
            : pauseReason === "hidden"
              ? "Paused while away"
              : "Paused"}
        </span>
      ) : null}
      <button
        type="button"
        onClick={toggleVisible}
        className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        title="Hide the study-time display. Tracking rules and course progress are unchanged."
      >
        Hide
      </button>
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
