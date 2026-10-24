"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BIT_MAX,
  BIT_MIN,
  BIT_SNAPS,
  DEFAULT_COUNT,
  DEFAULT_NEED,
  DEFAULT_WORKER,
  NEEDS,
  REQUESTS_PER_MS,
  STEP_BACKS,
  bitsVerdict,
  cardTones,
  clampBits,
  fleetPerSecond,
  formatCount,
  formatLifetime,
  idsPerMs,
  machines,
  requestsPerMs,
  rollback,
  shortRate,
  split,
  type Handling,
} from "../models/snowflake-bits";

const W = 420;
const H = 434;
const BAR = { x: 8, w: 404, y: 66, h: 24 };
const CW = BAR.w / 64;
const RAIL = { x0: 118, x1: 386 };
const RAIL_Y = { worker: 124, count: 176 } as const;
const CARD_Y = 216;
const CARD = { w: 132, h: 42, gap: 4 };
const NEED_LABEL_Y = 284;
const NEED_Y = 306;
const STEP_Y = 346;
const STRIP = { y: 378, h: 22, cell: 13, gap: 3, x: 10 };
const CAPTION_Y = 424;
const RING = { x: 376, y: STRIP.y + STRIP.h / 2, r: 22 };
const LOOP_S = 2.4;

