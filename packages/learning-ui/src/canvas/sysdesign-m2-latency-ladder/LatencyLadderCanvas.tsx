"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LogRuler, type RulerBand } from "../primitives/log-ruler";
import { SvgNode, NODE_W } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import type { ActorKind } from "../renderers/scene/types";
import {
  compareRungs,
  formatCount,
  formatHuman,
  formatReal,
  humanSeconds,
  raceFrame,
  roundTripAt,
  STREAM_RATIO,
  type LatencyRung,
} from "../models/latency-ladder";

export type LadderRung = LatencyRung & { place: string; kind: ActorKind };

export type LatencyLadderProps = {
  title: string;
  purpose: string;
  limits: string;
  rungs: readonly LadderRung[];
  bands: readonly RulerBand[];
  min: number;
  max: number;
  start: { pinned: string; current: string };
};

const W = 420;
const H = 204;
const ORIGIN = { x: 70, y: 124 };
const DEST_X = 350;
const LANE_FAST = 86;
const LANE_SLOW = 162;
const LANE_ONE = 124;

type Pt = { x: number; y: number };
const r2 = (v: number) => Math.round(v * 100) / 100;
const along = (a: Pt, b: Pt, t: number): Pt => ({ x: r2(a.x + (b.x - a.x) * t), y: r2(a.y + (b.y - a.y) * t) });

