"use client";

// Everything under the canvas: the brief, the live numbers of the design as it
// stands, the strip that shows which scenario the run is playing, and the list of
// checks. Every functional and every non-functional check is listed before the
// run with its target, and after the run as pass or fail with the value measured
// and, for a fail, the reason.

import type { ChallengeReport, CheckResult } from "./challenge";
import type { HldLabSpec } from "./types";
import type { ModelResult } from "./tiered-architecture";
import { okText } from "./board-style";

export type RunState = "idle" | "running" | "done" | "stale";

function Stat({ label, value, ok, hint }: { label: string; value: string; ok: boolean; hint: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-[18px] font-semibold leading-tight tabular-nums ${okText(ok)}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}

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
  const shown = running !== null ? report.phases[running] : report.phases.find((p) => p.id === previewId);
  return (
    <div className="border-b border-border bg-muted/30 px-3 py-2" data-testid="phase-strip">
      <ol className="flex flex-wrap items-center gap-1.5">
        {report.phases.map((p, i) => {
          const active = shown?.id === p.id;
          const past = running !== null && i < running;
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={running !== null}
                onClick={() => onPick(p.id)}
                aria-current={active ? "step" : undefined}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active ? "border-blue-500 bg-blue-600 text-white" : past ? "border-emerald-500/50 bg-emerald-500/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
                } disabled:cursor-default`}
              >
                <span className="tabular-nums">{i + 1}</span> {p.title}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 min-h-[1.25rem] text-[12px] text-muted-foreground" aria-live="polite">
        {shown ? (
          <>
            <span className="font-medium text-foreground">{shown.title}.</span> {shown.applicable ? shown.story : `This design has no ${shown.missing}, so there is nothing to lose.`}
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
  const status = !revealed ? "Not run yet" : check.pass ? "Pass" : "Fail";
  return (
    <li className="flex gap-2 border-b border-border/60 py-2 last:border-b-0" data-check={check.id} data-status={revealed ? (check.pass ? "pass" : "fail") : "pending"}>
      <span
        aria-hidden
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          !revealed ? "border border-border text-muted-foreground" : check.pass ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {!revealed ? "" : check.pass ? "✓" : "✕"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium leading-snug">
          {check.label}
          <span className="sr-only">: {status}</span>
        </div>
        <div className="text-[11px] leading-snug text-muted-foreground">
          {revealed ? (
            <>
              Measured <span className={`font-semibold ${okText(check.pass)}`}>{check.measured}</span>
              <span aria-hidden> · </span>
              <span>needs {check.target}</span>
            </>
          ) : (
            <>Needs {check.target}</>
          )}
        </div>
        {revealed && !check.pass && check.reason ? (
          <div className="mt-0.5 text-[11.5px] leading-snug text-red-700 dark:text-red-300">{check.reason}</div>
        ) : null}
      </div>
      {revealed && onShow ? (
        <button type="button" onClick={onShow} className="h-fit shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:bg-muted hover:text-foreground">
          Show
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
        ? `All ${report.total} checks passed. Design accepted.`
        : `${report.passed} of ${report.total} checks passed. Fix the ones marked Fail, then run again.`
      : state === "stale"
        ? "You changed the design. Run again to check it."
        : state === "running"
          ? "Running the design through every scenario..."
          : `${report.total} checks will run${functional.length > 0 ? `: ${functional.length} functional and ${nonFunctional.length} non-functional` : ""}. Press Run.`;

  return (
    <div className="grid gap-4 border-t border-border p-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" data-testid="run-panel">
      <div>
        <p className="mb-2 text-[12px] leading-snug text-muted-foreground">{spec.scenario}</p>
        {fixedLoad ? (
          <p className="mb-3 text-[12px] text-muted-foreground">
            Peak load: <span className="font-semibold tabular-nums text-foreground">{load.toLocaleString()} req/s</span>, fixed by the brief.
          </p>
        ) : (
          <>
            <label className="flex items-center justify-between text-[12px] text-muted-foreground" htmlFor="lab-load">
              <span>Offered load</span>
              <span className="font-semibold tabular-nums text-foreground">{load.toLocaleString()} req/s</span>
            </label>
            <input id="lab-load" type="range" min={500} max={12000} step={500} value={load}
              onChange={(e) => onLoad(Number(e.target.value))} className="mb-3 w-full accent-blue-600" />
          </>
        )}
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your design right now</div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Capacity" value={`${result.capacityCeiling.toLocaleString()}/s`} ok={result.pass.rps} hint={targets.rps ? `need ${targets.rps.toLocaleString()}` : "no target"} />
          <Stat label="p99" value={`${result.p99Ms} ms`} ok={result.pass.p99} hint={targets.p99Ms ? `under ${targets.p99Ms}` : "no target"} />
          <Stat label="Availability" value={`${(result.availability * 100).toFixed(2)}%`} ok={result.pass.availability} hint={targets.availability ? `need ${(targets.availability * 100).toFixed(1)}%` : "no target"} />
          <Stat label="Cost" value={`$${result.costPerHour.toFixed(2)}/h`} ok={result.pass.budget} hint={targets.budgetPerHour ? `budget $${targets.budgetPerHour}` : "no target"} />
        </div>
        {result.failure ? <p className="mt-2 text-[12px] font-semibold text-red-600 dark:text-red-400">{result.failure}</p> : null}
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
          className={`mb-2 text-[13px] font-semibold ${state === "done" ? okText(report.allPass) : "text-foreground"}`}
          aria-live="polite"
          data-testid="verdict"
        >
          {verdict}
        </p>
        <div className="grid gap-x-5 @xl:grid-cols-1 @4xl:grid-cols-2">
          {[["Functional", functional], ["Non-functional", nonFunctional]].map(([title, list]) =>
            (list as CheckResult[]).length === 0 ? null : (
              <section key={title as string} aria-label={`${title} checks`}>
                <h4 className="mb-0.5 mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {title as string} <span className="font-normal tabular-nums">({(list as CheckResult[]).filter((c) => revealedFor(c) && c.pass).length}/{(list as CheckResult[]).length})</span>
                </h4>
                <ul>
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
