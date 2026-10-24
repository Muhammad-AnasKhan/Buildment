"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail, type RailMark } from "../primitives/picture-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BAR_MAX_MS,
  DEFAULT_DISTANCE,
  DEFAULT_PROTOCOL,
  DISTANCES,
  PROTOCOLS,
  distanceOf,
  firstByteMs,
  formatMs,
  handshakeVerdict,
  protocolOf,
  segmentsOf,
  tripPhase,
  type DistanceId,
  type ProtocolId,
} from "../models/handshake-cost";

const W = 420;
const H = 334;
const PHONE = { x: 62, y: 78 };
/** Where the server card sits for each distance: the farther, the farther right. */
const SERVER_X = [210, 262, 308, 358] as const;
const BAR = { x: 20, y: 166, w: 380, h: 24 };
const CHIPS_Y = 236;
const RAIL = { x0: 48, x1: 372, y: 298 };
const LADDER = [0, 1, 2, 3] as const;

const SEGMENT_FILL: Record<string, string> = {
  TCP: "fill-blue-500 dark:fill-blue-400",
  QUIC: "fill-blue-500 dark:fill-blue-400",
  TLS: "fill-violet-500 dark:fill-violet-400",
  request: "fill-emerald-500 dark:fill-emerald-400",
};
const TOTAL_TONE = (ms: number): Tone => (ms < 100 ? "good" : ms < 300 ? "warn" : "bad");

