"use client";

import { useRef, useState, type PointerEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "./beat-frame";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { FOCUS_RING, LABEL_HALO, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "./tones";
import { svgPoint, tweenProgress, useReducedMotion, useTween } from "./use-motion";
import { wrapWords } from "../models/sorter";
import {
  ASSEMBLED_CHARS,
  counterLabel,
  filledCount,
  isComplete,
  isPlaced,
  placeChip,
  poolLayout,
  selectChip,
  SLOT_CHARS,
  SLOT_GEO,
  SLOT_STRIP_CHARS,
  slotFrame,
  slotsTop,
  slotVerdict,
  startSlots,
  type CardSlot,
  type SlotChip,
  type SlotState,
  type SlotVerdicts,
} from "../models/slot-card";

// A playable slot card: a claim card with labelled slots (metric, before,
// after, source...) and a pool of chips under it. Tap a chip, then a slot (or
// drag the chip onto the slot). A right chip snaps in; a guess, an adjective
// or a tool's estimate shakes, says why, and goes back to the pool. When
// every slot is full the card becomes one sentence a reader can check. Any
// course can use it with its own slots and chips.

export type SlotCardConfig = {
  /** The card's title, for example "Tawfiq's claim". At most 24 characters. */
  cardTitle: string;
  /** Three to six labelled slots, top to bottom. */
  slots: CardSlot[];
  /** Five to ten chips; each slot has exactly one right chip, the rest have `slot: null`. */
  chips: SlotChip[];
  /** The finished sentence shown once every slot is full, up to about 200 characters. */
  assembled: string;
  /** The original claim, shown small under the title. At most 44 characters. */
  claim?: string;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
  /** The lesson shown under the card once it is complete. */
  endNote: string;
  /** The banner before the first try, at most 38 characters. */
  prompt?: string;
  /** Own wording for the end banner; each line at most 38 characters. */
  verdicts?: SlotVerdicts;
};

export const SLOT_DEFAULT_PROMPT = "Fill every slot with a checkable part";

const G = SLOT_GEO;
const W = G.width;
const SHAKE_MS = 420;
const SNAP_MS = 200;
const FADE_MS = 220;

type Feedback = { kind: "right" | "wrong"; chip: string; slot: string; reason?: string; at: number };

export function SlotCard({ title, limits, cardTitle, slots, chips, assembled, claim, hint, endNote, prompt = SLOT_DEFAULT_PROMPT, verdicts }: SlotCardConfig & { title: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [round, setRound] = useState(0);
  const [state, setState] = useState<SlotState>(() => startSlots(slots, chips, 1));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [drag, setDrag] = useState<{ id: string; x0: number; y0: number; dx: number; dy: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const [live, setLive] = useState("");
  const reduced = useReducedMotion();
  const now = useTween(feedback ? feedback.at + Math.max(SHAKE_MS, FADE_MS) + 40 : 0, reduced);

  const frame = slotFrame(slots, chips, !!claim);
  const H = frame.height;
  const top = slotsTop(!!claim);
  const done = isComplete(state);
  const pool = poolLayout(state.order, chips, frame.poolTop);
  const byChip = new Map(chips.map((c) => [c.id, c]));
  const shakeP = feedback?.kind === "wrong" ? tweenProgress(now, feedback.at, SHAKE_MS, reduced) : 1;
  const snapP = feedback?.kind === "right" ? tweenProgress(now, feedback.at, SNAP_MS, reduced) : 1;
  const fadeP = done && feedback ? tweenProgress(now, feedback.at, FADE_MS, reduced) : 1;

  const rowY = (i: number) => top + i * G.slot.pitch;
  const slotAt = (x: number, y: number) => slots.findIndex((_, i) => x >= G.card.x && x <= G.card.x + G.card.w && y >= rowY(i) - 4 && y <= rowY(i) + G.slot.pitch - 4);

  const tryPlace = (slotId: string, chipId: string | null = state.selected) => {
    if (done) return;
    const slot = slots.find((s) => s.id === slotId);
    if (!chipId) {
      setLive(`${slot?.label}: pick a chip first, then tap this slot.`);
      return;
    }
    const { state: next, outcome } = placeChip(state, chips, slots, slotId, chipId);
    if (outcome.kind === "ignored") {
      if (state.filled[slotId]) setLive(`${slot?.label} is already filled.`);
      return;
    }
    setState(next);
    setFeedback({ kind: outcome.kind, chip: outcome.chip.id, slot: slotId, reason: outcome.kind === "wrong" ? outcome.reason : undefined, at: performance.now() });
    if (outcome.kind === "wrong") setLive(`Not ${outcome.slot.label}. ${outcome.reason} The chip went back to the pool.`);
    else if (isComplete(next)) setLive(`${slotVerdict(next, verdicts)}. ${assembled} ${endNote}`);
    else setLive(`Right: ${outcome.chip.text} fills ${outcome.slot.label}. ${counterLabel(next, slots)}.`);
  };

  const pick = (chipId: string) => {
    if (done) return;
    const next = selectChip(state, chipId);
    setState(next);
    const chip = byChip.get(chipId);
    setLive(next.selected ? `Picked up: ${chip?.text}. Now tap the slot it fills.` : `Put down: ${chip?.text}.`);
  };

  const again = () => {
    const r = round + 1;
    setRound(r);
    setState(startSlots(slots, chips, r + 1));
    setFeedback(null);
    setDrag(null);
    setLive("Every slot is empty again.");
  };

  const onChipDown = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    skipClick.current = false;
    const pt = svgPoint(svg.current, e);
    if (!pt) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, x0: pt.x, y0: pt.y, dx: 0, dy: 0, moved: false });
  };
  const onChipMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const pt = svgPoint(svg.current, e);
    if (!pt) return;
    const dx = pt.x - drag.x0;
    const dy = pt.y - drag.y0;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > 8 });
  };
  const onChipUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (drag.moved) {
      skipClick.current = true;
      const pt = svgPoint(svg.current, e);
      const i = pt ? slotAt(pt.x, pt.y) : -1;
      if (i >= 0) tryPlace(slots[i].id, drag.id);
    }
    setDrag(null);
  };

  const dropTarget = drag?.moved ? slotAt(drag.x0 + drag.dx, drag.y0 + drag.dy) : -1;

  let banner: { text: string; tone: Tone } = { text: prompt, tone: "accent" };
  if (done) banner = { text: slotVerdict(state, verdicts), tone: state.misses === 0 ? "good" : "accent" };
  else if (feedback?.kind === "wrong") banner = { text: "Not quite. It went back to the pool", tone: "warn" };
  else if (feedback?.kind === "right") banner = { text: `Right: ${slots.find((s) => s.id === feedback.slot)?.label ?? ""}`, tone: "good" };

  // The strip between the card and the pool.
  const selectedChip = state.selected ? byChip.get(state.selected) : null;
  let strip: { lines: string[]; className: string } = { lines: ["Tap a chip, then the slot it fills."], className: NEUTRAL.mutedText };
  if (done) strip = { lines: [], className: "" };
  else if (selectedChip) strip = { lines: wrapWords(`Picked up: ${selectedChip.text}. Now tap its slot.`, SLOT_STRIP_CHARS).slice(0, 2), className: TONES.accent.text };
  else if (feedback?.kind === "wrong") strip = { lines: wrapWords(feedback.reason ?? "", SLOT_STRIP_CHARS).slice(0, 2), className: TONES.bad.text };
  else if (feedback?.kind === "right") strip = { lines: [`It fits. ${counterLabel(state, slots)}.`], className: TONES.good.text };

  const shakeX = feedback?.kind === "wrong" && shakeP < 1 ? 9 * Math.sin(shakeP * Math.PI * 6) * (1 - shakeP) : 0;
  const bodyH = slots.length * G.slot.pitch - 8;
  const assembledLines = wrapWords(assembled, ASSEMBLED_CHARS);
  const assembledTop = top + (bodyH - assembledLines.length * G.assembledLine) / 2 + 16;
  const endLines = wrapWords(endNote, SLOT_STRIP_CHARS);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={done ? "Start again deals the chips in a new order." : hint}
      controls={done || filledCount(state) > 0 || state.misses > 0 ? <BeatButton onClick={again}>Start again</BeatButton> : null}
    >
      <div className="relative">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={done ? `${cardTitle}: ${assembled}` : `${cardTitle}. ${counterLabel(state, slots)}. ${slots.map((s) => `${s.label}: ${state.filled[s.id] ? byChip.get(state.filled[s.id]!)?.text : "empty"}`).join("; ")}.`}
          className="block h-auto w-full select-none"
        >
          <title>{title}</title>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={banner.text} tone={banner.tone} />

          {/* The card: title and counter, the original claim, then the slots (or the finished sentence). */}
          <rect x={G.card.x} y={G.card.top + 3} width={G.card.w} height={frame.cardBottom - G.card.top} rx={18} className="fill-foreground/[0.06]" />
          <rect x={G.card.x} y={G.card.top} width={G.card.w} height={frame.cardBottom - G.card.top} rx={18} className={cn(NEUTRAL.surface, done ? TONES.good.stroke : NEUTRAL.line)} strokeWidth={done ? 2 : 1.5} />
          <text x={G.slot.labelX} y={G.card.top + 26} className={cn(NEUTRAL.text, "text-[15px] font-bold")}>{cardTitle}</text>
          <text x={G.card.x + G.card.w - 14} y={G.card.top + 26} textAnchor="end" className={cn(done ? TONES.good.text : NEUTRAL.text, "text-[13px] font-semibold tabular-nums")}>
            {counterLabel(state, slots)}
          </text>
          {claim ? (
            <text x={G.slot.labelX} y={G.card.top + 48} className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
              {`Was: “${claim}”`}
            </text>
          ) : null}

          {fadeP < 1 || !done ? (
            <g opacity={done ? 1 - fadeP : 1}>
              {slots.map((s, i) => {
                const y = rowY(i);
                const chipId = state.filled[s.id];
                const chip = chipId ? byChip.get(chipId) : null;
                const arriving = feedback?.kind === "right" && feedback.slot === s.id && snapP < 1;
                const refused = feedback?.kind === "wrong" && feedback.slot === s.id && shakeP < 1;
                const target = dropTarget === i || (!!state.selected && !chip);
                const tone: Tone | null = refused ? "bad" : chip ? "good" : target ? "accent" : null;
                const lines = chip ? wrapWords(chip.text, SLOT_CHARS).slice(0, 2) : [];
                return (
                  <g key={s.id}>
                    <text x={G.slot.labelX} y={y + 27} className={cn(NEUTRAL.text, "text-[13.5px] font-bold")}>{s.label}</text>
                    <rect
                      x={G.slot.boxX}
                      y={y}
                      width={G.slot.boxW}
                      height={G.slot.h}
                      rx={12}
                      className={cn(tone ? TONES[tone].softFill : "fill-muted/40", tone ? TONES[tone].stroke : NEUTRAL.faintStroke, SHAPE_TRANSITION)}
                      strokeWidth={tone ? 2 : 1.5}
                      strokeDasharray={chip ? undefined : "5 4"}
                    />
                    {chip ? (
                      <g opacity={arriving ? snapP : 1}>
                        {lines.map((line, li) => (
                          <text key={li} x={G.slot.boxX + 12} y={y + (lines.length > 1 ? 19 : 27) + li * 16} className={cn(TONES.good.text, "text-[13px] font-semibold")}>
                            {line}
                          </text>
                        ))}
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </g>
          ) : null}

          {done ? (
            <g opacity={fadeP}>
              {assembledLines.map((line, i) => (
                <text key={i} x={G.slot.labelX} y={assembledTop + i * G.assembledLine} className={cn(NEUTRAL.text, "text-[15px] font-medium")}>
                  {line}
                </text>
              ))}
            </g>
          ) : null}

          {/* Feedback between the card and the pool. */}
          {strip.lines.map((line, i) => (
            <text key={`${i}-${line}`} x={W / 2} y={frame.stripTop + (strip.lines.length === 1 ? 24 : 16) + i * 16} textAnchor="middle" className={cn(strip.className, LABEL_HALO, "text-[13px] font-semibold")}>
              {line}
            </text>
          ))}

          {/* The pool, or the lesson once the card is complete. */}
          {done
            ? endLines.map((line, i) => (
                <text key={`${i}-${line}`} x={W / 2} y={frame.poolTop + 18 + i * G.noteLine} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13.5px] font-medium")} opacity={fadeP}>
                  {line}
                </text>
              ))
            : pool.map((box) => {
                if (isPlaced(state, box.id)) {
                  return <rect key={box.id} x={box.x} y={box.y} width={box.w} height={G.chip.h} rx={14} className={cn("fill-none", NEUTRAL.line)} strokeWidth={1} strokeDasharray="4 4" />;
                }
                const sel = state.selected === box.id;
                const dragging = drag?.moved && drag.id === box.id;
                const shaking = feedback?.kind === "wrong" && feedback.chip === box.id ? shakeX : 0;
                const dx = (dragging ? drag!.dx : 0) + shaking;
                const dy = dragging ? drag!.dy : sel ? -3 : 0;
                const tone: Tone | null = feedback?.kind === "wrong" && feedback.chip === box.id && shakeP < 1 ? "warn" : sel || dragging ? "accent" : null;
                return (
                  <g key={box.id} transform={dx || dy ? `translate(${dx} ${dy})` : undefined}>
                    <rect x={box.x} y={box.y + 3} width={box.w} height={G.chip.h} rx={14} className="fill-foreground/[0.06]" />
                    <rect x={box.x} y={box.y} width={box.w} height={G.chip.h} rx={14} className={cn(tone ? TONES[tone].softFill : NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line, SHAPE_TRANSITION)} strokeWidth={tone ? 2.5 : 1.5} />
                    {box.lines.map((line, li) => (
                      <text key={li} x={box.x + box.w / 2} y={box.y + (box.lines.length > 1 ? 19 : 27) + li * 16} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}
        </svg>

        {/* Real buttons over the slots and the chips, so tap, Tab and Enter all work. */}
        {done
          ? null
          : slots.map((s, i) => {
              const chipId = state.filled[s.id];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => tryPlace(s.id)}
                  aria-label={chipId ? `${s.label}: ${byChip.get(chipId)?.text}. Filled.` : `${s.label}: empty.${state.selected ? " Put the picked-up chip here." : " Pick a chip first."}`}
                  className={cn("absolute cursor-pointer rounded-xl", FOCUS_RING)}
                  style={{ left: `${((G.card.x + 6) / W) * 100}%`, top: `${((rowY(i) - 4) / H) * 100}%`, width: `${((G.card.w - 12) / W) * 100}%`, height: `${(G.slot.pitch / H) * 100}%` }}
                />
              );
            })}
        {done
          ? null
          : pool
              .filter((box) => !isPlaced(state, box.id))
              .map((box) => {
                const chip = byChip.get(box.id)!;
                return (
                  <button
                    key={box.id}
                    type="button"
                    aria-pressed={state.selected === box.id}
                    aria-label={`Chip: ${chip.text}`}
                    onClick={() => {
                      if (skipClick.current) {
                        skipClick.current = false;
                        return;
                      }
                      pick(box.id);
                    }}
                    onPointerDown={onChipDown(box.id)}
                    onPointerMove={onChipMove}
                    onPointerUp={onChipUp}
                    onPointerCancel={() => setDrag(null)}
                    className={cn("absolute cursor-grab touch-none rounded-2xl", FOCUS_RING, drag?.moved && "cursor-grabbing")}
                    style={{ left: `${(box.x / W) * 100}%`, top: `${((box.y - 3) / H) * 100}%`, width: `${(box.w / W) * 100}%`, height: `${((G.chip.h + 6) / H) * 100}%` }}
                  />
                );
              })}
        <p className="sr-only" aria-live="polite">{live}</p>
      </div>
    </BeatFrame>
  );
}
