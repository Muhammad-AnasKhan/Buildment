"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Flame, Mail, Snowflake, Sparkles, Target, X, Zap } from "lucide-react";
import { clearWeeklyGoal, setWeeklyGoal } from "@/server/actions/weekly-goal";
import { Button } from "@/components/ui/button";
import { XP_AMOUNTS } from "@/shared/gamification/xp";
import type { LearnerHabit, StudyGoalKind, StudyGoalPeriod } from "@/shared/lib/streak";

type Preset = {
  id: string;
  label: string;
  detail: string;
  period: StudyGoalPeriod;
  kind: StudyGoalKind;
  target: number;
};

const DAILY_PRESETS: Preset[] = [
  { id: "daily-light", label: "Light", detail: "5 min", period: "DAILY", kind: "MINUTES", target: 5 },
  { id: "daily-steady", label: "Steady", detail: "10 min", period: "DAILY", kind: "MINUTES", target: 10 },
  { id: "daily-strong", label: "Strong", detail: "20 min", period: "DAILY", kind: "MINUTES", target: 20 },
];

const WEEKLY_SESSION_PRESETS: Preset[] = [
  { id: "weekly-light", label: "Light", detail: "3 sessions", period: "WEEKLY", kind: "SESSIONS", target: 3 },
  { id: "weekly-steady", label: "Steady", detail: "5 sessions", period: "WEEKLY", kind: "SESSIONS", target: 5 },
  { id: "weekly-strong", label: "Strong", detail: "7 sessions", period: "WEEKLY", kind: "SESSIONS", target: 7 },
];

const WEEKLY_CHAPTER_PRESETS: Preset[] = [
  { id: "weekly-ch-light", label: "Light", detail: "2 chapters", period: "WEEKLY", kind: "CHAPTERS", target: 2 },
  { id: "weekly-ch-steady", label: "Steady", detail: "3 chapters", period: "WEEKLY", kind: "CHAPTERS", target: 3 },
  { id: "weekly-ch-strong", label: "Strong", detail: "5 chapters", period: "WEEKLY", kind: "CHAPTERS", target: 5 },
];

function matchPreset(period: StudyGoalPeriod, kind: StudyGoalKind, target: number, weeklyMetric: "SESSIONS" | "CHAPTERS") {
  const list =
    period === "DAILY" ? DAILY_PRESETS : weeklyMetric === "CHAPTERS" ? WEEKLY_CHAPTER_PRESETS : WEEKLY_SESSION_PRESETS;
  return list.find((preset) => preset.kind === kind && preset.target === target)?.id ?? null;
}

function unitLabel(kind: StudyGoalKind) {
  if (kind === "MINUTES") return "minutes";
  if (kind === "CHAPTERS") return "chapters";
  return "sessions";
}

