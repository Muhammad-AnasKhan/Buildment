"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailStrip } from "../primitives/rail-strip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  CHANGES,
  CHANGE_LABELS,
  DEFAULT_CHANGE,
  VISIBLE_SLOTS,
  changeFromFraction,
  changeToFraction,
  pagingState,
  pagingVerdict,
  type BookView,
  type Change,
  type PagingMode,
} from "../models/paging-insert";

const W = 420;
const H = 280;
const CARD = { x: 132, w: 156, h: 24 };
const Y0 = 48;
const PITCH = 28;
const PAGE_H = 3 * PITCH - 4;
const SLIDE = "transform 350ms ease, opacity 300ms ease";

const slotY = (slot: number) => Y0 + slot * PITCH;

function cardLook(b: BookView) {
  if (b.deleted) return { rect: cn("fill-card", NEUTRAL.faintStroke), dash: "5 4", tag: "deleted", tagClass: NEUTRAL.mutedText, name: NEUTRAL.mutedText };
  if (b.skipped) return { rect: cn(TONES.bad.softFill, TONES.bad.stroke), dash: "5 4", tag: "never shown", tagClass: TONES.bad.text, name: TONES.bad.text };
  if (b.again) return { rect: cn(TONES.warn.softFill, TONES.warn.stroke), dash: undefined, tag: "again", tagClass: TONES.warn.text, name: TONES.warn.text };
  if (b.onPageTwo) return { rect: cn(TONES.accent.softFill, TONES.accent.stroke), dash: undefined, tag: "", tagClass: "", name: NEUTRAL.text };
  if (b.isNew) return { rect: cn(NEUTRAL.surface, NEUTRAL.line), dash: undefined, tag: "new", tagClass: TONES.accent.text, name: NEUTRAL.text };
  return { rect: cn(b.onPageOne ? "fill-muted" : NEUTRAL.surface, NEUTRAL.line), dash: undefined, tag: "", tagClass: "", name: NEUTRAL.text };
}

/** 6.3: change the list between page 1 and page 2, then page by offset or by cursor. */
export function PagingInsertCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [k, setK] = useState<Change>(DEFAULT_CHANGE);
  const [mode, setMode] = useState<PagingMode>("offset");
  const titleId = useId();
  const descId = useId();
  const state = pagingState(k, mode);
  const verdict = pagingVerdict(k, mode);
  const page2 = state.pageTwo.join(", ");
  const description = `Huda saw books 9, 8 and 7 on page 1. Then ${k === -1 ? "book 8 was deleted" : k === 0 ? "nothing changed" : `${k} new book${k === 1 ? " was" : "s were"} added`}. Page 2 by ${mode} shows books ${page2}. ${verdict.text}.`;

  const mid1 = slotY(state.pageOneSlots[0]) + PAGE_H / 2;
  const mid2 = slotY(state.pageTwoSlots[0]) + PAGE_H / 2;
  const bracket = (x: number, side: 1 | -1) => `M ${x + 4 * side} 0 L ${x} 0 L ${x} ${PAGE_H} L ${x + 4 * side} ${PAGE_H}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the rail to change the list between the pages, then switch <b>offset</b> and <b>cursor</b>.</>}
      controls={
        <>
          <BeatButton pressed={mode === "offset"} onClick={() => setMode("offset")}>Offset</BeatButton>
          <BeatButton pressed={mode === "cursor"} onClick={() => setMode("cursor")}>Cursor</BeatButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* Page 1, as Huda saw it before the change. */}
        <g style={{ transform: `translateY(${slotY(state.pageOneSlots[0])}px)`, transition: SLIDE }}>
          <path d={bracket(122, 1)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={NEUTRAL.doneStroke} />
        </g>
        <g style={{ transform: `translateY(${mid1}px)`, transition: SLIDE }}>
          <text x={112} y={-3} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>Page 1</text>
          <text x={112} y={13} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>Huda saw this</text>
        </g>

        {/* Page 2, as the API returns it now. */}
        <g style={{ transform: `translateY(${slotY(state.pageTwoSlots[0])}px)`, transition: SLIDE }}>
          <path d={bracket(298, -1)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
        </g>
        <g style={{ transform: `translateY(${mid2}px)`, transition: SLIDE }}>
          <text x={308} y={-3} className={cn(TONES.accent.text, "text-[12.5px] font-bold")}>Page 2</text>
          <text x={308} y={13} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{mode === "offset" ? "rows 4 to 6" : "older than 7"}</text>
        </g>

        {/* The books. Each keeps its card; the list makes room at the top. */}
        {state.books.map((b) => {
          const slot = b.slot === null ? -1 : Math.min(b.slot, VISIBLE_SLOTS);
          const look = cardLook(b);
          return (
            <g key={b.book} aria-hidden style={{ transform: `translateY(${slotY(slot)}px)`, transition: SLIDE, opacity: b.visible ? 1 : 0 }} className="pointer-events-none">
              <rect x={CARD.x} y={3} width={CARD.w} height={CARD.h} rx={8} className="fill-foreground/[0.05]" />
              <rect x={CARD.x} y={0} width={CARD.w} height={CARD.h} rx={8} strokeWidth={1.5} strokeDasharray={look.dash} className={look.rect} />
              <text x={CARD.x + 10} y={16.5} className={cn(look.name, "text-[12.5px] font-semibold")}>{`Book ${b.book}`}</text>
              {look.tag ? <text x={CARD.x + CARD.w - 10} y={16.5} textAnchor="end" className={cn(look.tagClass, "text-[11.5px] font-semibold")}>{look.tag}</text> : null}
            </g>
          );
        })}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <RailStrip
        label="Change between page 1 and page 2"
        valueText={CHANGE_LABELS[k]}
        value={k}
        ladder={CHANGES}
        fraction={changeToFraction(k)}
        fromFraction={changeFromFraction}
        onChange={(v) => setK(v as Change)}
        marks={CHANGES.map((c) => ({ at: changeToFraction(c), label: CHANGE_LABELS[c] }))}
        ends={["", ""]}
        caption="new books between page 1 and page 2"
      />
    </BeatFrame>
  );
}
