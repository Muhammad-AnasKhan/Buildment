"use client";

import { useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatActionButton, BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { RULES, START, cartsFor, describeResult, editText, grade, intendedFor, listItems, merge, stampsFor, verdict, type CaseId, type Item, type Rule } from "./model";

const W = 420;
const H = 430;
const LANE = { hana: 186, dina: 230 };
const CELL_X: Record<Item, number> = { eggs: 118, milk: 228, tea: 338 };
const RESULT_Y = 322;
const MEANT_Y = 392;
const ARROW = { x: 210, y0: 258, y1: 284 };

const PILL_W: Record<Item, number> = { eggs: 44, milk: 44, tea: 38 };

/** A row of small item pills starting at x. */
function Items({ items, x, y }: { items: readonly Item[]; x: number; y: number }) {
  const lefts = items.map((_, i) => x + items.slice(0, i).reduce((sum, it) => sum + PILL_W[it] + 6, 0));
  return (
    <>
      {items.map((it, i) => {
        const w = PILL_W[it];
        const at = lefts[i];
        return (
          <g key={it}>
            <rect x={at} y={y - 12} width={w} height={24} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={at + w / 2} y={y + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
              {it}
            </text>
          </g>
        );
      })}
    </>
  );
}

/** 13.6: pick a merge rule and see the cart it makes from one conflict. */
export function CartMergeCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [rule, setRule] = useState<Rule>("union");
  const [caseId, setCaseId] = useState<CaseId>(1);
  const [flipped, setFlipped] = useState(false);

  const carts = cartsFor(caseId);
  const stamps = stampsFor(flipped);
  const result = merge(rule, caseId, flipped);
  const intended = intendedFor(caseId);
  const marks = grade(result, intended);
  const v = verdict(rule, caseId, flipped);
  const info = RULES.find((r) => r.id === rule)!;
  const summary = describeResult(rule, caseId, flipped);

  const lanes = [
    { who: "hana" as const, name: "Hana", y: LANE.hana, cart: carts.hana, stamp: stamps.hana, tone: "bad" as const },
    { who: "dina" as const, name: "Dina", y: LANE.dina, cart: carts.dina, stamp: stamps.dina, tone: "good" as const },
  ];
  const phase = clock.reduced ? -1 : (clock.seconds / 1.4) % 1;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>rule</b>. Then switch the case. <b>Flip stamps</b> shows what last write wins does when Hana saves last.
        </>
      }
      controls={
        <>
          <BeatChoice<"1" | "2">
            label="Which conflict"
            options={[
              { id: "1", label: "Case 1" },
              { id: "2", label: "Case 2" },
            ]}
            value={String(caseId) as "1" | "2"}
            onChange={(id) => setCaseId(id === "1" ? 1 : 2)}
          />
          <BeatActionButton onClick={() => setFlipped((f) => !f)}>Flip stamps</BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{`The cart starts as ${listItems(START)}. ${caseId === 1 ? "Hana removes milk while Dina adds tea" : "Hana removes milk while Dina adds milk again"}. ${summary}`}</desc>
          <DotGrid width={W} height={H} />

          {/* The four rules. */}
          <g role="radiogroup" aria-label="Merge rule">
            {RULES.map((r, i) => (
              <SvgRadioChip key={r.id} x={i % 2 === 0 ? 16 : 218} y={68 + Math.floor(i / 2) * 40} width={186} text={r.label} label={r.label} checked={rule === r.id} onSelect={() => setRule(r.id)} />
            ))}
          </g>

          {/* The two edits, side by side in time. */}
          <text x={W / 2} y={150} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px]")}>
            {`Cart began as ${listItems(START)}. Both edit at once:`}
          </text>
          {lanes.map((l) => (
            <g key={l.who}>
              <text x={12} y={l.y + 4.5} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{l.name}</text>
              <rect x={58} y={l.y - 14} width={112} height={28} rx={14} strokeWidth={2} className={cn(NEUTRAL.surface, TONES[l.tone].stroke)} />
              <text x={114} y={l.y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{editText(l.who, caseId)}</text>
              <rect x={176} y={l.y - 11} width={66} height={22} rx={11} className={cn(stamps[l.who] === Math.max(stamps.hana, stamps.dina) ? TONES.accent.softFill : "fill-muted")} />
              <text x={209} y={l.y + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{`stamp ${l.stamp}`}</text>
              <line x1={248} x2={262} y1={l.y} y2={l.y} strokeWidth={1.75} className={NEUTRAL.doneStroke} />
              <polygon points={`266,${l.y} 258,${l.y - 4.5} 258,${l.y + 4.5}`} className={NEUTRAL.doneFill} />
              <Items items={l.cart} x={272} y={l.y} />
            </g>
          ))}

          {/* The merge. */}
          <line x1={ARROW.x} x2={ARROW.x} y1={ARROW.y0} y2={ARROW.y1 - 6} strokeWidth={2} className={NEUTRAL.doneStroke} />
          <polygon points={`${ARROW.x},${ARROW.y1} ${ARROW.x - 5},${ARROW.y1 - 9} ${ARROW.x + 5},${ARROW.y1 - 9}`} className={NEUTRAL.doneFill} />
          {phase >= 0 ? <circle cx={ARROW.x} cy={ARROW.y0 + (ARROW.y1 - ARROW.y0) * phase} r={3.5} opacity={Math.sin(Math.PI * phase)} className={TONES.accent.solidFill} /> : null}
          <text x={ARROW.x + 14} y={ARROW.y0 + 15} className={cn(NEUTRAL.mutedText, "text-[12.5px] font-medium")}>{`merge: ${info.short}`}</text>

          {/* The cart the rule makes, item by item against what they meant. */}
          <text x={12} y={RESULT_Y + 4.5} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Cart</text>
          {marks.map((m) => {
            const cx = CELL_X[m.item];
            const tone = m.mark === "right" ? "good" : "bad";
            const lost = m.mark === "lost";
            return (
              <g key={m.item}>
                <rect x={cx - 36} y={RESULT_Y - 15} width={72} height={30} rx={15} strokeWidth={2} strokeDasharray={lost ? "4 3" : undefined} className={cn(lost ? "fill-muted" : TONES[tone].softFill, TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                {m.mark === "right" ? <Check x={cx - 28} y={RESULT_Y - 7} width={14} height={14} strokeWidth={3} className="fill-none text-emerald-600 dark:text-emerald-400" aria-hidden /> : null}
                <text x={cx + (m.mark === "right" ? 8 : 0)} y={RESULT_Y + 4.5} textAnchor="middle" opacity={lost ? 0.6 : 1} className={cn(lost ? NEUTRAL.mutedText : TONES[tone].text, "text-[12.5px] font-bold")}>
                  {m.item}
                </text>
                {m.mark !== "right" ? (
                  <g>
                    <rect x={cx - 24} y={RESULT_Y + 20} width={48} height={20} rx={10} className={TONES.bad.softFill} />
                    <text x={cx} y={RESULT_Y + 34} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold")}>{m.mark}</text>
                  </g>
                ) : null}
              </g>
            );
          })}

          <text x={12} y={MEANT_Y + 4.5} className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>They meant</text>
          {intended.map((it) => (
            <g key={it}>
              <rect x={CELL_X[it] - 24} y={MEANT_Y - 12} width={48} height={24} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={CELL_X[it]} y={MEANT_Y + 4.2} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{it}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 10} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>{info.why}</text>

          <VerdictBanner width={W} text={v.text} tone={v.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{summary}</p>
      </div>
    </BeatFrame>
  );
}
