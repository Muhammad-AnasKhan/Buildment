"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import type { ActorKind } from "../renderers/scene/types";
import { flowDots, unitHash } from "../models/server-load";
import { PictureSlider, SliderRail, type RailMark } from "./picture-slider";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { NODE_W, SvgNode } from "./svg-node";
import { LABEL_HALO, NEUTRAL, TONES, type Tone } from "./tones";

// "Traffic into a server", as one reusable picture: a source card sends
// request dots along a lane at a rate that follows the load, a line of dots
// piles up in front of the server card, the server's pill turns good, warn or
// bad, and a small inset curve has a dot that rides it as the learner drags
// the rail at the bottom. Below the source sits either a crowd that grows with
// the load or a small note card (for example a live equation). Everything is
// data: another course can pass its own cards, curve, words and rail.

export const TRAFFIC_W = 420;
export const TRAFFIC_H = 300;

const SRC = { x: 66, y: 88 };
const SRV = { x: 354, y: 88 };
const LANE_Y = 88;
const SRC_EDGE = SRC.x + NODE_W / 2;
const SRV_EDGE = SRV.x - NODE_W / 2;
const HEAD_X = SRV_EDGE - 9;
const SPACING = 12.5;
/** Most dots the line in front of the server can show; one dot stands for many requests. */
export const QUEUE_CAP = 12;
const RAIL = { x0: 34, x1: 386, y: 262 };
const PLOT = { x0: 244, x1: 398, y0: 154, y1: 200 };
/** Dots a second the line grows by in the picture while the server is over 100%. */
const GROW_DOTS = 3;
const DROP_EVERY = 0.55;
const DROP_FALL = 1.1;

export type TrafficCard = { label: string; kind?: ActorKind; status: string; tone?: Tone };

export type LoadCurve = {
  /** y for a given x, in the curve's own units; Infinity is allowed. */
  f: (x: number) => number;
  xMax: number;
  yMax: number;
  /** The current x; past xMax the dot sits on the right edge. */
  x: number;
  /** The words by the moving dot, for example "100 ms". */
  label: string;
  tone: Tone;
  /** Words over the plot (what y is) and under it (what x is). */
  yCaption: string;
  xCaption: string;
  /** Words under the left and right ends of the x axis. */
  xEnds: [string, string];
};

export type TrafficAside =
  | { kind: "crowd"; count: number }
  | { kind: "note"; title: string; formula: string; value: string; tone: Tone };

export type TrafficSlider = {
  label: string;
  valueText: string;
  value: number;
  ladder: readonly number[];
  fraction: number;
  fromFraction: (f: number) => number;
  onChange: (value: number) => void;
  marks?: RailMark[];
  ends: [string, string];
  caption: string;
};

export type TrafficPlaygroundProps = {
  /** Accessible name of the picture. */
  label: string;
  /** The current state in words, for screen readers. */
  summary: string;
  seconds: number;
  /** Reduced motion: draw a still frame that tells the whole story. */
  still: boolean;
  source: TrafficCard;
  server: TrafficCard;
  flow: {
    /** Request dots a second drawn in the lane. */
    arrivalDots: number;
    /** Dots a second the line in front of the server moves forward. */
    serviceDots: number;
    /** Requests inside the server in the model; drawn as up to QUEUE_CAP dots. */
    inside: number;
    /** True past 100%: the line grows, and some requests time out. */
    growing: boolean;
    tone: Tone;
  };
  verdict: { text: string; tone: Tone };
  curve: LoadCurve;
  aside: TrafficAside;
  slider: TrafficSlider;
};

/** The line in front of the server: how many dots, and whether more wait beyond them. */
export function queueDots(inside: number, growing: boolean, elapsed: number, still: boolean): { count: number; more: boolean; full: boolean } {
  if (growing) {
    const count = still ? QUEUE_CAP : Math.min(QUEUE_CAP, 4 + Math.floor(Math.max(0, elapsed) * GROW_DOTS));
    return { count, more: count >= QUEUE_CAP, full: count >= QUEUE_CAP };
  }
  const n = Number.isFinite(inside) ? Math.max(0, Math.round(inside)) : 0;
  return { count: Math.min(QUEUE_CAP, n), more: n > QUEUE_CAP, full: false };
}

