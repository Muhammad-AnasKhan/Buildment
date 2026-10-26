"use client";

// Everything under the canvas: the brief, the live numbers of the design as it
// stands, the fault-injection timeline that shows which scenario the run is
// playing, and the verification grid. Every functional and non-functional check is
// listed before the run with its target; after the run each is stamped pass or fail
// with the value measured and, for a fail, the reason.

import type { ChallengeReport, CheckResult } from "./challenge";
import type { HldLabSpec } from "./types";
import type { ModelResult } from "./tiered-architecture";
import { CheckSlot, PHASE_MS, PhaseTimeline, okText } from "../lab-ui";
import { useNames } from "./names-context";

export type RunState = "idle" | "running" | "done" | "stale";

export { PHASE_MS };

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
      <PhaseTimeline steps={report.phases.map((p) => ({ id: p.id, title: p.title }))} playing={running} activeId={shown?.id ?? null} onPick={onPick} text={text} />
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
        ? `${report.total} of ${report.total} checks passed. Design accepted.`
        : `${report.passed} of ${report.total} checks passed. Fix the ones marked fail, then run again.`
      : state === "stale"
        ? "You changed the design. Run again to check it."
        : state === "running"
          ? "Running the design through every scenario..."
          : `${report.total} checks will run${functional.length > 0 ? `: ${functional.length} on what it does (functional) and ${nonFunctional.length} on how well it does it (non-functional)` : ""}. Press Run.`;

  return (
    <div className="grid gap-4 border-t-[1.5px] border-border p-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" data-testid="run-panel">
      <div>
        <p className="mb-2 text-[12px] leading-snug text-muted-foreground">{text(spec.scenario)}</p>
        {fixedLoad ? (
          <p className="mb-3 text-[12px] text-muted-foreground">
            Busiest moment: <span className="lab-mono font-bold tabular-nums text-foreground">{load.toLocaleString()} requests a second</span>, fixed by the brief.
          </p>
        ) : (
          <>
            <label className="flex items-center justify-between text-[12px] text-muted-foreground" htmlFor="lab-load">
              <span>Traffic sent (offered load)</span>
              <span className="lab-mono font-bold tabular-nums text-foreground">{load.toLocaleString()} req/s</span>
            </label>
            <input id="lab-load" type="range" min={500} max={12000} step={500} value={load}
              onChange={(e) => onLoad(Number(e.target.value))} className="mb-3 w-full accent-[color:var(--lab-accent)]" />
          </>
        )}
        <div className="lab-mono mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your design right now</div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Can serve" value={`${result.capacityCeiling.toLocaleString()}/s`} ok={result.pass.rps} hint={targets.rps ? `need ${targets.rps.toLocaleString()}` : "no target"} />
          <Stat label="Slowest 1 in 100 (p99)" value={`${result.p99Ms} ms`} ok={result.pass.p99} hint={targets.p99Ms ? `under ${targets.p99Ms}` : "no target"} />
          <Stat label="Stays up (availability)" value={`${(result.availability * 100).toFixed(2)}%`} ok={result.pass.availability} hint={targets.availability ? `need ${(targets.availability * 100).toFixed(1)}%` : "no target"} />
          <Stat label="Cost" value={`$${result.costPerHour.toFixed(2)}/h`} ok={result.pass.budget} hint={targets.budgetPerHour ? `budget $${targets.budgetPerHour}` : "no target"} />
        </div>
        {result.failure ? <p className="mt-2 text-[12px] font-semibold text-[color:var(--lab-down-ink)]">{text(result.failure)}</p> : null}
        {result.dropped > 0.5 || result.blocked > 0.5 || result.backlog > 0.5 ? (
          <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
            {result.dropped > 0.5 ? <li>Turning away {Math.round(result.dropped).toLocaleString()}/s (over a limit)</li> : null}
            {result.blocked > 0.5 ? <li>Firewall blocking {Math.round(result.blocked).toLocaleString()}/s</li> : null}
            {result.backlog > 0.5 ? <li>The queue is falling behind by {Math.round(result.backlog).toLocaleString()}/s: add workers</li> : null}
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
          {[["What it does (functional)", functional], ["How well it does it (non-functional)", nonFunctional]].map(([title, list]) =>
            (list as CheckResult[]).length === 0 ? null : (
              <section key={title as string} aria-label={`${title} checks`}>
                <h4 className="lab-mono mb-1 mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {title as string} <span className="font-normal tabular-nums">({(list as CheckResult[]).filter((c) => revealedFor(c) && c.pass).length}/{(list as CheckResult[]).length})</span>
                </h4>
                <ul className="space-y-1.5">
                  {(list as CheckResult[]).map((c) => (
                    <CheckSlot key={c.id} check={c} revealed={revealedFor(c)} onShow={c.scenario !== "steady" ? () => onShow(c.scenario) : undefined} text={text} />
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
