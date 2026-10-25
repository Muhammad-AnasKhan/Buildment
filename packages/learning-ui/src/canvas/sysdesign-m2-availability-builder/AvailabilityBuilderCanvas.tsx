"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Database, Router, Server, Zap, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { weekOf, WEEK_COLUMNS, YearStrip } from "../primitives/year-strip";
import { availabilityVerdict, chainAvailability, formatAvailability, formatDowntime, redDays, type PartGroup } from "../models/availability";

export type BuilderPart = PartGroup & { kind: "router" | "server" | "cache" | "database"; full: string };

type Props = { title: string; purpose: string; limits: string; parts: readonly BuilderPart[]; maxCopies: number };

const W = 420;
const H = 322;
const CARD_W = 88;
const CARD_H = 56;
const GAP = 16;
const LEFT0 = 10;
const SLOT_Y = [78, 140, 202] as const;
const LINE_Y = SLOT_Y[0];
const STRIP = { x: 14, y: 248 };
const WEEK_S = 0.2;
const RED_WEEK_S = 1.4;
const DOT_GAP = 70;
const DOT_SPEED = 55;

const ICON: Record<BuilderPart["kind"], LucideIcon> = { router: Router, server: Server, cache: Zap, database: Database };
const BADGE: Record<BuilderPart["kind"], string> = {
  router: "fill-sky-100 dark:fill-sky-500/20",
  server: "fill-blue-100 dark:fill-blue-500/20",
  cache: "fill-amber-100 dark:fill-amber-500/20",
  database: "fill-emerald-100 dark:fill-emerald-500/20",
};
const ICON_COLOUR: Record<BuilderPart["kind"], string> = {
  router: "text-sky-700 dark:text-sky-300",
  server: "text-blue-700 dark:text-blue-300",
  cache: "text-amber-700 dark:text-amber-300",
  database: "text-emerald-700 dark:text-emerald-300",
};

const r2 = (v: number) => Math.round(v * 100) / 100;
const leftOf = (i: number) => LEFT0 + i * (CARD_W + GAP);

/** Which week the sweep is on: plain weeks pass quickly, weeks with downtime hold. */
function sweepWeek(seconds: number, redWeeks: ReadonlySet<number>): number {
  const dur = (w: number) => (redWeeks.has(w) ? RED_WEEK_S : WEEK_S);
  let loop = 0;
  for (let w = 0; w < WEEK_COLUMNS; w++) loop += dur(w);
  let t = seconds % loop;
  for (let w = 0; w < WEEK_COLUMNS; w++) {
    if (t < dur(w)) return w;
    t -= dur(w);
  }
  return WEEK_COLUMNS - 1;
}

