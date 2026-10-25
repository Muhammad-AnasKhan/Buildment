"use client";

// Everything under the canvas: the brief, the live numbers of the design as it
// stands, the fault-injection timeline that shows which scenario the run is
// playing, and the verification grid. Every functional and non-functional check is
// listed before the run with its target; after the run each is stamped pass or fail
// with the value measured and, for a fail, the reason.

import { Zap } from "lucide-react";
import type { ChallengeReport, CheckResult } from "./challenge";
import type { HldLabSpec } from "./types";
import type { ModelResult } from "./tiered-architecture";
import { okText } from "./board-style";
import { useNames } from "./names-context";

export type RunState = "idle" | "running" | "done" | "stale";

/** How long the run stays on each scenario, in milliseconds. */
export const PHASE_MS = 2600;

function Stat({ label, value, ok, hint }: { label: string; value: string; ok: boolean; hint: string }) {
  return (
    <div className="rounded-[6px] border-[1.5px] border-border bg-muted px-3 py-2">
      <div className="lab-mono text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`lab-mono text-[20px] font-bold leading-tight tabular-nums ${okText(ok)}`}>{value}</div>
      <div className="text-[10.5px] text-muted-foreground">{hint}</div>
    </div>
  );
}

/** The fault-injection timeline: one connected segment per scenario, with a bar that fills while it plays. */
export function PhaseStrip({
  report, running, previewId, onPick, onBack,
}: {
  report: ChallengeReport;
  /** Index of the phase the run is playing now, or null. */
  running: number | null;
  previewId: string | null;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  const { text } = useNames();
  const shown = running !== null ? report.phases[running] : report.phases.find((p) => p.id === previewId);
  return (
    <div className="border-b-[1.5px] border-border bg-muted px-3 py-2" data-testid="phase-strip">
      <ol className="flex overflow-hidden rounded-[6px] border-[1.5px] border-border bg-card">
        {report.phases.map((p, i) => {
          const active = shown?.id === p.id;
          const playing = running === i;
          const past = running !== null && i < running;
          return (
            <li key={p.id} className="min-w-0 flex-1 border-l-[1.5px] border-border first:border-l-0">
              <button
                type="button"
                disabled={running !== null}
                onClick={() => onPick(p.id)}
                aria-current={active ? "step" : undefined}
                className={`relative flex w-full flex-col items-start gap-0.5 px-2 pb-2 pt-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)] disabled:cursor-default ${active ? "bg-[color:var(--lab-accent)]/15" : "hover:bg-muted"}`}
              >
                <span className="lab-mono flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                  {i > 0 ? <Zap className="h-2.5 w-2.5 text-[color:var(--lab-warm-ink)]" aria-label="fault" /> : null}
                </span>
                <span className="lab-display w-full truncate text-[11.5px] font-semibold">{text(p.title)}</span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-[color:var(--lab-recessed)]">
                  {playing ? (
                    <span key={`fill-${i}`} className="lab-fill block h-full bg-[color:var(--lab-accent)]" style={{ ["--lab-phase-ms" as string]: `${PHASE_MS}ms` }} />
                  ) : past || (running === null && active) ? (
                    <span className="block h-full bg-[color:var(--lab-accent)]" />
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 min-h-[1.25rem] text-[12px] text-muted-foreground" aria-live="polite">
        {shown ? (
          <>
            <span className="font-semibold text-foreground">{text(shown.title)}.</span> {shown.applicable ? text(shown.story) : `This design has no ${text(shown.missing ?? "part")}, so there is nothing to lose.`}
            {running === null ? (
              <button type="button" onClick={onBack} className="ml-2 underline underline-offset-2 hover:text-foreground">Back to my design</button>
            ) : null}
          </>
        ) : (
          "Pick a step to see it on the board."
        )}
      </p>
    </div>
  );
}

function CheckRow({ check, revealed, onShow }: { check: CheckResult; revealed: boolean; onShow?: () => void }) {
  const { text } = useNames();
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

export function RunPanel({
  spec, result, report, state, running, ran, load, onLoad, onShow,
}: {
  spec: HldLabSpec;
  /** The design as it stands, at the offered load. */
  result: ModelResult;
  report: ChallengeReport;
  state: RunState;
  running: number | null;
  /** True once a run has finished for the current design. */
  ran: boolean;
  load: number;
  onLoad: (n: number) => void;
  onShow: (scenario: string) => void;
}) {
  const { text } = useNames();
  const targets = spec.levels[0]?.targets ?? {};
  const fixedLoad = Boolean(spec.challenge);
  const phaseIndex = new Map(report.phases.map((p, i) => [p.id, i]));
  const revealedFor = (c: CheckResult) => {
    if (ran) return true;
    if (running === null) return false;
    return (phaseIndex.get(c.scenario) ?? 0) <= running;
  };
  const functional = report.checks.filter((c) => c.kind === "functional");
  const nonFunctional = report.checks.filter((c) => c.kind === "non-functional");

  const verdict =
    state === "done"
      ? report.allPass
        ? `${report.total}/${report.total} VERIFIED. All checks passed, design accepted.`
        : `${report.passed} of ${report.total} checks passed. Fix the ones marked fail, then run again.`
      : state === "stale"
        ? "You changed the design. Run again to check it."
        : state === "running"
          ? "Running the design through every scenario..."
          : `${report.total} checks will run${functional.length > 0 ? `: ${functional.length} functional and ${nonFunctional.length} non-functional` : ""}. Press Run.`;

  return (
    <div className="grid gap-4 border-t-[1.5px] border-border p-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" data-testid="run-panel">
      <div>
        <p className="mb-2 text-[12px] leading-snug text-muted-foreground">{text(spec.scenario)}</p>
        {fixedLoad ? (
          <p className="mb-3 text-[12px] text-muted-foreground">
            Peak load: <span className="lab-mono font-bold tabular-nums text-foreground">{load.toLocaleString()} req/s</span>, fixed by the brief.
          </p>
        ) : (
          <>
            <label className="flex items-center justify-between text-[12px] text-muted-foreground" htmlFor="lab-load">
              <span>Offered load</span>
              <span className="lab-mono font-bold tabular-nums text-foreground">{load.toLocaleString()} req/s</span>
            </label>
            <input id="lab-load" type="range" min={500} max={12000} step={500} value={load}
              onChange={(e) => onLoad(Number(e.target.value))} className="mb-3 w-full accent-[color:var(--lab-accent)]" />
          </>
        )}
        <div className="lab-mono mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your design right now</div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Capacity" value={`${result.capacityCeiling.toLocaleString()}/s`} ok={result.pass.rps} hint={targets.rps ? `need ${targets.rps.toLocaleString()}` : "no target"} />
          <Stat label="p99" value={`${result.p99Ms} ms`} ok={result.pass.p99} hint={targets.p99Ms ? `under ${targets.p99Ms}` : "no target"} />
          <Stat label="Availability" value={`${(result.availability * 100).toFixed(2)}%`} ok={result.pass.availability} hint={targets.availability ? `need ${(targets.availability * 100).toFixed(1)}%` : "no target"} />
          <Stat label="Cost" value={`$${result.costPerHour.toFixed(2)}/h`} ok={result.pass.budget} hint={targets.budgetPerHour ? `budget $${targets.budgetPerHour}` : "no target"} />
        </div>
        {result.failure ? <p className="mt-2 text-[12px] font-semibold text-[color:var(--lab-down-ink)]">{text(result.failure)}</p> : null}
        {result.dropped > 0.5 || result.blocked > 0.5 || result.backlog > 0.5 ? (
          <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
            {result.dropped > 0.5 ? <li>Rejecting {Math.round(result.dropped).toLocaleString()}/s at limits and throttles</li> : null}
            {result.blocked > 0.5 ? <li>Firewall filtering {Math.round(result.blocked).toLocaleString()}/s</li> : null}
            {result.backlog > 0.5 ? <li>Queue backlog growing {Math.round(result.backlog).toLocaleString()}/s: add consumers</li> : null}
          </ul>
        ) : null}
      </div>

      <div>
        <p
          className={`lab-display mb-2 text-[13.5px] font-semibold ${state === "done" ? okText(report.allPass) : "text-foreground"}`}
          aria-live="polite"
          data-testid="verdict"
        >
          {verdict}
        </p>
        <div className="grid gap-x-5 @xl:grid-cols-1 @4xl:grid-cols-2">
          {[["Functional", functional], ["Non-functional", nonFunctional]].map(([title, list]) =>
            (list as CheckResult[]).length === 0 ? null : (
              <section key={title as string} aria-label={`${title} checks`}>
                <h4 className="lab-mono mb-1 mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {title as string} <span className="font-normal tabular-nums">({(list as CheckResult[]).filter((c) => revealedFor(c) && c.pass).length}/{(list as CheckResult[]).length})</span>
                </h4>
                <ul className="space-y-1.5">
                  {(list as CheckResult[]).map((c) => (
                    <CheckRow key={c.id} check={c} revealed={revealedFor(c)} onShow={c.scenario !== "steady" ? () => onShow(c.scenario) : undefined} />
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
