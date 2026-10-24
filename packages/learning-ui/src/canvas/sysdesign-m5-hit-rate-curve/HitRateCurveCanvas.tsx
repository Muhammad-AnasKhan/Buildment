"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { ladderStep, SliderRail } from "../primitives/picture-slider";
import { SliderZone } from "../primitives/slider-zone";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  CATALOGUE,
  DEFAULT_K,
  DEFAULT_SKEW,
  hitRate,
  hitVerdict,
  itemsText,
  K_LADDER,
  labelSize,
  K_MAX,
  K_MIN,
  kFraction,
  kFromFraction,
  percentText,
  placeLabel,
  readIsHit,
  shareText,
  SKEW_MAX,
  SKEW_SNAPS,
  SKEW_STEP,
  zipfPrefix,
  type Box,
} from "../models/hit-rate";
import { clamp, roundToStep, snapTo, stepByKey } from "../models/picture-controls";

// 5.4: a hit-rate curve. Drag along the plot to change the cache size (log
// scale); drag the rail under it to change the skew of the traffic. A dot
// rides the curve, a dashed line shows even traffic, and a strip of reads
// above the plot turns green (hit) or amber (miss) in the right proportion.

const W = 420;
const H = 350;
const PX0 = 48;
const PX1 = 404;
const PY0 = 86;
const PY1 = 224;
const LANE = { x0: 48, x1: 322, y: 58, spacing: 18, speed: 45 };
const RAIL = { x0: 34, x1: 386, y: 306 };

const X = (k: number) => PX0 + kFraction(k) * (PX1 - PX0);
const Y = (rate: number) => PY1 - rate * (PY1 - PY0);
const r1 = (v: number) => Math.round(v * 10) / 10;
const skewText = (s: number) => s.toFixed(1);

