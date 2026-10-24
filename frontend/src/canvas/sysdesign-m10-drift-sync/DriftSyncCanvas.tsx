"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_DRIFT,
  DEFAULT_SYNC,
  DRIFT_LADDER,
  SYNC_LADDER,
  TEETH,
  cycleSeconds,
  driftVerdict,
  flipAfterSeconds,
  flipped,
  formatGap,
  formatInterval,
  gapMs,
  ladderFromFraction,
  ladderToFraction,
  largestGapMs,
  shareAbove,
  stillCursor,
  sweepAt,
} from "../models/drift-sync";

const W = 420;
const H = 350;
const CX0 = 64;
const CX1 = 400;
const TAG_Y = 62;
const Y_TOP = 112;
const Y_BASE = 202;
const RAIL_X0 = 118;
const RAIL_X1 = 386;
const RAIL_Y = [254, 310] as const;
const TAG = { w: 60, h: 26, gap: 20 };
const PAIR_W = 2 * TAG.w + TAG.gap;

const r1 = (v: number) => Math.round(v * 10) / 10;
const tooth = (k: number) => CX0 + (k * (CX1 - CX0)) / TEETH;

/** 10.2 beat 4: drag the drift and the sync interval, and watch the gap between two clocks climb and drop. */
export function DriftSyncCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [drift, setDrift] = useState<number>(DEFAULT_DRIFT);
  const [sync, setSync] = useState<number>(DEFAULT_SYNC);
  const titleId = useId();
  const descId = useId();

  const verdict = driftVerdict(drift, sync);
  const peak = largestGapMs(drift, sync);
  const share = shareAbove(drift, sync);
  const flipS = flipAfterSeconds(drift);

  // Peak sits at the top; with a small peak the 1 ms line leaves headroom so the tooth is honestly small.
  const yMax = Math.max(peak, 1.5);
  const yOf = (g: number) => Y_BASE - (g / yMax) * (Y_BASE - Y_TOP);
  const thrY = Math.min(yOf(1), Y_BASE - 5);
  const peakY = yOf(peak);
  const w = (CX1 - CX0) / TEETH;
  const frac = Math.min(1, flipS / sync);

  const sweep = beat.reduced ? stillCursor(drift, sync) : sweepAt(beat.seconds);
  const cursorX = CX0 + sweep * (CX1 - CX0);
  const into = cycleSeconds(sweep, sync);
  const gap = gapMs(drift, into);
  const isFlipped = flipped(drift, into);
  const dotY = yOf(Math.min(gap, yMax));
  const pairX = Math.max(8 + PAIR_W / 2, Math.min(W - 8 - PAIR_W / 2, cursorX));
  const swap = TAG.w + TAG.gap;

  let sawtooth = `M ${r1(CX0)} ${Y_BASE}`;
  for (let k = 0; k < TEETH; k++) sawtooth += ` L ${r1(tooth(k + 1))} ${r1(peakY)} L ${r1(tooth(k + 1))} ${Y_BASE}`;

  const rails = [
    {
      key: "drift",
      y: RAIL_Y[0],
      name: "Drift",
      value: `${drift} ppm`,
      label: "Drift of each clock, in parts per million",
      ladder: DRIFT_LADDER as readonly number[],
      current: drift,
      ticks: DRIFT_LADDER.map((v) => ({ v, text: String(v) })),
      set: setDrift,
      valueText: `${drift} ppm. ${verdict.text}`,
    },
    {
      key: "sync",
      y: RAIL_Y[1],
      name: "Sync every",
      value: formatInterval(sync),
      label: "How often the clocks sync",
      ladder: SYNC_LADDER as readonly number[],
      current: sync,
      ticks: SYNC_LADDER.map((v) => ({ v, text: formatInterval(v) })),
      set: setSync,
      valueText: `${formatInterval(sync)}. ${verdict.text}`,
    },
  ];

  const peakLabel = `largest gap ${formatGap(peak)}`;
  const peakW = Math.ceil(peakLabel.length * 6.7 + 20);
  const peakX = Math.max(8 + peakW / 2, Math.min(W - 8 - peakW / 2, tooth(1)));
  const peakLabelY = Math.max(Y_TOP - 22, peakY - 24);

  const description = `The gap between two clocks that drift ${drift} ppm in opposite directions and sync every ${formatInterval(sync)} climbs to ${formatGap(peak)} before each sync. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>two rails</b>. The tags show the order the stamps give two writes 1 ms apart.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The chart: the gap over three sync cycles. */}
          <line x1={CX0} x2={CX1} y1={Y_BASE} y2={Y_BASE} strokeWidth={2} className={NEUTRAL.line} />
          {[0, 1, 2, 3].map((k) => (
            <line key={`t${k}`} x1={tooth(k)} x2={tooth(k)} y1={Y_BASE} y2={Y_BASE + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          ))}
          {share > 0
            ? Array.from({ length: TEETH }, (_, k) => {
                const x0 = tooth(k) + frac * w;
                const x1 = tooth(k + 1);
                return <polygon key={`red${k}`} points={`${r1(x0)},${r1(thrY)} ${r1(x1)},${r1(peakY)} ${r1(x1)},${r1(thrY)}`} className={TONES.bad.softFill} />;
              })
            : null}
          <line x1={CX0} x2={CX1} y1={thrY} y2={thrY} strokeWidth={2} strokeDasharray="6 4" className={TONES.warn.stroke} />
          <path d={sawtooth} fill="none" strokeWidth={2.5} strokeLinejoin="round" className={TONES.accent.stroke} />
          {share > 0
            ? Array.from({ length: TEETH }, (_, k) => {
                const x0 = tooth(k) + frac * w;
                const y0 = Y_BASE - frac * (Y_BASE - peakY);
                return <line key={`hot${k}`} x1={r1(x0)} y1={r1(y0)} x2={r1(tooth(k + 1))} y2={r1(peakY)} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />;
              })
            : null}

          {/* The sweep: a cursor with the two write tags on top. */}
          <line x1={r1(cursorX)} x2={r1(cursorX)} y1={TAG_Y + TAG.h / 2 + 2} y2={Y_BASE} strokeWidth={1.5} strokeDasharray="3 3" className={isFlipped ? TONES.bad.stroke : NEUTRAL.doneStroke} />
          <circle cx={r1(cursorX)} cy={r1(dotY)} r={6} strokeWidth={2.5} className={cn(isFlipped ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} />

          <text x={CX0 - 8} y={thrY + 4} textAnchor="end" className={cn(TONES.warn.text, "text-[12px] font-bold")}>1 ms</text>
          {[1, 2].map((k) => (
            <text key={`sync${k}`} x={tooth(k)} y={Y_BASE + 22} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>sync</text>
          ))}

          {/* Labels on their own pills, drawn after the lines. */}
          <g>
            <rect x={r1(peakX - peakW / 2)} y={r1(peakLabelY - 14)} width={peakW} height={22} rx={11} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <text x={r1(peakX)} y={r1(peakLabelY + 1.5)} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{peakLabel}</text>
          </g>
          <g transform={`translate(${r1(pairX)} ${TAG_Y})`}>
            {[0, 1].map((n) => {
              const slot = slotOf(n, isFlipped);
              const x = -PAIR_W / 2 + slot * swap;
              return (
                <g key={n} style={{ transform: `translate(${x}px, 0px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
                  <rect x={0} y={-TAG.h / 2} width={TAG.w} height={TAG.h} rx={TAG.h / 2} strokeWidth={2} className={cn(NEUTRAL.surface, isFlipped ? TONES.bad.stroke : TONES.good.stroke)} />
                  <text x={TAG.w / 2} y={4.5} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{`write ${n + 1}`}</text>
                </g>
              );
            })}
            <polygon points={`-6,-5 6,0 -6,5`} className={isFlipped ? TONES.bad.solidFill : TONES.good.solidFill} />
          </g>

          {rails.map((r) => {
            const frac01 = ladderToFraction(r.ladder, r.current);
            const hx = RAIL_X0 + frac01 * (RAIL_X1 - RAIL_X0);
            return (
              <g key={r.key}>
                <text x={8} y={r.y - 2} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{r.name}</text>
                <text x={8} y={r.y + 15} className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{r.value}</text>
                <RailSlider
                  svgRef={svg}
                  x0={RAIL_X0}
                  x1={RAIL_X1}
                  y={r.y}
                  label={r.label}
                  valueText={r.valueText}
                  value={r.current}
                  ladder={r.ladder}
                  fromFraction={(f) => ladderFromFraction(r.ladder, f)}
                  onChange={(v) => r.set(v)}
                  onGrab={(g) => (g ? beat.freeze() : beat.unfreeze())}
                >
                  <g aria-hidden>
                    <line x1={RAIL_X0} x2={RAIL_X1} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                    <line x1={RAIL_X0} x2={hx} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                    {r.ticks.map((t) => {
                      const x = RAIL_X0 + ladderToFraction(r.ladder, t.v) * (RAIL_X1 - RAIL_X0);
                      return (
                        <g key={t.v}>
                          <line x1={x} x2={x} y1={r.y - 9} y2={r.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                          <text x={x} y={r.y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t.text}</text>
                        </g>
                      );
                    })}
                    <circle cx={hx} cy={r.y} r={17} className={TONES.accent.softFill} />
                    <circle cx={hx} cy={r.y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
                    <line x1={hx - 3} x2={hx - 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                    <line x1={hx + 3} x2={hx + 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                  </g>
                </RailSlider>
              </g>
            );
          })}
        </svg>
      </div>
    </BeatFrame>
  );
}

/** Slot of write n in the pair: write 1 first when the stamps agree, write 2 first when they flip. */
function slotOf(n: number, isFlipped: boolean): number {
  return isFlipped ? 1 - n : n;
}
