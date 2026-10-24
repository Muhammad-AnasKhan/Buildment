"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  ACCOUNTS,
  ALL_IDS,
  balanceText,
  barScale,
  books,
  booksValueText,
  booksVerdict,
  ENTRIES,
  entryText,
  shown,
  sideWord,
  type Entry,
  type Step,
} from "../models/ledger-entries";

const W = 420;
const H = 348;
const CARD = { x: 6, w: 226, h: 40, pitch: 46, top: 50 };
const PANEL = { x0: 240, x1: 414 };
const BARS = { base: 176, max: 100, w: 44, debitX: 262, creditX: 348 };
const PILL_TOPS = [246, 272, 298] as const;
const COUNT_Y = 338;

const r1 = (v: number) => Math.round(v * 10) / 10;

function press(fn: () => void) {
  return {
    onClick: fn,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    },
  };
}

function EntryCard({ entry, slot, included, onToggle }: { entry: Entry; slot: number; included: boolean; onToggle: () => void }) {
  const top = CARD.top + slot * CARD.pitch;
  const debit = entry.side === "debit";
  const text = entryText(entry);
  return (
    <g role="button" tabIndex={0} aria-pressed={included} aria-label={`${text}, ${included ? "included" : "missing"}`} className="group cursor-pointer outline-none" {...press(onToggle)}>
      <rect x={CARD.x} y={top + 3} width={CARD.w} height={CARD.h} rx={12} className={included ? "fill-foreground/[0.06]" : "fill-transparent"} />
      <rect
        x={CARD.x}
        y={top}
        width={CARD.w}
        height={CARD.h}
        rx={12}
        strokeWidth={1.5}
        strokeDasharray={included ? undefined : "5 4"}
        className={cn(NEUTRAL.surface, included ? NEUTRAL.line : NEUTRAL.faintStroke, "transition-colors duration-200 group-hover:stroke-muted-foreground motion-reduce:transition-none")}
      />
      <rect
        x={CARD.x + 8}
        y={top + 10}
        width={46}
        height={20}
        rx={10}
        className={cn(included ? (debit ? TONES.accent.softFill : "fill-muted") : "fill-transparent", included ? "" : cn(NEUTRAL.faintStroke))}
        strokeWidth={included ? 0 : 1}
        strokeDasharray={included ? undefined : "3 3"}
      />
      <text x={CARD.x + 31} y={top + 24} textAnchor="middle" className={cn(included ? (debit ? TONES.accent.text : NEUTRAL.text) : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
        {sideWord(entry.side)}
      </text>
      <text x={CARD.x + 62} y={top + 25} className={cn(included ? NEUTRAL.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
        {entry.account}
      </text>
      <text x={CARD.x + CARD.w - 10} y={top + 25} textAnchor="end" className={cn(included ? NEUTRAL.text : TONES.bad.text, included ? "text-[14px] font-bold tabular-nums" : "text-[11.5px] font-semibold")}>
        {included ? entry.amount : "missing"}
      </text>
      <rect x={CARD.x - 3} y={top - 3} width={CARD.w + 6} height={CARD.h + 6} rx={14} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </g>
  );
}

/** A refund card shown before the refund step: faint, and not a button. */
function GhostCard({ entry, slot }: { entry: Entry; slot: number }) {
  const top = CARD.top + slot * CARD.pitch;
  return (
    <g aria-hidden opacity={0.55}>
      <rect x={CARD.x} y={top} width={CARD.w} height={CARD.h} rx={12} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-transparent", NEUTRAL.faintStroke)} />
      <text x={CARD.x + 31} y={top + 24} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
        {sideWord(entry.side)}
      </text>
      <text x={CARD.x + 62} y={top + 25} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
        {entry.account}
      </text>
      <text x={CARD.x + CARD.w - 10} y={top + 25} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[14px] font-bold tabular-nums")}>
        {entry.amount}
      </text>
    </g>
  );
}

/** 25.3 beat 3: tap entries out of a sale and a refund and watch debits and credits. */
export function PostEntriesCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [step, setStep] = useState<Step>("sale");
  const [included, setIncluded] = useState<ReadonlySet<string>>(() => new Set(ALL_IDS));

  const b = books(step, included);
  const verdict = booksVerdict(step, b);
  const scale = barScale(step);
  const toggle = (id: string) =>
    setIncluded((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const barH = (total: number) => r1(Math.max(0, Math.min(1, total / scale)) * BARS.max);
  const hD = barH(b.debits);
  const hC = barH(b.credits);
  const beamTone = b.count === 0 ? null : b.balanced ? "good" : "bad";
  const barFill = (debit: boolean) => (b.balanced ? TONES.good.solidFill : debit ? TONES.accent.solidFill : "fill-muted-foreground/55");
  const beamLeft = { x: BARS.debitX + BARS.w / 2, y: BARS.base - hD };
  const beamRight = { x: BARS.creditX + BARS.w / 2, y: BARS.base - hC };

  const visible = shown(step);
  const description = `${booksValueText(step, b)}.`;
  const entryWord = b.count === 1 ? "entry" : "entries";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <BeatChoice<Step>
          label="Step"
          options={[
            { id: "sale", label: "Sale" },
            { id: "refund", label: "Refund" },
          ]}
          value={step}
          onChange={setStep}
        />
      }
      hint={
        <>
          Tap an <b>entry</b> to take it out, tap again to put it back. <b>Refund</b> adds three reversing entries.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
        <DotGrid width={W} height={H} />

        {/* The entries, one card each. Before the refund step its three entries wait, faint, below the sale. */}
        {visible.map((e) => (
          <EntryCard key={e.id} entry={e} slot={ENTRIES.indexOf(e)} included={included.has(e.id)} onToggle={() => toggle(e.id)} />
        ))}
        {step === "sale" ? ENTRIES.filter((e) => e.step === "refund").map((e) => <GhostCard key={e.id} entry={e} slot={ENTRIES.indexOf(e)} />) : null}

        {/* Two bars and a beam between their tops: level when the books balance. */}
        <g aria-hidden>
          {[BARS.debitX, BARS.creditX].map((x) => (
            <rect key={x} x={x} y={BARS.base - BARS.max} width={BARS.w} height={BARS.max} rx={8} className="fill-muted" />
          ))}
          {hD > 0 ? <rect x={BARS.debitX} y={r1(BARS.base - hD)} width={BARS.w} height={hD} rx={8} className={barFill(true)} /> : null}
          {hC > 0 ? <rect x={BARS.creditX} y={r1(BARS.base - hC)} width={BARS.w} height={hC} rx={8} className={barFill(false)} /> : null}
          <line
            x1={beamLeft.x}
            x2={beamRight.x}
            y1={beamLeft.y}
            y2={beamRight.y}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={beamTone ? undefined : "2 5"}
            className={beamTone ? TONES[beamTone].stroke : NEUTRAL.faintStroke}
          />
          <circle cx={beamLeft.x} cy={beamLeft.y} r={5} className={cn(beamTone ? TONES[beamTone].solidFill : NEUTRAL.faintFill, "stroke-card")} strokeWidth={2} />
          <circle cx={beamRight.x} cy={beamRight.y} r={5} className={cn(beamTone ? TONES[beamTone].solidFill : NEUTRAL.faintFill, "stroke-card")} strokeWidth={2} />
          {[
            { x: BARS.debitX, name: "Debits", total: b.debits },
            { x: BARS.creditX, name: "Credits", total: b.credits },
          ].map((t) => (
            <g key={t.name}>
              <text x={t.x + BARS.w / 2} y={BARS.base + 20} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
                {t.name}
              </text>
              <text x={t.x + BARS.w / 2} y={BARS.base + 40} textAnchor="middle" className={cn(NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>
                {t.total}
              </text>
            </g>
          ))}
        </g>

        {/* The balance of each account. */}
        <text x={PANEL.x0} y={PILL_TOPS[0] - 8} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
          Balance of each account
        </text>
        {ACCOUNTS.map((a, i) => {
          const used = visible.some((e) => e.account === a && included.has(e.id));
          const zero = used && b.balances[a] === 0;
          return (
            <g key={a} aria-hidden>
              <rect x={PANEL.x0} y={PILL_TOPS[i]} width={PANEL.x1 - PANEL.x0} height={22} rx={11} className={zero ? TONES.good.softFill : "fill-muted"} />
              <text x={PANEL.x0 + 10} y={PILL_TOPS[i] + 15} className={cn(zero ? TONES.good.text : NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>
                {balanceText(a, b.balances[a])}
              </text>
            </g>
          );
        })}
        <text x={PANEL.x0} y={COUNT_Y} className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>
          {`${b.count} ${entryWord}`}
        </text>

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