/** Colours for the three fields of the ID: time is the accent, worker violet, count teal. */
const FIELD = {
  time: { fill: TONES.accent.solidFill, stroke: TONES.accent.stroke, text: TONES.accent.text },
  worker: { fill: "fill-violet-600 dark:fill-violet-400", stroke: "stroke-violet-600 dark:stroke-violet-400", text: "fill-violet-800 dark:fill-violet-200" },
  count: { fill: "fill-teal-600 dark:fill-teal-400", stroke: "stroke-teal-600 dark:stroke-teal-400", text: "fill-teal-800 dark:fill-teal-200" },
};

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 10.7 beat 5: move bits between machine number and count, then step the clock back. */
export function SnowflakeBitsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [worker, setWorker] = useState<number>(DEFAULT_WORKER);
  const [count, setCount] = useState<number>(DEFAULT_COUNT);
  const [need, setNeed] = useState<number>(DEFAULT_NEED);
  const [step, setStep] = useState<number>(0);
  const [handling, setHandling] = useState<Handling>("trust");
  const titleId = useId();
  const descId = useId();

  const { w, s, t } = split(worker, count);
  const verdict = bitsVerdict(w, s, need, step, handling);
  const tones = cardTones(w, s, need);
  const fleet = fleetPerSecond(w, s);
  const rb = rollback(step, handling, s);
  const r = requestsPerMs(s);

  const xTime = BAR.x + CW;
  const xWorker = xTime + t * CW;
  const xCount = xWorker + w * CW;
  const mid = (a: number, bits: number) => a + (bits * CW) / 2;
  let dividers = "";
  for (let i = 1; i < 64; i++) dividers += `M${r1(BAR.x + i * CW)} ${BAR.y} v${BAR.h} `;

  // The strip: one millisecond of IDs, as it looks after the clock steps back.
  const stepped = step > 1;
  const cellTone = !stepped ? "none" : handling === "trust" ? "bad" : rb.refused > 0 ? "warn" : "good";
  const phase = beat.reduced ? -1 : Math.floor(((beat.seconds % LOOP_S) / LOOP_S) * REQUESTS_PER_MS);
  const ringP = beat.reduced ? 1 : Math.min(1, (beat.seconds % LOOP_S) / (LOOP_S * 0.65));
  const circ = 2 * Math.PI * RING.r;
  const caption = !stepped
    ? `Each cell is one of the ${REQUESTS_PER_MS} IDs asked for in a millisecond`
    : handling === "trust"
      ? `Red: ${r} IDs a millisecond made again, for ${step} ms`
      : rb.refused > 0
        ? `Refuses ${r} IDs a ms for ${rb.refused / r} ms, then waits ${rb.waitMs} ms`
        : `Waits ${rb.waitMs} ms, then every ID is new`;
  const ringText = stepped && handling === "guard" ? `${rb.waitMs} ms` : null;

  const needChipW = NEEDS.map((n) => chipWidth(`${shortRate(n)}`));
  const needX = rowPositions(needChipW, (W - (needChipW.reduce((a, b) => a + b, 0) + 4 * (NEEDS.length - 1))) / 2, 4);
  const stepChipW = STEP_BACKS.map((n) => chipWidth(`${n} ms`));
  const stepX = rowPositions(stepChipW, 122, 4);

  const cards = [
    { key: "machines", label: "Machines", value: formatCount(machines(w)), tone: undefined },
    { key: "perms", label: "IDs per ms, each", value: formatCount(idsPerMs(s)), tone: tones.perMs === "bad" ? ("bad" as const) : undefined },
    { key: "life", label: "Lifetime", value: formatLifetime(t), tone: tones.lifetime === "bad" ? ("bad" as const) : undefined },
  ];

  const rails = [
    { key: "worker", y: RAIL_Y.worker, name: "Machine bits", bits: w, set: (v: number) => setWorker(v), f: FIELD.worker, label: "Bits for the machine number" },
    { key: "count", y: RAIL_Y.count, name: "Count bits", bits: s, set: (v: number) => setCount(v), f: FIELD.count, label: "Bits for the count" },
  ];
  const ladder = Array.from({ length: BIT_MAX - BIT_MIN + 1 }, (_, i) => BIT_MIN + i);
  const ticks = [BIT_MIN, ...BIT_SNAPS, BIT_MAX];
  const at = (v: number) => RAIL.x0 + ((v - BIT_MIN) / (BIT_MAX - BIT_MIN)) * (RAIL.x1 - RAIL.x0);

  const description = `A 64-bit ID with ${t} bits of time, ${w} bits of machine number and ${s} bits of count. ${formatCount(machines(w))} machines, ${formatCount(idsPerMs(s))} IDs per millisecond each, lifetime ${formatLifetime(t)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>two rails</b> to move bits, then pick how much is needed and how far the clock steps back.</>}
      controls={
        <>
          <BeatButton pressed={handling === "trust"} onClick={() => setHandling("trust")}>Trust the clock</BeatButton>
          <BeatButton pressed={handling === "guard"} onClick={() => setHandling("guard")}>Wait, then refuse</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The 64-bit ID: one unused bit, then time, machine and count. */}
          <rect x={BAR.x} y={BAR.y} width={CW} height={BAR.h} className="fill-muted" />
          <rect x={r1(xTime)} y={BAR.y} width={r1(t * CW)} height={BAR.h} className={cn(FIELD.time.fill, "transition-all duration-200 motion-reduce:transition-none")} />
          <rect x={r1(xWorker)} y={BAR.y} width={r1(w * CW)} height={BAR.h} className={cn(FIELD.worker.fill, "transition-all duration-200 motion-reduce:transition-none")} />
          <rect x={r1(xCount)} y={BAR.y} width={r1(s * CW)} height={BAR.h} className={cn(FIELD.count.fill, "transition-all duration-200 motion-reduce:transition-none")} />
          <path d={dividers} fill="none" strokeWidth={1} className="stroke-card" />
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={4} fill="none" strokeWidth={1.5} className={NEUTRAL.line} />
          <text x={r1(mid(xTime, t))} y={60} textAnchor="middle" className={cn(FIELD.time.text, "text-[12.5px] font-bold")}>{`time: ${t} bits`}</text>
          {w >= 3 ? <text x={r1(mid(xWorker, w))} y={60} textAnchor="middle" className={cn(FIELD.worker.text, "text-[12.5px] font-bold")}>{w}</text> : null}
          {s >= 3 ? <text x={r1(mid(xCount, s))} y={60} textAnchor="middle" className={cn(FIELD.count.text, "text-[12.5px] font-bold")}>{s}</text> : null}

          {rails.map((rail) => {
            const hx = at(rail.bits);
            return (
              <g key={rail.key}>
                <text x={8} y={rail.y - 2} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{rail.name}</text>
                <text x={8} y={rail.y + 15} className={cn(rail.f.text, "text-[13px] font-bold tabular-nums")}>{`${rail.bits} bits`}</text>
                <RailSlider
                  svgRef={svg}
                  x0={RAIL.x0}
                  x1={RAIL.x1}
                  y={rail.y}
                  label={rail.label}
                  valueText={`${rail.bits} bits. ${verdict.text}`}
                  value={rail.bits}
                  ladder={ladder}
                  fromFraction={(f) => {
                    const raw = BIT_MIN + f * (BIT_MAX - BIT_MIN);
                    const snap = BIT_SNAPS.find((v) => Math.abs(v - raw) <= 0.75);
                    return clampBits(snap ?? raw);
                  }}
                  onChange={rail.set}
                >
                  <g aria-hidden>
                    <line x1={RAIL.x0} x2={RAIL.x1} y1={rail.y} y2={rail.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                    <line x1={RAIL.x0} x2={r1(hx)} y1={rail.y} y2={rail.y} strokeWidth={6} strokeLinecap="round" className={rail.f.stroke} />
                    {ticks.map((v) => (
                      <g key={v}>
                        <line x1={at(v)} x2={at(v)} y1={rail.y - 8} y2={rail.y + 8} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                        <text x={at(v)} y={rail.y + 32} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{v}</text>
                      </g>
                    ))}
                    <circle cx={r1(hx)} cy={rail.y} r={17} className={TONES.accent.softFill} />
                    <circle cx={r1(hx)} cy={rail.y} r={11} className={cn(rail.f.fill, "stroke-card")} strokeWidth={2.5} />
                    <line x1={r1(hx) - 3} x2={r1(hx) - 3} y1={rail.y - 4.5} y2={rail.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                    <line x1={r1(hx) + 3} x2={r1(hx) + 3} y1={rail.y - 4.5} y2={rail.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                  </g>
                </RailSlider>
              </g>
            );
          })}

          {/* What the split gives. */}
          {cards.map((c, i) => {
            const x = 8 + i * (CARD.w + CARD.gap);
            return (
              <g key={c.key}>
                <rect x={x} y={CARD_Y} width={CARD.w} height={CARD.h} rx={12} strokeWidth={c.tone ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone ? TONES[c.tone].stroke : NEUTRAL.line)} />
                <text x={x + 10} y={CARD_Y + 16} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
                <text x={x + 10} y={CARD_Y + 35} className={cn(c.tone ? TONES[c.tone].text : NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>{c.value}</text>
              </g>
            );
          })}

          {/* How much is needed. */}
          <text x={10} y={NEED_LABEL_Y} className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold")}>Needed a second</text>
          <text x={W - 10} y={NEED_LABEL_Y} textAnchor="end" className={cn(fleet >= need ? TONES.good.text : TONES.bad.text, "text-[12px] font-bold")}>{`fleet makes ${shortRate(fleet)}`}</text>
          {NEEDS.map((n, i) => (
            <SvgChip key={n} x={needX[i]} y={NEED_Y} text={shortRate(n)} width={needChipW[i]} label={`Need ${shortRate(n)} IDs a second`} pressed={need === n} onPress={() => setNeed(n)} />
          ))}

          {/* How far the clock steps back. */}
          <text x={10} y={STEP_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Clock steps back</text>
          {STEP_BACKS.map((n, i) => (
            <SvgChip key={n} x={stepX[i]} y={STEP_Y} text={`${n} ms`} width={stepChipW[i]} label={n === 0 ? "No step back" : `Clock steps back ${n} milliseconds`} pressed={step === n} onPress={() => setStep(n)} />
          ))}

          {/* One millisecond of IDs after the step back. */}
          {Array.from({ length: REQUESTS_PER_MS }, (_, i) => {
            const x = STRIP.x + i * (STRIP.cell + STRIP.gap);
            const tone = cellTone === "none" ? null : TONES[cellTone];
            return (
              <g key={i}>
                <rect x={x} y={STRIP.y} width={STRIP.cell} height={STRIP.h} rx={4} strokeWidth={1.5} className={cn("transition-colors duration-200 motion-reduce:transition-none", tone ? cn(tone.softFill, tone.stroke) : cn("fill-muted", NEUTRAL.line))} />
                {phase === i ? <rect x={x - 2.5} y={STRIP.y - 2.5} width={STRIP.cell + 5} height={STRIP.h + 5} rx={6} fill="none" strokeWidth={2} className={TONES.accent.stroke} /> : null}
              </g>
            );
          })}
          {stepped && handling === "trust" ? (
            <g>
              <rect x={336} y={RING.y - 13} width={72} height={26} rx={13} strokeWidth={2} className={cn(NEUTRAL.surface, TONES.bad.stroke)} />
              <text x={372} y={RING.y + 4.5} textAnchor="middle" className={cn(TONES.bad.text, "text-[12.5px] font-bold tabular-nums")}>{`x ${step} ms`}</text>
            </g>
          ) : null}
          {ringText ? (
            <g>
              <circle cx={RING.x} cy={RING.y} r={RING.r} fill="none" strokeWidth={4} className="stroke-muted" />
              <circle cx={RING.x} cy={RING.y} r={RING.r} fill="none" strokeWidth={4} strokeLinecap="round" strokeDasharray={`${r1(circ * ringP)} ${r1(circ)}`} transform={`rotate(-90 ${RING.x} ${RING.y})`} className={rb.refused > 0 ? TONES.warn.stroke : TONES.good.stroke} />
              <text x={RING.x} y={RING.y + 4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-bold tabular-nums")}>{ringText}</text>
            </g>
          ) : null}
          <text x={W / 2} y={CAPTION_Y} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{caption}</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
