"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Target, X } from "lucide-react";
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
        <div className="flex max-h-[min(90dvh,34rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Target className="size-4" aria-hidden /></span>
              <div>
                <h2 id="weekly-goal-title" className="text-base font-semibold">{goal ? "Edit weekly goal" : "Set weekly goal"}</h2>
                <p className="text-xs text-muted-foreground">{step === 1 ? "Choose what you want to complete." : "Add your focus and reminder preference."}</p>
              </div>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
          </div>

          <div className="shrink-0 px-5 pt-4 sm:px-6" aria-label={`Step ${step} of 2`}>
            <div className="mb-2 flex justify-between text-xs font-medium"><span className={step === 1 ? "text-foreground" : "text-muted-foreground"}>1 · Weekly target</span><span className={step === 2 ? "text-foreground" : "text-muted-foreground"}>2 · Details</span></div>
            <div className="grid grid-cols-2 gap-2"><span className="h-1.5 rounded-full bg-primary" /><span className={`h-1.5 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} /></div>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Track your goal by
                    <select value={kind} onChange={(event) => setKind(event.target.value as "SESSIONS" | "CHAPTERS")} className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:[color-scheme:dark]">
                      <option value="SESSIONS">Study sessions</option>
                      <option value="CHAPTERS">Completed chapters</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Target each week
                    <div className="mt-2 flex h-10 items-center rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
                      <input type="number" min={1} max={50} value={target} onChange={(event) => setTarget(event.target.value)} className="h-full min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm outline-none" aria-label="Weekly target" />
                      <span className="pr-3 text-xs text-muted-foreground">{kind === "SESSIONS" ? "sessions" : "chapters"}</span>
                    </div>
                  </label>
                  <p className="text-xs leading-5 text-muted-foreground">{kind === "SESSIONS" ? "A session counts when you study in a course." : "A chapter counts when you complete it."} Your progress covers the last 7 days.</p>
                  {goal ? <p className="rounded-lg bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">Current goal: {goal.progress} of {goal.target} {goal.kind === "CHAPTERS" ? "chapters" : "sessions"} complete</p> : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Your focus this week <span className="font-normal text-muted-foreground">· Optional</span>
                    <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} rows={2} placeholder="For example: Finish the vendor dashboard modules" className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm font-normal outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
                    <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">{note.length}/240</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/15 p-3.5">
                    <input type="checkbox" checked={dailyReminder} onChange={(event) => setDailyReminder(event.target.checked)} className="mt-0.5 size-4 accent-primary" />
                    <span><span className="block text-sm font-medium">Email me a daily reminder</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">One email each day while the goal is unfinished. You can turn it off here.</span></span>
                  </label>
                  <p className="text-xs text-muted-foreground">Goal: {target} {kind === "SESSIONS" ? "study sessions" : "chapters"} per week</p>
                </div>
              )}
            </div>
            <div className="shrink-0 border-t px-5 py-3 sm:px-6">
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
