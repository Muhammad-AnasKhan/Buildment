"use client";

// The pieces of the solution view: the cassette that says why a part is in the
// reference design, the list of parts that replaces the palette, the plain-words
// comparison with the learner's own design, and a small confirm bar. The solution
// itself is drawn as a blueprint ghost: the reference layout with each part marked
// as matching, missing or under-configured against the learner's design.

import type { CSSProperties } from "react";
import type { ComponentKind, PropertyDef } from "./catalog";
import { COMPONENT_CATALOG } from "./catalog";
import type { CompareResult } from "./solution";
import type { NodeConfig } from "./hld-board-model";
import type { SolutionDef, SolutionPart } from "./types";
import type { TierLoad } from "./tiered-architecture";
import { KindGlyph } from "./Glyph";
import { colorOf, tint } from "./board-style";
import { Cassette, cacheSentence } from "./SettingsDrawer";
import { AWS_PARTS, AWS_PROPS, sizeLabel } from "./aws-names";
import { useNames } from "./names-context";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)]";

/** Why one part is in the reference design, in the same cassette as the settings. */
export function PartExplainer({
  id, kind, part, cfg, tier, checkLabels, anchor, onClose,
}: {
  id: string;
  kind: ComponentKind;
  part: SolutionPart | undefined;
  cfg: NodeConfig;
  tier?: TierLoad;
  checkLabels: Record<string, string>;
  anchor?: CSSProperties;
  onClose: () => void;
}) {
  const def = COMPONENT_CATALOG[kind];
  const { mode, nameOf, text } = useNames();
  const aws = mode === "aws" ? AWS_PARTS[kind] : undefined;
  const settings = def.properties.filter((p) => !["minCount", "maxCount", "targetUtil", "autoscale"].includes(p.id) || Number(cfg.autoscale ?? 0) > 0);
  const valueText = (p: PropertyDef, v: number | string | undefined): string => {
    const value = v ?? p.default;
    if (p.type === "toggle") return Number(value) > 0 ? "on" : "off";
    if (p.type === "ratio") return `${Math.round(Number(value) * 100)}%`;
    if (p.type === "size") return sizeLabel(kind, String(value), mode).label;
    return String(value);
  };
  const h = "lab-mono mb-0.5 mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-300";

  return (
    <Cassette
      id={id}
      kind={kind}
      label={`Why ${nameOf(kind)} is in the solution`}
      title={nameOf(kind)}
      subtitle="Reference solution"
      anchor={anchor}
      onClose={onClose}
    >
      <div data-testid="part-explainer">
        {aws ? <p className="mb-1 text-[11px] leading-snug text-slate-300">{aws.meaning}</p> : null}
        {part ? (
          <>
            <h4 className={h}>Why it is here</h4>
            <p className="text-[12.5px] leading-snug text-slate-50">{text(part.why)}</p>
            {part.checks.length > 0 ? (
              <>
                <h4 className={h}>Checks it helps pass</h4>
                <ul className="list-disc pl-4 text-[12px] leading-snug text-slate-100">
                  {part.checks.map((c) => <li key={c}>{text(checkLabels[c] ?? c)}</li>)}
                </ul>
              </>
            ) : null}
            <h4 className={h}>Without it</h4>
            <p className="text-[12.5px] leading-snug text-slate-50">{text(part.without)}</p>
          </>
        ) : (
          <p className="text-[12px] text-slate-200">This part is where the requests start. Nothing else to explain.</p>
        )}

        {tier?.cacheStats ? (
          <div className="lab-mono mt-3 rounded-[5px] bg-black/30 px-2 py-1.5 text-[10.5px] leading-snug text-slate-100" data-testid="explainer-cache-stats">
            {cacheSentence(tier.cacheStats)}
          </div>
        ) : null}

        {kind !== "client" ? (
          <>
            <h4 className={h}>Settings in the reference</h4>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[12px]">
              {settings.map((p) => (
                <div key={p.id} className="contents">
                  <dt className="text-slate-200">{(mode === "aws" ? AWS_PROPS[kind]?.[p.id]?.label : undefined) ?? p.label}</dt>
                  <dd className="lab-mono font-bold text-white">{valueText(p, cfg[p.id])}</dd>
                </div>
              ))}
            </dl>
            {aws ? <p className="mt-2 rounded-[5px] border border-dashed border-slate-500 px-2 py-1 text-[10.5px] leading-snug text-slate-200"><b className="lab-mono text-[9px] uppercase tracking-wider text-slate-300">Remember </b>{aws.remember}</p> : null}
          </>
        ) : null}
      </div>
    </Cassette>
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
  const { nameOf, text } = useNames();
  return (
    <div className="border-b border-border p-3 @2xl:border-b-0 @2xl:border-r" role="group" aria-label="Parts of the solution">
      <div className="lab-mono mb-1 text-[10px] font-bold uppercase tracking-widest text-[color:var(--lab-warm-ink)]">Reference solution</div>
      <p className="mb-2 text-[11.5px] leading-snug text-muted-foreground">{text(solution.summary)}</p>
      <div className="mb-1 text-[10px] text-muted-foreground">Pick a part to see why it is there.</div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 @2xl:block @2xl:overflow-visible @2xl:pb-0">
        {nodes.filter((n) => n.kind !== "client").map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n.id)}
            aria-pressed={openId === n.id}
            className={`flex shrink-0 items-center gap-2 rounded-[6px] border-[1.5px] bg-card px-2 py-1.5 text-left text-[12px] font-medium shadow-[0_2px_0_0_var(--lab-edge-shadow)] transition-colors hover:bg-muted @2xl:mb-1 @2xl:w-full ${FOCUS} ${openId === n.id ? "border-[color:var(--lab-accent)]" : "border-border"}`}
          >
            <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-[4px]" style={{ backgroundColor: tint(colorOf(n.kind), 14), color: colorOf(n.kind) }}><KindGlyph kind={n.kind} size={16} /></span>
            <span className="whitespace-nowrap @2xl:truncate">{nameOf(n.kind)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** What differs between the learner's design and the reference, in plain words. */
export function CompareView({ compare, onClose }: { compare: CompareResult; onClose: () => void }) {
  const { text } = useNames();
  return (
    <section className="border-t-[1.5px] border-border bg-muted px-3 py-2.5" aria-label="Compare with my design" data-testid="compare-view">
      <div className="flex items-start justify-between gap-2">
        <p className="lab-display text-[13px] font-semibold" aria-live="polite">{text(compare.headline)}</p>
        <button type="button" onClick={onClose} className={`lab-mono shrink-0 rounded-[4px] border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground ${FOCUS}`}>Hide</button>
      </div>
      {compare.lines.length > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {compare.lines.map((l) => (
            <li key={l.text} className="text-[12px] leading-snug">
              {text(l.text)}
              {l.explains.length > 0 ? (
                <span className="block text-[11px] text-muted-foreground">Helps explain: {l.explains.map(text).join("; ")}</span>
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
    <div role="alertdialog" aria-label={message} className="flex flex-wrap items-center gap-2 border-b-[1.5px] border-[color:var(--lab-warm)] bg-[color:var(--lab-warm)]/15 px-4 py-2 text-[12.5px]" data-testid="confirm-bar">
      <span className="font-medium">{message}</span>
      <span className="flex gap-2">
        <button type="button" onClick={onNo} className={`rounded-[5px] border border-border bg-card px-2.5 py-1 text-[12px] font-medium hover:bg-muted ${FOCUS}`}>{no}</button>
        <button type="button" onClick={onYes} className={`lab-mono rounded-[5px] border-b-2 border-[color:var(--lab-ink)]/40 bg-[color:var(--lab-accent)] px-2.5 py-1 text-[11px] font-bold uppercase text-[color:var(--lab-on-accent)] ${FOCUS}`}>{yes}</button>
      </span>
    </div>
  );
}