/** 2.6: tap parts and copies; the nines, the downtime and the red days follow. */
export function AvailabilityBuilderCanvas({ title, limits, parts: start, maxCopies }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState<Record<string, number>>(() => Object.fromEntries(start.map((p) => [p.id, p.copies])));
  const { seconds, reduced } = useBeatClock(box);

  const parts = start.map((p) => ({ ...p, copies: copies[p.id] ?? 0 }));
  const result = chainAvailability(parts);
  const verdict = availabilityVerdict(result);
  const days = redDays(result);
  const redWeeks = new Set(days.map((d) => weekOf(d.day)));
  const week = reduced ? null : sweepWeek(seconds, redWeeks);
  const downId = week === null ? null : (days.find((d) => weekOf(d.day) === week)?.groupId ?? null);
  const downIndex = downId ? parts.findIndex((p) => p.id === downId) : -1;

  const set = (id: string, n: number) => setCopies((c) => ({ ...c, [id]: Math.max(0, Math.min(maxCopies, n)) }));

  // Request dots along the chain; inside a part with copies they take turns.
  const dots = (() => {
    if (reduced) return [];
    const out: { x: number; y: number; bad: boolean }[] = [];
    const offset = (seconds * DOT_SPEED) % DOT_GAP;
    for (let i = -1, x = offset - DOT_GAP; x < W; i++, x += DOT_GAP) {
      if (x < 0) continue;
      const lap = Math.floor((seconds * DOT_SPEED) / DOT_GAP) - i;
      let y = LINE_Y;
      let bad = false;
      parts.forEach((p, idx) => {
        const left = leftOf(idx);
        const n = p.copies;
        if (idx === downIndex && x > left - GAP / 2) bad = true;
        if (n < 2) return;
        const target = SLOT_Y[((lap % n) + n) % n];
        if (x >= left - GAP / 2 && x <= left + CARD_W + GAP / 2) {
          const into = Math.min(1, (x - (left - GAP / 2)) / (GAP / 2));
          const out = Math.min(1, (left + CARD_W + GAP / 2 - x) / (GAP / 2));
          y = LINE_Y + (target - LINE_Y) * Math.min(into, out);
        }
      });
      if (bad && downIndex >= 0 && x > leftOf(downIndex) + 4) continue;
      out.push({ x: r2(x), y: r2(y), bad });
    }
    return out;
  })();

  const press = (fn: () => void) => ({
    onClick: fn,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    },
  });

  const card = (p: BuilderPart, idx: number, slot: number) => {
    const left = leftOf(idx);
    const top = SLOT_Y[slot] - CARD_H / 2;
    const Icon = ICON[p.kind];
    const isDown = idx === downIndex;
    const label = slot === 0 ? (p.copies > 1 ? `Take ${p.full} and its copies out of the chain` : `Take ${p.full} out of the chain`) : `Remove copy ${slot + 1} of ${p.full}`;
    const pillTone = isDown ? TONES.bad : null;
    return (
      <g key={`${p.id}-${slot}`} role="button" tabIndex={0} aria-label={label} className="group cursor-pointer outline-none" {...press(() => set(p.id, slot))}>
        {isDown ? <rect x={left - 4} y={top - 4} width={CARD_W + 8} height={CARD_H + 8} rx={16} className={cn("fill-none", TONES.bad.stroke)} strokeWidth={2.5} /> : null}
        <rect x={left} y={top + 3} width={CARD_W} height={CARD_H} rx={12} className="fill-foreground/[0.06]" />
        <rect x={left} y={top} width={CARD_W} height={CARD_H} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line, "transition-colors group-hover:stroke-muted-foreground")} strokeWidth={1.5} />
        <circle cx={left + 15} cy={top + 15} r={10} className={BADGE[p.kind]} />
        <Icon x={left + 8} y={top + 8} width={14} height={14} strokeWidth={2} className={ICON_COLOUR[p.kind]} aria-hidden />
        <text x={left + 29} y={top + 19.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{p.name}</text>
        <rect x={left + 6} y={top + 30} width={CARD_W - 12} height={20} rx={10} className={pillTone ? pillTone.softFill : "fill-muted"} />
        <text x={left + CARD_W / 2} y={top + 44} textAnchor="middle" className={cn(pillTone ? pillTone.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
          {isDown ? "down" : formatAvailability(p.availability)}
        </text>
        <rect x={left - 3} y={top - 3} width={CARD_W + 6} height={CARD_H + 6} rx={14} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
      </g>
    );
  };

  const ghost = (p: BuilderPart, idx: number, slot: number) => {
    const left = leftOf(idx);
    const top = SLOT_Y[slot] - CARD_H / 2;
    const text = slot === 0 ? `+ ${p.name}` : "+ copy";
    const label = slot === 0 ? `Put ${p.full} back in the chain` : `Add a copy of ${p.full}`;
    return (
      <g key={`${p.id}-ghost`} role="button" tabIndex={0} aria-label={label} className="group cursor-pointer outline-none" {...press(() => set(p.id, slot + 1))}>
        <rect x={left} y={top} width={CARD_W} height={CARD_H} rx={12} className={cn("fill-card transition-colors group-hover:fill-muted", NEUTRAL.faintStroke)} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={left + CARD_W / 2} y={top + CARD_H / 2 + 4.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[13px] font-semibold")}>{text}</text>
        <rect x={left - 3} y={top - 3} width={CARD_W + 6} height={CARD_H + 6} rx={14} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
      </g>
    );
  };

  const caption = result.weakest && result.downHours > 0 ? `One square is one day. Most downtime: ${start.find((p) => p.id === result.weakest?.id)?.full ?? result.weakest.name}` : "One square is one day";
  const description = `${parts
    .filter((p) => p.copies > 0)
    .map((p) => `${p.full}: ${p.copies} ${p.copies === 1 ? "copy" : "copies"} at ${formatAvailability(p.availability)}`)
    .join("; ")}. Whole chain ${formatAvailability(result.availability)}, ${formatDowntime(result.downHours)} down a year.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap <b>+ copy</b> to add a copy, tap a card to remove it.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* The request path: one line through the chain, splitting where a part has copies. */}
          <line x1={0} x2={W} y1={LINE_Y} y2={LINE_Y} className={NEUTRAL.faintStroke} strokeWidth={2} />
          {parts.map((p, idx) => {
            if (p.copies < 2) return null;
            const left = leftOf(idx);
            const last = SLOT_Y[p.copies - 1];
            return (
              <g key={`branch-${p.id}`}>
                {[left - GAP / 2, left + CARD_W + GAP / 2].map((x) => (
                  <line key={x} x1={x} x2={x} y1={LINE_Y} y2={last} className={NEUTRAL.faintStroke} strokeWidth={2} />
                ))}
                {SLOT_Y.slice(1, p.copies).map((y) => (
                  <line key={y} x1={left - GAP / 2} x2={left + CARD_W + GAP / 2} y1={y} y2={y} className={NEUTRAL.faintStroke} strokeWidth={2} />
                ))}
              </g>
            );
          })}

          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={5} className={d.bad ? TONES.bad.solidFill : TONES.accent.solidFill} />
          ))}

          {parts.map((p, idx) => (
            <g key={p.id}>
              {Array.from({ length: p.copies }, (_, slot) => card(p, idx, slot))}
              {p.copies < maxCopies ? ghost(p, idx, p.copies) : null}
            </g>
          ))}

          <YearStrip x={STRIP.x} y={STRIP.y} marked={days.map((d) => ({ day: d.day, fraction: d.fraction, tone: "bad" as const }))} cursorWeek={week} />
          <text x={STRIP.x} y={H - 6} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{caption}</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
