"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { BadgeCheck, Ellipsis, FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "./beat-frame";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "./tones";
import { useBeatClock } from "./use-beat-clock";
import { useSettledStart } from "./use-settled-start";
import { wrapWords } from "../models/sorter";
import {
  KIND_WORD,
  markerAt,
  moveBlock,
  moveTo,
  orderBlocks,
  phoneLabelText,
  SEEN_SHARE,
  spendable,
  STACK_GEO,
  STACK_NOTE_CHARS,
  stackHeight,
  stackLayout,
  stackRows,
  stackVerdict,
  type StackBlock,
  type StackKind,
  type StackVerdicts,
} from "../models/budget-stack";

// A playable budget stack: blocks inside a phone, read top to bottom while a
// budget (seconds of a first look, lines of a preview) runs out. A marker
// walks down on its own, slower over costly blocks; blocks it reaches are
// seen, blocks past the budget are greyed with a "not seen" tag. The learner
// taps a block and moves it (or drags it), and the marker runs again. Any
// course can use it with its own blocks and budget.

export type BudgetStackConfig = {
  /** Four to eight blocks, in the starting order. */
  blocks: StackBlock[];
  /** How much the reader spends, in `unit`. */
  budget: number;
  /** Short unit, for example "s" or "lines". */
  unit: string;
  /** Label at the top of the phone, for example "A quick first look (illustrative)". */
  budgetLabel: string;
  /** Proof blocks that must be seen for the goal. */
  goal: number;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
  /** The banner while the marker runs, at most 38 characters. */
  prompt?: string;
  /** Own wording for the verdict; `{seen}` and `{goal}` are filled in. */
  verdicts?: StackVerdicts;
};

export const STACK_DEFAULT_PROMPT = "Where does the budget run out?";

const LEAD_S = 0.5;
const PLAY_S = 4.5;
const HOLD_S = 2.6;
const G = STACK_GEO;
const W = G.width;
const PHONE_CX = G.phone.x + G.phone.w / 2;

const KIND_ICON: Record<StackKind, typeof BadgeCheck> = { proof: BadgeCheck, filler: Ellipsis, context: FileText };

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** "1 line", not "1 lines": a plural word unit drops its "s" for exactly one (short units such as "s" stay). */
function unitFor(n: number, unit: string): string {
  return n === 1 && /^[a-z]{3,}s$/.test(unit) ? unit.slice(0, -1) : unit;
}

