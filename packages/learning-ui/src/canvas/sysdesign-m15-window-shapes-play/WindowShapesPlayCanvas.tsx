"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { AXIS_S, EVENTS, SHAPES, membership, playhead, sessionGaps, tableRows, verdictFor, windowsFor, windowLabel, type Shape } from "./model";

const W = 420;
const H = 356;
const AX = { x0: 30, x1: 404, y: 158 };
const ROW = { y0: 192, step: 32, h: 26 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(AX.x0 + (Math.max(0, Math.min(AXIS_S, t)) / AXIS_S) * (AX.x1 - AX.x0));

/** 15.6 beat 2: tap a window shape and see how the same eight events are counted. */
export function WindowShapesPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [shape, setShape] = useState<Shape>("tumbling");

  const wins = windowsFor(shape);
  const per = membership(shape);
  const verdict = verdictFor(shape);
  const info = SHAPES.find((s) => s.id === shape) ?? SHAPES[0];
  // The playhead sweeps the axis; a still picture rests after the last event, with every window closed.
  const t = clock.reduced ? AXIS_S + 100 : playhead(clock.seconds);
  const widths = SHAPES.map((s) => chipWidth(s.label));
  const chipXs = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 8 * (SHAPES.length - 1))) / 2, 8);

  const description = `Eight events at seconds ${EVENTS.join(", ")}. ${info.label} windows, ${info.note}: ${wins.map((w) => `${windowLabel(w)} has ${w.count}`).join("; ")}. ${verdict.text}. ${verdict.note}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a <b>shape</b>. Look at the number over each dot.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The three shapes. */}
          <g role="radiogroup" aria-label="Window shape">
            {SHAPES.map((s, i) => (
              <SvgRadioChip key={s.id} x={chipXs[i]} y={64} width={widths[i]} text={s.label} label={`${s.label} windows`} checked={s.id === shape} onSelect={() => setShape(s.id)} />
            ))}
          </g>
          <text x={W / 2} y={102} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-medium")}>{info.note}</text>

          {/* The time axis, with the events as dots and the windows each is in above them. */}
          <line x1={AX.x0} x2={AX.x1} y1={AX.y} y2={AX.y} strokeWidth={1.5} className={NEUTRAL.line} />
          <line x1={AX.x0} x2={xOf(t)} y1={AX.y} y2={AX.y} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          {[0, 60, 120, 180, 240].map((s) => (
            <g key={s}>
              <line x1={xOf(s)} x2={xOf(s)} y1={AX.y + 4} y2={AX.y + 10} strokeWidth={1.5} className={NEUTRAL.doneStroke} />
              <text x={xOf(s)} y={AX.y + 25} textAnchor={s === 0 ? "start" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{s === 240 ? "240 s" : String(s)}</text>
            </g>
          ))}
          {EVENTS.map((s, i) => {
            const passed = t >= s;
            return (
              <g key={s}>
                <circle cx={xOf(s)} cy={AX.y} r={5} strokeWidth={2} className={cn(passed ? TONES.accent.solidFill : NEUTRAL.surface, TONES.accent.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={xOf(s)} y={AX.y - 12} textAnchor="middle" className={cn(per[i] > 1 ? TONES.warn.text : NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{per[i]}</text>
              </g>
            );
          })}

          {/* The windows as bars, one row for each overlapping layer. */}
          {wins.map((w, k) => {
            const y = ROW.y0 + w.row * ROW.step;
            const session = shape === "session";
            const from = session ? xOf(w.from) : xOf(Math.max(0, w.from));
            const to = session ? xOf(w.to) : xOf(Math.min(AXIS_S, w.to));
            const width = Math.max(session ? 18 : 4, r1(to - from));
            const x = session ? r1(Math.min(AX.x1 - width, Math.max(AX.x0, (from + to) / 2 - width / 2))) : from;
            const open = t >= Math.max(0, w.from) && t < w.closesAt;
            const closed = t >= w.closesAt;
            return (
              <g key={`${shape}-${k}`}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={ROW.h}
                  rx={9}
                  strokeWidth={open ? 2.5 : 1.5}
                  className={cn(closed || open ? TONES.accent.softFill : "fill-muted/60", closed || open ? TONES.accent.stroke : "stroke-muted-foreground/40", "transition-colors duration-200 motion-reduce:transition-none")}
                />
                <text x={r1(x + width / 2)} y={y + 17.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{w.count}</text>
              </g>
            );
          })}
          {shape === "session"
            ? sessionGaps().map((g) => (
                <text key={g.from} x={r1((xOf(g.from) + xOf(g.to)) / 2)} y={ROW.y0 + 17.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium tabular-nums")}>{`${g.length} s gap`}</text>
              ))
            : null}

          <text x={AX.x0} y={296} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>bar: events in the window</text>
          <text x={AX.x1} y={296} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>over a dot: windows it is in</text>
          <rect x={14} y={308} width={392} height={34} rx={17} strokeWidth={1.5} className={cn(NEUTRAL.surface, verdict.tone === "warn" ? TONES.warn.stroke : NEUTRAL.line)} />
          <text x={W / 2} y={329} textAnchor="middle" className={cn(verdict.tone === "warn" ? TONES.warn.text : NEUTRAL.text, "text-[13px] font-semibold tabular-nums")}>{verdict.note}</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <table className="sr-only">
          <caption>{`${info.label} windows and the events in each`}</caption>
          <thead>
            <tr>
              <th scope="col">Window</th>
              <th scope="col">Events</th>
            </tr>
          </thead>
          <tbody>
            {tableRows(shape).map((r) => (
              <tr key={r.window}>
                <td>{r.window}</td>
                <td>{r.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BeatFrame>
  );
}
