"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { FOCUS_RING } from "./tones";

// The frame every beat canvas sits in (agent-ip/10-interactive-canvases.md,
// "Beat visuals"): the picture first and full width, then at most two
// controls and one hint line, then the model's limits in a small fold. No
// title row or summary cards above the picture: the beat heading does that.

type BeatFrameProps = {
  /** Accessible name for the whole visual, usually the spec title. */
  label: string;
  /** The picture: one SVG, drawn on a narrow viewBox so it reads on a phone. */
  children: ReactNode;
  /** At most two controls, for example a toggle and Replay. */
  controls?: ReactNode;
  /** One line telling the learner what to touch. */
  hint?: ReactNode;
  /** What the model leaves out. */
  limits: string;
};

export function BeatFrame({ label, children, controls, hint, limits }: BeatFrameProps) {
  return (
    <figure aria-label={label} className="not-prose isolate my-6 min-w-0 max-w-full overflow-clip">
      <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-3">{children}</div>
      {controls || hint ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
          {controls}
          {hint ? <p className="text-sm text-foreground">{hint}</p> : null}
        </div>
      ) : null}
      <details className="group mt-1 px-1">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground [&::-webkit-details-marker]:hidden">
          What this picture leaves out
        </summary>
        <p className="pb-2 text-sm leading-relaxed text-foreground">{limits}</p>
      </details>
    </figure>
  );
}

/** A 44px pill button for the one or two controls under a beat picture. */
export function BeatButton({ pressed, onClick, children }: { pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        buttonVariants({ variant: pressed ? "default" : "outline" }),
        "h-11 rounded-full px-4 text-sm font-semibold sm:h-10",
        pressed && "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-400 dark:text-blue-950",
        FOCUS_RING
      )}
    >
      {children}
    </button>
  );
}
