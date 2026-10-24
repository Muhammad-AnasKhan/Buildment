"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import {
  CONCURRENT_TOTAL,
  EVENTS,
  LANES,
  MESSAGES,
  chain,
  compareVerdict,
  concurrentPairs,
  deciders,
  eventById,
  pairKey,
  relation,
  type Lane,
} from "../models/vector-compare";

const W = 420;
const H = 366;
const X0 = 62;
const PITCH = 42;
const LANE_Y: Record<Lane, number> = { A: 84, B: 144, C: 204 };
const R = 16;
const COUNTER_Y = 250;
const CARD_Y = 276;
const CARD = { w: 192, h: 82 };
const CELL = { w: 44, h: 28, gap: 6 };
const SLOTS = ["A", "B", "C"];

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (id: string) => X0 + EVENTS.findIndex((e) => e.id === id) * PITCH;
const yOf = (id: string) => LANE_Y[eventById(id).lane];
const CONCURRENT = new Set(concurrentPairs());

/** 10.4 beat 3: tap two of nine events and compare their vectors slot by slot. */
export function VectorCompareCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [found, setFound] = useState<ReadonlySet<string>>(new Set());
  const [completed, setCompleted] = useState<string | null>(null);
  const titleId = useId();
  const descId = useId();

  const [x, y] = [picks[0] ?? null, picks[1] ?? null];
  const rel = x && y ? relation(x, y) : null;
  const dec = x && y ? deciders(x, y) : null;
  const path = x && y ? chain(x, y) : null;
  const onPath = new Set(path ?? []);
  const pathLinks = new Set((path ?? []).slice(1).map((id, i) => `${(path as string[])[i]}>${id}`));

  const verdict = x && y && completed === pairKey(x, y) ? { text: "All 7 concurrent pairs found", tone: "good" as const } : compareVerdict(x, y, new Set());

  function pick(id: string) {
    if (picks.length === 2) return setPicks([id]);
    if (picks[0] === id) return setPicks([]);
    if (picks.length === 0) return setPicks([id]);
    const next = [picks[0], id];
    setPicks(next);
    const key = pairKey(next[0], next[1]);
    if (CONCURRENT.has(key) && !found.has(key)) {
      const grown = new Set(found).add(key);
      setFound(grown);
      setCompleted(grown.size === CONCURRENT_TOTAL ? key : null);
    }
  }

  function move(e: KeyboardEvent, id: string) {
    const i = EVENTS.findIndex((v) => v.id === id);
    let j = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = Math.min(EVENTS.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = Math.max(0, i - 1);
    else return;
    e.preventDefault();
    e.stopPropagation();
    svg.current?.querySelector<SVGGElement>(`[data-event="${EVENTS[j].id}"]`)?.focus();
  }

  const arrow = (a: string, b: string) => {
    const x1 = xOf(a);
    const y1 = yOf(a);
    const x2 = xOf(b);
    const y2 = yOf(b);
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const sx = x1 + ux * (R + 2);
    const sy = y1 + uy * (R + 2);
    const ex = x2 - ux * (R + 2);
    const ey = y2 - uy * (R + 2);
    const head = `${r1(ex)},${r1(ey)} ${r1(ex - ux * 9 - uy * 4.5)},${r1(ey - uy * 9 + ux * 4.5)} ${r1(ex - ux * 9 + uy * 4.5)},${r1(ey - uy * 9 - ux * 4.5)}`;
    return { sx: r1(sx), sy: r1(sy), ex: r1(ex), ey: r1(ey), head };
  };

  const concurrentTone = rel === "concurrent";
  const cards: { id: string | null; px: number; tone: "accent" | "warn"; slot: number | null }[] = [
    { id: x, px: 10, tone: concurrentTone ? "warn" : "accent", slot: dec?.x ?? null },
    { id: y, px: W - 10 - CARD.w, tone: concurrentTone ? "warn" : "accent", slot: dec?.y ?? null },
  ];

  const description = x && y ? `${verdict.text}. ${x} has vector [${eventById(x).vector.join(",")}], ${y} has [${eventById(y).vector.join(",")}].` : `Nine events on three nodes. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap <b>two events</b> to compare them. A third tap starts again. Arrow keys move, Enter picks.</>}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

        {/* Lanes, then lane links, then messages, then the glowing chain, then the events. */}
        {LANES.map((l) => (
          <line key={`lane-${l}`} x1={40} x2={W - 6} y1={LANE_Y[l]} y2={LANE_Y[l]} strokeWidth={1.5} strokeDasharray="4 4" className={NEUTRAL.faintStroke} />
        ))}
        {MESSAGES.map((m) => {
          const a = arrow(m.from, m.to);
          const lit = pathLinks.has(`${m.from}>${m.to}`);
          return (
            <g key={`${m.from}-${m.to}`}>
              <line x1={a.sx} y1={a.sy} x2={a.ex} y2={a.ey} strokeWidth={lit ? 4.5 : 2} strokeLinecap="round" className={lit ? TONES.accent.stroke : NEUTRAL.doneStroke} />
              <polygon points={a.head} className={lit ? TONES.accent.solidFill : NEUTRAL.doneFill} />
            </g>
          );
        })}
        {EVENTS.map((e, i) => {
          const next = EVENTS.slice(i + 1).find((o) => o.lane === e.lane);
          if (!next || !pathLinks.has(`${e.id}>${next.id}`)) return null;
          return <line key={`hop-${e.id}`} x1={xOf(e.id) + R} x2={xOf(next.id) - R} y1={yOf(e.id)} y2={yOf(e.id)} strokeWidth={4.5} strokeLinecap="round" className={TONES.accent.stroke} />;
        })}

        {LANES.map((l) => (
          <g key={`tag-${l}`}>
            <circle cx={20} cy={LANE_Y[l]} r={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <text x={20} y={LANE_Y[l] + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{l}</text>
          </g>
        ))}

        {EVENTS.map((e) => {
          const picked = picks.includes(e.id);
          const lit = onPath.has(e.id) && !picked;
          const tone = picked ? (concurrentTone ? TONES.warn : TONES.accent) : TONES.accent;
          const cx = xOf(e.id);
          const cy = yOf(e.id);
          return (
            <g
              key={e.id}
              data-event={e.id}
              role="button"
              tabIndex={0}
              aria-label={`${e.id}, ${e.what}, vector ${e.vector.join(",")}${picked ? ", chosen" : ""}`}
              aria-pressed={picked}
              className={cn("group cursor-pointer", FOCUS_RING)}
              onClick={() => pick(e.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  pick(e.id);
                } else move(ev, e.id);
              }}
            >
              <rect x={cx - PITCH / 2} y={cy - 22} width={PITCH} height={44} fill="none" pointerEvents="all" />
              <circle cx={cx} cy={cy} r={R} strokeWidth={picked || lit ? 3 : 1.5} className={cn("transition-colors duration-200 motion-reduce:transition-none", picked ? cn(tone.solidFill, tone.stroke) : lit ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line, "group-hover:fill-muted"))} />
              <text x={cx} y={cy + 4.8} textAnchor="middle" className={cn("text-[13px] font-bold", picked ? (concurrentTone ? "fill-amber-950" : "fill-white dark:fill-blue-950") : NEUTRAL.text)}>{e.id}</text>
              <circle cx={cx} cy={cy} r={R + 5} fill="none" strokeWidth={2.5} className={cn("opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
            </g>
          );
        })}

        {/* How many of the seven concurrent pairs have been found. */}
        <rect x={W / 2 - 116} y={COUNTER_Y - 13} width={232} height={26} rx={13} strokeWidth={1.5} className={cn(NEUTRAL.surface, found.size === CONCURRENT_TOTAL ? TONES.good.stroke : NEUTRAL.line)} />
        <text x={W / 2} y={COUNTER_Y + 4.5} textAnchor="middle" className={cn(found.size === CONCURRENT_TOTAL ? TONES.good.text : NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>
          {`Concurrent pairs found: ${found.size} of ${CONCURRENT_TOTAL}`}
        </text>

        {/* The two chosen events with their vectors side by side. */}
        {cards.map((c, n) => {
          const e = c.id ? eventById(c.id) : null;
          const t = TONES[c.tone];
          return (
            <g key={n}>
              <rect x={c.px} y={CARD_Y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={e ? 2 : 1.5} strokeDasharray={e ? undefined : "5 4"} className={cn(NEUTRAL.surface, e && rel ? t.stroke : NEUTRAL.line)} />
              {e ? (
                <>
                  <text x={c.px + 12} y={CARD_Y + 20} className={cn(NEUTRAL.text, "text-[14px] font-bold")}>{e.id}</text>
                  <text x={c.px + 40} y={CARD_Y + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{e.what}</text>
                  {SLOTS.map((s, i) => {
                    const cx = c.px + 16 + i * (CELL.w + CELL.gap);
                    const circled = c.slot === i;
                    return (
                      <g key={s}>
                        <text x={cx + CELL.w / 2} y={CARD_Y + 38} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{s}</text>
                        <rect x={cx} y={CARD_Y + 44} width={CELL.w} height={CELL.h} rx={8} strokeWidth={1.5} className={cn("fill-muted", NEUTRAL.line)} />
                        <text x={cx + CELL.w / 2} y={CARD_Y + 63} textAnchor="middle" className={cn(NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>{e.vector[i]}</text>
                        {circled ? <rect x={cx - 3} y={CARD_Y + 41} width={CELL.w + 6} height={CELL.h + 6} rx={11} fill="none" strokeWidth={3} className={t.stroke} /> : null}
                      </g>
                    );
                  })}
                </>
              ) : (
                <text x={c.px + CARD.w / 2} y={CARD_Y + CARD.h / 2 + 4.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px]")}>{n === 0 ? "tap an event" : "tap a second event"}</text>
              )}
            </g>
          );
        })}
      </svg>
    </BeatFrame>
  );
}
