"use client";

// The settings drawer: opens from the small icon that appears on a component when
// you hover or focus it, never by default, one component at a time. It is always
// dark, a step darker than the board, so it reads as a separate surface. On a
// wide board it slides in from the right; on a narrow one (a phone) it is a sheet
// that rises from the bottom.

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ComponentKind, PropertyDef, PropertyGroup } from "./catalog";
import { COMPONENT_CATALOG, sizesFor } from "./catalog";
import type { NodeConfig } from "./hld-board-model";
import type { TierLoad } from "./tiered-architecture";
import { chipStyle, iconOf } from "./board-style";

/** Plain words for what a cache did with the reads it was asked. */
export function cacheSentence(s: { hitRate: number; reads: number; hits: number; misses: number }): string {
  const n = (v: number) => Math.round(v).toLocaleString();
  return `Asked ${n(s.reads)}/s. Answered itself ${n(s.hits)}/s (${Math.round(s.hitRate * 100)}% hits). Went on to the database ${n(s.misses)}/s. A cache hit means the database is never asked.`;
}

const GROUP_ORDER: PropertyGroup[] = ["Capacity", "Scaling", "Resilience", "Behaviour"];
const SCALING_FIELDS = new Set(["minCount", "maxCount", "targetUtil"]);

const FIELD =
  "rounded-md border border-slate-600 bg-slate-800 px-1.5 py-1 text-[12px] text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

/** One configurable property: size and option pickers, toggles, sliders and numbers. */
function PropertyField({ p, value, onChange }: { p: PropertyDef; value: number | string | undefined; onChange: (v: number | string) => void }) {
  const v = value ?? p.default;
  const row = "mb-2 flex items-center justify-between gap-2 text-[12px]";
  const label = <span className="text-slate-300" title={p.help}>{p.label}</span>;
  if (p.type === "size" || p.type === "enum") {
    const options = p.type === "size" ? sizesFor(p.sizeSet ?? "generic").map((t) => t.id) : p.options ?? [];
    return (
      <label className={row}>
        {label}
        <select value={String(v)} onChange={(e) => onChange(e.target.value)} className={`${FIELD} max-w-[140px]`}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (p.type === "toggle") {
    const on = Number(v) > 0;
    return (
      <div className={row}>
        {label}
        <button type="button" role="switch" aria-checked={on} aria-label={p.label} onClick={() => onChange(on ? 0 : 1)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${FOCUS} ${on ? "bg-blue-500" : "bg-slate-600"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </div>
    );
  }
  if (p.type === "ratio") {
    return (
      <label className={row}>
        {label}
        <span className="flex items-center gap-1.5">
          <input type="range" min={0} max={1} step={p.step ?? 0.05} value={Number(v)} onChange={(e) => onChange(Number(e.target.value))} className="w-20 accent-blue-400" />
          <span className="w-9 text-right tabular-nums text-slate-100">{Math.round(Number(v) * 100)}%</span>
        </span>
      </label>
    );
  }
  return (
    <label className={row}>
      {label}
      <input type="number" min={p.min} max={p.max} value={Number(v)} onChange={(e) => onChange(Number(e.target.value))} className={`${FIELD} w-20 tabular-nums`} />
    </label>
  );
}

export function SettingsDrawer({
  id, kind, cfg, tier, onChange, onToggleDown, onRemove, onClose,
}: {
  id: string;
  kind: ComponentKind;
  cfg: NodeConfig;
  tier?: TierLoad;
  onChange: (key: string, value: number | string) => void;
  onToggleDown: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const def = COMPONENT_CATALOG[kind];
  const ref = useRef<HTMLDivElement>(null);
  // Move focus into the drawer when it opens or switches component.
  useEffect(() => { ref.current?.focus(); }, [id]);

  const busy = tier ? Math.round(tier.utilisation * 100) : 0;
  const busyColor = !tier || tier.utilisation < 0.7 ? "text-emerald-400" : tier.utilisation < 0.9 ? "text-amber-400" : "text-red-400";

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={`Settings for ${def.label}`}
      id="lab-settings-drawer"
      data-testid="settings-drawer"
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
      className="absolute inset-x-0 bottom-0 z-20 max-h-[78%] overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-slate-900 p-3.5 text-slate-100 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] outline-none dark:bg-neutral-950 @xl:inset-x-auto @xl:inset-y-0 @xl:right-0 @xl:max-h-none @xl:w-[292px] @xl:rounded-none @xl:border-l @xl:border-t-0 @xl:shadow-[-8px_0_24px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-600 @xl:hidden" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[14px]" style={chipStyle(kind)}>{iconOf(kind)}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold leading-tight">{def.label}</div>
          <div className="truncate text-[11px] text-slate-400">{def.vendor}</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close settings"
          className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white ${FOCUS}`}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mb-2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] text-slate-300">
        {cfg.down ? (
          "Down. Requests through it fail."
        ) : tier && tier.reachable ? (
          <>
            {tier.managed ? "Managed, scales for you" : (
              <>Serves up to <span className="font-semibold text-slate-100">{Math.round(tier.capacity).toLocaleString()}/s</span>, <span className={`font-semibold ${busyColor}`}>{busy}% busy</span></>
            )}
            <span className="text-slate-400"> · ${tier.cost.toFixed(2)}/h</span>
          </>
        ) : (
          "Not linked into the request path yet."
        )}
      </div>

      {tier?.cacheStats && !cfg.down ? (
        <div className="mb-2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] leading-snug text-slate-300" data-testid="cache-stats">
          <div>Reads asked of the cache: <span className="font-semibold text-slate-100">{Math.round(tier.cacheStats.reads).toLocaleString()}/s</span></div>
          <div>Answered by the cache (hits): <span className="font-semibold text-emerald-400">{Math.round(tier.cacheStats.hits).toLocaleString()}/s</span> ({Math.round(tier.cacheStats.hitRate * 100)}%)</div>
          <div>Reached the database (misses): <span className="font-semibold text-amber-400">{Math.round(tier.cacheStats.misses).toLocaleString()}/s</span></div>
          <div className="mt-0.5 text-slate-400">A cache hit means the database is never asked.</div>
        </div>
      ) : null}

      {GROUP_ORDER.map((group) => {
        const fields = def.properties.filter(
          (p) => (p.group ?? "Capacity") === group && (!SCALING_FIELDS.has(p.id) || Number(cfg.autoscale ?? 0) > 0),
        );
        if (fields.length === 0) return null;
        return (
          <div key={group}>
            <div className="mb-1 mt-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{group}</div>
            {fields.map((p) => <PropertyField key={p.id} p={p} value={cfg[p.id]} onChange={(v) => onChange(p.id, v)} />)}
          </div>
        );
      })}

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onToggleDown}
          className={`flex-1 rounded-md border px-2 py-1.5 text-[12px] font-semibold ${FOCUS} ${cfg.down ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10" : "border-red-500 text-red-400 hover:bg-red-500/10"}`}>
          {cfg.down ? "Restore" : "Take it down"}
        </button>
        {kind !== "client" ? (
          <button type="button" onClick={onRemove}
            className={`rounded-md border border-slate-600 px-2 py-1.5 text-[12px] text-slate-300 hover:border-red-500 hover:text-red-400 ${FOCUS}`}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
