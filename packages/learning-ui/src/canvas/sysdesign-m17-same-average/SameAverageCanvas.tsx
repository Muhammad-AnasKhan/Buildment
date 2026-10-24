"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { A, AXIS_MAX, B, MODES, STATS, TARGET_MS, averagedP99, isSlow, meetsTarget, merged, mergedP99, slowTone, statOf, verdictFor, type Mode, type Stat } from "./model";

const W = 420;
const H = 440;
const X0 = 24;
const X1 = 404;
const PANEL_H = 92;
const PANEL_A = 88;
const PANEL_B = PANEL_A + PANEL_H + 4;
const PANEL_C = PANEL_B + PANEL_H + 4;
const PANEL_C_H = 128;
const COMBINE_TEXT = "Combine A and B";

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (ms: number) => r1(X0 + (Math.min(AXIS_MAX, Math.max(0, ms)) / AXIS_MAX) * (X1 - X0));

type Marker = { ms: number; text: string; tone: Tone | null; ghost?: boolean };

/** A strip of dots on the 0 to 900 ms axis, one row of dots per slot so a clump reads as a clump. */
function Strip({ values, top, rows, pitch, radius, hide }: { values: readonly number[]; top: number; rows: number; pitch: number; radius: number; hide: Tone }) {
  return (
    <g aria-hidden>
      {values.map((ms, i) => (
        <circle
          key={i}
          cx={xOf(ms)}
          cy={top + (i % rows) * pitch}
          r={isSlow(ms) ? radius + 1.6 : radius}
          strokeWidth={isSlow(ms) ? 1.5 : 0}
          className={cn(isSlow(ms) ? cn(TONES[hide].solidFill, "stroke-card") : "fill-blue-600/70 dark:fill-blue-400/70", SHAPE_TRANSITION)}
        />
      ))}
    </g>
  );
}

/** The marker for a statistic: a line down to the strip's baseline and a pill with the value. */
function MarkerMark({ marker, lineTop, base, pillY }: { marker: Marker; lineTop: number; base: number; pillY: number }) {
  const x = xOf(marker.ms);
  const w = marker.ghost ? 80 : 58;
  const left = Math.max(10, Math.min(W - 10 - w, x - w / 2));
  const t = marker.tone ? TONES[marker.tone] : null;
  return (
    <g opacity={marker.ghost ? 0.7 : 1} className="transition-opacity duration-200 motion-reduce:transition-none">
      <line x1={x} x2={x} y1={lineTop} y2={base} strokeWidth={marker.ghost ? 1.75 : 2.5} strokeLinecap="round" strokeDasharray={marker.ghost ? "4 4" : undefined} className={t ? t.stroke : "stroke-foreground"} />
      <rect x={left} y={pillY} width={w} height={20} rx={10} strokeWidth={1.75} className={cn(t ? t.softFill : "fill-card", t ? t.stroke : "stroke-foreground")} />
      <text x={left + w / 2} y={pillY + 14.5} textAnchor="middle" className={cn(t ? t.text : NEUTRAL.text, "text-[12px] font-bold tabular-nums")}>{marker.text}</text>
    </g>
  );
}

