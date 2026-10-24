"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { ORDERS, duration, moveRow, percent, rowLabel, selfTime, share, spans, total, verdictFor, type Order, type Service } from "./model";

const W = 420;
const ROWS = 7;
const PITCH = 44;
const RY = 118;
const AX = { x0: 72, x1: 406 };
const CARD = { x: 14, y: RY + ROWS * PITCH + 10, w: 392, h: 68 };
const H = CARD.y + CARD.h + 16;

const r1 = (v: number) => Math.round(v * 10) / 10;

// One quiet colour per service, so a row's owner is readable at a glance.
const SERVICE: Record<Service, { soft: string; text: string; bar: string }> = {
  api: { soft: "fill-blue-100 dark:fill-blue-500/25", text: "fill-blue-800 dark:fill-blue-200", bar: "fill-blue-500 dark:fill-blue-400" },
  menu: { soft: "fill-violet-100 dark:fill-violet-500/25", text: "fill-violet-800 dark:fill-violet-200", bar: "fill-violet-500 dark:fill-violet-400" },
  payments: { soft: "fill-teal-100 dark:fill-teal-500/25", text: "fill-teal-800 dark:fill-teal-200", bar: "fill-teal-600 dark:fill-teal-400" },
};

const pillW = (service: string) => Math.ceil(service.length * 6.9 + 14);
const textX = (depth: number) => 14 + depth * 14;

/** 17.2 beat 4: switch the order, tap a span row, and see which call holds the time. */
export function TraceRequestCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const rows = useRef<(SVGGElement | null)[]>([]);
  const [order, setOrder] = useState<Order>("slow");
  const [selected, setSelected] = useState<number | null>(null);

  const all = spans(order);
  const totalMs = total(order);
  const verdict = verdictFor(order, selected);
  const X = (ms: number) => r1(AX.x0 + (ms / totalMs) * (AX.x1 - AX.x0));
  const widths = ORDERS.map((o) => chipWidth(o.label));
  const chipXs = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 8)) / 2, 8);
  const sel = selected === null ? null : all[selected];
  const selTone = verdict.tone;

  const description = `Trace of one ${order} order, ${totalMs} ms in all. ${all.map((s, i) => `${s.service} ${s.name} starts at ${s.start} ms and lasts ${duration(s)} ms, own time ${selfTime(order, i)} ms`).join("; ")}. ${verdict.text}.`;

  const onRowKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(i);
      return;
    }
    const next = moveRow(i, e.key);
    if (next === null) return;
    e.preventDefault();
    setSelected(next);
    rows.current[next]?.focus();
  };

  return (
    <BeatFrame label={title} limits={limits} hint={<>Pick an order, then tap a <b>row</b>. Arrow keys move between rows.</>}>
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="Which order">
            {ORDERS.map((o, i) => (
              <SvgRadioChip key={o.id} x={chipXs[i]} y={66} width={widths[i]} text={o.label} label={`${o.label}, ${total(o.id)} milliseconds in all`} checked={o.id === order} onSelect={() => setOrder(o.id)} />
            ))}
          </g>

          {/* The time axis: 0 to the whole order. */}
          <text x={AX.x0} y={RY - 5} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0 ms</text>
          <text x={AX.x1} y={RY - 5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>{`${totalMs} ms`}</text>

          {all.map((s, i) => {
            const t = RY + i * PITCH;
            const on = selected === i;
            const px = textX(s.depth);
            const pw = pillW(s.service);
            const parent = s.parent === null ? null : all[s.parent];
            const barX = X(s.start);
            const barW = Math.max(3, r1(X(s.end) - X(s.start)));
            return (
              <g
                key={i}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                role="button"
                tabIndex={0}
                aria-label={rowLabel(order, i)}
                aria-pressed={on}
                className="group cursor-pointer outline-none"
                onClick={() => setSelected(i)}
                onKeyDown={(e) => onRowKey(e, i)}
              >
                {/* The tap area is a path, so the picture's text check does not take it for a card. */}
                <path d={`M6 ${t} h408 v${PITCH - 2} h-408 Z`} fill="none" pointerEvents="all" />
                <rect x={6} y={t} width={408} height={PITCH - 2} rx={10} strokeWidth={on ? 2 : 0} className={cn(on ? cn(TONES[selTone].softFill, TONES[selTone].stroke) : "fill-transparent", "transition-colors duration-200 motion-reduce:transition-none")} />
                <rect x={3} y={t - 3} width={414} height={PITCH + 4} rx={12} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />

                {parent && s.parent !== null ? (
                  <path d={`M${textX(parent.depth) + 6} ${RY + s.parent * PITCH + 25} V${t + 12} H${px - 2}`} fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={NEUTRAL.faintStroke} />
                ) : null}

                <rect x={px} y={t + 3} width={pw} height={18} rx={9} className={SERVICE[s.service].soft} />
                <text x={px + pw / 2} y={t + 16} textAnchor="middle" className={cn(SERVICE[s.service].text, "text-[11.5px] font-bold")}>{s.service}</text>
                <text x={px + pw + 7} y={t + 17} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{s.name}</text>
                <text x={AX.x1} y={t + 17} textAnchor="end" className={cn(on ? NEUTRAL.text : NEUTRAL.mutedText, "text-[12px] tabular-nums", on && "font-bold")}>{`${duration(s)} ms`}</text>

                <rect x={AX.x0} y={t + 26} width={AX.x1 - AX.x0} height={11} rx={5.5} className="fill-muted/60" />
                <rect
                  x={barX}
                  y={t + 26}
                  width={barW}
                  height={11}
                  rx={5.5}
                  strokeWidth={on ? 2 : 0}
                  className={cn(SERVICE[s.service].bar, on && "stroke-foreground", "transition-[x,width] duration-300 motion-reduce:transition-none")}
                  style={{ x: barX, width: barW }}
                />
              </g>
            );
          })}

          {/* The selected span: its own time, as a number and as a share of the order. */}
          <g>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={sel ? 2 : 1.5} strokeDasharray={sel ? undefined : "6 5"} className={cn(NEUTRAL.surface, sel ? TONES[selTone].stroke : NEUTRAL.faintStroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            {sel && selected !== null ? (
              <>
                <rect x={CARD.x + 12} y={CARD.y + 11} width={pillW(sel.service)} height={18} rx={9} className={SERVICE[sel.service].soft} />
                <text x={CARD.x + 12 + pillW(sel.service) / 2} y={CARD.y + 24} textAnchor="middle" className={cn(SERVICE[sel.service].text, "text-[11.5px] font-bold")}>{sel.service}</text>
                <text x={CARD.x + 12 + pillW(sel.service) + 7} y={CARD.y + 25} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{sel.name}</text>
                <text x={CARD.x + 12} y={CARD.y + 53} className={cn(TONES[selTone].text, "text-[16px] font-bold tabular-nums")}>{`self ${selfTime(order, selected)} ms, ${percent(order, selected)}% of the order`}</text>
                <rect x={CARD.x + CARD.w - 112} y={CARD.y + 15} width={100} height={8} rx={4} className="fill-muted" />
                <rect x={CARD.x + CARD.w - 112} y={CARD.y + 15} width={Math.max(4, r1(100 * share(order, selected)))} height={8} rx={4} className={TONES[selTone].solidFill} />
              </>
            ) : (
              <text x={W / 2} y={CARD.y + CARD.h / 2 + 5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>Tap a row to see its own time</text>
            )}
          </g>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{verdict.text}</p>
      </div>
    </BeatFrame>
  );
}