/** 2.2: tap two rungs of the ladder; the slow trip runs while the fast one counts. */
export function LatencyLadderCanvas({ title, limits, rungs, bands, min, max, start }: LatencyLadderProps) {
  const box = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState(start);
  const { seconds, reduced, freeze, unfreeze, restart } = useBeatClock(box);

  // A new pair starts a new race from the beginning.
  const pair = `${pick.pinned}|${pick.current}`;
  useEffect(() => {
    restart();
  }, [pair, restart]);

  const byId = (id: string) => rungs.find((r) => r.id === id) ?? rungs[0];
  const cur = byId(pick.current);
  const pin = byId(pick.pinned);
  const cmp = compareRungs(pin, cur);
  const fast = cmp.fast as LadderRung;
  const slow = cmp.slow as LadderRung;
  const frame = raceFrame(seconds, cmp, reduced);

  const from = { x: ORIGIN.x + NODE_W / 2, y: ORIGIN.y };
  const slowY = cmp.same ? LANE_ONE : LANE_SLOW;
  const slowTo = { x: DEST_X - NODE_W / 2, y: slowY };
  const fastTo = { x: DEST_X - NODE_W / 2, y: LANE_FAST };
  const slowAt = roundTripAt(frame.progress);
  const slowPacket = along(from, slowTo, slowAt);
  const moving = !frame.holding && !reduced;
  const arrival = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 8);

  const humanNow = formatHuman(frame.humanElapsed);
  // The chip keeps only the last word ("reads", "trips"): the card names the place.
  const countNow = `${formatCount(frame.count)} ${fast.plural.split(" ").pop()}`;
  const description = cmp.same
    ? `${slow.name}: ${formatReal(slow.ns)}, which is ${formatHuman(humanSeconds(slow.ns))} in human time.`
    : `${slow.name} takes ${formatReal(slow.ns)}, ${formatHuman(humanSeconds(slow.ns))} in human time. In that time ${fast.name.toLowerCase()} can happen ${formatCount(cmp.ratio)} times. ${cmp.verdict}.`;

  // The fast lane: one packet bouncing, or a stream when it is too quick to follow.
  const fastLane = () => {
    if (cmp.same) return null;
    if (!moving) return null;
    if (cmp.ratio <= STREAM_RATIO) {
      const p = along(from, fastTo, roundTripAt(frame.fastPhase));
      return <circle cx={p.x} cy={p.y} r={7} className={TONES.good.solidFill} />;
    }
    return [0, 1, 2, 3, 4, 5].map((k) => {
      const p = along(from, fastTo, (seconds * 2.2 + k / 6) % 1);
      return <circle key={k} cx={p.x} cy={p.y} r={4} className={TONES.good.solidFill} opacity={0.85} />;
    });
  };

  const chipW = (text: string) => text.length * 6.9 + 40;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap or drag along the <b>ladder</b>. Tap two rungs to compare them.</>}
    >
      <div ref={box} onPointerDown={freeze} onPointerUp={unfreeze} onPointerCancel={unfreeze} onPointerLeave={unfreeze}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Tracks: from your code to each place, lit while a packet runs. */}
          {!cmp.same ? <line x1={from.x} y1={from.y} x2={fastTo.x} y2={fastTo.y} strokeWidth={2.5} strokeLinecap="round" className={TONES.good.stroke} opacity={0.55} /> : null}
          <line x1={from.x} y1={from.y} x2={slowTo.x} y2={slowTo.y} strokeWidth={2.5} strokeLinecap="round" className={TONES.accent.stroke} opacity={0.55} />

          {fastLane()}
          {moving ? (
            <g>
              {[1, 2, 3].map((i) => {
                const p = along(from, slowTo, roundTripAt(Math.max(0, frame.progress - i * 0.012)));
                return <circle key={i} cx={p.x} cy={p.y} r={7 - i * 1.5} opacity={0.35 - i * 0.08} className={TONES.accent.solidFill} />;
              })}
              <circle cx={slowPacket.x} cy={slowPacket.y} r={8} className={TONES.accent.solidFill} />
              <circle cx={slowPacket.x} cy={slowPacket.y} r={3} className="fill-card" />
            </g>
          ) : null}

          <SvgNode x={ORIGIN.x} y={ORIGIN.y} label="Your code" kind="worker" status="1 ns = 1 s" />
          {!cmp.same ? <SvgNode x={DEST_X} y={LANE_FAST} label={fast.place} kind={fast.kind} status={formatReal(fast.ns)} statusTone="good" arrival={moving && cmp.ratio <= STREAM_RATIO ? arrival(frame.fastPhase) : 0} /> : null}
          <SvgNode x={DEST_X} y={slowY} label={slow.place} kind={slow.kind} status={formatReal(slow.ns)} statusTone="accent" arrival={moving ? arrival(frame.progress) : 0} />

          {/* The count: how many fast trips fit in the slow one, so far. */}
          {!cmp.same ? (
            <g>
              {(() => {
                const mid = along(from, fastTo, 0.5);
                const w = chipW(countNow);
                return (
                  <g transform={`translate(${mid.x} ${mid.y - 24})`}>
                    <rect x={-w / 2} y={-12} width={w} height={24} rx={12} className={cn(NEUTRAL.surface, TONES.good.stroke)} strokeWidth={1.5} />
                    <text y={4.5} textAnchor="middle" className={cn(TONES.good.text, "text-[12.5px] font-semibold tabular-nums")}>
                      × {countNow}
                    </text>
                  </g>
                );
              })()}
            </g>
          ) : null}

          {/* The human clock: time passed on the slow trip, if 1 ns lasted 1 second. */}
          {(() => {
            const mid = along(from, slowTo, 0.5);
            const w = chipW(humanNow) + 6;
            return (
              <g transform={`translate(${mid.x} ${mid.y + 26})`}>
                <rect x={-w / 2} y={-12} width={w} height={24} rx={12} className={NEUTRAL.surface} />
                <rect x={-w / 2} y={-12} width={w} height={24} rx={12} className={cn(TONES.accent.softFill, TONES.accent.stroke)} strokeWidth={1.5} />
                <Clock x={-w / 2 + 8} y={-7} width={14} height={14} strokeWidth={2.25} className={cn(TONES.accent.stroke, "fill-none")} aria-hidden />
                <text x={9} y={4.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12.5px] font-semibold tabular-nums")}>
                  {humanNow}
                </text>
              </g>
            );
          })()}

          <VerdictBanner width={W} text={cmp.verdict} tone="accent" />
        </svg>
      </div>
      <LogRuler
        rungs={rungs.map((r) => ({ id: r.id, label: r.name, value: r.ns }))}
        bands={bands}
        min={min}
        max={max}
        current={pick.current}
        pinned={pick.pinned}
        onChange={setPick}
        label="Latency ladder, from a cache hit to a trip across the world"
        valueText={`${cur.name}, ${formatReal(cur.ns)}, ${formatHuman(humanSeconds(cur.ns))} in human time. ${cmp.verdict}. Press Enter to compare from here.`}
      />
    </BeatFrame>
  );
}
