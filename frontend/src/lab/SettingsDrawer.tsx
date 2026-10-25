"use client";

// The settings cassette. It opens from the small TUNE keycap that appears on a
// component when you hover or focus it, never by default, one at a time. On a wide
// board it grows out beside the component it belongs to; on a narrow one (a phone)
// it is a deck docked along the bottom while the component is panned into view
// above it, so you edit with the part reacting in front of you. It is always dark,
// a step darker than the board, so it reads as an instrument and not as page.

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import type { ComponentKind, PropertyDef, PropertyGroup } from "./catalog";
import { COMPONENT_CATALOG, sizesFor } from "./catalog";
import type { NodeConfig } from "./hld-board-model";
import type { TierLoad } from "./tiered-architecture";
import { KindGlyph } from "./Glyph";
import { colorOf } from "./board-style";
import { AWS_PARTS, AWS_PROPS, sizeLabel } from "./aws-names";
import { useNames } from "./names-context";

const GROUP_ORDER: PropertyGroup[] = ["Capacity", "Scaling", "Resilience", "Behaviour"];
const SCALING_FIELDS = new Set(["minCount", "maxCount", "targetUtil"]);

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)]";
const SEG = `lab-mono rounded-[4px] border px-2 py-1 text-[11px] font-bold ${FOCUS}`;

/** Plain words for what a cache did with the reads it was asked. */
export function cacheSentence(s: { hitRate: number; reads: number; hits: number; misses: number }): string {
  const n = (v: number) => Math.round(v).toLocaleString();
  return `Asked ${n(s.reads)}/s. Answered itself ${n(s.hits)}/s (${Math.round(s.hitRate * 100)}% hits). Went on to the database ${n(s.misses)}/s. A cache hit means the database is never asked.`;
}

/** Where the cassette sits beside its component, as CSS variables the wide layout reads. */
export function anchorStyle(left: string, top: string): CSSProperties {
  return { "--cx": left, "--cy": top } as CSSProperties;
}

/** The frame shared by the settings cassette and the solution's explanation cassette. */
export function Cassette({
  id, label, kind, title, subtitle, badge, anchor, onClose, children,
}: {
  id: string;
  label: string;
  kind: ComponentKind;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  anchor?: CSSProperties;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Move focus into the cassette when it opens or switches component.
  useEffect(() => { ref.current?.focus(); }, [id]);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={label}
      id="lab-settings-drawer"
      data-testid="settings-drawer"
      style={anchor}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
      className="lab-cassette absolute inset-x-0 bottom-0 z-20 max-h-[58%] overflow-y-auto rounded-t-[8px] border-[1.5px] border-b-0 border-[color:var(--lab-grid)] bg-[color:var(--lab-inspector)] p-3 text-slate-100 shadow-[0_-4px_0_0_var(--lab-edge-shadow)] outline-none @xl:bottom-auto @xl:left-[var(--cx,auto)] @xl:right-[var(--cx-r,12px)] @xl:top-[var(--cy,8px)] @xl:inset-x-auto @xl:max-h-[calc(100%-16px)] @xl:w-[272px] @xl:rounded-[8px] @xl:border-b-[1.5px] @xl:shadow-[0_4px_0_0_var(--lab-edge-shadow)]"
    >
      <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-500 @xl:hidden" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-black/30" style={{ color: colorOf(kind) }}>
          <KindGlyph kind={kind} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div title={title} className="lab-display truncate text-[14px] font-semibold leading-tight">{title}</div>
          {subtitle ? <div className="lab-mono truncate text-[10px] uppercase tracking-wide text-slate-300">{subtitle}</div> : null}
        </div>
        {badge}
        <button type="button" onClick={onClose} aria-label="Close" className={`lab-mono flex h-7 items-center gap-1 rounded-[4px] border border-slate-500 px-1.5 text-[9px] font-bold uppercase text-slate-200 hover:bg-white/10 ${FOCUS}`}>
          <X className="h-3 w-3" aria-hidden /> Esc
        </button>
      </div>
      {children}
    </div>
  );
}

function Stepper({ p, value, onChange }: { p: PropertyDef; value: number; onChange: (v: number) => void }) {
  const min = p.min ?? 0;
  const max = p.max ?? 1_000_000;
  const step = p.step ?? 1;
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const btn = `flex h-7 w-7 items-center justify-center rounded-[4px] border border-slate-500 text-slate-100 hover:bg-white/10 disabled:opacity-40 ${FOCUS}`;
  return (
    <span className="flex items-center gap-1">
      <button type="button" aria-label={`Fewer ${p.label}`} className={btn} disabled={value <= min} onClick={() => set(value - step)}><Minus className="h-3.5 w-3.5" aria-hidden /></button>
      <input
        type="number" min={p.min} max={p.max} value={value} aria-label={p.label}
        onChange={(e) => set(Number(e.target.value))}
        className={`lab-mono h-7 w-14 rounded-[4px] border border-slate-500 bg-black/30 text-center text-[12px] text-slate-100 ${FOCUS}`}
      />
      <button type="button" aria-label={`More ${p.label}`} className={btn} disabled={value >= max} onClick={() => set(value + step)}><Plus className="h-3.5 w-3.5" aria-hidden /></button>
    </span>
  );
}

