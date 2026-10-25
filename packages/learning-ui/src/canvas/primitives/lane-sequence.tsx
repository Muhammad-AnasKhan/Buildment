"use client";

import { cn } from "../../lib/utils";
import type { ActorKind } from "../renderers/scene/types";
import { NODE_H, NODE_W, SvgNode } from "./svg-node";
import { SvgButton } from "./svg-button";
import { NEUTRAL, TONES, type Tone } from "./tones";

// Nodes as columns, time running down: a node card on top, a dashed lifeline
// under it, an event pill on the lifeline for every event, and an arrow from
// the sending pill to the receiving pill for every message. Data-driven, so a
// chapter on clocks, logs or replication can draw its own run with the same
// parts. Every label sits inside an opaque pill drawn after the lines, so no
// arrow ever crosses a letter.

export type LaneCard = {
  id: string;
  /** Centre of the column. */
  x: number;
  label: string;
  kind?: ActorKind;
  /** The pill under the name, for example "counter 6" or "clock +25 ms". */
  status?: string;
  statusTone?: Tone;
  /** A ring around the card, for example the node that is selected. */
  mark?: Tone;
  /** 0 to 1: a soft wash on the card when a message has just arrived. */
  arrival?: number;
  /** What a screen reader says for the card's button. */
  ariaLabel: string;
  pressed?: boolean;
  onPress?: () => void;
};

type LaneCardsProps = { cards: readonly LaneCard[]; y: number };

/** The row of node cards. A card with onPress is a button. */
export function LaneCards({ cards, y }: LaneCardsProps) {
  return (
    <g>
      {cards.map((c) => {
        const node = <SvgNode x={c.x} y={y} label={c.label} kind={c.kind ?? "server"} status={c.status} statusTone={c.statusTone} mark={c.mark} arrival={c.arrival} />;
        return c.onPress ? (
          <SvgButton key={c.id} x={c.x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} label={c.ariaLabel} pressed={c.pressed} onPress={c.onPress}>
            {node}
          </SvgButton>
        ) : (
          <g key={c.id}>{node}</g>
        );
      })}
    </g>
  );
}

export type LaneEventView = {
  key: string;
  /** Index into the columns. */
  col: number;
  /** Row on the page, 0 is the first. */
  row: number;
  /** The main text in the pill: a counter or a stamp. */
  text: string;
  /** A small second line on the left, for example "clock 70". */
  sub?: string;
  /** A small mark on the right of the second line, for example "+30". */
  badge?: { text: string; tone: Tone };
  /** The newest event gets the accent outline; older ones are quiet. */
  style: "current" | "past" | "start";
  /** Outline tone: the newest event defaults to the accent; any event can be marked, for example in red when it is out of order. */
  tone?: Tone;
  /** 0 to 1, for older rows fading back. */
  opacity?: number;
};

export type LaneMessageView = {
  from: string;
  to: string;
  tone?: Tone;
  /** Quiet, for older messages. */
  past?: boolean;
};

type LaneBodyProps = {
  /** Centre x of each column. */
  columns: readonly number[];
  /** y of row 0's centre. */
  top: number;
  pitch: number;
  /** How many rows the lifelines run through. */
  rows: number;
  pillW: number;
  pillH: number;
  events: readonly LaneEventView[];
  messages: readonly LaneMessageView[];
  /** Where the lifelines start; defaults to just above the first row. */
  lifelineFrom?: number;
};

/** Lifelines, message arrows and event pills. Draw the cards and any rails around it. */
export function LaneBody({ columns, top, pitch, rows, pillW, pillH, events, messages, lifelineFrom }: LaneBodyProps) {
  const yOf = (row: number) => top + row * pitch;
  const byKey = new Map(events.map((e) => [e.key, e]));
  const bottom = yOf(Math.max(0, rows - 1)) + pillH / 2 + 8;
  return (
    <g>
      {columns.map((x, i) => (
        <line key={`life-${i}`} x1={x} x2={x} y1={lifelineFrom ?? top - pillH / 2 - 6} y2={bottom} strokeWidth={1.5} strokeDasharray="4 4" className={NEUTRAL.faintStroke} />
      ))}
      {messages.map((m) => {
        const a = byKey.get(m.from);
        const b = byKey.get(m.to);
        if (!a || !b) return null;
        const dir = Math.sign(columns[b.col] - columns[a.col]) || 1;
        const x1 = columns[a.col] + (dir * pillW) / 2;
        const x2 = columns[b.col] - (dir * pillW) / 2;
        const y1 = yOf(a.row);
        const y2 = yOf(b.row);
        const tone = m.tone ?? "accent";
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        const head = `${x2},${y2} ${x2 - ux * 9 - uy * 4.5},${y2 - uy * 9 + ux * 4.5} ${x2 - ux * 9 + uy * 4.5},${y2 - uy * 9 - ux * 4.5}`;
        return (
          <g key={`${m.from}-${m.to}`} opacity={m.past ? 0.5 : 1}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2.25} strokeLinecap="round" className={TONES[tone].stroke} />
            <polygon points={head} className={TONES[tone].solidFill} />
          </g>
        );
      })}
      {events.map((e) => {
        const x = columns[e.col];
        const y = yOf(e.row);
        const current = e.style === "current";
        const toneName = e.tone ?? (current ? "accent" : undefined);
        const outline = toneName ? TONES[toneName].stroke : e.style === "start" ? NEUTRAL.faintStroke : NEUTRAL.line;
        const two = e.sub !== undefined || e.badge !== undefined;
        return (
          <g key={e.key} opacity={e.opacity ?? 1}>
            <rect x={x - pillW / 2} y={y - pillH / 2} width={pillW} height={pillH} rx={Math.min(pillH / 2, 14)} strokeWidth={current ? 2.5 : toneName ? 2 : 1.5} className={cn(NEUTRAL.surface, outline, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={x} y={two ? y - 1.5 : y + 4.8} textAnchor="middle" className={cn(current ? NEUTRAL.text : NEUTRAL.mutedText, "text-[13px] font-bold tabular-nums")}>
              {e.text}
            </text>
            {e.sub ? (
              <text x={e.badge ? x - pillW / 2 + 9 : x} y={y + 12.5} textAnchor={e.badge ? "start" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {e.sub}
              </text>
            ) : null}
            {e.badge ? (
              <text x={x + pillW / 2 - 9} y={y + 12.5} textAnchor="end" className={cn(TONES[e.badge.tone].text, "text-[11.5px] font-bold tabular-nums")}>
                {e.badge.text}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
