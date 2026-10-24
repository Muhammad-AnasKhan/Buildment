"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import { textWidth } from "../models/history-layout";
import { ladderFraction, ladderValue } from "../models/sync-rate";
import {
  DEFAULT_ROW,
  FAR_ROWS,
  FAST_DONE_S,
  RTT_LADDER,
  START_S,
  TRIP_S,
  barFraction,
  doneAt,
  eastRead,
  eastUpdatesAt,
  formatMs,
  formatStale,
  staleMs,
  verdictFor,
  writeMs,
  type ReaderOutcome,
} from "../models/far-copy";

const W = 420;
const H = 392;
const WRITER = { x: 66, y: 84 };
const FAR_X = [200, 250, 300, 350] as const;
const TRACK = { x0: 24, x1: 396, h: 14 };
const ROW_B = 150;
const ROW_C = 212;
const READER_Y = 252;
const RAIL = { x0: 118, x1: 386, y: 318 };
const PERIOD_S = 6;
const r1 = (v: number) => Math.round(v * 10) / 10;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** A bar on a 0 to 20 ms scale: it fills the track at 20 ms and shows a break mark beyond. */
function ScaleBar({ y, fraction, broken, shown, tone }: { y: number; fraction: number; broken: boolean; shown: number; tone: "accent" | "warn" }) {
  const full = TRACK.x1 - TRACK.x0;
  const len = fraction > 0 ? Math.max(3, fraction * full * shown) : 0;
  const bx = TRACK.x0 + full * 0.86;
  return (
    <g aria-hidden>
      <rect x={TRACK.x0} y={y} width={full} height={TRACK.h} rx={TRACK.h / 2} className="fill-muted" />
      {len > 0 ? <rect x={TRACK.x0} y={y} width={r1(len)} height={TRACK.h} rx={TRACK.h / 2} className={tone === "accent" ? TONES.accent.solidFill : TONES.warn.solidFill} /> : null}
      {broken ? (
        <g className="stroke-card">
          <line x1={bx - 3} x2={bx + 3} y1={y + TRACK.h + 2} y2={y - 2} strokeWidth={4} />
          <line x1={bx + 3} x2={bx + 9} y1={y + TRACK.h + 2} y2={y - 2} strokeWidth={4} />
        </g>
      ) : null}
      {broken ? (
        <g className={NEUTRAL.doneStroke}>
          <line x1={bx - 3} x2={bx + 3} y1={y + TRACK.h + 2} y2={y - 2} strokeWidth={1.5} />
          <line x1={bx + 3} x2={bx + 9} y1={y + TRACK.h + 2} y2={y - 2} strokeWidth={1.5} />
        </g>
      ) : null}
    </g>
  );
}

