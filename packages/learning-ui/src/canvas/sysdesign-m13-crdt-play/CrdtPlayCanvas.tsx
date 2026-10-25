"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { INTENDED, REPLICAS, SET_TYPES, cartText, initialReplicas, listItems, mergeInto, rows, verdict, visible, type Replica, type Replicas, type SetType } from "./model";

const W = 420;
const H = 366;
const CARD = { w: 126, h: 192, gap: 8, x0: 13, y: 56 };
const cardLeft = (i: number) => CARD.x0 + i * (CARD.w + CARD.gap);
const cardCx = (i: number) => cardLeft(i) + CARD.w / 2;
const BOTTOM = CARD.y + CARD.h;
const FLIGHT = 0.7;

/** A point on the curve under the cards from one replica to another. */
function arc(from: number, to: number, u: number): { x: number; y: number } {
  const x0 = cardCx(from);
  const x1 = cardCx(to);
  const y0 = BOTTOM + 4;
  const cy = BOTTOM + 52;
  const v = 1 - u;
  return { x: Math.round((v * v * x0 + 2 * v * u * ((x0 + x1) / 2) + u * u * x1) * 100) / 100, y: Math.round((v * v * y0 + 2 * v * u * cy + u * u * y0) * 100) / 100 };
}

/** 13.7: merge three replicas in any order, for three kinds of set. */
export function CrdtPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [type, setType] = useState<SetType>("plain");
  const [reps, setReps] = useState<Replicas>(() => initialReplicas("plain"));
  const [source, setSource] = useState<Replica | null>(null);
  const [merges, setMerges] = useState(0);
  const [last, setLast] = useState<{ from: Replica; to: Replica } | null>(null);

  const v = verdict(type, reps);
  const t = last ? clock.seconds : 0;
  const flying = last && t < FLIGHT ? arc(REPLICAS.indexOf(last.from), REPLICAS.indexOf(last.to), t / FLIGHT) : null;

  const changeType = (next: SetType) => {
    setType(next);
    setReps(initialReplicas(next));
    setSource(null);
    setMerges(0);
    setLast(null);
  };
  const reset = () => changeType(type);
  const tap = (r: Replica) => {
    if (source === null) return setSource(r);
    if (source === r) return setSource(null);
    setReps(mergeInto(reps, source, r));
    setMerges(merges + 1);
    setLast({ from: source, to: r });
    setSource(null);
    clock.restart();
  };
  const onKeys = (e: KeyboardEvent<SVGGElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const all = Array.from(e.currentTarget.querySelectorAll<SVGElement>('[role="button"]'));
    const at = all.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
    const next = all[(Math.max(0, at) + step + all.length) % all.length];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const status = source ? `Merge ${source} into which replica?` : last ? `Last merge: ${last.from} into ${last.to}` : "Tap a replica, then another to merge it in";
  const announce = `${source ? `${source} selected. Pick the replica to merge ${source} into. ` : last ? `Merged ${last.from} into ${last.to}. ` : ""}${v.text}`;
  const description = `Three replicas of a cart, using a ${SET_TYPES.find((s) => s.id === type)!.label}. ${REPLICAS.map((r) => `Replica ${r} shows ${listItems(visible(type, reps[r]))}`).join(". ")}. ${merges} merges so far. ${v.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>replica</b> to pick the source, then another to merge it in. Try the other set types.
        </>
      }
      controls={
        <>
          <BeatSegmented<SetType> label="Type" options={SET_TYPES} value={type} onChange={changeType} />
          <BeatActionButton onClick={reset}>Reset</BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Merge arrow from the last source to the last target. */}
          {last && !source ? (
            <path
              d={`M${cardCx(REPLICAS.indexOf(last.from))} ${BOTTOM + 4} Q${(cardCx(REPLICAS.indexOf(last.from)) + cardCx(REPLICAS.indexOf(last.to))) / 2} ${BOTTOM + 52} ${cardCx(REPLICAS.indexOf(last.to))} ${BOTTOM + 4}`}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              className={TONES.accent.stroke}
            />
          ) : null}
          {last && !source ? (
            <polygon
              points={`${cardCx(REPLICAS.indexOf(last.to))},${BOTTOM + 2} ${cardCx(REPLICAS.indexOf(last.to)) - 5},${BOTTOM + 13} ${cardCx(REPLICAS.indexOf(last.to)) + 5},${BOTTOM + 13}`}
              className={TONES.accent.solidFill}
            />
          ) : null}
          {flying ? <circle cx={flying.x} cy={flying.y} r={5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} /> : null}

          <g role="group" aria-label="Replicas" onKeyDown={onKeys}>
            {REPLICAS.map((r, i) => {
              const left = cardLeft(i);
              const picked = source === r;
              const list = rows(type, reps[r]);
              const items = visible(type, reps[r]);
              return (
                <SvgButton
                  key={r}
                  x={left - 5}
                  y={CARD.y - 5}
                  width={CARD.w + 10}
                  height={CARD.h + 10}
                  rx={19}
                  label={source && !picked ? `Replica ${r}, merge ${source} into ${r}` : `Replica ${r}${picked ? ", selected as source" : ""}, cart ${listItems(items)}`}
                  pressed={picked}
                  onPress={() => tap(r)}
                >
                  {picked ? <rect x={left - 5} y={CARD.y - 5} width={CARD.w + 10} height={CARD.h + 10} rx={19} strokeWidth={2.5} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                  <rect x={left} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                  <rect x={left} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, picked ? TONES.accent.stroke : NEUTRAL.line)} />
                  <circle cx={left + 17} cy={CARD.y + 18} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
                  <Server x={left + 9} y={CARD.y + 10} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                  <text x={left + 34} y={CARD.y + 23} className={cn(NEUTRAL.text, "text-[14px] font-bold")}>{`Replica ${r}`}</text>
                  {list.length === 0 ? (
                    <text x={left + 14} y={CARD.y + 58} className={cn(NEUTRAL.mutedText, "text-[12px]")}>(empty)</text>
                  ) : (
                    list.map((row, j) => (
                      <g key={row.text}>
                        <rect x={left + 8} y={CARD.y + 40 + j * 24} width={CARD.w - 16} height={22} rx={11} className={row.removed ? TONES.bad.softFill : "fill-muted"} />
                        <text x={left + 16} y={CARD.y + 55 + j * 24} className={cn(row.removed ? TONES.bad.text : NEUTRAL.text, row.removed && "line-through", "text-[12px] font-medium")}>{row.text}</text>
                        {row.removed ? (
                          <text x={left + CARD.w - 14} y={CARD.y + 55 + j * 24} textAnchor="end" className={cn(TONES.bad.text, "text-[11.5px] font-semibold")}>gone</text>
                        ) : null}
                      </g>
                    ))
                  )}
                  <line x1={left + 10} x2={left + CARD.w - 10} y1={CARD.y + 144} y2={CARD.y + 144} strokeWidth={1.5} className={NEUTRAL.line} />
                  <text x={left + 12} y={CARD.y + 163} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>cart</text>
                  <text x={left + 12} y={CARD.y + 181} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{cartText(items)}</text>
                </SvgButton>
              );
            })}
          </g>

          <text x={W / 2} y={BOTTOM + 78} textAnchor="middle" className={cn(source ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-semibold")}>{status}</text>
          <text x={14} y={H - 14} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{`merges used: ${merges}`}</text>
          <text x={W - 14} y={H - 14} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12.5px]")}>{`They meant: ${INTENDED.join(", ")}`}</text>

          <VerdictBanner width={W} text={v.text} tone={v.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>
    </BeatFrame>
  );
}