/** 3.2: pick how the connection starts, drag the server away, and watch the round trips add up. */
export function HandshakeCostCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [protocolId, setProtocolId] = useState<ProtocolId>(DEFAULT_PROTOCOL);
  const [distanceId, setDistanceId] = useState<DistanceId>(DEFAULT_DISTANCE);

  const protocol = protocolOf(protocolId);
  const distance = distanceOf(distanceId);
  const index = DISTANCES.findIndex((d) => d.id === distanceId);
  const trips = protocol.trips.length;
  const total = firstByteMs(protocolId, distanceId);
  const segments = segmentsOf(protocolId, distanceId);
  const verdict = handshakeVerdict(protocolId, distanceId);
  const totalTone = TOTAL_TONE(total);

  const serverX = SERVER_X[index];
  const laneFrom = PHONE.x + NODE_W / 2;
  const laneTo = serverX - NODE_W / 2;
  const phase = clock.reduced ? { trip: null, progress: 0 } : tripPhase(clock.seconds, trips);

  const scale = BAR.w / BAR_MAX_MS;
  const fillEnd = BAR.x + total * scale;
  const pillW = Math.max(64, formatMs(total).length * 8.4 + 22);
  const pillX = Math.max(BAR.x, Math.min(BAR.x + BAR.w - pillW, fillEnd - pillW / 2));

  const summary = `${protocol.name}, server ${distance.name} (${distance.rttMs} ms for a round trip): ${trips} round ${trips === 1 ? "trip" : "trips"}, so the first byte arrives after ${formatMs(total)}. ${verdict.text}.`;

  const marks: RailMark[] = DISTANCES.map((d, i) => ({ at: i / 3, label: d.label }));

  // The legend lists what each round trip pays for, left to right.
  const legendXs = rowPositions(segments.map((s) => s.label.length * 7.4 + 30), BAR.x, 8);
  const legend = segments.map((s, i) => ({ ...s, x: legendXs[i] }));

  // Chips sit in one row, centred.
  const chipTexts = PROTOCOLS.map((p) => p.chip);
  const chipsW = chipTexts.reduce((a, t) => a + chipWidth(t), 0) + 8 * (chipTexts.length - 1);
  const chipXs = rowPositions(chipTexts.map((t) => chipWidth(t)), (W - chipsW) / 2);
  const chipSpots = PROTOCOLS.map((p, i) => ({ p, x: chipXs[i] }));

  const outbound = phase.progress < 0.5;
  const dotX = laneFrom + (laneTo - laneFrom) * (outbound ? phase.progress * 2 : (1 - phase.progress) * 2);

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a <b>protocol</b>, then drag the rail to move the server away.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {/* The link between the cards, and the dot that goes there and back once for every round trip. */}
          <line x1={laneFrom} x2={laneTo} y1={PHONE.y} y2={PHONE.y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {phase.trip !== null ? (
            <g>
              <circle cx={dotX + (outbound ? -8 : 8)} cy={PHONE.y} r={3} opacity={0.25} className={TONES.accent.solidFill} />
              <circle cx={dotX} cy={PHONE.y} r={5} className={outbound ? TONES.accent.solidFill : TONES.good.solidFill} />
            </g>
          ) : null}

          <SvgNode x={PHONE.x} y={PHONE.y} label="Phone" kind="phone" status={protocol.chip} />
          <SvgNode x={serverX} y={PHONE.y} label="Server" kind="server" status={`${trips} round ${trips === 1 ? "trip" : "trips"}`} statusTone={totalTone} />
          <text x={(laneFrom + laneTo) / 2} y={128} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
            {formatMs(distance.rttMs)} per round trip
          </text>

          {/* The bar: one segment per round trip, on one fixed scale, so the distance shows as length. */}
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={8} className="fill-muted" />
          {segments.map((s, i) => {
            const x = BAR.x + s.start * scale;
            const w = Math.max(3, s.ms * scale);
            const active = phase.trip === i;
            return (
              <g key={`${s.label}-${i}`}>
                <rect x={x} y={BAR.y} width={w} height={BAR.h} rx={4} className={cn(SEGMENT_FILL[s.label] ?? SEGMENT_FILL.request, "transition-opacity duration-200 motion-reduce:transition-none")} opacity={phase.trip === null || active ? 1 : 0.55} />
                {w > 12 ? <rect x={x + w - 1} y={BAR.y} width={1.5} height={BAR.h} className="fill-card" /> : null}
                {active ? <rect x={x - 1} y={BAR.y - 1} width={w + 2} height={BAR.h + 2} rx={6} fill="none" strokeWidth={2} className="stroke-foreground" /> : null}
              </g>
            );
          })}
          <rect x={pillX} y={BAR.y - 26} width={pillW} height={22} rx={11} className="fill-card" />
          <rect x={pillX} y={BAR.y - 26} width={pillW} height={22} rx={11} className={cn(TONES[totalTone].softFill, TONES[totalTone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} strokeWidth={1.5} />
          <text x={pillX + pillW / 2} y={BAR.y - 10.5} textAnchor="middle" className={cn(TONES[totalTone].text, "text-[13.5px] font-bold tabular-nums")}>
            {formatMs(total)}
          </text>

          {legend.map((s, i) => (
            <g key={`legend-${i}`}>
              <circle cx={s.x + 6} cy={BAR.y + BAR.h + 17} r={5} className={SEGMENT_FILL[s.label] ?? SEGMENT_FILL.request} />
              <text x={s.x + 16} y={BAR.y + BAR.h + 21.5} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>{s.label}</text>
            </g>
          ))}
          <text x={BAR.x + BAR.w} y={BAR.y + BAR.h + 21.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>full bar = {BAR_MAX_MS} ms</text>

          {chipSpots.map(({ p, x }) => (
            <SvgChip key={p.id} x={x} y={CHIPS_Y} text={p.chip} label={p.name} pressed={p.id === protocolId} onPress={() => setProtocolId(p.id)} />
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Distance to the server"
            valueText={`${distance.name}: ${formatMs(distance.rttMs)} per round trip`}
            value={index}
            ladder={LADDER}
            fromFraction={(f) => Math.max(0, Math.min(3, Math.round(f * 3)))}
            onChange={(i) => setDistanceId(DISTANCES[i].id)}
            onGrab={(grabbed) => (grabbed ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={index / 3} marks={marks} ends={["0.25 ms", "160 ms"]} caption="one round trip" />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