/** 17.5 beat 3: tap the statistic a dashboard graphs and see who it shows and who it hides. */
export function SameAverageCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const [stat, setStat] = useState<Stat>("average");
  const [combined, setCombined] = useState(false);
  const [mode, setMode] = useState<Mode>("average");

  const hide = slowTone(stat, combined);
  const verdict = verdictFor(stat, combined, mode);
  const sw = STATS.map((s) => chipWidth(s.label));
  const sx = rowPositions(sw, 14, 8);
  const cw = chipWidth(COMBINE_TEXT);
  const mw = MODES.map((m) => chipWidth(m.label));
  const mx = rowPositions(mw, 14, 8);

  const markerFor = (xs: readonly number[]): Marker => {
    const v = Math.round(statOf(xs, stat));
    const tone: Tone | null = stat === "p99" ? (meetsTarget(xs) ? "good" : "bad") : null;
    return { ms: v, text: `${v} ms`, tone };
  };
  const mA = markerFor(A);
  const mB = markerFor(B);
  const truth = mergedP99();
  const markersC: Marker[] =
    mode === "average" ? [{ ms: truth, text: `true ${truth} ms`, tone: null, ghost: true }, { ms: averagedP99(), text: `${averagedP99()} ms`, tone: "bad" }] : [{ ms: truth, text: `${truth} ms`, tone: "good" }];

  const description = `Two services, 20 requests each, both averaging 120 ms. ${STATS.find((s) => s.id === stat)?.label} marker: A ${mA.text}, B ${mB.text}. ${combined ? `Combined: averaging the two p99 values gives ${averagedP99()} ms, merging the 40 requests gives ${mergedP99()} ms. ` : ""}Target: p99 under ${TARGET_MS} ms. ${verdict.text}.`;

  const panel = (top: number, name: string, values: readonly number[], marker: Marker, withTarget: boolean) => (
    <g>
      <rect x={8} y={top} width={404} height={PANEL_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      <text x={20} y={top + 21} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{name}</text>
      {withTarget ? <text x={xOf(TARGET_MS) + 7} y={top + 21} className={cn(TONES.warn.text, "text-[12px] font-semibold")}>{`target: p99 under ${TARGET_MS} ms`}</text> : null}
      <line x1={X0} x2={X1} y1={top + 63} y2={top + 63} strokeWidth={1.5} className={NEUTRAL.line} />
      <line x1={xOf(TARGET_MS)} x2={xOf(TARGET_MS)} y1={top + 28} y2={top + 63} strokeWidth={1.75} strokeDasharray="4 4" className={TONES.warn.stroke} />
      <Strip values={values} top={top + 34} rows={4} pitch={7} radius={3.4} hide={hide} />
      <MarkerMark marker={marker} lineTop={top + 28} base={top + 63} pillY={top + 67} />
    </g>
  );

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a <b>statistic</b> and watch the marker. Then <b>combine</b> the two services.</>}>
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="Statistic">
            {STATS.map((s, i) => (
              <SvgRadioChip
                key={s.id}
                x={sx[i]}
                y={64}
                width={sw[i]}
                text={s.label}
                label={`${s.label} of each service`}
                checked={!combined && s.id === stat}
                onSelect={() => {
                  setStat(s.id);
                  setCombined(false);
                }}
              />
            ))}
          </g>
          <SvgChip
            x={W - 14 - cw}
            y={64}
            width={cw}
            text={COMBINE_TEXT}
            label="Combine A and B into one list of 40 requests"
            pressed={combined}
            onPress={() => {
              const on = !combined;
              setCombined(on);
              if (on) setStat("p99");
            }}
          />

          {panel(PANEL_A, "Service A", A, mA, true)}
          {panel(PANEL_B, "Service B", B, mB, false)}

          {combined ? (
            <g>
              <rect x={8} y={PANEL_C} width={404} height={PANEL_C_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={20} y={PANEL_C + 21} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>A and B together: 40 requests</text>
              <g role="radiogroup" aria-label="How to combine the two p99 values">
                {MODES.map((m, i) => (
                  <SvgRadioChip key={m.id} x={mx[i]} y={PANEL_C + 47} width={mw[i]} text={m.label} label={m.label} checked={m.id === mode} onSelect={() => setMode(m.id)} />
                ))}
              </g>
              <line x1={X0} x2={X1} y1={PANEL_C + 98} y2={PANEL_C + 98} strokeWidth={1.5} className={NEUTRAL.line} />
              <line x1={xOf(TARGET_MS)} x2={xOf(TARGET_MS)} y1={PANEL_C + 70} y2={PANEL_C + 98} strokeWidth={1.75} strokeDasharray="4 4" className={TONES.warn.stroke} />
              <Strip values={merged()} top={PANEL_C + 72} rows={5} pitch={5.5} radius={2.6} hide={hide} />
              {markersC.map((m) => (
                <MarkerMark key={m.text} marker={m} lineTop={PANEL_C + 66} base={PANEL_C + 98} pillY={PANEL_C + 102} />
              ))}
            </g>
          ) : (
            <g>
              <rect x={8} y={PANEL_C} width={404} height={PANEL_C_H} rx={14} strokeWidth={1.5} strokeDasharray="6 5" className={cn(NEUTRAL.surface, NEUTRAL.faintStroke)} />
              <text x={W / 2} y={PANEL_C + 58} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>Tap Combine A and B to put</text>
              <text x={W / 2} y={PANEL_C + 77} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>all 40 requests in one list</text>
            </g>
          )}

          {[0, 300, 600, 900].map((ms) => (
            <text key={ms} x={xOf(ms)} y={PANEL_C + PANEL_C_H + 17} textAnchor={ms === 0 ? "start" : ms === 900 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{ms === 900 ? "900 ms" : String(ms)}</text>
          ))}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{`${verdict.text}. Service A ${mA.text}, service B ${mB.text}.`}</p>
      </div>
    </BeatFrame>
  );
}