export function TrafficPlayground({ label, summary, seconds, still, source, server, flow, verdict, curve, aside, slider }: TrafficPlaygroundProps) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();

  // When the server tips past 100%, remember the moment, so the line can grow from then on.
  const [growth, setGrowth] = useState({ growing: flow.growing, since: seconds });
  if (growth.growing !== flow.growing) setGrowth({ growing: flow.growing, since: seconds });
  const elapsed = flow.growing ? Math.max(0, seconds - growth.since) : 0;
  const queue = queueDots(flow.inside, flow.growing, elapsed, still);

  const tail = HEAD_X - queue.count * SPACING;
  const flowEnd = queue.count > 0 ? tail : SRV.x;
  const dots = flowDots(seconds, flow.arrivalDots);
  const shiftFrac = queue.count > 0 && !still ? ease((((seconds * flow.serviceDots) % 1) + 1) % 1) : 0;
  const qTone = TONES[flow.tone];

  // Past 100%, once the line is full, requests that waited too long drop out of it.
  const drops: { x: number; age: number }[] = [];
  if (flow.growing && queue.full && !still) {
    const fullAt = (QUEUE_CAP - 4) / GROW_DOTS;
    const t = elapsed - fullAt;
    if (t > 0) {
      const k = Math.floor(t / DROP_EVERY);
      for (const j of [k - 1, k]) {
        const age = t - j * DROP_EVERY;
        if (j < 0 || age > DROP_FALL) continue;
        const slot = Math.floor(unitHash(j, 7) * QUEUE_CAP);
        drops.push({ x: HEAD_X - slot * SPACING, age });
      }
    }
  }

  return (
    <PictureSlider
      svgRef={svg}
      x0={RAIL.x0}
      x1={RAIL.x1}
      label={slider.label}
      valueText={slider.valueText}
      value={slider.value}
      ladder={slider.ladder}
      fromFraction={slider.fromFraction}
      onChange={slider.onChange}
    >
      <svg ref={svg} viewBox={`0 0 ${TRAFFIC_W} ${TRAFFIC_H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{label}</title>
        <desc id={descId}>{summary}</desc>
        <DotGrid width={TRAFFIC_W} height={TRAFFIC_H} />

        {/* The lane between the two cards. */}
        <line x1={SRC_EDGE} x2={SRV_EDGE} y1={LANE_Y} y2={LANE_Y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />

        {/* Request dots, drawn under the cards so they leave one and vanish into the other. */}
        {dots.map((d) => {
          const x = SRC.x + 40 + (flowEnd - SRC.x - 40) * d.progress;
          return (
            <g key={d.id}>
              <circle cx={x - 7} cy={LANE_Y} r={3} opacity={0.25} className={TONES.accent.solidFill} />
              <circle cx={x} cy={LANE_Y} r={4.5} className={TONES.accent.solidFill} />
            </g>
          );
        })}

        {/* The line in front of the server. It steps forward as the server finishes requests. */}
        {Array.from({ length: queue.count + (shiftFrac > 0 ? 1 : 0) }, (_, i) => {
          const x = HEAD_X - i * SPACING + shiftFrac * SPACING;
          const opacity = i === queue.count ? shiftFrac : i === 0 ? 1 - shiftFrac * 0.6 : 1;
          return <circle key={i} cx={x} cy={LANE_Y} r={5} opacity={opacity} className={cn(qTone.solidFill, "stroke-card")} strokeWidth={1.5} />;
        })}
        {queue.more
          ? [0, 1, 2].map((i) => <circle key={`more-${i}`} cx={tail + 2 - i * 6} cy={LANE_Y} r={1.8} opacity={0.8 - i * 0.25} className={qTone.solidFill} />)
          : null}
        {drops.map((d) => (
          <g key={`drop-${d.x}-${d.age.toFixed(2)}`} opacity={1 - d.age / DROP_FALL} transform={`translate(${d.x} ${LANE_Y + 10 + d.age * 26})`}>
            <line x1={-3.5} x2={3.5} y1={-3.5} y2={3.5} strokeWidth={2} strokeLinecap="round" className={TONES.bad.stroke} />
            <line x1={-3.5} x2={3.5} y1={3.5} y2={-3.5} strokeWidth={2} strokeLinecap="round" className={TONES.bad.stroke} />
          </g>
        ))}

        <SvgNode x={SRC.x} y={SRC.y} label={source.label} kind={source.kind ?? "user"} status={source.status} statusTone={source.tone} />
        <SvgNode x={SRV.x} y={SRV.y} label={server.label} kind={server.kind ?? "server"} status={server.status} statusTone={server.tone} mark={server.tone === "bad" ? "bad" : undefined} />

        {aside.kind === "crowd" ? <Crowd count={aside.count} /> : <NoteCard {...aside} />}
        <CurveInset curve={curve} />

        <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={slider.fraction} marks={slider.marks} ends={slider.ends} caption={slider.caption} />
        <VerdictBanner width={TRAFFIC_W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </PictureSlider>
  );
}

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

const CROWD_COLS = 12;
const CROWD_MAX = 60;

/** Small people under the source card, one more for every step up in load. */
function Crowd({ count }: { count: number }) {
  const n = Math.max(0, Math.min(CROWD_MAX, Math.round(count)));
  return (
    <g aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const cx = 22 + (i % CROWD_COLS) * 16.5;
        const cy = 146 + Math.floor(i / CROWD_COLS) * 17;
        return (
          <g key={i} className="fill-violet-400/80 dark:fill-violet-300/70">
            <circle cx={cx} cy={cy - 4.5} r={2.8} />
            <rect x={cx - 4} y={cy - 1} width={8} height={6.5} rx={3} />
          </g>
        );
      })}
    </g>
  );
}

/** A small card with a title, a formula and its live value. */
function NoteCard({ title, formula, value, tone }: { title: string; formula: string; value: string; tone: Tone }) {
  return (
    <g>
      <rect x={12} y={134} width={208} height={94} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
      <text x={24} y={154} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{title}</text>
      <text x={24} y={181} className={cn(NEUTRAL.text, "text-[15px] font-semibold")}>{formula}</text>
      <rect x={18} y={192} width={196} height={28} rx={14} className={TONES[tone].softFill} />
      <text x={116} y={211} textAnchor="middle" className={cn(TONES[tone].text, "font-mono text-[13.5px] font-bold tabular-nums")}>{value}</text>
    </g>
  );
}

/** Sample a curve into an SVG path, stopping where it leaves the top of the plot. */
export function curvePath(f: (x: number) => number, xMax: number, yMax: number, steps = 120): string {
  const X = (x: number) => PLOT.x0 + (x / xMax) * (PLOT.x1 - PLOT.x0);
  const Y = (y: number) => PLOT.y1 - (Math.max(0, y) / yMax) * (PLOT.y1 - PLOT.y0);
  const parts: string[] = [];
  let prev: [number, number] | null = null;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * xMax;
    const y = f(x);
    if (!Number.isFinite(y) || y > yMax) {
      // Close the path at the top edge, between the last point inside and this one.
      if (prev && Number.isFinite(y)) {
        const t = (yMax - prev[1]) / (y - prev[1]);
        parts.push(`L${X(prev[0] + t * (x - prev[0])).toFixed(1)} ${Y(yMax).toFixed(1)}`);
      } else if (prev) parts.push(`L${X(prev[0]).toFixed(1)} ${Y(yMax).toFixed(1)}`);
      break;
    }
    parts.push(`${parts.length ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`);
    prev = [x, y];
  }
  return parts.join(" ");
}

function CurveInset({ curve }: { curve: LoadCurve }) {
  const X = (x: number) => PLOT.x0 + (Math.max(0, Math.min(curve.xMax, x)) / curve.xMax) * (PLOT.x1 - PLOT.x0);
  const Y = (y: number) => PLOT.y1 - (Math.max(0, Math.min(curve.yMax, y)) / curve.yMax) * (PLOT.y1 - PLOT.y0);
  const raw = curve.x > curve.xMax ? Infinity : curve.f(curve.x);
  const off = !Number.isFinite(raw) || raw > curve.yMax;
  const dx = X(curve.x);
  const dy = off ? PLOT.y0 : Y(raw);
  const right = dx > (PLOT.x0 + PLOT.x1) / 2;
  const labelX = right ? dx - 11 : dx + 11;
  const labelY = dy < PLOT.y0 + 14 ? dy + 17 : dy - 8;
  const tone = TONES[curve.tone];
  return (
    <g>
      <rect x={230} y={124} width={180} height={102} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
      <text x={242} y={141} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{curve.yCaption}</text>
      <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.y1} y2={PLOT.y1} className={NEUTRAL.line} strokeWidth={1.5} />
      <line x1={PLOT.x1} x2={PLOT.x1} y1={PLOT.y0 - 4} y2={PLOT.y1} className={NEUTRAL.faintStroke} strokeWidth={1.5} strokeDasharray="3 4" />
      <path d={curvePath(curve.f, curve.xMax, curve.yMax)} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={TONES.accent.stroke} />
      <text x={PLOT.x0} y={217} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{curve.xEnds[0]}</text>
      <text x={(PLOT.x0 + PLOT.x1) / 2} y={217} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{curve.xCaption}</text>
      <text x={PLOT.x1} y={217} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{curve.xEnds[1]}</text>
      {off ? <path d={`M${dx - 5} ${dy - 9} L${dx} ${dy - 15} L${dx + 5} ${dy - 9} Z`} className={tone.solidFill} /> : null}
      <circle cx={dx} cy={dy} r={6.5} className={cn(tone.solidFill, "stroke-card")} strokeWidth={2} />
      <text x={labelX} y={labelY} textAnchor={right ? "end" : "start"} className={cn(tone.text, LABEL_HALO, "text-[12.5px] font-bold tabular-nums")}>{curve.label}</text>
    </g>
  );
}