function curvePoints(rateAt: (k: number) => number, count: number) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const k = K_MIN * Math.pow(K_MAX / K_MIN, i / count);
    return { x: X(k), y: Y(rateAt(k)) };
  });
}
const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${r1(p.x)} ${r1(p.y)}`).join(" ");

/** Short pieces of a polyline. Many small paths, not one big one, so each hugs its part of the curve. */
function pieces(pts: { x: number; y: number }[], per: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i += per) out.push(toPath(pts.slice(i, Math.min(pts.length, i + per + 1))));
  return out;
}

/** Dashes cut along the polyline by length: each is a short line, so the dashed curve is many small shapes too. */
function dashes(pts: { x: number; y: number }[], on: number, period: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let travelled = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len === 0) continue;
    const phaseA = travelled % period;
    const phaseB = phaseA + len;
    if (phaseA < on) {
      const end = Math.min(on, phaseB);
      out.push({ x1: a.x, y1: a.y, x2: a.x + ((b.x - a.x) * (end - phaseA)) / len, y2: a.y + ((b.y - a.y) * (end - phaseA)) / len });
    }
    travelled += len;
  }
  return out;
}

export function HitRateCurveCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [k, setK] = useState<number>(DEFAULT_K);
  const [s, setS] = useState<number>(DEFAULT_SKEW);
  const pre = useMemo(() => zipfPrefix(s), [s]);
  const evenPre = useMemo(() => zipfPrefix(0), []);
  const rate = hitRate(k, pre);
  const verdict = hitVerdict(k, s, pre);
  const live = `${itemsText(k)}: ${percentText(rate)} of reads`;

  const main = useMemo(() => curvePoints((kk) => hitRate(kk, pre), 90), [pre]);
  const even = useMemo(() => curvePoints((kk) => hitRate(kk, evenPre), 90), [evenPre]);
  const mainPieces = useMemo(() => pieces(main, 3), [main]);
  const evenDashes = useMemo(() => dashes(even, 5, 10), [even]);
  const dense = useMemo(() => curvePoints((kk) => hitRate(kk, pre), 300).concat(curvePoints((kk) => hitRate(kk, evenPre), 300)), [pre, evenPre]);

  const dot = { x: X(k), y: Y(rate) };
  const bounds: Box = { x: PX0 + 4, y: PY0 + 2, w: PX1 - PX0 - 8, h: PY1 - PY0 - 6 };
  const liveSize = labelSize(live);
  const liveBox = placeLabel(liveSize.w, liveSize.h, dot, [...dense, dot], [], bounds);
  const evenAnchor = { x: X(3000), y: Y(0.3) };
  const evenBox =
    s > 0 ? placeLabel(84, 18, evenAnchor, [...dense, dot], liveBox ? [liveBox] : [], bounds) : null;

  const setSize = (next: number) => setK(clamp(Math.round(next), K_MIN, K_MAX));
  const setSkew = (next: number) => setS(clamp(roundToStep(next, SKEW_STEP), 0, SKEW_MAX));
  const summary = `Cache of ${itemsText(k)} out of ${CATALOGUE.toLocaleString("en-US")} products, skew ${skewText(s)}. It answers ${percentText(rate)} of reads. ${verdict.text}.`;

  // The strip of reads: dots drift right, green when the cache answers.
  const front = Math.floor((clock.seconds * LANE.speed) / LANE.spacing);
  const lanePhase = clock.seconds * LANE.speed;
  const laneDots = Array.from({ length: Math.ceil((LANE.x1 - LANE.x0) / LANE.spacing) + 1 }, (_, j) => {
    const n = front - j;
    const x = LANE.x0 + (lanePhase - n * LANE.spacing);
    return { n, x };
  }).filter((d) => d.x >= LANE.x0 && d.x <= LANE.x1);

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag along the curve for the <b>cache size</b>, and the bar below for the <b>skew</b>.</>}>
      <div ref={box} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Reads drift along this strip: green when the cache answers, amber when the database must. */}
          <line x1={LANE.x0} x2={LANE.x1} y1={LANE.y} y2={LANE.y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {laneDots.map((d) => (
            <circle key={d.n} cx={r1(d.x)} cy={LANE.y} r={4.5} className={cn(TONES[readIsHit(d.n, rate) ? "good" : "warn"].solidFill, "stroke-card")} strokeWidth={1.5} />
          ))}
          <circle cx={338} cy={LANE.y} r={4.5} className={TONES.good.solidFill} />
          <text x={347} y={LANE.y + 4} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>hit</text>
          <circle cx={374} cy={LANE.y} r={4.5} className={TONES.warn.solidFill} />
          <text x={383} y={LANE.y + 4} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>miss</text>

          {/* Axes. */}
          <line x1={PX0} x2={PX1} y1={PY1} y2={PY1} strokeWidth={1.5} className={NEUTRAL.line} />
          <line x1={PX0} x2={PX0} y1={PY0} y2={PY1} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 0.5, 1].map((v) => (
            <g key={v} aria-hidden>
              <line x1={PX0 - 4} x2={PX0} y1={Y(v)} y2={Y(v)} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={PX0 - 8} y={Y(v) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{Math.round(v * 100)}%</text>
            </g>
          ))}
          {[10, 100, 1000, 10000].map((v) => (
            <g key={v} aria-hidden>
              <line x1={X(v)} x2={X(v)} y1={PY1} y2={PY1 + 4} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={X(v)} y={PY1 + 19} textAnchor={v === 10 ? "start" : v === 10000 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {shareText(v)}
              </text>
            </g>
          ))}
          <text x={(PX0 + PX1) / 2} y={PY1 + 38} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            cache size, share of 10,000 products
          </text>
          <text x={PX0} y={PY0 - 8} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>reads answered by the cache</text>

          {/* Even traffic: the straight line k / N, which bends on a log axis. */}
          {evenDashes.map((d, i) => (
            <line key={i} x1={r1(d.x1)} y1={r1(d.y1)} x2={r1(d.x2)} y2={r1(d.y2)} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.faintStroke} />
          ))}
          {mainPieces.map((d, i) => (
            <path key={i} d={d} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
          ))}

          {evenBox ? (
            <text x={evenBox.x} y={evenBox.y + evenBox.h - 5} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>even traffic</text>
          ) : null}

          {/* The marker on the size axis, then the dot on the curve. */}
          <path d={`M${r1(dot.x)} ${PY1 + 2} l-5 7 h10 Z`} className={TONES.accent.solidFill} />
          <circle cx={dot.x} cy={dot.y} r={13} className={TONES.accent.softFill} />
          <circle cx={dot.x} cy={dot.y} r={7} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
          {liveBox ? (
            <text x={liveBox.x} y={liveBox.y + liveBox.h - 5} className={cn(TONES.accent.text, "text-[12.5px] font-bold tabular-nums")}>{live}</text>
          ) : null}

          <SliderRail
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            fraction={s / SKEW_MAX}
            marks={SKEW_SNAPS.filter((m) => m > 0).map((m) => ({ at: m / SKEW_MAX, label: skewText(m) }))}
            ends={["even traffic", "very skewed"]}
            caption={`Skew ${skewText(s)}`}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>

        <SliderZone
          view={{ w: W, h: H }}
          box={{ x: PX0 - 14, y: PY0 - 8, w: PX1 - PX0 + 28, h: PY1 - PY0 + 16 }}
          label="Cache size"
          valueMin={K_MIN}
          valueMax={K_MAX}
          valueNow={k}
          valueText={`${live}. ${verdict.text}`}
          onFraction={(fx) => setSize(kFromFraction(((PX0 - 14 + fx * (PX1 - PX0 + 28)) - PX0) / (PX1 - PX0)))}
          onKey={(key) => {
            const next = ladderStep(K_LADDER, k, key);
            if (next === null) return false;
            setSize(next);
            return true;
          }}
        />
        <SliderZone
          view={{ w: W, h: H }}
          box={{ x: RAIL.x0 - 18, y: RAIL.y - 22, w: RAIL.x1 - RAIL.x0 + 36, h: 44 }}
          label="Traffic skew"
          valueMin={0}
          valueMax={SKEW_MAX}
          valueNow={s}
          valueText={`Skew ${skewText(s)}${s === 0 ? ", even traffic" : ""}. ${live}. ${verdict.text}`}
          onFraction={(fx) => {
            const raw = ((RAIL.x0 - 18 + fx * (RAIL.x1 - RAIL.x0 + 36)) - RAIL.x0) / (RAIL.x1 - RAIL.x0);
            setSkew(snapTo(raw * SKEW_MAX, SKEW_SNAPS, 0.06));
          }}
          onKey={(key) => {
            const next = stepByKey(s, key, { min: 0, max: SKEW_MAX, step: SKEW_STEP, page: 0.5 });
            if (next === null) return false;
            setSkew(next);
            return true;
          }}
        />
      </div>
    </BeatFrame>
  );
}
