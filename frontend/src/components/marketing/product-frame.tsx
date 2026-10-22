"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Clock3 } from "lucide-react";
import { LESSON_MODULES } from "@/components/marketing/marketing-content";
import { cn } from "@/lib/utils";

const START_MODULE = 2;
const MIN_ANSWER_LENGTH = 20;
const REVIEW_DELAY_MS = 700;

/**
 * Interactive lesson preview: pick a module, write (or auto-fill) an answer, submit it for a
 * simulated mentor review, watch the progress bar fill. Nothing here talks to the API.
 */
export function ProductFrame() {
  const [current, setCurrent] = useState(START_MODULE);
  const [done, setDone] = useState<ReadonlySet<number>>(new Set());
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [reviewing, setReviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const lesson = LESSON_MODULES[current];
  const isDone = done.has(current);
  const answer = drafts[current] ?? "";
  const isLast = current === LESSON_MODULES.length - 1;
  const percent = Math.round((done.size / LESSON_MODULES.length) * 100);
  const canSubmit = isDone
    ? !isLast
    : !reviewing && answer.trim().length >= MIN_ANSWER_LENGTH;

  function selectModule(index: number) {
    if (timer.current) clearTimeout(timer.current);
    setReviewing(false);
    setCurrent(index);
  }

  function fillExample() {
    if (isDone) return;
    setDrafts((value) => ({ ...value, [current]: lesson.example }));
    textareaRef.current?.focus();
  }

  function submit() {
    if (isDone) {
      if (!isLast) selectModule(current + 1);
      return;
    }
    const index = current;
    setReviewing(true);
    timer.current = setTimeout(() => {
      setDone((value) => new Set(value).add(index));
      setReviewing(false);
    }, REVIEW_DELAY_MS);
  }

  const submitLabel = reviewing
    ? "Reviewing…"
    : isDone
      ? isLast
        ? "Course preview done"
        : "Next module"
      : "Submit for review";

  return (
    <div className="relative mx-auto w-full max-w-[40rem] lg:max-w-none">
      <div
        aria-label="Interactive lesson preview"
        className="overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl shadow-foreground/10"
      >
        {/* window bar */}
        <div className="flex h-12 items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
          </div>
          <div className="flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
            <span className="truncate">FreshMarket</span>
            <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
            <span className="truncate font-semibold text-foreground">
              {lesson.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            <span>14 min</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-[11.75rem_minmax(0,1fr)]">
          {/* module sidebar */}
          <aside className="border-b border-border/70 bg-muted/15 p-3 sm:border-b-0 sm:border-r sm:p-4">
            <p className="mb-2.5 px-2 text-xs font-semibold text-muted-foreground">
              Module 6
            </p>
            <div className="grid grid-cols-2 gap-1 sm:block sm:space-y-1">
              {LESSON_MODULES.map((module, index) => {
                const on = index === current;
                const finished = done.has(index);
                return (
                  <button
                    key={module.name}
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => selectModule(index)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm",
                      on
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px]",
                        finished
                          ? "border-ok bg-ok text-white"
                          : "border-current opacity-60",
                      )}
                      aria-hidden
                    >
                      {finished ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : null}
                    </span>
                    <span className="truncate">{module.name}</span>
                    {finished ? (
                      <span className="sr-only">(submitted)</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mx-2 mt-5">
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-foreground to-ok transition-[width] duration-[600ms] ease-[cubic-bezier(.3,.8,.3,1)]"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {percent}% complete
              </p>
            </div>
          </aside>

          {/* lesson area */}
          <section className="flex min-w-0 flex-col gap-3 p-5 sm:min-h-[25rem] sm:p-6">
            <span
              className={cn(
                "self-start rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                isDone ? "bg-ok-soft text-ok" : "bg-muted text-foreground",
              )}
            >
              {isDone ? "Submitted" : "Open question"}
            </span>
            <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-[1.375rem]">
              {lesson.question}
            </h3>
            <p className="text-sm text-muted-foreground">{lesson.hint}</p>

            <textarea
              ref={textareaRef}
              value={answer}
              disabled={isDone || reviewing}
              onChange={(event) =>
                setDrafts((value) => ({
                  ...value,
                  [current]: event.target.value,
                }))
              }
              placeholder="Write your reasoning here…"
              aria-label="Your answer"
              className="min-h-24 w-full resize-y rounded-[14px] border border-border bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-80"
            />

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={fillExample}
                disabled={isDone || reviewing}
                className="rounded-md text-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
              >
                Show an example answer
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="rounded-xl bg-foreground cursor-pointer px-[18px] py-2.5 text-sm font-semibold text-background outline-none transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transform-none"
              >
                {submitLabel}
              </button>
            </div>

            {isDone ? (
              <div
                role="status"
                className="bm-pop flex gap-2.5 rounded-[14px] bg-ok-soft px-3.5 py-3 text-sm"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok font-bold text-white">
                  M
                </span>
                <div>
                  <b className="block font-semibold">Mentor review</b>
                  <span className="text-foreground/85">{lesson.feedback}</span>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -inset-x-6 -bottom-6 -z-10 h-28 rounded-full bg-muted/60 blur-3xl"
        aria-hidden="true"
      />
    </div>
  );
}
