"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { HistoryDot, HistoryOp } from "../models/history";
import { BAR_H, CHIP_H, PLOT_X0, PLOT_X1, VIEW_W, placeBars, type CaptionWords, type HistoryLayout, type OpWords } from "../models/history-layout";
import { NEUTRAL, TONES, type Tone } from "./tones";

// The history picture: one lane per client, a time axis, and one bar per
// operation from its start to its end. A write bar is accent blue, a read bar
// is neutral. Data-driven: the caller passes the operations, the words for each
// bar and what to mark (rings, dots, a selected bar), and chooses what a tap
// does. Course 11 uses it to build a history, to place the instant each
// operation takes effect, and to show three consistency verdicts.
//
// Draw it inside an <svg viewBox="0 0 420 H"> after DotGrid. Geometry and text
// fitting are in models/history-layout.ts; the rules are in models/history.ts.

const WRITE_BAR = "fill-blue-600 stroke-blue-700 dark:fill-blue-400 dark:stroke-blue-300";
const WRITE_TEXT = "fill-white dark:fill-blue-950";
const READ_BAR = "fill-card stroke-muted-foreground";
const LANE_BG = "fill-muted/40";
const SEGMENT = 9;

export type HistoryViewProps = {
  layout: HistoryLayout;
  ops: readonly HistoryOp[];
  /** The words for each bar, longest first. */
  words: readonly OpWords[];
  /** Caption chips under bars, for example "may return 0 or 1". */
  captions?: readonly (CaptionWords & { tone?: Tone })[];
  /** A bar drawn with a heavier outline, for example the one a second tap would remove. */
  selected?: string | null;
  /** Bars to ring in red. */
  rings?: readonly string[];
  /** One instant per operation, joined by a thin line in the order given. */
  dots?: readonly HistoryDot[];
  /** 0 to 1; changes fade. */
  dotsOpacity?: number;
  /** Makes every bar a button. */
  onBar?: (op: HistoryOp) => void;
  /** Which bars are buttons (all of them by default). */
  pressable?: (op: HistoryOp) => boolean;
  /** What a tap on a bar does, for screen readers. */
  barAction?: (op: HistoryOp) => string;
  /** Makes every lane a button. The time is null when the lane was activated from the keyboard. */
  onLane?: (client: string, time: number | null) => void;
  laneAction?: (client: string) => string;
  /** Drawn behind the bars, above the lanes (for example a bracket). */
  behind?: ReactNode;
  /** Drawn last, above everything. */
  children?: ReactNode;
};

