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
      className={`rounded-[8px] border p-2.5 shadow-sm ${!revealed ? "border-border bg-card" : check.pass ? "border-[color:var(--lab-ok)]/45 bg-card" : "border-[color:var(--lab-down)]/60 bg-[color:var(--lab-down-fill)]/35"}`}
      data-check={check.id}
      data-status={revealed ? (check.pass ? "pass" : "fail") : "pending"}
    >
      <div className="flex items-start gap-2">
        <span
          key={revealed ? "on" : "off"}
          aria-hidden
          className={`lab-mono flex h-[21px] w-[42px] shrink-0 items-center justify-center rounded-full border text-[8.5px] font-bold uppercase tracking-wider ${revealed ? "lab-stamp" : ""} ${
            !revealed ? "border-dashed border-border bg-muted text-muted-foreground" : check.pass ? "border-[color:var(--lab-ok)]/60 bg-[color:var(--lab-ok)]/10 text-[color:var(--lab-ok-ink)]" : "border-[color:var(--lab-down)]/60 bg-[color:var(--lab-down-fill)] text-[color:var(--lab-down-ink)]"
          }`}
        >
          {!revealed ? "wait" : check.pass ? "pass" : "fail"}
        </span>
        <div className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug text-foreground">
          {text(check.label)}
          <span className="sr-only">: {status}</span>
        </div>
        {revealed && onShow ? (
          <button type="button" onClick={onShow} className="lab-mono h-fit shrink-0 rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)]">
            {check.pass ? "Replay" : "Inspect"}
          </button>
        ) : null}
      </div>

      <dl className={`mt-2 grid gap-2 border-t border-border/70 pt-2 ${revealed ? "grid-cols-2" : "grid-cols-1"}`}>
        <div>
          <dt className="lab-mono text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground">Target</dt>
          <dd className="mt-0.5 text-[10.5px] leading-snug text-foreground">{text(check.target)}</dd>
        </div>
        {revealed ? (
          <div>
            <dt className="lab-mono text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground">Measured</dt>
            <dd className={`lab-mono mt-0.5 text-[10.5px] font-bold leading-snug ${okText(check.pass)}`}>{text(check.measured)}</dd>
          </div>
        ) : null}
      </dl>

      {revealed && !check.pass && check.reason ? (
        <div className="mt-2 rounded-[6px] border border-[color:var(--lab-down)]/25 bg-[color:var(--lab-down-fill)]/45 px-2 py-1.5 text-[10.5px] leading-relaxed text-[color:var(--lab-down-ink)]">
          <span className="font-bold">Why it failed: </span>{text(check.reason)}
        </div>
      ) : null}
    </li>
  );
}
