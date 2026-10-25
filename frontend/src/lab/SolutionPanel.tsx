"use client";

// The pieces of the solution view: the drawer that says why a part is in the
// reference design, the list of parts that replaces the palette, the plain-words
// comparison with the learner's own design, and a small confirm bar.

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ComponentKind, PropertyDef } from "./catalog";
import { COMPONENT_CATALOG } from "./catalog";
import type { CompareResult } from "./solution";
import type { NodeConfig } from "./hld-board-model";
import type { SolutionDef, SolutionPart } from "./types";
import type { TierLoad } from "./tiered-architecture";
import { chipStyle, iconOf } from "./board-style";
import { cacheSentence } from "./SettingsDrawer";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

function valueText(p: PropertyDef, v: number | string | undefined): string {
  const value = v ?? p.default;
  if (p.type === "toggle") return Number(value) > 0 ? "on" : "off";
  if (p.type === "ratio") return `${Math.round(Number(value) * 100)}%`;
  return String(value);
}

/** Why one part is in the reference design, in a dark drawer like the settings one. */
export function PartExplainer({
  id, kind, part, cfg, tier, checkLabels, onClose,
}: {
  id: string;
  kind: ComponentKind;
  part: SolutionPart | undefined;
  cfg: NodeConfig;
  tier?: TierLoad;
  checkLabels: Record<string, string>;
  onClose: () => void;
}) {
  const def = COMPONENT_CATALOG[kind];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, [id]);
  const settings = def.properties.filter((p) => !["minCount", "maxCount", "targetUtil", "autoscale"].includes(p.id) || Number(cfg.autoscale ?? 0) > 0);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={`Why ${def.label} is in the solution`}
      id="lab-settings-drawer"
      data-testid="part-explainer"
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
      className="absolute inset-x-0 bottom-0 z-20 max-h-[78%] overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-slate-900 p-3.5 text-slate-100 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] outline-none dark:bg-neutral-950 @xl:inset-x-auto @xl:inset-y-0 @xl:right-0 @xl:max-h-none @xl:w-[310px] @xl:rounded-none @xl:border-l @xl:border-t-0 @xl:shadow-[-8px_0_24px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-600 @xl:hidden" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[14px]" style={chipStyle(kind)}>{iconOf(kind)}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold leading-tight">{def.label}</div>
          <div className="truncate text-[11px] text-amber-300">Reference solution</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close explanation" className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white ${FOCUS}`}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {part ? (
        <>
          <h4 className="mb-0.5 mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Why it is here</h4>
          <p className="text-[12.5px] leading-snug text-slate-100">{part.why}</p>
          {part.checks.length > 0 ? (
            <>
              <h4 className="mb-0.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Checks it helps pass</h4>
              <ul className="list-disc pl-4 text-[12px] leading-snug text-slate-200">
                {part.checks.map((c) => <li key={c}>{checkLabels[c] ?? c}</li>)}
              </ul>
            </>
          ) : null}
          <h4 className="mb-0.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Without it</h4>
          <p className="text-[12.5px] leading-snug text-slate-100">{part.without}</p>
        </>
      ) : (
        <p className="text-[12px] text-slate-300">This part is where the requests start. Nothing else to explain.</p>
      )}

      {tier?.cacheStats ? (
        <div className="mt-3 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11.5px] leading-snug text-slate-200" data-testid="explainer-cache-stats">
          {cacheSentence(tier.cacheStats)}
        </div>
      ) : null}

      {kind !== "client" ? (
        <>
          <h4 className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Settings in the reference</h4>
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[12px]">
            {settings.map((p) => (
              <div key={p.id} className="contents">
                <dt className="text-slate-300">{p.label}</dt>
                <dd className="tabular-nums text-slate-100">{valueText(p, cfg[p.id])}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </div>
  );
}

/** Replaces the palette in the solution view: what the design is, and a button per part. */
export function PartList({
  solution, nodes, openId, onOpen,
}: {
  solution: SolutionDef;
  nodes: { id: string; kind: ComponentKind }[];
  openId: string | null;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="border-b border-border p-3 @2xl:border-b-0 @2xl:border-r" role="group" aria-label="Parts of the solution">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Reference solution</div>
      <p className="mb-2 text-[11.5px] leading-snug text-muted-foreground">{solution.summary}</p>
      <div className="mb-1 text-[10px] text-muted-foreground">Pick a part to see why it is there.</div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 @2xl:block @2xl:overflow-visible @2xl:pb-0">
        {nodes.filter((n) => n.kind !== "client").map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n.id)}
            aria-pressed={openId === n.id}
            className={`flex shrink-0 items-center gap-2 rounded-lg border bg-background px-2 py-1.5 text-left text-[12px] font-medium transition-colors hover:border-blue-400 hover:bg-muted/40 @2xl:mb-1 @2xl:w-full ${openId === n.id ? "border-blue-500" : "border-border"}`}
          >
            <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded text-[11px]" style={chipStyle(n.kind)}>{iconOf(n.kind)}</span>
            <span className="whitespace-nowrap @2xl:truncate">{COMPONENT_CATALOG[n.kind].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** What differs between the learner's design and the reference, in plain words. */
export function CompareView({ compare, onClose }: { compare: CompareResult; onClose: () => void }) {
  return (
    <section className="border-t border-border bg-muted/20 px-3 py-2.5" aria-label="Compare with my design" data-testid="compare-view">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-semibold" aria-live="polite">{compare.headline}</p>
        <button type="button" onClick={onClose} className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground">Hide</button>
      </div>
      {compare.lines.length > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {compare.lines.map((l) => (
            <li key={l.text} className="text-[12px] leading-snug">
              {l.text}
              {l.explains.length > 0 ? (
                <span className="block text-[11px] text-muted-foreground">Helps explain: {l.explains.join("; ")}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** A short question with two answers, shown under the header. */
export function ConfirmBar({
  message, yes, no, onYes, onNo,
}: {
  message: string;
  yes: string;
  no: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div role="alertdialog" aria-label={message} className="flex flex-wrap items-center gap-2 border-b border-border bg-amber-50 px-4 py-2 text-[12.5px] dark:bg-amber-500/10" data-testid="confirm-bar">
      <span className="font-medium">{message}</span>
      <span className="flex gap-2">
        <button type="button" onClick={onNo} className="rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium hover:bg-muted">{no}</button>
        <button type="button" onClick={onYes} className="rounded-md bg-blue-600 px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-blue-700">{yes}</button>
      </span>
    </div>
  );
}
