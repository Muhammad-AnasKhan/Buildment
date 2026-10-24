"use client";

import { useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailStrip } from "../primitives/rail-strip";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { dotRate, laneDots } from "../models/lane-dots";
import {
  busyTone,
  COUNT,
  COUNT_LADDER,
  COUNT_SNAPS,
  countFromFraction,
  countToFraction,
  DEFAULT_SIZE,
  DEMAND,
  dollars,
  fleet,
  percent,
  SIZES,
} from "../models/fleet-sizing";

const W = 420;
const H = 272;
const CHIP = { y: 48, w: 94, h: 46, gap: 8, x0: 10 };
const BUS_Y = 134;
const CARD = { y: 158, w: 46, h: 64, gap: 5 };
const TAG = { y: 236, h: 26 };
const SHORT: Record<string, string> = { small: "S", medium: "M", large: "L", xlarge: "XL" };

const cardLeft = (i: number, n: number) => (W - (n * CARD.w + (n - 1) * CARD.gap)) / 2 + i * (CARD.w + CARD.gap);

/** 4.2: tap a size, drag the number of servers; capacity, cost and the load after one failure follow. */
export function InstancePickerCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [sizeId, setSizeId] = useState<string>(DEFAULT_SIZE);
  const [count, setCount] = useState<number>(COUNT.default);
  const f = fleet(sizeId, count);
  const cardTone = busyTone(f.busy);
  const afterTone: Tone = f.count === 1 ? "bad" : busyTone(f.busyAfter);
  const afterText = f.count === 1 ? "If one fails: down" : `If one fails: ${percent(f.busyAfter)}`;
  const capTone: Tone | null = f.capacity < DEMAND ? "bad" : null;

  const summary = `${f.count} ${f.size.label.toLowerCase()} servers, each ${f.size.perSec} requests a second, carry ${DEMAND} a second at ${percent(f.busy)} busy. Capacity ${f.capacity} a second. Cost ${dollars(f.cost)} an hour. ${
    f.count === 1 ? "If the server fails, nothing is left." : `If one server fails, the rest run at ${percent(f.busyAfter)}.`
  } ${f.verdict}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a <b>size</b>, then drag the number of servers.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Size chips: tap one. */}
          {SIZES.map((s, i) => {
            const x = CHIP.x0 + i * (CHIP.w + CHIP.gap);
            const on = s.id === sizeId;
            return (
              <SvgButton key={s.id} x={x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx={14} label={`${s.label}: ${s.perSec} requests a second, $${s.price.toFixed(2)} an hour`} pressed={on} onPress={() => setSizeId(s.id)}>
                <rect x={x} y={CHIP.y + 3} width={CHIP.w} height={CHIP.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx={14} className={cn(on ? TONES.accent.softFill : NEUTRAL.surface, on ? TONES.accent.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} strokeWidth={on ? 2.5 : 1.5} />
                <text x={x + CHIP.w / 2} y={CHIP.y + 19} textAnchor="middle" className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[13px] font-bold")}>{s.label}</text>
                <text x={x + CHIP.w / 2} y={CHIP.y + 36} textAnchor="middle" className={cn(on ? TONES.accent.text : NEUTRAL.mutedText, "text-[11.5px] font-medium tabular-nums")}>{`${s.perSec}/s · $${s.price.toFixed(2)}`}</text>
              </SvgButton>
            );
          })}

          {/* The demand and the bus that feeds every server. */}
          <line x1={210} x2={210} y1={122} y2={BUS_Y} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          <line x1={cardLeft(0, f.count) + CARD.w / 2} x2={cardLeft(f.count - 1, f.count) + CARD.w / 2} y1={BUS_Y} y2={BUS_Y} strokeWidth={1.5} strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <rect x={120} y={100} width={180} height={22} rx={11} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
          <text x={210} y={115.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{DEMAND} requests a second</text>

          {/* One drop per server, with dots at a rate that follows its busy share. */}
          {Array.from({ length: f.count }, (_, i) => {
            const cx = cardLeft(i, f.count) + CARD.w / 2;
            return (
              <g key={`drop-${i}`}>
                <line x1={cx} x2={cx} y1={BUS_Y} y2={CARD.y} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                {laneDots(clock.seconds, dotRate(f.busy), clock.reduced, i, 0.9).map((p, k) => (
                  <circle key={k} cx={cx} cy={BUS_Y + 3 + p * (CARD.y - BUS_Y - 8)} r={3.5} className={TONES[cardTone].solidFill} />
                ))}
              </g>
            );
          })}

          {/* The servers: one card each, busy share on the pill. */}
          {Array.from({ length: f.count }, (_, i) => {
            const x = cardLeft(i, f.count);
            const t = TONES[cardTone];
            return (
              <g key={`card-${i}`}>
                <rect x={x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
                <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={12} className={cn(NEUTRAL.surface, cardTone === "bad" ? t.stroke : NEUTRAL.line)} strokeWidth={cardTone === "bad" ? 2 : 1.5} />
                <circle cx={x + 14} cy={CARD.y + 16} r={9.5} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={x + 8} y={CARD.y + 10} width={12} height={12} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={x + 28} y={CARD.y + 20.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{SHORT[f.size.id]}</text>
                <rect x={x + 4} y={CARD.y + 36} width={CARD.w - 8} height={22} rx={11} className={cn(t.softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={x + CARD.w / 2} y={CARD.y + 51} textAnchor="middle" className={cn(t.text, "text-[11.5px] font-bold tabular-nums")}>{percent(f.busy)}</text>
              </g>
            );
          })}

          {/* Capacity, cost, and the ghost: what is left if one server fails. */}
          <rect x={14} y={TAG.y} width={118} height={TAG.h} rx={13} className={cn(capTone ? TONES[capTone].softFill : "fill-muted")} />
          <text x={73} y={TAG.y + 17.5} textAnchor="middle" className={cn(capTone ? TONES[capTone].text : NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{`${f.capacity}/s capacity`}</text>
          <rect x={140} y={TAG.y} width={112} height={TAG.h} rx={13} className="fill-muted" />
          <text x={196} y={TAG.y + 17.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{`${dollars(f.cost)} an hour`}</text>
          <rect x={260} y={TAG.y} width={146} height={TAG.h} rx={13} strokeWidth={1.75} strokeDasharray="5 4" className={cn(TONES[afterTone].softFill, TONES[afterTone].stroke)} />
          <text x={333} y={TAG.y + 17.5} textAnchor="middle" className={cn(TONES[afterTone].text, "text-[12px] font-bold tabular-nums")}>{afterText}</text>

          <VerdictBanner width={W} text={f.verdict} tone={f.tone} />
        </svg>
        <RailStrip
          label="Number of servers"
          valueText={`${f.count} ${f.size.label.toLowerCase()} servers: ${f.capacity} a second, ${dollars(f.cost)} an hour. ${f.verdict}`}
          value={f.count}
          ladder={COUNT_LADDER}
          fraction={countToFraction(f.count)}
          fromFraction={countFromFraction}
          onChange={setCount}
          marks={COUNT_SNAPS.map((n) => ({ at: countToFraction(n), label: String(n) }))}
          ends={["1", "8"]}
          caption="number of servers"
        />
      </div>
    </BeatFrame>
  );
}
