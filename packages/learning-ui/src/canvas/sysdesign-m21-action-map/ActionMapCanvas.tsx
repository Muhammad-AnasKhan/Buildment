"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { NODE_H, NODE_W, SvgNode } from "../primitives/svg-node";
import { rowPositions, SvgChip } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ACTION_HOPS,
  ACTION_IDS,
  ACTION_LABELS,
  actionCaption,
  actionPills,
  actionVerdict,
  actionWords,
  BLOCKS,
  DOTS_PER_SECOND,
  HOPS,
  hopKey,
  speedClass,
  type ActionId,
  type ActionPill,
  type BlockId,
} from "../models/feed-actions";

const W = 420;
const CHIP_Y = 62;
const CAPTION = { y: 394, h: 44 };
const H = CAPTION.y + CAPTION.h + 12;
const DOT_GAP = 22;
const CHIP_WIDTHS = [90, 104, 112, 66];
const CHIP_GAP = 8;

type Pt = [number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;
const centre = (id: BlockId): Pt => {
  const b = BLOCKS.find((x) => x.id === id)!;
  return [b.x, b.y];
};

function pathLength(points: readonly Pt[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return total;
}

function pointAt(points: readonly Pt[], distance: number): Pt {
  let left = distance;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (left <= seg || i === points.length - 1) {
      const t = seg > 0 ? Math.min(1, left / seg) : 0;
      return [r1(x0 + (x1 - x0) * t), r1(y0 + (y1 - y0) * t)];
    }
    left -= seg;
  }
  return points[points.length - 1];
}

/** 21.2: tap an action and watch the blocks it touches light up with their rates. */
export function ActionMapCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [action, setAction] = useState<ActionId>("feed");

  const pills = actionPills(action);
  const pillOf = new Map<BlockId, ActionPill>(pills.map((p) => [p.block, p]));
  const verdict = actionVerdict(action);
  const [line1, line2] = actionCaption(action);
  const used = new Set(ACTION_HOPS[action]);

  const hops = HOPS.map((h) => {
    const points: Pt[] = [centre(h.from), ...(h.via ?? []), centre(h.to)];
    const on = used.has(hopKey(h));
    const rate = pillOf.get(h.to)?.value ?? 0;
    return { key: hopKey(h), points, on, speed: DOTS_PER_SECOND[speedClass(rate)] };
  });

  const xs = rowPositions(CHIP_WIDTHS, (W - (CHIP_WIDTHS.reduce((a, b) => a + b, 0) + CHIP_GAP * (CHIP_WIDTHS.length - 1))) / 2, CHIP_GAP);

  const onKeys = (e: KeyboardEvent<SVGGElement>) => {
    const i = ACTION_IDS.indexOf(action);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(ACTION_IDS.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ACTION_IDS.length - 1;
    else return;
    e.preventDefault();
    setAction(ACTION_IDS[next]);
    e.currentTarget.querySelectorAll<SVGGElement>('[role="button"]')[next]?.focus();
  };

  const description = `Hikaya action map. ${actionWords(action)} ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap an action in the picture, or use the arrow keys.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Links: the ones this action uses are lit; the rest stay faint. */}
          {hops.map((h) =>
            h.points.slice(1).map((p, i) => (
              <LinkLine
                key={`${h.key}-${i}`}
                x1={h.points[i][0]}
                y1={h.points[i][1]}
                x2={p[0]}
                y2={p[1]}
                strokeWidth={h.on ? 2.5 : 1.5}
                className={cn(h.on ? TONES.accent.stroke : NEUTRAL.faintStroke, "transition-colors duration-200 motion-reduce:transition-none")}
              />
            ))
          )}

          {/* Request dots on the lit links; arrows when motion is reduced. Cards are drawn over them. */}
          {hops
            .filter((h) => h.on)
            .map((h) => {
              const length = pathLength(h.points);
              if (reduced) {
                const [x, y] = pointAt(h.points, length / 2);
                const [ax, ay] = pointAt(h.points, length / 2 - 3);
                const [bx, by] = pointAt(h.points, length / 2 + 3);
                const angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
                return <polygon key={`arrow-${h.key}`} points="-6,-5 6,0 -6,5" transform={`translate(${x} ${y}) rotate(${r1(angle)})`} className={TONES.accent.solidFill} aria-hidden />;
              }
              const offset = (seconds * h.speed * DOT_GAP) % DOT_GAP;
              const dots: Pt[] = [];
              for (let d = offset; d < length; d += DOT_GAP) dots.push(pointAt(h.points, d));
              return (
                <g key={`dots-${h.key}`} aria-hidden>
                  {dots.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={3.4} className={TONES.accent.solidFill} />
                  ))}
                </g>
              );
            })}

          {BLOCKS.map((b) => {
            const p = pillOf.get(b.id);
            return (
              <g key={b.id}>
                <SvgNode x={b.x} y={b.y} label={b.label} kind={b.kind} status={p?.text} statusTone={p?.tone} mark={p?.tone === "warn" ? "warn" : undefined} />
                {/* Untouched blocks are dimmed with a wash over an opaque card, so links never show through. */}
                <rect x={b.x - NODE_W / 2} y={b.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={14} style={{ opacity: p ? 0 : 0.5 }} className="pointer-events-none fill-card transition-opacity duration-200 motion-reduce:transition-none" />
              </g>
            );
          })}

          {/* A small tag that points to the chapter that explains the warning number. */}
          {pills
            .filter((p) => p.tag)
            .map((p) => {
              const b = BLOCKS.find((x) => x.id === p.block)!;
              const x = b.x + 56 - 40;
              const y = b.y - 30 - 11;
              return (
                <g key={`tag-${p.block}`}>
                  <rect x={x} y={y} width={42} height={18} rx={9} className="fill-card" />
                  <rect x={x} y={y} width={42} height={18} rx={9} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
                  <text x={x + 21} y={y + 13} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-bold tabular-nums")}>
                    {p.tag}
                  </text>
                </g>
              );
            })}

          {/* What the pills count, in two short lines. */}
          <rect x={8} y={CAPTION.y} width={W - 16} height={CAPTION.h} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
          <text x={20} y={CAPTION.y + 18} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
            {line1}
          </text>
          <text x={20} y={CAPTION.y + 35} className={cn(NEUTRAL.mutedText, "text-[12px]")}>
            {line2}
          </text>

          {/* The action chips. */}
          <g role="group" aria-label="Choose an action" onKeyDown={onKeys}>
            {ACTION_IDS.map((id, i) => (
              <SvgChip key={id} x={xs[i]} y={CHIP_Y} width={CHIP_WIDTHS[i]} text={ACTION_LABELS[id]} label={ACTION_LABELS[id]} pressed={action === id} onPress={() => setAction(id)} />
            ))}
          </g>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <ul className="sr-only" aria-live="polite">
          {pills.map((p) => (
            <li key={p.block}>{p.words}</li>
          ))}
        </ul>
      </div>
    </BeatFrame>
  );
}
