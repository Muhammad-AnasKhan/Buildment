"use client";

// The cassette: the dark settings and explanation surface that grows beside a part
// on a wide board, and docks along the bottom on a phone. Plus the tactile controls
// that live in it. Presentational: the board decides what goes inside.

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Glyph } from "./Glyph";
import type { LabRole } from "./bench";

export const CASSETTE_FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)]";
const SEG = `lab-mono rounded-[4px] border px-2 py-1 text-[11px] font-bold ${CASSETTE_FOCUS}`;

/** Where the cassette sits beside its part, as CSS variables the wide layout reads. */
export function anchorStyle(left: string, top: string): CSSProperties {
  return { "--cx": left, "--cy": top } as CSSProperties;
}

export function Cassette({
  id = "lab-settings-drawer", label, role, color, title, subtitle, badge, anchor, floating = true, onClose, children,
}: {
  id?: string;
  /** Accessible name of the dialog. */
  label: string;
  role: LabRole;
  color: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  anchor?: CSSProperties;
  /** False draws it in the page flow (a specimen sheet) instead of over a canvas. */
  floating?: boolean;
  onClose?: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Move focus into the cassette when it opens or switches part.
  useEffect(() => { if (floating) ref.current?.focus(); }, [id, title, floating]);
  const place = floating
    ? "absolute inset-x-0 bottom-0 z-20 max-h-[58%] overflow-y-auto rounded-t-[8px] border-b-0 shadow-[0_-4px_0_0_var(--lab-edge-shadow)] @xl:bottom-auto @xl:left-[var(--cx,auto)] @xl:right-[var(--cx-r,12px)] @xl:top-[var(--cy,8px)] @xl:inset-x-auto @xl:max-h-[calc(100%-16px)] @xl:w-[272px] @xl:rounded-[8px] @xl:border-b-[1.5px] @xl:shadow-[0_4px_0_0_var(--lab-edge-shadow)]"
    : "relative w-[272px] rounded-[8px] shadow-[0_4px_0_0_var(--lab-edge-shadow)]";
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={label}
      id={id}
      data-testid="settings-drawer"
      style={anchor}
      onKeyDown={(e) => { if (e.key === "Escape" && onClose) { e.stopPropagation(); onClose(); } }}
      className={`lab-cassette border-[1.5px] border-[color:var(--lab-grid)] bg-[color:var(--lab-inspector)] p-3 text-slate-100 outline-none ${place}`}
    >
      {floating ? <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-500 @xl:hidden" aria-hidden /> : null}
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-black/30" style={{ color }}>
          <Glyph role={role} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div title={title} className="lab-display line-clamp-2 text-[14px] font-semibold leading-tight">{title}</div>
          {subtitle ? <div className="lab-mono truncate text-[10px] uppercase tracking-wide text-slate-300">{subtitle}</div> : null}
        </div>
        {badge}
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close" className={`lab-mono flex h-7 items-center gap-1 rounded-[4px] border border-slate-500 px-1.5 text-[9px] font-bold uppercase text-slate-200 hover:bg-white/10 ${CASSETTE_FOCUS}`}>
            <X className="h-3 w-3" aria-hidden /> Esc
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** The two-cell readout under the header: what it can serve and how busy it is. */
export function CassetteReadout({ items, tone = "ok" }: { items: { label: string; value: string; tone?: "last" | "plain" }[]; tone?: "ok" | "warm" | "hot" }) {
  const color = tone === "ok" ? "text-emerald-300" : tone === "warm" ? "text-amber-300" : "text-orange-300";
  return (
    <div className="lab-mono mb-2.5 grid gap-px overflow-hidden rounded-[5px] bg-slate-600 text-[11px]" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <div key={it.label} className="bg-black/40 px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-wider text-slate-300">{it.label}</div>
          <div className={`truncate font-bold ${it.tone === "last" ? color : "text-white"}`}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function CassetteSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="lab-mono mb-1 mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-300">{title}</div>
      {children}
    </div>
  );
}

/** A row of labelled choices, one pressed: sizes, families, option lists. */
export function SegmentedGroup({ label, options, value, onChange }: {
  label: string;
  options: { id: string; label: string; title?: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={`${SEG} flex-1 ${o.id === value ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/20 text-white" : "border-slate-500 text-slate-300 hover:bg-white/10"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ label, value, min = 0, max = 1_000_000, step = 1, onChange }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const btn = `flex h-7 w-7 items-center justify-center rounded-[4px] border border-slate-500 text-slate-100 hover:bg-white/10 disabled:opacity-40 ${CASSETTE_FOCUS}`;
  return (
    <span className="flex items-center gap-1">
      <button type="button" aria-label={`Fewer ${label}`} className={btn} disabled={value <= min} onClick={() => set(value - step)}><Minus className="h-3.5 w-3.5" aria-hidden /></button>
      <input
        type="number" min={min} max={max} value={value} aria-label={label}
        onChange={(e) => set(Number(e.target.value))}
        className={`lab-mono h-7 w-14 rounded-[4px] border border-slate-500 bg-black/30 text-center text-[12px] text-slate-100 ${CASSETTE_FOCUS}`}
      />
      <button type="button" aria-label={`More ${label}`} className={btn} disabled={value >= max} onClick={() => set(value + step)}><Plus className="h-3.5 w-3.5" aria-hidden /></button>
    </span>
  );
}

export function CassetteSwitch({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-[4px] border transition-colors ${CASSETTE_FOCUS} ${on ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]" : "border-slate-500 bg-black/30"}`}>
      <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-[2px] bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export function CassetteSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <>
      <input type="range" min={0} max={1} step={0.05} value={value} list="lab-detents" aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[color:var(--lab-accent)]" />
      <datalist id="lab-detents">{[0, 0.25, 0.5, 0.75, 1].map((d) => <option key={d} value={d} />)}</datalist>
    </>
  );
}