export function HistoryView({ layout, ops, words, captions = [], selected, rings = [], dots = [], dotsOpacity = 1, onBar, barAction, pressable, onLane, laneAction, behind, children }: HistoryViewProps) {
  const placed = placeBars(layout, ops, words, captions);
  const laneOf = new Map(layout.clients.map((c, i) => [c, i]));
  const wordsById = new Map(words.map((w) => [w.id, w]));
  const toneById = new Map(captions.map((c) => [c.id, c.tone ?? "accent"]));
  const opById = new Map(ops.map((o) => [o.id, o]));
  const laneWidth = VIEW_W - 8;

  const timeAt = (e: MouseEvent<SVGGElement>): number | null => {
    if (e.detail === 0) return null;
    const svg = e.currentTarget.ownerSVGElement;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return layout.time(p.matrixTransform(m.inverse()).x);
  };
  const keyPress = (act: () => void) => (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    act();
  };

  // The thin line joining the dots, in short pieces so each stays close to what it crosses.
  const dotAt = (d: HistoryDot) => {
    const op = opById.get(d.id);
    const lane = op ? laneOf.get(op.client) : undefined;
    return op && lane !== undefined ? { x: layout.x(d.t), y: layout.barY(lane) } : null;
  };
  const points = dots.map(dotAt).filter((p): p is { x: number; y: number } => !!p);
  const pieces: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / SEGMENT));
    for (let k = 0; k < n; k++) {
      pieces.push({
        x1: a.x + ((b.x - a.x) * k) / n,
        y1: a.y + ((b.y - a.y) * k) / n,
        x2: a.x + ((b.x - a.x) * (k + 0.75)) / n,
        y2: a.y + ((b.y - a.y) * (k + 0.75)) / n,
      });
    }
  }

  return (
    <g>
      {/* The lanes. */}
      {layout.clients.map((client, i) => {
        const top = layout.laneTop(i);
        return (
          <g key={`lane-${client}`}>
            <rect x={4} y={top + 1} width={laneWidth} height={layout.laneH - 2} rx={10} className={LANE_BG} />
            <text x={10} y={layout.barY(i) + BAR_H / 2 + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{client}</text>
          </g>
        );
      })}

      {/* The time axis. */}
      <line x1={PLOT_X0} x2={PLOT_X1} y1={layout.axisY} y2={layout.axisY} strokeWidth={2} className={NEUTRAL.line} />
      {layout.ticks.map((t) => (
        <g key={`tick-${t.t}`}>
          <line x1={t.x} x2={t.x} y1={layout.axisY} y2={layout.axisY + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          <text x={t.x} y={layout.axisY + 21} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t.text}</text>
        </g>
      ))}
      <text x={(PLOT_X0 + PLOT_X1) / 2} y={layout.axisY + 39} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{layout.axis.caption}</text>

      {behind}

      {/* Lane taps come before the bars, so a bar on top takes its own tap. */}
      {onLane
        ? layout.clients.map((client, i) => {
            const top = layout.laneTop(i);
            const act = () => onLane(client, null);
            return (
              <g
                key={`tap-${client}`}
                role="button"
                tabIndex={0}
                aria-label={laneAction ? laneAction(client) : `${client}'s lane`}
                className="group cursor-pointer outline-none"
                onClick={(e) => {
                  const t = timeAt(e);
                  if (t === null) act();
                  else onLane(client, t);
                }}
                onKeyDown={keyPress(act)}
              >
                <path d={`M4 ${top + 1} h${laneWidth} v${layout.laneH - 2} h${-laneWidth} Z`} fill="none" pointerEvents="all" />
                <rect x={3} y={top} width={laneWidth + 2} height={layout.laneH} rx={11} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
              </g>
            );
          })
        : null}

      {/* A thin line joining the points in order, behind the bars. */}
      <g opacity={dotsOpacity} className="transition-opacity duration-300 motion-reduce:transition-none">
        {pieces.map((p, i) => (
          <line key={`piece-${i}`} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} strokeWidth={1.5} strokeLinecap="round" className={TONES.accent.stroke} />
        ))}
      </g>

      {/* The bars. */}
      {placed.map((bar) => {
        const op = opById.get(bar.id);
        if (!op) return null;
        const lane = bar.lane;
        const y = layout.barY(lane);
        const isWrite = op.kind === "write";
        const isSelected = selected === op.id;
        const body = (
          <>
            <rect x={bar.x0} y={y} width={bar.x1 - bar.x0} height={BAR_H} rx={8} strokeWidth={1.5} className={cn("transition-colors duration-200 motion-reduce:transition-none", isWrite ? WRITE_BAR : READ_BAR)} />
            {bar.inside ? (
              <text x={bar.inside.x} y={y + BAR_H / 2 + 4.2} textAnchor="middle" className={cn(isWrite ? WRITE_TEXT : NEUTRAL.text, "text-[11.5px] font-semibold")}>{bar.inside.text}</text>
            ) : null}
            {isSelected ? <rect x={bar.x0 - 3} y={y - 3} width={bar.x1 - bar.x0 + 6} height={BAR_H + 6} rx={10} className={cn("fill-none", TONES.accent.stroke)} strokeWidth={2.5} /> : null}
          </>
        );
        const aria = `${wordsById.get(op.id)?.aria ?? op.id}${barAction ? `. ${barAction(op)}` : ""}`;
        if (!onBar || (pressable && !pressable(op))) return <g key={`bar-${op.id}`}>{body}</g>;
        const act = () => onBar(op);
        const hitTop = layout.laneTop(lane) + 1;
        const hitW = bar.x1 - bar.x0 + 8;
        return (
          <g key={`bar-${op.id}`} role="button" tabIndex={0} aria-label={aria} aria-pressed={selected === undefined ? undefined : isSelected} className="group cursor-pointer outline-none" onClick={act} onKeyDown={keyPress(act)}>
            <path d={`M${bar.x0 - 4} ${hitTop} h${hitW} v${layout.laneH - 2} h${-hitW} Z`} fill="none" pointerEvents="all" />
            {body}
            <rect x={bar.x0 - 5} y={y - 5} width={bar.x1 - bar.x0 + 10} height={BAR_H + 10} rx={12} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
          </g>
        );
      })}

      {/* Words that did not fit inside their bar, and captions, in the band under it. */}
      {placed.map((bar) => (
        <g key={`under-${bar.id}`}>
          {bar.below ? (
            <text x={bar.below.x} y={layout.bandY(bar.lane) + 13.5} textAnchor={bar.below.anchor} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{bar.below.text}</text>
          ) : null}
          {bar.caption ? (
            <g>
              <rect x={bar.caption.x} y={layout.bandY(bar.lane)} width={bar.caption.chipW} height={CHIP_H} rx={CHIP_H / 2} strokeWidth={1.5} className={cn(TONES[toneById.get(bar.id) ?? "accent"].softFill, TONES[toneById.get(bar.id) ?? "accent"].stroke)} />
              <text x={bar.caption.x + bar.caption.chipW / 2} y={layout.bandY(bar.lane) + 14} textAnchor="middle" className={cn(TONES[toneById.get(bar.id) ?? "accent"].text, "text-[11.5px] font-semibold")}>{bar.caption.text}</text>
            </g>
          ) : null}
        </g>
      ))}

      {/* Red rings for the operations that conflict. */}
      {placed.map((bar) => (
        <rect
          key={`ring-${bar.id}`}
          x={bar.x0 - 5}
          y={layout.barY(bar.lane) - 5}
          width={bar.x1 - bar.x0 + 10}
          height={BAR_H + 10}
          rx={12}
          strokeWidth={3}
          opacity={rings.includes(bar.id) ? 1 : 0}
          className={cn("fill-none transition-opacity duration-300 motion-reduce:transition-none", TONES.bad.stroke)}
        />
      ))}

      {/* The instants, sitting on the top edge of their bars. */}
      {dots.map((d) => {
        const p = dotAt(d);
        if (!p) return null;
        return (
          <g key={`dot-${d.id}`} opacity={dotsOpacity} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} className="transition-[transform,opacity] duration-300 motion-reduce:transition-none">
            <circle r={5.5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} />
          </g>
        );
      })}

      {children}
    </g>
  );
}
