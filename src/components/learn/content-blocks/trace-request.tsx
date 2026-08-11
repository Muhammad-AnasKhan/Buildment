"use client";

import { Children, isValidElement, useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LearnPanelShell } from "./learn-panel-shell";
import { TRACE_ACTOR_STYLES, type TraceActor } from "./types";

export type TraceStepProps = {
  actor?: TraceActor;
  label: string;
  detail?: string;
  status?: number;
};

export function TraceStep(_props: TraceStepProps) {
  return null;
}

TraceStep.displayName = "TraceStep";

function collectSteps(children: ReactNode): TraceStepProps[] {
  const steps: TraceStepProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string; name?: string };
    if (type?.displayName === "TraceStep" || type?.name === "TraceStep") {
      steps.push(child.props as TraceStepProps);
    }
  });
  return steps;
}

function statusTone(status: number) {
  if (status >= 200 && status < 300) return "text-emerald-700 bg-emerald-50 ring-emerald-200/80";
  if (status >= 400 && status < 500) return "text-amber-800 bg-amber-50 ring-amber-200/80";
  if (status >= 500) return "text-red-700 bg-red-50 ring-red-200/80";
  return "text-neutral-700 bg-neutral-100 ring-neutral-200/80";
}

type TraceRequestClientProps = {
  title?: string;
  steps: TraceStepProps[];
};

export function TraceRequestClient({ title, steps }: TraceRequestClientProps) {
  const [active, setActive] = useState(0);
  const total = steps.length;

  const go = useCallback(
    (next: number) => {
      setActive(Math.max(0, Math.min(total - 1, next)));
    },
    [total]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, go]);

  if (total === 0) return null;

  const current = steps[active]!;
  const actor = current.actor ?? "API";
  const actorStyle = TRACE_ACTOR_STYLES[actor] ?? TRACE_ACTOR_STYLES.API;

  return (
    <LearnPanelShell eyebrow="Trace" title={title}>
      <div className="p-5 sm:p-6" aria-live="polite">
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Step {active + 1} of {total}
          </p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous step"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => go(active + 1)}
              disabled={active === total - 1}
              aria-label="Next step"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <ol className="space-y-0">
          {steps.map((step, i) => {
            const stepActor = step.actor ?? "API";
            const styles = TRACE_ACTOR_STYLES[stepActor] ?? TRACE_ACTOR_STYLES.API;
            const isActive = i === active;

            return (
              <li key={i} className="relative flex gap-4 pb-8 last:pb-0">
                {i < steps.length - 1 ? (
                  <div
                    className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-neutral-200"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 mt-1 size-[22px] shrink-0 rounded-full ring-2 ring-white",
                    styles.dot,
                    !isActive && "opacity-40"
                  )}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                    isActive
                      ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
                      : "border-transparent hover:bg-neutral-50"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
                        styles.badge
                      )}
                    >
                      {stepActor}
                    </span>
                    {step.status != null ? (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset",
                          statusTone(step.status)
                        )}
                      >
                        {step.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 font-mono text-sm text-neutral-900">{step.label}</p>
                  {step.detail && isActive ? (
                    <p className="mt-1 text-sm text-neutral-600">{step.detail}</p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="sr-only">
          {current.label}. {current.detail ?? ""}
        </div>
      </div>
    </LearnPanelShell>
  );
}

type TraceRequestProps = {
  title?: string;
  children?: ReactNode;
};

export function TraceRequest({ title, children }: TraceRequestProps) {
  const steps = collectSteps(children);
  return <TraceRequestClient title={title} steps={steps} />;
}
