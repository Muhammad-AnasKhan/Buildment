"use client";

// The fault-injection timeline and the verification grid. Presentational: they take
// plain data (steps, checks) and a function to put names into sentences.

import { Zap } from "lucide-react";
import { okText } from "./bench";

/** How long a run stays on each scenario, in milliseconds. */
export const PHASE_MS = 2600;

export interface TimelineStep {
  id: string;
  title: string;
}

export interface CheckView {
  id: string;
  label: string;
  pass: boolean;
  measured: string;
  target: string;
  reason?: string;
}

const same = (s: string) => s;

/** One connected segment per scenario, with a bar that fills while it plays. */
export function PhaseTimeline({
  steps, playing, activeId, onPick, text = same,
}: {
  steps: TimelineStep[];
  /** Index of the step the run is playing now, or null. */
  playing: number | null;
  /** The step shown on the board when no run is playing. */
  activeId?: string | null;
  onPick?: (id: string) => void;
  text?: (s: string) => string;
}) {
  const shownId = playing !== null ? steps[playing]?.id : activeId;
  return (
    <ol className="flex overflow-hidden rounded-[6px] border-[1.5px] border-border bg-card" data-testid="phase-timeline">
      {steps.map((p, i) => {
        const active = shownId === p.id;
        const now = playing === i;
        const past = playing !== null && i < playing;
        return (
          <li key={p.id} className="min-w-0 flex-1 border-l-[1.5px] border-border first:border-l-0">
            <button
              type="button"
              disabled={playing !== null || !onPick}
              onClick={() => onPick?.(p.id)}
              aria-current={active ? "step" : undefined}
              className={`relative flex w-full flex-col items-start gap-0.5 px-2 pb-2 pt-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)] disabled:cursor-default ${active ? "bg-[color:var(--lab-accent)]/15" : "hover:bg-muted"}`}
            >
              <span className="lab-mono flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
                {i > 0 ? <Zap className="h-2.5 w-2.5 text-[color:var(--lab-warm-ink)]" aria-label="fault" /> : null}
              </span>
              <span className="lab-display w-full truncate text-[11.5px] font-semibold">{text(p.title)}</span>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-[color:var(--lab-recessed)]">
                {now ? (
                  <span key={`fill-${i}`} className="lab-fill block h-full bg-[color:var(--lab-accent)]" style={{ ["--lab-phase-ms" as string]: `${PHASE_MS}ms` }} />
                ) : past || (playing === null && active) ? (
                  <span className="block h-full bg-[color:var(--lab-accent)]" />
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** One check: a stamp (wait, pass or fail), its name, what was measured against what was needed, and why it failed. */
export function CheckSlot({ check, revealed, onShow, text = same }: {
  check: CheckView;
  revealed: boolean;
  /** Replays the scene this check was measured in. */
  onShow?: () => void;
  text?: (s: string) => string;
}) {
  const status = !revealed ? "Not run yet" : check.pass ? "Pass" : "Fail";
  return (
    <li
      className={`flex gap-2 rounded-[5px] border px-2 py-1.5 ${!revealed ? "border-border bg-card" : check.pass ? "border-[color:var(--lab-ok)]/50 bg-card" : "border-[color:var(--lab-down)]/60 bg-[color:var(--lab-down-fill)]/40"}`}
      data-check={check.id}
      data-status={revealed ? (check.pass ? "pass" : "fail") : "pending"}
    >
      <span
        key={revealed ? "on" : "off"}
        aria-hidden
        className={`lab-mono mt-0.5 flex h-[22px] w-[42px] shrink-0 items-center justify-center rounded-[3px] border-2 text-[9px] font-bold uppercase tracking-wider ${revealed ? "lab-stamp" : ""} ${
          !revealed ? "border-dashed border-border text-muted-foreground" : check.pass ? "border-[color:var(--lab-ok-ink)] text-[color:var(--lab-ok-ink)]" : "border-[color:var(--lab-down-ink)] text-[color:var(--lab-down-ink)]"
        }`}
      >
        {!revealed ? "wait" : check.pass ? "pass" : "fail"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium leading-snug">
          {text(check.label)}
          <span className="sr-only">: {status}</span>
        </div>
        <div className="text-[11px] leading-snug text-muted-foreground">
          {revealed ? (
            <>
              Measured <span className={`lab-mono font-bold ${okText(check.pass)}`}>{text(check.measured)}</span>
              <span aria-hidden> / </span>
              <span>needs {text(check.target)}</span>
            </>
          ) : (
            <>Needs {text(check.target)}</>
          )}
        </div>
        {revealed && !check.pass && check.reason ? (
          <div className="mt-0.5 text-[11.5px] leading-snug text-[color:var(--lab-down-ink)]">{text(check.reason)}</div>
        ) : null}
      </div>
      {revealed && onShow ? (
        <button type="button" onClick={onShow} className="lab-mono h-fit shrink-0 rounded-[4px] border border-border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)]">
          {check.pass ? "Replay" : "Inspect"}
        </button>
      ) : null}
    </li>
  );
}
