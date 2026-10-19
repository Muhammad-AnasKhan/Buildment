"use client";

import { useBrowserStorage } from "@/lib/use-browser-storage";
import { Clock, EyeOff, Pause, Play, Square } from "lucide-react";
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
  const [storedVisibility, setStoredVisibility] = useBrowserStorage("buildment:show-study-clock", "true");
  const visible = storedVisibility !== "false";
  const toggleVisible = () => setStoredVisibility(String(!visible));

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
        className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground hover:text-foreground", className)}
        title="Show estimated study-time controls"
      >
        <Clock className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">Show timer</span>
        <span className="sr-only sm:hidden">Show study timer</span>
      </button>
    );
  }

  const pausedLabel =
    pauseReason === "inactive"
      ? "Paused after 2 min idle"
      : pauseReason === "hidden"
        ? "Paused while away"
        : "Paused";

  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <div
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-foreground",
          status === "running" && "border-emerald-500/40"
        )}
        title={
          chapterLabel
            ? `Estimated study time. This session; ${chapterLabel}. Counts while this lesson is visible and you are active. Pauses after two minutes without activity.`
            : "Estimated study time. Counts while this lesson is visible and you are active. Pauses after two minutes without activity."
        }
      >
        <Clock
          className={cn(
            "size-3.5 shrink-0",
            status === "running" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          )}
          aria-hidden
        />
        <span className="font-mono text-[13px] tabular-nums" aria-label="Session time">
          {formatStudyClock(sessionSeconds)}
        </span>
        {chapterLabel ? (
          <span className="hidden text-xs text-muted-foreground 2xl:inline">{chapterLabel}</span>
        ) : null}
        {status === "paused" ? (
          <span className="hidden text-xs text-muted-foreground xl:inline">{pausedLabel}</span>
        ) : null}
      </div>

      {status === "running" ? (
        <>
          <ClockIconButton disabled={busy} onClick={onPause} label="Pause study timer">
            <Pause className="size-3.5" aria-hidden />
          </ClockIconButton>
          <ClockIconButton disabled={busy} onClick={onStop} label="Stop study timer">
            <Square className="size-3" aria-hidden />
          </ClockIconButton>
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
          <ClockIconButton disabled={busy} onClick={onResume} label="Resume study timer" emphasis>
            <Play className="size-3.5" aria-hidden />
          </ClockIconButton>
          <ClockIconButton disabled={busy} onClick={onStop} label="Stop study timer">
            <Square className="size-3" aria-hidden />
          </ClockIconButton>
        </>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Play className="size-3" aria-hidden />
          Start
        </button>
      )}
      <ClockIconButton
        onClick={toggleVisible}
        label="Hide study timer"
        title="Hide the study-time display. Tracking rules and course progress are unchanged."
        quiet
      >
        <EyeOff className="size-3.5" aria-hidden />
      </ClockIconButton>
    </div>
  );
}

function ClockIconButton({
  children,
  onClick,
  label,
  title,
  disabled = false,
  emphasis = false,
  quiet = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  title?: string;
  disabled?: boolean;
  emphasis?: boolean;
  quiet?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50",
        emphasis
          ? "bg-foreground text-background hover:opacity-90"
          : quiet
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "border border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
