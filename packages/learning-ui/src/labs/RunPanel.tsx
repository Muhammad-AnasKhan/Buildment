"use client";

// The lab's right-hand test rail: brief, scenarios, live numbers and verification
// checks. On smaller boards it drops below the canvas, but keeps the same readable
// single-column hierarchy. Every check shows its target before a run and its
// measurement plus an actionable explanation afterwards.

import type { ChallengeReport, CheckResult } from "./challenge";
import type { HldLabSpec } from "./types";
import type { ModelResult } from "./tiered-architecture";
import { CheckSlot, PHASE_MS, PhaseTimeline, okText } from "../lab-ui";
import { useNames } from "./names-context";

export type RunState = "idle" | "running" | "done" | "stale";

export { PHASE_MS };

function Stat({ label, value, ok, hint }: { label: string; value: string; ok: boolean; hint: string }) {
  return (
    <div className="rounded-[8px] border border-border border-l-[3px] bg-card px-2.5 py-2" style={{ borderLeftColor: ok ? "var(--lab-ok)" : "var(--lab-down)" }}>
      <div className="lab-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className={`lab-mono mt-0.5 text-[16px] font-bold leading-tight tabular-nums ${okText(ok)}`}>{value}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{hint}</div>
    </div>
  );
}

function ResultCheckRow({
  check, index, onInspect, text,
}: {
  check: CheckResult;
  index: number;
  onInspect?: () => void;
  text: (s: string) => string;
}) {
  if (check.pass) {
    return (
      <li
        className="flex items-center gap-3 px-1 py-2"
        data-check={check.id}
        data-status="pass"
      >
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--lab-ok)]/15 text-[11px] font-bold text-[color:var(--lab-ok-ink)]">✓</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{text(check.label)}</span>
        <span className="lab-mono shrink-0 text-[11px] font-semibold text-[color:var(--lab-ok-ink)]">{text(check.measured)}</span>
        {onInspect ? (
          <button type="button" onClick={onInspect} className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            Replay
          </button>
        ) : null}
      </li>
    );
  }

  return (
    <li
      className="border-b border-border/70 py-4 first:pt-1 last:border-b-0 last:pb-1"
      data-check={check.id}
      data-status="fail"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span aria-hidden className="lab-mono mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
            {index}
          </span>
          <h4 className="text-[14px] font-semibold leading-snug text-foreground">
            {text(check.label)}
            <span className="sr-only">: Fail</span>
          </h4>
        </div>
        {onInspect ? (
          <button type="button" onClick={onInspect} className="shrink-0 text-[12px] font-semibold text-[color:var(--lab-accent)] hover:underline">
            Show on board
          </button>
        ) : null}
      </div>

      <div className="mt-3 ml-9 grid grid-cols-2 overflow-hidden rounded-[8px] border border-border bg-[color:var(--lab-recessed)]/40">
        <div className="border-r border-border px-3 py-2.5">
          <div className="lab-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Need</div>
          <div className="mt-1 text-[13px] font-medium leading-snug text-foreground">{text(check.target)}</div>
        </div>
        <div className="px-3 py-2.5">
          <div className="lab-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Got</div>
          <div className={`lab-mono mt-1 text-[13px] font-bold leading-snug ${okText(false)}`}>{text(check.measured)}</div>
        </div>
      </div>

      {check.reason ? (
        <p className="ml-9 mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {text(check.reason)}
        </p>
      ) : null}
    </li>
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

/** A focused result surface that appears after the run finishes. */
export function ResultsDialog({
  report, onClose, onInspect, onRunAgain,
}: {
  /** Kept for call-site compatibility; checks already carry the measured values. */
  spec: HldLabSpec;
  /** Kept for call-site compatibility; checks already carry the measured values. */
  result: ModelResult;
  report: ChallengeReport;
  onClose: () => void;
  onInspect: (scenario: string) => void;
  onRunAgain: () => void;
}) {
  const { text } = useNames();
  const failed = report.checks.filter((check) => !check.pass);
  const passed = report.checks.filter((check) => check.pass);
  const remaining = report.total - report.passed;
  const passPct = report.total === 0 ? 0 : (report.passed / report.total) * 100;
  const inspect = (check: CheckResult) => {
    onInspect(check.scenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm lab-results-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-results-title"
        className="lab-results-dialog relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[18px] border border-border bg-[color:var(--lab-module)] shadow-2xl"
      >
        <header className="relative shrink-0 px-5 pt-5 sm:px-6">
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full text-lg leading-none text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close results">×</button>

          <p className="lab-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Test results</p>
          <h2 id="lab-results-title" className="lab-display mt-1.5 pr-8 text-[22px] font-semibold leading-tight text-foreground sm:text-[24px]">
            {report.allPass
              ? "Your design passes"
              : `${remaining} ${remaining === 1 ? "check" : "checks"} still need a fix`}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {report.allPass
              ? "Every target in this model is met."
              : "Compare what you need with what you got, then change the board."}
          </p>

          <div className="mt-4" aria-label={`${report.passed} of ${report.total} checks passed`}>
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="font-medium text-foreground">{report.passed} of {report.total} passed</span>
              <span className={report.allPass ? "font-medium text-[color:var(--lab-ok-ink)]" : "font-medium text-muted-foreground"}>
                {report.allPass ? "Ready" : `${remaining} left`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--lab-recessed)]">
              <div
                className={`h-full rounded-full transition-[width] ${report.allPass ? "bg-[color:var(--lab-ok)]" : "bg-[color:var(--lab-accent)]"}`}
                style={{ width: `${passPct}%` }}
              />
            </div>
          </div>
        </header>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-5 sm:px-6">
          {failed.length > 0 ? (
            <section aria-label="Checks to fix">
              <ol>
                {failed.map((check, index) => (
                  <ResultCheckRow
                    key={check.id}
                    check={check}
                    index={index + 1}
                    onInspect={check.scenario !== "steady" ? () => inspect(check) : undefined}
                    text={text}
                  />
                ))}
              </ol>
            </section>
          ) : null}

          {passed.length > 0 ? (
            <section aria-label="Passed checks" className={failed.length > 0 ? "mt-2 border-t border-border/70 pt-3" : undefined}>
              {failed.length > 0 ? (
                <p className="mb-1 lab-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Already passing · {passed.length}
                </p>
              ) : null}
              <ul>
                {passed.map((check, index) => (
                  <ResultCheckRow
                    key={check.id}
                    check={check}
                    index={index + 1}
                    onInspect={check.scenario !== "steady" ? () => inspect(check) : undefined}
                    text={text}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <footer className="flex shrink-0 gap-2 border-t border-border px-5 py-3.5 sm:px-6">
          <button type="button" onClick={() => { onClose(); onRunAgain(); }} className="flex-1 rounded-[10px] border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-muted">
            Run again
          </button>
          <button type="button" onClick={onClose} className="flex-[1.3] rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-500">
            {report.allPass ? "Back to board" : "Fix on board"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function RunPanel({
  spec, result, report, state, running, ran, load, previewId, collapsed, onLoad, onShow, onBack, onToggle, onOpenResults,
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
  /** A completed scenario currently projected onto the board. */
  previewId: string | null;
  collapsed: boolean;
  onLoad: (n: number) => void;
  onShow: (scenario: string) => void;
  onBack: () => void;
  onToggle: () => void;
  onOpenResults: () => void;
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
  const activePhase = running !== null
    ? report.phases[running]
    : previewId
      ? report.phases.find((phase) => phase.id === previewId) ?? null
      : null;

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

  if (collapsed) {
    return (
      <aside className="flex min-h-[52px] items-center justify-center border-t-[1.5px] border-border bg-[color:var(--lab-recessed)]/55 @2xl:col-span-2 @6xl:col-span-1 @6xl:h-full @6xl:min-h-0 @6xl:border-l-[1.5px] @6xl:border-t-0" aria-label="Collapsed test suite">
        <button type="button" onClick={onToggle} className="flex h-full w-full items-center justify-center gap-2 px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground @6xl:flex-col" title="Expand test suite" aria-label="Expand test suite">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="lab-mono text-[9px] font-bold uppercase tracking-[0.16em] @6xl:[writing-mode:vertical-rl]">Tests</span>
          <span className={`lab-mono rounded-full px-1.5 py-0.5 text-[9px] font-bold ${ran ? (report.allPass ? "bg-[color:var(--lab-ok)]/15 text-[color:var(--lab-ok-ink)]" : "bg-[color:var(--lab-down-fill)] text-[color:var(--lab-down-ink)]") : "bg-muted text-muted-foreground"}`}>{ran ? `${report.passed}/${report.total}` : report.total}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="custom-scrollbar min-h-0 overflow-y-auto border-t-[1.5px] border-border bg-[color:var(--lab-recessed)]/45 @2xl:col-span-2 @6xl:col-span-1 @6xl:h-full @6xl:border-l-[1.5px] @6xl:border-t-0"
      data-testid="run-panel"
      aria-label="Test suite"
    >
      <div className="sticky top-0 z-10 border-b border-border bg-[color:var(--lab-module)]/95 px-3.5 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="lab-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Test suite</div>
            <h3 className="lab-display mt-0.5 text-[15px] font-semibold text-foreground">
              {state === "running" ? `Running scenario ${(running ?? 0) + 1} of ${report.phases.length}` : state === "done" ? "Run complete" : state === "stale" ? "Design changed" : "Ready to test"}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={onOpenResults} disabled={!ran} className={`lab-mono rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums disabled:cursor-default ${state === "done" ? (report.allPass ? "border-[color:var(--lab-ok)]/60 bg-[color:var(--lab-ok)]/10 text-[color:var(--lab-ok-ink)]" : "border-[color:var(--lab-down)]/60 bg-[color:var(--lab-down-fill)]/50 text-[color:var(--lab-down-ink)]") : "border-border bg-muted text-muted-foreground"}`} title={ran ? "Open detailed results" : undefined}>
              {state === "done" ? `${report.passed}/${report.total} passed` : `${report.total} checks`}
            </button>
            <button type="button" onClick={onToggle} className="flex size-7 items-center justify-center rounded-[5px] border border-border text-muted-foreground hover:bg-muted hover:text-foreground" title="Collapse test suite" aria-label="Collapse test suite">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
        <p
          className={`mt-2 text-[12px] leading-snug ${state === "done" ? okText(report.allPass) : "text-muted-foreground"}`}
          aria-live="polite"
          data-testid="verdict"
        >
          {verdict}
        </p>
      </div>

      <div className="space-y-4 p-3.5">
        <section aria-labelledby="lab-brief-heading">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h4 id="lab-brief-heading" className="lab-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">The brief</h4>
            {fixedLoad ? <span className="lab-mono rounded-full bg-[color:var(--lab-accent)]/10 px-2 py-0.5 text-[9.5px] font-bold text-[color:var(--lab-accent)]">{load.toLocaleString()} req/s</span> : null}
          </div>
          <div className="rounded-[8px] border border-border bg-card p-3 shadow-sm">
            <p className="text-[12px] leading-relaxed text-foreground">{text(spec.scenario)}</p>
          </div>
        </section>

        <section aria-labelledby="lab-scenarios-heading">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h4 id="lab-scenarios-heading" className="lab-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Test scenarios</h4>
            {previewId && running === null ? (
              <button type="button" onClick={onBack} className="text-[10.5px] font-semibold text-[color:var(--lab-accent)] hover:underline">Back to design</button>
            ) : null}
          </div>
          <ol className="space-y-1.5" data-testid="phase-timeline">
            {report.phases.map((phase, index) => {
              const active = activePhase?.id === phase.id;
              const phaseChecks = report.checks.filter((check) => check.scenario === phase.id);
              const phasePassed = phaseChecks.filter((check) => check.pass).length;
              return (
                <li key={phase.id}>
                  <button
                    type="button"
                    disabled={!ran || running !== null}
                    onClick={() => onShow(phase.id)}
                    aria-current={active ? "step" : undefined}
                    className={`w-full rounded-[8px] border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)] disabled:cursor-default ${active ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/10" : "border-border bg-card hover:bg-muted"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`lab-mono flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${active ? "bg-[color:var(--lab-accent)] text-[color:var(--lab-on-accent)]" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
                        <span className="truncate text-[12px] font-semibold text-foreground">{text(phase.title)}</span>
                      </span>
                      <span className="lab-mono shrink-0 text-[9.5px] text-muted-foreground">{ran ? `${phasePassed}/${phaseChecks.length}` : phaseChecks.length}</span>
                    </span>
                    {active ? <span className="mt-1.5 block pl-7 text-[10.5px] leading-snug text-muted-foreground">{phase.applicable ? text(phase.story) : `This design has no ${text(phase.missing ?? "part")}, so there is nothing to lose.`}</span> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="lab-metrics-heading">
          <h4 id="lab-metrics-heading" className="lab-mono mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Live design metrics</h4>
        {fixedLoad ? (
          null
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
        </section>

        <section aria-labelledby="lab-checks-heading">
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <h4 id="lab-checks-heading" className="lab-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Checks</h4>
            <span className="text-[10px] text-muted-foreground">Target → measured → explanation</span>
          </div>
          <div className="space-y-4">
          {[["What it does (functional)", functional], ["How well it does it (non-functional)", nonFunctional]].map(([title, list]) =>
            (list as CheckResult[]).length === 0 ? null : (
              <section key={title as string} aria-label={`${title} checks`}>
                <h5 className="lab-display mb-1.5 mt-1 flex items-center justify-between gap-2 text-[12px] font-semibold text-foreground">
                  {title as string} <span className="font-normal tabular-nums">({(list as CheckResult[]).filter((c) => revealedFor(c) && c.pass).length}/{(list as CheckResult[]).length})</span>
                </h5>
                <ul className="space-y-2">
                  {(list as CheckResult[]).map((c) => (
                    <CheckSlot key={c.id} check={c} revealed={revealedFor(c)} onShow={c.scenario !== "steady" ? () => onShow(c.scenario) : undefined} text={text} />
                  ))}
                </ul>
              </section>
            ),
          )}
          </div>
        </section>
        </div>
    </aside>
  );
}
