"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../lib/utils";
import { logPosition } from "../models/latency-ladder";
import { DotGrid } from "./svg-parts";
import { FOCUS_RING, NEUTRAL, TONES } from "./tones";

// A horizontal log ruler the learner drags or taps along. Rungs are values on
// the ruler (a cache hit, a disk seek, a price, a size); bands name the
// stretches between them in words ("hours", "days"). Two rungs are picked:
// the one the learner is on and the one they came from, so any two can be
// compared. Data-driven, so another course can lay out its own ladder.

export type RulerRung = { id: string; label: string; value: number };
export type RulerBand = { label: string; upTo: number };

type LogRulerProps = {
  rungs: readonly RulerRung[];
  bands: readonly RulerBand[];
  min: number;
  max: number;
  /** The rung the learner is on. */
  current: string;
  /** The rung they came from; compared with the current one. */
  pinned: string;
  onChange: (next: { current: string; pinned: string }) => void;
  label: string;
  valueText: string;
};

const W = 420;
const H = 108;
const X0 = 22;
const X1 = 398;
const LINE_Y = 70;
const ROW_PINNED = 17;
const ROW_CURRENT = 43;
const CHIP_H = 22;

export function LogRuler({ rungs, bands, min, max, current, pinned, onChange, label, valueText }: LogRulerProps) {
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  // Rounded, so the server and the browser print the same numbers.
  const X = (v: number) => Math.round((X0 + logPosition(v, min, max) * (X1 - X0)) * 100) / 100;
  const index = Math.max(0, rungs.findIndex((r) => r.id === current));
  const cur = rungs[index];
  const pin = rungs.find((r) => r.id === pinned) ?? cur;

  const rungAt = (e: PointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const x = p.matrixTransform(m.inverse()).x;
    const at = (x - X0) / (X1 - X0);
    return rungs.reduce((best, r) => (Math.abs(logPosition(r.value, min, max) - at) < Math.abs(logPosition(best.value, min, max) - at) ? r : best));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = rungs.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange({ current, pinned: current });
      return;
    } else return;
    e.preventDefault();
    const r = rungs[Math.max(0, Math.min(rungs.length - 1, next))];
    onChange({ current: r.id, pinned });
  };

  // Band edges on the ruler, left to right.
  const bandBoxes = bands.map((b, i) => ({ label: b.label, x0: X(i === 0 ? min : bands[i - 1].upTo), x1: X(Math.min(b.upTo, max)), i }));

  const chip = (r: RulerRung, y: number, solid: boolean) => {
    const w = r.label.length * 7 + 22;
    const cx = Math.max(X0 - 12 + w / 2, Math.min(X1 + 12 - w / 2, X(r.value)));
    const t = TONES.accent;
    return (
      <g key={`${r.id}-${y}`}>
        <line x1={X(r.value)} x2={X(r.value)} y1={y + CHIP_H / 2} y2={LINE_Y} className={t.stroke} strokeWidth={1.5} strokeDasharray={solid ? undefined : "3 3"} />
        <rect x={cx - w / 2} y={y - CHIP_H / 2} width={w} height={CHIP_H} rx={CHIP_H / 2} className={cn(solid ? t.solidFill : cn(NEUTRAL.surface, t.stroke))} strokeWidth={1.5} />
        <text x={cx} y={y + 4.5} textAnchor="middle" className={cn(solid ? "fill-white dark:fill-blue-950" : t.text, "text-[12.5px] font-semibold")}>
          {r.label}
        </text>
      </g>
    );
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={rungs.length}
      aria-valuenow={index + 1}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        const r = rungAt(e);
        if (!r) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        // A tap on a new rung makes the old one the rung to compare with.
        if (r.id !== current) onChange({ current: r.id, pinned: current });
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const r = rungAt(e);
        if (r && r.id !== current) onChange({ current: r.id, pinned });
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className={cn("cursor-ew-resize touch-none select-none rounded-xl", FOCUS_RING)}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} aria-hidden className="block h-auto w-full">
        <DotGrid width={W} height={H} />
        {bandBoxes.map((b) => (
          <g key={b.label}>
            <rect x={b.x0} y={LINE_Y - 9} width={Math.max(0, b.x1 - b.x0)} height={18} className={b.i % 2 ? "fill-muted-foreground/[0.07]" : "fill-muted-foreground/[0.16]"} />
            <text x={(b.x0 + b.x1) / 2} y={LINE_Y + 30} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
              {b.label}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={LINE_Y} y2={LINE_Y} className={NEUTRAL.doneStroke} strokeWidth={1.5} />
        {rungs.map((r) => (
          <circle key={r.id} cx={X(r.value)} cy={LINE_Y} r={4.5} className={cn(NEUTRAL.surface, NEUTRAL.doneStroke)} strokeWidth={2} />
        ))}
        {pin.id !== cur.id ? chip(pin, ROW_PINNED, false) : null}
        {chip(cur, ROW_CURRENT, true)}
        <circle cx={X(pin.value)} cy={LINE_Y} r={7} className={cn(NEUTRAL.surface, TONES.accent.stroke)} strokeWidth={2.5} />
        <circle cx={X(cur.value)} cy={LINE_Y} r={7.5} className={TONES.accent.solidFill} />
      </svg>
    </div>
  );
}