export function BudgetStack({ title, limits, blocks, budget, unit, budgetLabel, goal, hint, prompt = STACK_DEFAULT_PROMPT, verdicts }: BudgetStackConfig & { title: string; limits: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [order, setOrder] = useState(() => blocks.map((b) => b.id));
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; y0: number; dy: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const [live, setLive] = useState("");
  const clock = useBeatClock(wrap);
  const settled = useSettledStart(clock.seconds);

  const ordered = orderBlocks(blocks, order);
  const rows = stackRows(ordered, budget);
  const layout = stackLayout(ordered);
  const H = stackHeight(blocks);
  const stackTop = G.firstTop;
  const lastBox = layout[layout.length - 1];
  const stackBottom = lastBox ? lastBox.y + lastBox.h : stackTop;
  const verdict = stackVerdict(rows, goal, verdicts);
  const spendAll = spendable(rows, budget);
  const ranOut = rows.length > 0 && rows[rows.length - 1].end > budget;

  // The marker's clock: lead in, spend the budget, hold the final frame, loop.
  const playS = PLAY_S * (budget > 0 ? spendAll / budget : 0);
  const cycle = LEAD_S + playS + HOLD_S;
  const final = settled || clock.reduced;
  const t = final ? cycle : clock.seconds % cycle;
  const spent = final ? spendAll : Math.max(0, Math.min(1, (t - LEAD_S) / Math.max(playS, 0.001))) * spendAll;
  const stopped = final || t >= LEAD_S + playS;
  const mark = markerAt(rows, spent);
  const markBox = layout[mark.index];
  const markerY = markBox ? markBox.y + Math.min(1, mark.frac) * markBox.h : stackTop;
  const budgetY = (() => {
    const at = markerAt(rows, spendAll);
    const box = layout[at.index];
    return box ? box.y + Math.min(1, at.frac) * box.h : stackTop;
  })();

  const select = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    const b = blocks.find((x) => x.id === id);
    if (b) setLive(next ? `${b.label} selected. ${b.note ? `${b.note} ` : ""}Move it with Move up and Move down, or the arrow keys.` : `${b.label} put down.`);
  };

  const applyOrder = (next: string[], id: string) => {
    if (next.join() === order.join()) {
      setLive(next.indexOf(id) === 0 ? "Already at the top." : "Already at the bottom.");
      return;
    }
    setOrder(next);
    clock.restart();
    const b = blocks.find((x) => x.id === id);
    const v = stackVerdict(stackRows(orderBlocks(blocks, next), budget), goal, verdicts);
    setLive(`${b?.label} moved to place ${next.indexOf(id) + 1} of ${next.length}. ${v.text}.`);
  };

  const move = (dir: -1 | 1) => {
    if (selected) applyOrder(moveBlock(order, selected, dir), selected);
  };

  const unitsPerPx = () => {
    const r = svg.current?.getBoundingClientRect();
    return r && r.height > 0 ? H / r.height : 1;
  };

  // Where a dragged block would land: the number of other blocks whose middle is above its middle.
  const dropIndex = (id: string, dy: number) => {
    const box = layout.find((b) => b.id === id);
    if (!box) return order.indexOf(id);
    const mid = box.y + box.h / 2 + dy;
    return layout.filter((b) => b.id !== id && b.y + b.h / 2 < mid).length;
  };

  const onPointerDown = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    skipClick.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, y0: e.clientY, dy: 0, moved: false });
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dy = (e.clientY - drag.y0) * unitsPerPx();
    setDrag({ ...drag, dy, moved: drag.moved || Math.abs(dy) > 8 });
  };
  const onPointerUp = () => {
    if (!drag) return;
    if (drag.moved) {
      skipClick.current = true;
      setSelected(drag.id);
      applyOrder(moveTo(order, drag.id, dropIndex(drag.id, drag.dy)), drag.id);
    }
    setDrag(null);
  };

  const onKeyDown = (id: string) => (e: KeyboardEvent) => {
    if (selected !== id || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    applyOrder(moveBlock(order, id, e.key === "ArrowUp" ? -1 : 1), id);
  };

  const target = drag?.moved ? dropIndex(drag.id, drag.dy) : null;
  // The gap a dragged block would drop into, drawn as a short accent line.
  const targetY = (() => {
    if (target === null || !drag) return null;
    const others = layout.filter((b) => b.id !== drag.id);
    if (target === 0) return stackTop - G.block.gap / 2;
    const above = others[target - 1];
    return above ? above.y + above.h + G.block.gap / 2 : null;
  })();

  const lastSeen = rows.reduce((acc, r, i) => (r.seen ? i : acc), -1);
  const foldY = lastSeen >= 0 ? layout[lastSeen].y + layout[lastSeen].h + G.block.gap / 2 : stackTop - G.block.gap / 2;
  const banner: { text: string; tone: Tone } = stopped ? { text: verdict.text, tone: verdict.met ? "good" : "warn" } : { text: prompt, tone: "accent" };
  const pillY = Math.max(stackTop, Math.min(stackBottom - G.pill.h, (stopped ? budgetY : markerY) - G.pill.h / 2));
  const selectedBlock = blocks.find((b) => b.id === selected) ?? null;
  const noteLines = selectedBlock?.note ? wrapWords(selectedBlock.note, STACK_NOTE_CHARS).slice(0, 2) : blocks.some((b) => b.note) ? ["Tap a block to read its note and move it."] : [];
  const summary = `${budgetLabel}: ${fmt(budget)} ${unit}. ${rows.map((r) => `${r.block.label}, ${r.seen ? "seen" : "not seen"}`).join("; ")}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={selected ? "Move the selected block, or drag it. Tap it again to put it down." : hint}
      controls={
        selected ? (
          <>
            <BeatButton onClick={() => move(-1)}>Move up</BeatButton>
            <BeatButton onClick={() => move(1)}>Move down</BeatButton>
          </>
        ) : (
          <BeatButton onClick={clock.restart}>Replay</BeatButton>
        )
      }
    >
      <div ref={wrap} className="relative" onPointerDown={clock.freeze} onPointerUp={clock.unfreeze} onPointerLeave={clock.unfreeze} onPointerCancel={clock.unfreeze}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <title>{title}</title>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={banner.text} tone={banner.tone} />

          {/* The phone, with its label at the top. */}
          <rect x={G.phone.x} y={G.phone.top + 3} width={G.phone.w} height={H - 12 - G.phone.top} rx={G.phone.radius} className="fill-foreground/[0.06]" />
          <rect x={G.phone.x} y={G.phone.top} width={G.phone.w} height={H - 12 - G.phone.top} rx={G.phone.radius} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={2} />
          <rect x={PHONE_CX - 24} y={G.phone.top + 9} width={48} height={6} rx={3} className={NEUTRAL.faintFill} aria-hidden />
          <text x={PHONE_CX} y={G.phone.top + 36} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
            {phoneLabelText(budgetLabel, budget, unit)}
          </text>

          {/* The blocks. */}
          {rows.map((row, i) => {
            const box = layout[i];
            const b = row.block;
            const dragging = drag?.moved && drag.id === b.id;
            const reached = spent >= row.start + SEEN_SHARE * b.cost || (stopped && row.seen);
            const reading = !stopped && mark.index === i;
            const unseen = stopped && !row.seen;
            const isSel = selected === b.id;
            const Icon = KIND_ICON[b.kind];
            const cy = box.y + box.h / 2;
            const metaY = box.y + box.h - 11;
            const tag = unseen ? "not seen" : reached ? "seen" : null;
            const tagW = tag ? tag.length * 7 + 16 : 0;
            const tagTone: Tone | null = tag === "seen" ? (b.kind === "proof" ? "good" : "accent") : null;
            const stroke = isSel || dragging ? TONES.accent.stroke : reading ? TONES.accent.stroke : NEUTRAL.line;
            return (
              <g key={b.id} transform={dragging ? `translate(0 ${drag!.dy})` : undefined}>
                <rect
                  x={G.block.x}
                  y={box.y}
                  width={G.block.w}
                  height={box.h}
                  rx={12}
                  className={cn(isSel || dragging ? TONES.accent.softFill : NEUTRAL.surface, stroke, SHAPE_TRANSITION)}
                  strokeWidth={isSel || dragging ? 2.5 : reading ? 2 : 1.5}
                  strokeDasharray={unseen ? "5 4" : undefined}
                />
                <circle cx={G.block.x + 24} cy={cy} r={14} className={cn(b.kind === "proof" ? TONES.accent.softFill : "fill-muted", b.kind === "proof" ? TONES.accent.stroke : NEUTRAL.line)} strokeWidth={1.5} />
                <Icon x={G.block.x + 16} y={cy - 8} width={16} height={16} strokeWidth={2.25} className={cn("fill-none", b.kind === "proof" ? TONES.accent.stroke : NEUTRAL.doneStroke)} aria-hidden />
                {box.lines.map((line, li) => (
                  <text key={li} x={G.block.x + 48} y={box.y + (box.lines.length > 1 ? 20 : 21) + li * 16} className={cn(unseen ? NEUTRAL.mutedText : NEUTRAL.text, "text-[13.5px] font-bold")}>
                    {line}
                  </text>
                ))}
                <text x={G.block.x + 48} y={metaY} className={cn(NEUTRAL.mutedText, "text-[13px] font-medium tabular-nums")}>
                  {`${KIND_WORD[b.kind]} · ${fmt(b.cost)} ${unitFor(b.cost, unit)}`}
                </text>
                {tag ? (
                  <g>
                    <rect x={G.block.x + G.block.w - 10 - tagW} y={metaY - 13} width={tagW} height={18} rx={9} className={cn(tagTone ? TONES[tagTone].softFill : "fill-muted", tagTone ? TONES[tagTone].stroke : NEUTRAL.line)} strokeWidth={1} strokeDasharray={tagTone ? undefined : "3 2"} />
                    <text x={G.block.x + G.block.w - 10 - tagW / 2} y={metaY} textAnchor="middle" className={cn(tagTone ? TONES[tagTone].text : NEUTRAL.text, "text-[13px] font-semibold")}>
                      {tag}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Where a dragged block would drop. */}
          {targetY !== null ? <line x1={G.block.x} x2={G.block.x + G.block.w} y1={targetY} y2={targetY} className={TONES.accent.stroke} strokeWidth={3} strokeLinecap="round" /> : null}

          {/* The fold: blocks under this line were not seen. */}
          {stopped && ranOut && lastSeen < rows.length - 1 ? (
            <line x1={G.phone.x + 4} x2={G.rail.x + G.rail.w + 2} y1={foldY} y2={foldY} className={TONES.warn.stroke} strokeWidth={2} strokeDasharray="6 4" />
          ) : null}

          {/* The rail beside the phone: the budget spent so far, the marker, and the readout. */}
          <rect x={G.rail.x} y={stackTop} width={G.rail.w} height={stackBottom - stackTop} rx={2} className={NEUTRAL.faintFill} />
          <rect x={G.rail.x} y={stackTop} width={G.rail.w} height={Math.max(0, (stopped ? budgetY : markerY) - stackTop)} rx={2} className={TONES.accent.solidFill} />
          {ranOut && stopped ? <line x1={G.rail.x - 6} x2={G.rail.x + G.rail.w + 6} y1={budgetY} y2={budgetY} className={TONES.warn.stroke} strokeWidth={2.5} strokeLinecap="round" /> : null}
          {!stopped ? <path d={`M ${G.phone.x + 2} ${markerY - 6} L ${G.phone.x + 10} ${markerY} L ${G.phone.x + 2} ${markerY + 6} Z`} className={TONES.accent.solidFill} aria-hidden /> : null}
          <rect x={G.pill.x} y={pillY} width={G.pill.w} height={G.pill.h} rx={12} className={cn(stopped && ranOut ? TONES.warn.softFill : TONES.accent.softFill, stopped && ranOut ? TONES.warn.stroke : TONES.accent.stroke)} strokeWidth={1.5} />
          <text x={G.pill.x + G.pill.w / 2} y={pillY + 17} textAnchor="middle" className={cn(stopped && ranOut ? TONES.warn.text : TONES.accent.text, "text-[13px] font-bold tabular-nums")}>
            {`${stopped ? fmt(spendAll) : fmt(Math.floor(spent))} ${unitFor(stopped ? spendAll : Math.floor(spent), unit)}`}
          </text>
          {stopped ? (
            <text x={G.pill.x + G.pill.w / 2} y={pillY + G.pill.h + 17} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
              {ranOut ? "budget out" : "all read"}
            </text>
          ) : null}

          {/* The selected block's note, at the foot of the phone. */}
          {noteLines.map((line, i) => (
            <text key={`${i}-${line}`} x={PHONE_CX} y={stackBottom + 24 + i * 17} textAnchor="middle" className={cn(selectedBlock ? NEUTRAL.text : NEUTRAL.mutedText, "text-[13px] font-medium")}>
              {line}
            </text>
          ))}
        </svg>

        {/* Real buttons over the blocks: tap or Enter selects, arrow keys or the buttons move, a drag drops it in place. */}
        {rows.map((row, i) => {
          const box = layout[i];
          const b = row.block;
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={selected === b.id}
              aria-label={`${b.label}. ${KIND_WORD[b.kind]}, ${fmt(b.cost)} ${unitFor(b.cost, unit)}. Place ${i + 1} of ${rows.length}. ${row.seen ? "Seen" : "Not seen"} within the budget.${b.note ? ` ${b.note}` : ""}`}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false;
                  return;
                }
                select(b.id);
              }}
              onKeyDown={onKeyDown(b.id)}
              onPointerDown={onPointerDown(b.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => setDrag(null)}
              className={cn("absolute cursor-grab touch-none rounded-xl", FOCUS_RING, drag?.moved && "cursor-grabbing")}
              style={{ left: `${(G.block.x / W) * 100}%`, top: `${(box.y / H) * 100}%`, width: `${(G.block.w / W) * 100}%`, height: `${(box.h / H) * 100}%` }}
            />
          );
        })}
        <p className="sr-only" aria-live="polite">{live}</p>
      </div>
    </BeatFrame>
  );
}
