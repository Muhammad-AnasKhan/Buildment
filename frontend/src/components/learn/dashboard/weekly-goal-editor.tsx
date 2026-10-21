"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Mail, Minus, Plus, Target, X } from "lucide-react";
import { clearWeeklyGoal, setWeeklyGoal } from "@/server/actions/weekly-goal";
import { Button } from "@/components/ui/button";
import type { LearnerHabit } from "@/shared/lib/streak";

export function WeeklyGoalEditor({ goal }: { goal: LearnerHabit["weeklyGoal"] }) {
  const [kind, setKind] = useState<"SESSIONS" | "CHAPTERS">(goal?.kind ?? "SESSIONS");
  const [target, setTarget] = useState(String(goal?.target ?? 3));
  const [note, setNote] = useState(goal?.note ?? "");
  const [dailyReminder, setDailyReminder] = useState(goal?.dailyReminder ?? false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextTarget = Number(target);
  const validTarget = Number.isInteger(nextTarget) && nextTarget >= 1 && nextTarget <= 50;
  const unit = kind === "SESSIONS" ? "sessions" : "chapters";

  function adjustTarget(change: number) {
    setTarget(String(Math.min(50, Math.max(1, (validTarget ? nextTarget : 1) + change))));
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function openEditor() {
    setKind(goal?.kind ?? "SESSIONS");
    setTarget(String(goal?.target ?? 3));
    setNote(goal?.note ?? "");
    setDailyReminder(goal?.dailyReminder ?? false);
    setStep(1);
    setError(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setStep(1);
    setError(null);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validTarget) return;
    if (step === 1) {
      setStep(2);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setWeeklyGoal({ kind, target: nextTarget, note, dailyReminder });
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

  return (
    <>
      <Button type="button" size="lg" onClick={openEditor} className="h-10 gap-2 rounded-xl px-4 shadow-sm">
        <Target className="size-4" aria-hidden /> {goal ? "Edit weekly goal" : "Set weekly goal"}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:items-center open:justify-center open:p-4"
        aria-labelledby="weekly-goal-title"
      >
        <div className="flex max-h-[min(92dvh,39rem)] w-full max-w-[34rem] flex-col overflow-hidden rounded-[1.5rem] border bg-card text-card-foreground shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Target className="size-5" aria-hidden /></span>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your learning plan</p>
                <h2 id="weekly-goal-title" className="text-xl font-semibold tracking-tight">{goal ? "Edit weekly goal" : "Set a weekly goal"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{step === 1 ? "Choose a target that fits your week." : "Make this goal yours."}</p>
              </div>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="-mr-1 -mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" /></button>
          </div>

          <div className="shrink-0 border-y bg-muted/20 px-5 py-3 sm:px-7" aria-label={`Step ${step} of 2`}>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={`grid size-5 place-items-center rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>1</span>
              <span className={step === 1 ? "text-foreground" : "text-muted-foreground"}>Set your target</span>
              <span className="mx-2 h-px flex-1 bg-border" />
              <span className={`grid size-5 place-items-center rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "border text-muted-foreground"}`}>2</span>
              <span className={step === 2 ? "text-foreground" : "text-muted-foreground"}>Add details</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {step === 1 ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-sm font-semibold">What would you like to track?</legend>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                      {([
                        { value: "SESSIONS", label: "Study sessions", detail: "Each time you study", icon: CalendarDays },
                        { value: "CHAPTERS", label: "Chapters", detail: "Chapters completed", icon: BookOpen },
                      ] as const).map(({ value, label, detail, icon: Icon }) => (
                        <label key={value} className={`relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-ring ${kind === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background hover:border-foreground/40"}`}>
                          <input type="radio" name="weekly-goal-kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="peer sr-only" />
                          <span className="flex items-center justify-between"><Icon className={`size-4 ${kind === value ? "text-primary" : "text-muted-foreground"}`} aria-hidden /><span className={`size-3.5 rounded-full border-[3px] ${kind === value ? "border-primary bg-background" : "border-muted-foreground/50"}`} aria-hidden /></span>
                          <span><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="weekly-goal-target" className="text-sm font-semibold">How many per week?</label>
                    <div className="mt-2.5 flex items-center justify-between rounded-xl border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
                      <span className="text-sm text-muted-foreground">Target</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => adjustTarget(-1)} disabled={nextTarget <= 1} aria-label="Decrease weekly target" className="grid size-8 place-items-center rounded-lg border text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
                        <input id="weekly-goal-target" type="number" min={1} max={50} value={target} onChange={(event) => setTarget(event.target.value)} className="w-10 appearance-none bg-transparent text-center text-lg font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" aria-describedby="weekly-goal-target-help" aria-invalid={!validTarget} />
                        <button type="button" onClick={() => adjustTarget(1)} disabled={nextTarget >= 50} aria-label="Increase weekly target" className="grid size-8 place-items-center rounded-lg border text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
                      </div>
                      <span className="min-w-16 text-right text-sm text-muted-foreground">{unit}</span>
                    </div>
                    <p id="weekly-goal-target-help" className={`mt-2 text-xs leading-5 ${validTarget ? "text-muted-foreground" : "text-destructive"}`}>{validTarget ? `${kind === "SESSIONS" ? "A session counts when you study in any course." : "A chapter counts when you complete it."} Choose 1–50; progress covers the last 7 days.` : "Enter a target from 1 to 50."}</p>
                  </div>
                  {goal ? <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Current progress: <span className="font-medium text-foreground">{goal.progress} of {goal.target} {goal.kind === "CHAPTERS" ? "chapters" : "sessions"}</span></p> : null}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Your weekly target</p>
                    <p className="mt-0.5 text-lg font-semibold">{target} {kind === "SESSIONS" ? "study sessions" : "chapters"}</p>
                  </div>
                  <label className="block text-sm font-semibold">
                    Your focus <span className="font-normal text-muted-foreground">· Optional</span>
                    <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} rows={2} placeholder="What would you like to work on this week?" className="mt-2.5 w-full resize-none rounded-xl border bg-background px-3.5 py-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
                    <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">{note.length}/240</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-3.5 hover:border-foreground/40">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><Mail className="size-4 text-muted-foreground" aria-hidden /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily email reminder</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Get a reminder while your goal is unfinished.</span></span>
                    <input type="checkbox" checked={dailyReminder} onChange={(event) => setDailyReminder(event.target.checked)} className="size-4 shrink-0 accent-primary" />
                  </label>
                </div>
              )}
            </div>
            <div className="shrink-0 border-t px-5 py-3.5 sm:px-7">
              {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
              <div className="flex items-center justify-end gap-2">
                {goal && step === 1 ? <Button type="button" size="sm" variant="ghost" loading={pending} disabled={pending} onClick={onClear} className="mr-auto">Remove goal</Button> : null}
                {step === 2 ? <Button type="button" size="sm" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="size-3.5" /> Back</Button> : <Button type="button" size="sm" variant="outline" onClick={close}>Cancel</Button>}
                <Button type="submit" disabled={pending || !validTarget} loading={pending}>
                  {step === 1 ? <>Next <ArrowRight className="size-4" /></> : pending ? "Saving…" : "Save goal"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
