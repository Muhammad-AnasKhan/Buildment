"use client";

import { useId, useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, unitHash } from "../models/server-load";
import {
  ARRIVALS,
  ARRIVAL_DOTS,
  B_LADDER,
  B_MAX,
  CPU_MS,
  DEFAULT_B,
  DEFAULT_SHARE,
  QUEUE_CAP,
  SHARES,
  THREADS,
  WAIT_MS,
  bFromFraction,
  bToFraction,
  blockFrame,
  blockVerdict,
  ceilingOf,
  clampB,
  formatCeiling,
  isBlocking,
  type Mode,
} from "../models/blocking-call";

const W = 420;
const H = 322;
const SRC = { x: 58, y: 107 };
const PANEL = { x: 146, y: 46, w: 266, h: 122 };
const LOOP_LANE = { x0: 232, x1: 404, y: 118, h: 22 };
const QUEUE_HEAD = 224;
const QUEUE_GAP = 12.5;
const POOL = { x0: 176, x1: 404, y0: 86, dy: 10.5, h: 6 };
const INSET = { x: 12, y: 176, w: 214, h: 72 };
const PLOT = { x0: 34, x1: 206, y0: 200, y1: 230 };
const CEILING_MAX = 1000;
const SHARE_CHIPS_Y = 218;
const RAIL = { x0: 34, x1: 386, y: 282 };

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 3.6: drag how long the slow call blocks, tap how often it runs, and switch between an event loop and a thread pool. */
export function BlockingCallCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [mode, setMode] = useState<Mode>("loop");
  const [b, setB] = useState<number>(DEFAULT_B);
  const [share, setShare] = useState<number>(DEFAULT_SHARE);

  const blocking = isBlocking(share, b);
  const verdict = blockVerdict(mode, share, b);
  const frame = blockFrame(clock.seconds, mode, share, b, clock.reduced);
  const ceiling = ceilingOf(mode, share, b);
  const shareWords = SHARES.find((s) => s.value === share)?.words ?? "none";

  const summary = `${mode === "loop" ? "Event loop: one thread runs every request." : `Thread pool: ${THREADS} threads, each request holds one while it waits.`} ${ARRIVALS} requests arrive a second, each needing ${CPU_MS} ms of CPU and ${WAIT_MS} ms of waiting. ${blocking ? `${shareWords} of requests also run a slow call of ${b} ms.` : "No request runs a slow call."} The most it can do is about ${formatCeiling(ceiling)} requests a second. ${verdict.text}.`;

  // Arriving request dots. One dot stands for many requests.
  const arrivals = flowDots(clock.seconds, ARRIVAL_DOTS, mode === "loop" ? 1 : 2.2);
  const tail = QUEUE_HEAD - frame.queue * QUEUE_GAP;
  const loopEnd = frame.queue > 0 ? tail : LOOP_LANE.x0;
  const srcEdge = SRC.x + 56;

  const poolLaneY = (i: number) => POOL.y0 + i * POOL.dy;

  const pillText = mode === "loop" ? (frame.active ? "blocked" : "free") : frame.active ? `1 of ${THREADS} stuck` : `${THREADS} threads`;
  const pillTone = frame.active ? "bad" : "good";
  const pillW = pillText.length * 6.9 + 18;

  // The inset: the ceiling against the length of the slow call.
  const X = (v: number) => PLOT.x0 + (v / B_MAX) * (PLOT.x1 - PLOT.x0);
  const Y = (v: number) => PLOT.y1 - (Math.min(CEILING_MAX, v) / CEILING_MAX) * (PLOT.y1 - PLOT.y0);
  const curve = Array.from({ length: B_MAX / 10 + 1 }, (_, i) => `${i === 0 ? "M" : "L"}${X(i * 10).toFixed(1)} ${Y(ceilingOf(mode, share, i * 10)).toFixed(1)}`).join(" ");
  const dx = X(b);
  const dy = Y(ceiling);
  const ceilingTone = mode === "loop" ? (ceiling < ARRIVALS * 1.5 ? "bad" : ceiling < 500 ? "warn" : "good") : "warn";

  const chipWidths = SHARES.map((s) => Math.max(48, chipWidth(s.chip)));
  const chipXs = rowPositions(chipWidths, INSET.x + INSET.w + 12);
  const chipSpots = SHARES.map((s, i) => ({ s, x: chipXs[i], w: chipWidths[i] }));

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatButton pressed={mode === "loop"} onClick={() => setMode("loop")}>Event loop</BeatButton>
          <BeatButton pressed={mode === "pool"} onClick={() => setMode("pool")}>Thread pool</BeatButton>
        </>
      }
      hint={<>Drag the rail to set how long the <b>slow call</b> blocks.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {/* The server: a panel holding one lane (event loop) or eight (thread pool). */}
          <rect x={PANEL.x} y={PANEL.y + 3} width={PANEL.w} height={PANEL.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          {frame.active && mode === "loop" ? <rect x={PANEL.x - 3} y={PANEL.y - 3} width={PANEL.w + 6} height={PANEL.h + 6} rx={17} fill="none" strokeWidth={2.5} className={TONES.bad.stroke} /> : null}
          <circle cx={PANEL.x + 20} cy={PANEL.y + 21} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
          <Server x={PANEL.x + 12} y={PANEL.y + 13} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
          <text x={PANEL.x + 38} y={PANEL.y + 26} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{mode === "loop" ? "Event loop" : "Thread pool"}</text>
          <rect x={PANEL.x + PANEL.w - 10 - pillW} y={PANEL.y + 11} width={pillW} height={20} rx={10} className={cn(TONES[pillTone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={PANEL.x + PANEL.w - 10 - pillW / 2} y={PANEL.y + 25} textAnchor="middle" className={cn(TONES[pillTone].text, "text-[11.5px] font-semibold")}>{pillText}</text>

          {mode === "loop" ? (
            <g>
              <rect x={LOOP_LANE.x0} y={LOOP_LANE.y - LOOP_LANE.h / 2} width={LOOP_LANE.x1 - LOOP_LANE.x0} height={LOOP_LANE.h} rx={8} className="fill-muted" />
              {frame.active ? (
                <rect x={LOOP_LANE.x0} y={LOOP_LANE.y - LOOP_LANE.h / 2} width={Math.max(6, (LOOP_LANE.x1 - LOOP_LANE.x0) * frame.progress)} height={LOOP_LANE.h} rx={8} className={TONES.bad.solidFill} />
              ) : (
                flowDots(clock.seconds + 0.5, 5, 0.6).map((d) => (
                  <circle key={`done-${d.id}`} cx={LOOP_LANE.x0 + 8 + (LOOP_LANE.x1 - LOOP_LANE.x0 - 16) * d.progress} cy={LOOP_LANE.y} r={3.5} className={TONES.good.solidFill} />
                ))
              )}
              {frame.active ? (
                <text x={LOOP_LANE.x0} y={LOOP_LANE.y + 29} className={cn(TONES.bad.text, "text-[12px] font-bold tabular-nums")}>one slow call, {b} ms</text>
              ) : (
                <text x={LOOP_LANE.x0} y={LOOP_LANE.y + 29} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{blocking ? "short calls pass quickly" : "every call is short"}</text>
              )}
              {Array.from({ length: frame.queue }, (_, i) => (
                <circle key={`q-${i}`} cx={QUEUE_HEAD - i * QUEUE_GAP} cy={LOOP_LANE.y} r={5} strokeWidth={1.5} className={cn(frame.active ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} />
              ))}
              {frame.queue >= QUEUE_CAP
                ? [0, 1, 2].map((i) => <circle key={`more-${i}`} cx={QUEUE_HEAD - QUEUE_CAP * QUEUE_GAP + 5 - i * 6} cy={LOOP_LANE.y} r={1.8} opacity={0.85 - i * 0.25} className={TONES.bad.solidFill} />)
                : null}
              {arrivals.map((d) => {
                const x = lerp(srcEdge, loopEnd, d.progress);
                const y = lerp(SRC.y, LOOP_LANE.y, ease(Math.min(1, d.progress * 3)));
                return <circle key={d.id} cx={x} cy={y} r={4.5} className={TONES.accent.solidFill} />;
              })}
            </g>
          ) : (
            <g>
              {Array.from({ length: THREADS }, (_, i) => {
                const y = poolLaneY(i);
                const stuck = frame.stuck === i;
                return (
                  <g key={i}>
                    <rect x={POOL.x0} y={y - POOL.h / 2} width={POOL.x1 - POOL.x0} height={POOL.h} rx={3} className="fill-muted" />
                    {stuck ? <rect x={POOL.x0} y={y - POOL.h / 2} width={Math.max(6, (POOL.x1 - POOL.x0) * frame.progress)} height={POOL.h} rx={3} className={TONES.bad.solidFill} /> : null}
                  </g>
                );
              })}
              {arrivals.map((d) => {
                const lane = Math.floor(unitHash(d.id, 9) * THREADS);
                if (frame.stuck === lane) return null;
                const into = Math.min(1, d.progress / 0.2);
                const along = Math.max(0, (d.progress - 0.2) / 0.8);
                const x = d.progress < 0.2 ? lerp(srcEdge, POOL.x0, into) : lerp(POOL.x0, POOL.x1, along);
                const y = d.progress < 0.2 ? lerp(SRC.y, poolLaneY(lane), ease(into)) : poolLaneY(lane);
                return <circle key={d.id} cx={x} cy={y} r={3.2} className={TONES.accent.solidFill} />;
              })}
            </g>
          )}

          <SvgNode x={SRC.x} y={SRC.y} label="Requests" kind="user" status={`${ARRIVALS} a second`} />

          {/* The inset: how many requests a second this setup can finish, against the length of the slow call. */}
          <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={INSET.x + 12} y={INSET.y + 17} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>ceiling</text>
          <text x={INSET.x + INSET.w - 12} y={INSET.y + 17} textAnchor="end" className={cn(TONES[ceilingTone].text, "text-[12.5px] font-bold tabular-nums")}>{formatCeiling(ceiling)} requests/s</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.y1} y2={PLOT.y1} strokeWidth={1.5} className={NEUTRAL.line} />
          <path d={curve} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
          <text x={PLOT.x0} y={INSET.y + INSET.h - 7} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0</text>
          <text x={(PLOT.x0 + PLOT.x1) / 2} y={INSET.y + INSET.h - 7} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>slow call</text>
          <text x={PLOT.x1} y={INSET.y + INSET.h - 7} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{B_MAX} ms</text>
          <circle cx={dx} cy={dy} r={6.5} strokeWidth={2} className={cn(TONES[ceilingTone].solidFill, "stroke-card")} />

          <text x={INSET.x + INSET.w + 12} y={INSET.y + 17} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>requests with a slow call</text>
          {chipSpots.map(({ s, x, w }) => (
            <SvgChip key={s.value} x={x} y={SHARE_CHIPS_Y} text={s.chip} width={w} label={`Slow call in ${s.words} of requests`} pressed={s.value === share} onPress={() => setShare(s.value)} />
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Length of the slow call"
            valueText={`${b} ms. ${verdict.text}`}
            value={b}
            ladder={B_LADDER}
            fromFraction={bFromFraction}
            onChange={(v) => setB(clampB(v))}
            onGrab={(grabbed) => (grabbed ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={bToFraction(b)}
              marks={[{ at: bToFraction(20), label: "20 ms" }, { at: bToFraction(100), label: "100 ms" }]}
              ends={["0", `${B_MAX} ms`]}
              caption={`slow call: ${b} ms`}
            />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