/** 11.7 beat 3: drag the far copy and switch the wait, and see where the cost goes: time or freshness. */
export function LatencyOrFreshCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [row, setRow] = useState<number>(DEFAULT_ROW);
  const [waits, setWaits] = useState(true);
  const [read, setRead] = useState<ReaderOutcome | null>(null);
  const titleId = useId();
  const descId = useId();

  const far = FAR_ROWS[row];
  const rtt = far.rtt;
  const verdict = verdictFor(rtt, waits);
  const wMs = writeMs(rtt, waits);
  const sMs = staleMs(rtt, waits);
  const wBar = barFraction(wMs);
  const sBar = barFraction(sMs);

  const t = clock.reduced || settled ? 5 : clock.seconds % PERIOD_S;
  const done = doneAt(waits);
  const farX = FAR_X[row];
  const out = clamp01((t - START_S) / TRIP_S);
  const back = clamp01((t - START_S - TRIP_S) / TRIP_S);
  const dotOut = t >= START_S && t < START_S + TRIP_S;
  const dotBack = waits && t >= START_S + TRIP_S && t < START_S + 2 * TRIP_S;
  const x0 = WRITER.x + 56;
  const x1 = farX - 56;
  const eastValue = t >= eastUpdatesAt ? 2 : 1;
  const writerStatus = t < START_S ? "ready" : t < done ? "writing x = 2" : "done";
  const writerShown = clamp01((t - START_S) / Math.max(0.01, done - START_S));
  const staleShown = waits ? 0 : clamp01((t - FAST_DONE_S) / (eastUpdatesAt - FAST_DONE_S));

  const tap = () => setRead(eastRead(clock.reduced || settled ? (FAST_DONE_S + eastUpdatesAt) / 2 : t, waits));
  const change = (fn: () => void) => {
    fn();
    setRead(null);
    clock.restart();
  };

  const wLabel = `${formatMs(wMs)} ms`;
  const cLabel = waits ? "East readers are never stale" : `East readers can be stale for ${formatStale(sMs)} ms`;
  const description = `A writer in the West writes to a local copy in 0.3 ms and to a far copy ${far.name}, a round trip of ${formatMs(rtt)} ms. The write ${waits ? "waits for the far copy" : "does not wait"}. ${verdict.text}. ${cLabel}.${read ? ` The East reader read ${read.text}.` : ""}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<BeatButton pressed={waits} onClick={() => change(() => setWaits(!waits))}>{`Write waits for the far copy: ${waits ? "on" : "off"}`}</BeatButton>}
      hint="Drag the far copy; switch the wait."
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The writer in the West and the far copy in the East. */}
          <line x1={x0} x2={x1} y1={WRITER.y} y2={WRITER.y} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 7" className={NEUTRAL.faintStroke} />
          <SvgNode x={WRITER.x} y={WRITER.y} label="Writer" kind="user" status={writerStatus} statusTone={t >= done ? "good" : undefined} />
          <g style={{ transform: `translate(${farX}px, 0px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
            <SvgNode x={0} y={WRITER.y} label="East copy" kind="database" status={`x = ${eastValue}`} statusTone={eastValue === 2 ? "good" : undefined} />
          </g>
          {dotOut ? <circle cx={r1(x0 + (x1 - x0) * out)} cy={WRITER.y} r={7} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} /> : null}
          {dotBack ? <circle cx={r1(x1 - (x1 - x0) * back)} cy={WRITER.y} r={7} strokeWidth={2.5} className={cn(TONES.good.solidFill, "stroke-card")} /> : null}

          {/* How long the writer waits, to scale up to 20 ms. */}
          <text x={TRACK.x0} y={ROW_B - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>Writer waits</text>
          <text x={TRACK.x1} y={ROW_B - 8} textAnchor="end" className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{wLabel}</text>
          <ScaleBar y={ROW_B} fraction={wBar.fraction} broken={wBar.broken} shown={writerShown} tone="accent" />
          <text x={TRACK.x0} y={ROW_B + 31} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>bars are to scale up to 20 ms</text>

          {/* How long East readers can see the old value. */}
          <text x={TRACK.x0} y={ROW_C - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{waits ? "East readers are never stale" : "East readers see the old value for"}</text>
          <text x={TRACK.x1} y={ROW_C - 8} textAnchor="end" className={cn(waits ? TONES.good.text : TONES.warn.text, "text-[13px] font-bold tabular-nums")}>{waits ? "0 ms" : `${formatStale(sMs)} ms`}</text>
          <ScaleBar y={ROW_C} fraction={sBar.fraction} broken={sBar.broken} shown={staleShown} tone="warn" />

          {/* An East reader: tap to read at this moment of the loop. */}
          <SvgButton x={TRACK.x0 - 2} y={READER_Y - 22} width={150} height={44} rx={22} label="Read from the East copy now" onPress={tap}>
            <rect x={TRACK.x0} y={READER_Y - 15} width={146} height={30} rx={15} strokeWidth={1.5} className={cn(NEUTRAL.surface, TONES.accent.stroke)} />
            <text x={TRACK.x0 + 73} y={READER_Y + 4.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12.5px] font-semibold")}>Tap: East reads</text>
          </SvgButton>
          {read ? (
            <g>
              <rect x={188} y={READER_Y - 13} width={Math.ceil(textWidth(read.text, 12, true) + 20)} height={26} rx={13} strokeWidth={1.5} className={read.tone ? cn(TONES[read.tone].softFill, TONES[read.tone].stroke) : cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={198} y={READER_Y + 4.2} className={cn(read.tone ? TONES[read.tone].text : NEUTRAL.text, "text-[12px] font-semibold")}>{read.text}</text>
            </g>
          ) : null}

          {/* The far copy's rail: round trip in milliseconds. */}
          <text x={8} y={RAIL.y - 2} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Round trip</text>
          <text x={8} y={RAIL.y + 15} className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{`${formatMs(rtt)} ms`}</text>
          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Round trip to the far copy"
            valueText={`${formatMs(rtt)} milliseconds, ${far.name}. ${verdict.text}`}
            value={rtt}
            ladder={RTT_LADDER}
            fromFraction={(f) => ladderValue(RTT_LADDER, f)}
            onChange={(v) => {
              const i = RTT_LADDER.indexOf(v);
              if (i >= 0 && i !== row) change(() => setRow(i));
            }}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          >
            <g aria-hidden>
              <line x1={RAIL.x0} x2={RAIL.x1} y1={RAIL.y} y2={RAIL.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
              <line x1={RAIL.x0} x2={RAIL.x0 + ladderFraction(RTT_LADDER, rtt) * (RAIL.x1 - RAIL.x0)} y1={RAIL.y} y2={RAIL.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
              {FAR_ROWS.map((f) => {
                const tx = RAIL.x0 + ladderFraction(RTT_LADDER, f.rtt) * (RAIL.x1 - RAIL.x0);
                return (
                  <g key={f.id}>
                    <line x1={tx} x2={tx} y1={RAIL.y - 9} y2={RAIL.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                    <text x={tx} y={RAIL.y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`${formatMs(f.rtt)} ms`}</text>
                  </g>
                );
              })}
              {(() => {
                const hx = RAIL.x0 + ladderFraction(RTT_LADDER, rtt) * (RAIL.x1 - RAIL.x0);
                return (
                  <>
                    <circle cx={hx} cy={RAIL.y} r={17} className={TONES.accent.softFill} />
                    <circle cx={hx} cy={RAIL.y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
                    <line x1={hx - 3} x2={hx - 3} y1={RAIL.y - 4.5} y2={RAIL.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                    <line x1={hx + 3} x2={hx + 3} y1={RAIL.y - 4.5} y2={RAIL.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                  </>
                );
              })()}
            </g>
          </RailSlider>
          <text x={W / 2} y={RAIL.y + 56} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`Far copy: ${far.name}`}</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