/** One configurable property as a tactile control: segmented sizes, steppers, detent sliders, switches. */
function PropertyField({
  kind, p, value, cfg, onChange,
}: {
  kind: ComponentKind;
  p: PropertyDef;
  value: number | string | undefined;
  cfg: NodeConfig;
  onChange: (key: string, v: number | string) => void;
}) {
  const { mode } = useNames();
  const v = value ?? p.default;
  const aws = AWS_PROPS[kind]?.[p.id];
  const label = aws && mode === "aws" ? aws.label : p.label;
  const help = aws && mode === "aws" ? aws.meaning : p.help;
  const row = "mb-2.5";
  const head = <div className="mb-1 flex items-center justify-between text-[12px] text-slate-200" title={help}>{label}</div>;
  const note = help && mode === "aws" ? <div className="mt-0.5 text-[10.5px] leading-snug text-slate-300">{help}</div> : null;

  if (p.type === "size") {
    const tiers = sizesFor(p.sizeSet ?? "generic");
    const current = tiers.find((t) => t.id === String(v)) ?? tiers[0]!;
    const families = [...new Set(tiers.map((t) => t.family))];
    const inFamily = tiers.filter((t) => t.family === current.family);
    const info = sizeLabel(kind, current.id, mode);
    return (
      <div className={row}>
        {head}
        {families.length > 1 ? (
          <div className="mb-1 flex gap-1" role="group" aria-label="Family">
            {families.map((f) => {
              const target = tiers.find((t) => t.family === f && t.vcpu === current.vcpu) ?? tiers.find((t) => t.family === f)!;
              return (
                <button key={f} type="button" aria-pressed={f === current.family} onClick={() => onChange(p.id, target.id)}
                  className={`${SEG} flex-1 ${f === current.family ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/20 text-white" : "border-slate-500 text-slate-300 hover:bg-white/10"}`}>
                  {f}
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="flex gap-1" role="group" aria-label="Size">
          {inFamily.map((t) => {
            const short = t.id.replace(/^(compute|memory|general)-/, "");
            return (
              <button key={t.id} type="button" aria-pressed={t.id === current.id} onClick={() => onChange(p.id, t.id)} title={`${t.vcpu} vCPU, ${t.memoryGb} GB, $${t.pricePerHour}/h (illustrative)`}
                className={`${SEG} flex-1 ${t.id === current.id ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/20 text-white" : "border-slate-500 text-slate-300 hover:bg-white/10"}`}>
                {short === "small" ? "S" : short === "medium" ? "M" : short === "large" ? "L" : short === "xlarge" ? "XL" : t.id}
              </button>
            );
          })}
        </div>
        <div className="lab-mono mt-1 text-[11px] font-bold text-slate-100" data-testid="size-label">{info.label}</div>
        <div className="text-[10.5px] leading-snug text-slate-300">{info.detail || `${current.vcpu} vCPU, ${current.memoryGb} GB. ${current.capacityRule}`}</div>
      </div>
    );
  }
  if (p.type === "enum") {
    return (
      <div className={row}>
        {head}
        <div className="flex gap-1" role="group" aria-label={label}>
          {(p.options ?? []).map((o) => (
            <button key={o} type="button" aria-pressed={String(v) === o} onClick={() => onChange(p.id, o)}
              className={`${SEG} flex-1 ${String(v) === o ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/20 text-white" : "border-slate-500 text-slate-300 hover:bg-white/10"}`}>{o}</button>
          ))}
        </div>
        {note}
      </div>
    );
  }
  if (p.type === "toggle") {
    const on = Number(v) > 0;
    return (
      <div className={row}>
        <div className="flex items-center justify-between gap-2 text-[12px] text-slate-200" title={help}>
          <span>{label}</span>
          <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(p.id, on ? 0 : 1)}
            className={`relative h-5 w-9 shrink-0 rounded-[4px] border transition-colors ${FOCUS} ${on ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]" : "border-slate-500 bg-black/30"}`}>
            <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-[2px] bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>
        {note}
      </div>
    );
  }
  if (p.type === "ratio") {
    return (
      <div className={row}>
        <div className="mb-1 flex items-center justify-between text-[12px] text-slate-200" title={help}>
          <span>{label}</span>
          <span className="lab-mono font-bold text-white">{Math.round(Number(v) * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={p.step ?? 0.05} value={Number(v)} list="lab-detents" aria-label={label}
          onChange={(e) => onChange(p.id, Number(e.target.value))} className="w-full accent-[color:var(--lab-accent)]" />
        <datalist id="lab-detents">{[0, 0.25, 0.5, 0.75, 1].map((d) => <option key={d} value={d} />)}</datalist>
        {note}
      </div>
    );
  }
  void cfg;
  return (
    <div className={row}>
      <div className="flex items-center justify-between gap-2 text-[12px] text-slate-200" title={help}>
        <span>{label}</span>
        <Stepper p={p} value={Number(v)} onChange={(n) => onChange(p.id, n)} />
      </div>
      {note}
    </div>
  );
}

export function SettingsDrawer({
  id, kind, cfg, tier, anchor, onChange, onToggleDown, onRemove, onClose,
}: {
  id: string;
  kind: ComponentKind;
  cfg: NodeConfig;
  tier?: TierLoad;
  anchor?: CSSProperties;
  onChange: (key: string, value: number | string) => void;
  onToggleDown: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const def = COMPONENT_CATALOG[kind];
  const { mode, nameOf } = useNames();
  const part = mode === "aws" ? AWS_PARTS[kind] : undefined;
  const busy = tier ? Math.round(tier.utilisation * 100) : 0;
  const busyColor = !tier || tier.utilisation < 0.7 ? "text-emerald-300" : tier.utilisation < 0.9 ? "text-amber-300" : "text-orange-300";

  return (
    <Cassette
      id={id}
      kind={kind}
      label={`Settings for ${nameOf(kind)}`}
      title={nameOf(kind)}
      subtitle={mode === "aws" ? def.label : def.vendor}
      anchor={anchor}
      onClose={onClose}
      badge={tier && tier.reachable && !cfg.down ? <span className="lab-mono rounded-[4px] bg-black/30 px-1.5 py-0.5 text-[10px] font-bold text-slate-100">${tier.cost.toFixed(2)}/h</span> : null}
    >
      {part ? <p className="mb-2 text-[11px] leading-snug text-slate-300" data-testid="aws-meaning">{part.meaning}</p> : null}

      <div className="lab-mono mb-2.5 grid grid-cols-2 gap-px overflow-hidden rounded-[5px] bg-slate-600 text-[11px]">
        {cfg.down ? (
          <div className="col-span-2 bg-black/40 px-2 py-1.5 font-bold uppercase tracking-wider text-red-300">Offline. Requests through it fail.</div>
        ) : tier && tier.reachable ? (
          <>
            <div className="bg-black/40 px-2 py-1.5"><div className="text-[9px] uppercase tracking-wider text-slate-300">Capacity</div><div className="font-bold text-white">{tier.managed ? "managed" : `${Math.round(tier.capacity).toLocaleString()}/s`}</div></div>
            <div className="bg-black/40 px-2 py-1.5"><div className="text-[9px] uppercase tracking-wider text-slate-300">Load</div><div className={`font-bold ${busyColor}`}>{tier.managed ? "scales" : `${busy}%`}</div></div>
          </>
        ) : (
          <div className="col-span-2 bg-black/40 px-2 py-1.5 text-slate-300">Not linked into the request path yet.</div>
        )}
      </div>

      {tier?.cacheStats && !cfg.down ? (
        <div className="lab-mono mb-2.5 rounded-[5px] bg-black/30 px-2 py-1.5 text-[10.5px] leading-snug text-slate-200" data-testid="cache-stats">
          <div className="flex justify-between"><span>asked</span><b>{Math.round(tier.cacheStats.reads).toLocaleString()}/s</b></div>
          <div className="flex justify-between text-emerald-300"><span>● hit, answered here</span><b>{Math.round(tier.cacheStats.hits).toLocaleString()}/s</b></div>
          <div className="flex justify-between text-amber-300"><span>◇ miss, goes on</span><b>{Math.round(tier.cacheStats.misses).toLocaleString()}/s</b></div>
          <div className="mt-0.5 font-sans text-[10.5px] text-slate-300">A cache hit means the database is never asked.</div>
        </div>
      ) : null}

      {GROUP_ORDER.map((group) => {
        const fields = def.properties.filter(
          (p) => (p.group ?? "Capacity") === group && (!SCALING_FIELDS.has(p.id) || Number(cfg.autoscale ?? 0) > 0),
        );
        if (fields.length === 0) return null;
        return (
          <div key={group}>
            <div className="lab-mono mb-1 mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-300">{group}</div>
            {fields.map((p) => <PropertyField key={p.id} kind={kind} p={p} value={cfg[p.id]} cfg={cfg} onChange={onChange} />)}
          </div>
        );
      })}

      {part ? <p className="mb-2 mt-1 rounded-[5px] border border-dashed border-slate-500 px-2 py-1 text-[10.5px] leading-snug text-slate-200" data-testid="aws-remember"><b className="lab-mono text-[9px] uppercase tracking-wider text-slate-300">Remember </b>{part.remember}</p> : null}

      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onToggleDown} aria-pressed={Boolean(cfg.down)}
          className={`lab-mono flex-1 rounded-[5px] border-2 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide ${FOCUS} ${cfg.down ? "border-emerald-400 text-emerald-300 hover:bg-emerald-400/10" : "border-red-400 text-red-300 hover:bg-red-400/10"}`}>
          {cfg.down ? "Restore" : "Trip fault"}
        </button>
        {kind !== "client" ? (
          <button type="button" onClick={onRemove} aria-label={`Remove ${nameOf(kind)}`}
            className={`flex h-[34px] w-[34px] items-center justify-center rounded-[5px] border border-slate-500 text-slate-300 hover:border-red-400 hover:text-red-300 ${FOCUS}`}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </Cassette>
  );
}
