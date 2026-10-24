"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_DELAY,
  DELAYS,
  EVENTS,
  EVENT_SPAN_S,
  LATENESS_S,
  MAX_LATE_S,
  WINDOWS,
  WINDOW_S,
  evaluate,
  lagText,
  lateness,
  latestArrival,
  playhead,
  valueText,
  verdictFor,
  watermarkAt,
} from "./model";

const W = 420;
const H = 424;
const CARD_Y = 72;
const PLOT = { x0: 52, x1: 404, top: 134, base: 246 };
const BARS = { y: 272, h: 26 };
const RAIL = { x0: 44, x1: 376, y: 384 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (t: number) => r1(PLOT.x0 + (Math.max(0, Math.min(EVENT_SPAN_S, t)) / EVENT_SPAN_S) * (PLOT.x1 - PLOT.x0));
const yOf = (late: number) => r1(PLOT.base - (Math.max(0, Math.min(MAX_LATE_S, late)) / MAX_LATE_S) * (PLOT.base - PLOT.top));

/** 15.6 beat 4: drag the watermark delay and watch which late events are dropped and how far behind the results run. */
export function WatermarkDelayPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [delay, setDelay] = useState<number>(DEFAULT_DELAY);
  const [lenient, setLenient] = useState(false);

  const e = evaluate(delay, lenient ? LATENESS_S : 0);
  const verdict = verdictFor(e);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  // The playhead is an arrival time: the watermark line moves as events arrive. A still picture rests at the end.
  const tau = clock.reduced ? 1000 : playhead(clock.seconds);
  const wm = watermarkAt(delay, tau);
  const latest = clock.reduced ? null : latestArrival(tau);

  const resultTone: Tone = delay >= 30 ? "warn" : "good";
  const description = `Forty events in two 60 second windows, plotted by event time and by how late they arrived. ${valueText(e)}. ${e.windows.map((w, i) => `Window ${i + 1}: ${w.counted} of ${w.total} counted`).join("; ")}. ${verdict.text}.`;

  const legendDrop = lenient ? "corrected" : "dropped";
  const dropFill = lenient ? TONES.warn.solidFill : TONES.bad.solidFill;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>delay</b> rail. Red crosses are events that arrived after their window closed.</>}
      controls={
        <BeatChoice<"off" | "on">
          label="Allowed lateness"
          options={[
            { id: "off", label: "No allowed lateness" },
            { id: "on", label: "Allowed lateness 30 s" },
          ]}
          value={lenient ? "on" : "off"}
          onChange={(id) => setLenient(id === "on")}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <SvgNode x={62} y={CARD_Y} label="Result" kind="clock" status={lagText(delay)} statusTone={resultTone} />
          <SvgNode x={210} y={CARD_Y} label="Counted" kind="database" status={`${e.counted} of ${EVENTS.length}`} statusTone={e.dropped > 0 ? "warn" : "good"} />
          {lenient ? (
            <SvgNode x={358} y={CARD_Y} label="Corrected" kind="note" status={e.corrected > 0 ? `${e.corrected} later` : "none"} statusTone={e.corrected > 0 ? "warn" : "good"} />
          ) : (
            <SvgNode x={358} y={CARD_Y} label="Dropped" kind="note" status={e.dropped > 0 ? `${e.dropped} ${e.dropped === 1 ? "event" : "events"}` : "none"} statusTone={e.dropped > 0 ? "bad" : "good"} />
          )}

          {/* The plot: event time across, how late the event arrived up. */}
          <text x={PLOT.x0} y={PLOT.top - 12} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>how late each event arrived</text>
          {Array.from({ length: WINDOWS }, (_, w) => (
            <rect key={w} x={xOf(w * WINDOW_S)} y={PLOT.top - 6} width={r1(xOf((w + 1) * WINDOW_S) - xOf(w * WINDOW_S))} height={PLOT.base - PLOT.top + 6} className={w % 2 === 0 ? "fill-muted-foreground/10" : "fill-muted-foreground/[0.04]"} />
          ))}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.base} y2={PLOT.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 30, 60].map((s) => (
            <text key={s} x={PLOT.x0 - 10} y={yOf(s) + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{s === 60 ? "60 s" : String(s)}</text>
          ))}
          {[0, 60].map((s) => (
            <text key={s} x={xOf(s)} y={PLOT.base + 17} textAnchor={s === 0 ? "start" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{String(s)}</text>
          ))}
          <text x={PLOT.x1} y={PLOT.base + 17} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>event time (s)</text>

          {/* The watermark moves right as events arrive. */}
          {wm !== null ? <line x1={xOf(wm)} x2={xOf(wm)} y1={PLOT.top - 6} y2={PLOT.base} strokeWidth={2} strokeDasharray="5 3" className={TONES.accent.stroke} /> : null}

          {EVENTS.map(([et], i) => {
            const fate = e.fates[i];
            const cx = xOf(et);
            const cy = yOf(lateness(i));
            const odd = fate !== "counted";
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={odd ? 5.5 : 4} strokeWidth={1.5} className={cn(odd ? dropFill : TONES.accent.solidFill, "stroke-card transition-colors duration-200 motion-reduce:transition-none")}>
                  <title>{`event at ${et} s arrived ${Math.round(lateness(i) * 10) / 10} s late: ${fate}`}</title>
                </circle>
                {fate === "dropped" ? (
                  <g strokeWidth={1.75} strokeLinecap="round" className="stroke-card">
                    <line x1={cx - 2.4} y1={cy - 2.4} x2={cx + 2.4} y2={cy + 2.4} />
                    <line x1={cx - 2.4} y1={cy + 2.4} x2={cx + 2.4} y2={cy - 2.4} />
                  </g>
                ) : null}
              </g>
            );
          })}
          {latest ? <circle cx={xOf(EVENTS[latest.index][0])} cy={yOf(lateness(latest.index))} r={r1(5 + Math.min(1, latest.age / 8) * 7)} fill="none" strokeWidth={2} opacity={Math.max(0, 1 - latest.age / 8)} className={TONES.accent.stroke} /> : null}

          {/* The two windows. */}
          {e.windows.map((w, i) => {
            const x = xOf(i * WINDOW_S) + (i === 0 ? 0 : 1.5);
            const width = r1(xOf((i + 1) * WINDOW_S) - xOf(i * WINDOW_S) - 1.5);
            const lost = w.counted < w.total;
            return (
              <g key={i}>
                <rect x={x} y={BARS.y} width={width} height={BARS.h} rx={9} strokeWidth={1.5} className={cn(lost ? TONES.warn.softFill : TONES.good.softFill, lost ? TONES.warn.stroke : TONES.good.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={r1(x + width / 2)} y={BARS.y + 17.5} textAnchor="middle" className={cn(lost ? TONES.warn.text : TONES.good.text, "text-[12.5px] font-bold tabular-nums")}>{`${i * WINDOW_S} to ${(i + 1) * WINDOW_S} s: ${w.counted} of ${w.total}`}</text>
              </g>
            );
          })}

          {/* A key to the dots. */}
          <g aria-hidden>
            <circle cx={PLOT.x0 + 5} cy={318} r={4} className={TONES.accent.solidFill} />
            <text x={PLOT.x0 + 15} y={322} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>counted</text>
            <circle cx={PLOT.x0 + 98} cy={318} r={5} className={dropFill} />
            <text x={PLOT.x0 + 109} y={322} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{legendDrop}</text>
            <line x1={PLOT.x0 + 196} x2={PLOT.x0 + 206} y1={318} y2={318} strokeWidth={2} strokeDasharray="4 2" className={TONES.accent.stroke} />
            <text x={PLOT.x0 + 212} y={322} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>watermark</text>
          </g>

          {/* The delay rail. */}
          <text x={22} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`watermark delay: ${delay} s`}</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={DELAYS.map((v) => ({ value: v, label: String(v), at: v / 60 }))}
            value={delay}
            onChange={setDelay}
            ariaLabel="Watermark delay in seconds"
            valueText={valueText(e)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