export function WeeklyGoalEditor({ goal }: { goal: LearnerHabit["weeklyGoal"] | LearnerHabit["goal"] }) {
  const current = goal;
  const [period, setPeriod] = useState<StudyGoalPeriod>(current?.period ?? "DAILY");
  const [weeklyMetric, setWeeklyMetric] = useState<"SESSIONS" | "CHAPTERS">(
    current?.kind === "CHAPTERS" ? "CHAPTERS" : "SESSIONS",
  );
  const [kind, setKind] = useState<StudyGoalKind>(current?.kind ?? "MINUTES");
  const [target, setTarget] = useState(current?.target ?? 10);
  const [note, setNote] = useState(current?.note ?? "");
  const [dailyReminder, setDailyReminder] = useState(current?.dailyReminder ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const presets = useMemo(() => {
    if (period === "DAILY") return DAILY_PRESETS;
    return weeklyMetric === "CHAPTERS" ? WEEKLY_CHAPTER_PRESETS : WEEKLY_SESSION_PRESETS;
  }, [period, weeklyMetric]);

  const selectedPresetId = matchPreset(period, kind, target, weeklyMetric);
  const boostXp = period === "DAILY" ? XP_AMOUNTS.daily_goal_met : XP_AMOUNTS.weekly_goal_met;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function openEditor() {
    const nextPeriod = current?.period ?? "DAILY";
    const nextKind = current?.kind ?? (nextPeriod === "DAILY" ? "MINUTES" : "SESSIONS");
    const nextTarget = current?.target ?? (nextPeriod === "DAILY" ? 10 : 5);
    setPeriod(nextPeriod);
    setWeeklyMetric(nextKind === "CHAPTERS" ? "CHAPTERS" : "SESSIONS");
    setKind(nextKind);
    setTarget(nextTarget);
    setNote(current?.note ?? "");
    setDailyReminder(current?.dailyReminder ?? false);
    setError(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setError(null);
  }

  function choosePeriod(next: StudyGoalPeriod) {
    setPeriod(next);
    if (next === "DAILY") {
      setKind("MINUTES");
      setTarget(10);
      return;
    }
    setKind(weeklyMetric);
    setTarget(weeklyMetric === "CHAPTERS" ? 3 : 5);
  }

  function chooseWeeklyMetric(next: "SESSIONS" | "CHAPTERS") {
    setWeeklyMetric(next);
    setKind(next);
    setTarget(next === "CHAPTERS" ? 3 : 5);
  }

  function choosePreset(preset: Preset) {
    setPeriod(preset.period);
    setKind(preset.kind);
    setTarget(preset.target);
    if (preset.period === "WEEKLY" && (preset.kind === "SESSIONS" || preset.kind === "CHAPTERS")) {
      setWeeklyMetric(preset.kind);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setWeeklyGoal({ period, kind, target, note, dailyReminder });
      if (!result.ok) setError(result.error);
      else close();
    });
  }

  function onClear() {
    setError(null);
    startTransition(async () => {
      await clearWeeklyGoal();
      close();
    });
  }

  const cta = current
    ? current.period === "DAILY"
      ? "Edit daily goal"
      : "Edit weekly goal"
    : "Set a study goal";

  return (
    <>
      <Button type="button" size="lg" onClick={openEditor} className="h-10 gap-2 rounded-xl px-4">
        <Target className="size-4" aria-hidden /> {cta}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:items-end open:justify-center open:p-0 sm:open:items-center sm:open:p-4"
        aria-labelledby="study-goal-title"
      >
        <div className="flex max-h-[min(94dvh,42rem)] w-full max-w-[36rem] flex-col overflow-hidden rounded-t-[1.5rem] border bg-card text-card-foreground sm:rounded-[1.5rem]">
          <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Target className="size-5" aria-hidden />
              </span>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Habit plan</p>
                <h2 id="study-goal-title" className="text-xl font-semibold tracking-tight">
                  {current ? "Adjust your goal" : "Choose a study goal"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick a pace that fits your life. Change it anytime.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mx-5 mb-3 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-amber-500/10 p-4 sm:mx-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden /> Boosts when you hit it
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-3 py-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <Zap className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">+{boostXp} XP</span>
                  <span className="block text-xs text-muted-foreground">
                    {period === "DAILY" ? "Once per day" : "Once per week"}
                  </span>
                </span>
              </div>
              {period === "WEEKLY" ? (
                <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-3 py-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    <Snowflake className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Streak freeze</span>
                    <span className="block text-xs text-muted-foreground">Protects one missed day</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-3 py-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-300">
                    <Flame className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Streak stays separate</span>
                    <span className="block text-xs text-muted-foreground">One lesson keeps your streak</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 space-y-5 overflow-y-auto px-5 pb-5 sm:px-7">
              <fieldset>
                <legend className="text-sm font-semibold">How often?</legend>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { value: "DAILY" as const, label: "Daily", detail: "Build a habit" },
                      { value: "WEEKLY" as const, label: "Weekly", detail: "Plan the week" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => choosePeriod(option.value)}
                      className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                        period === option.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "bg-background hover:border-foreground/40"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{option.detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {period === "WEEKLY" ? (
                <fieldset>
                  <legend className="text-sm font-semibold">Track by</legend>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {(
                      [
                        { value: "SESSIONS" as const, label: "Sessions", detail: "Each study visit" },
                        { value: "CHAPTERS" as const, label: "Chapters", detail: "Chapters completed" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => chooseWeeklyMetric(option.value)}
                        className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                          weeklyMetric === option.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "bg-background hover:border-foreground/40"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{option.detail}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <fieldset>
                <legend className="text-sm font-semibold">{period === "DAILY" ? "Daily pace" : "Weekly target"}</legend>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  {presets.map((preset) => {
                    const selected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => choosePreset(preset)}
                        className={`rounded-xl border px-2.5 py-3 text-center transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:border-foreground/40"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{preset.label}</span>
                        <span className={`mt-1 block text-xs ${selected ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                          {preset.detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {period === "DAILY"
                    ? "Minutes count from real study time across your courses."
                    : `Progress covers the last 7 days · ${target} ${unitLabel(kind)}.`}
                </p>
              </fieldset>

              {current ? (
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Current progress:{" "}
                  <span className="font-medium text-foreground">
                    {current.progress} of {current.target} {unitLabel(current.kind)}
                    {current.period === "DAILY" ? " today" : " this week"}
                  </span>
                </p>
              ) : null}

              <label className="block text-sm font-semibold">
                Focus note <span className="font-normal text-muted-foreground">· Optional</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={240}
                  rows={2}
                  placeholder={period === "DAILY" ? "What will you practice today?" : "What would you like to work on this week?"}
                  className="mt-2.5 w-full resize-none rounded-xl border bg-background px-3.5 py-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-3.5 hover:border-foreground/40">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                  <Mail className="size-4 text-muted-foreground" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Email reminder</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    Nudge you while the goal is still open.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(event) => setDailyReminder(event.target.checked)}
                  className="size-4 shrink-0 accent-primary"
                />
              </label>
            </div>

            <div className="shrink-0 border-t px-5 py-3.5 sm:px-7">
              {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
              <div className="flex items-center justify-end gap-2">
                {current ? (
                  <Button type="button" size="sm" variant="ghost" loading={pending} disabled={pending} onClick={onClear} className="mr-auto">
                    Remove goal
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} loading={pending}>
                  {pending ? "Saving…" : "Save goal"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
