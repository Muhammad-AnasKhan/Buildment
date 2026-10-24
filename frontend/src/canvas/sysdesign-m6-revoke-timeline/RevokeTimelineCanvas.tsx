"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { PictureSlider, SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  LANES,
  LIFETIME,
  LIFETIME_LADDER,
  REFRESH_S,
  axisFraction,
  clampLifetime,
  gapSeconds,
  laneDots,
  laneLabel,
  lifetimeFromFraction,
  lifetimeToFraction,
  revokeVerdict,
  type LaneId,
} from "../models/revoke-timeline";

const W = 420;
const H = 360;
const STRIP = { x0: 100, x1: 404 };
const LANE0 = 72;
const LANE_H = 58;
const LANE_PITCH = 64;
const BAN_X = 96;
const RAIL = { x0: STRIP.x0 + 0.5 * (STRIP.x1 - STRIP.x0), x1: STRIP.x1, y: 326 };
const SWEEP_S = 4.5;
const PERIOD_S = 8.5;

const X = (seconds: number) => Math.round((STRIP.x0 + axisFraction(seconds) * (STRIP.x1 - STRIP.x0)) * 100) / 100;
const TICKS = [
  { s: 1, label: "1 s", anchor: "start" as const },
  { s: 10, label: "10 s", anchor: "middle" as const },
  { s: 60, label: "1 min", anchor: "middle" as const },
  { s: 600, label: "10 min", anchor: "middle" as const },
  { s: 3600, label: "1 h", anchor: "end" as const },
];

/** 6.7: ban a seller and watch when each design notices; drag the token lifetime. */
export function RevokeTimelineCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [minutes, setMinutes] = useState<number>(LIFETIME.default);
  const [runStart, setRunStart] = useState(0);
  const titleId = useId();
  const descId = useId();

  const verdict = revokeVerdict(minutes);
  const elapsed = beat.seconds - runStart;
  const settled = beat.reduced || elapsed < 0;
  const sweep = settled ? 1 : Math.min(1, (elapsed % PERIOD_S) / SWEEP_S);
  const headX = STRIP.x0 + sweep * (STRIP.x1 - STRIP.x0);

  const change = (v: number) => {
    setMinutes(clampLifetime(v));
    setRunStart(beat.seconds + 1.2);
  };

  const toneOf = (id: LaneId) => (id === "sessions" ? TONES.good : id === "denylist" ? TONES.warn : verdict.tone === "bad" ? TONES.bad : TONES.warn);
  const description = `The seller is banned and keeps sending requests. Sessions refuse the next request. Signed tokens alone let the seller in for up to ${clampLifetime(minutes)} minutes. A denylist closes the gap to ${REFRESH_S} seconds. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag across the picture to change the <b>token lifetime</b>, then press Ban.</>}
      controls={<BeatButton onClick={() => setRunStart(beat.seconds)}>Ban the seller</BeatButton>}
    >
      <div ref={box}>
        <PictureSlider
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          label="Token lifetime in minutes"
          valueText={`${clampLifetime(minutes)} minutes. ${verdict.text}`}
          value={minutes}
          ladder={LIFETIME_LADDER}
          fromFraction={lifetimeFromFraction}
          onChange={change}
        >
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
            <title id={titleId}>{title}</title>
            <desc id={descId}>{description}</desc>
            <DotGrid width={W} height={H} />

            <text x={124} y={56} className={cn(NEUTRAL.mutedText, "text-[12px]")}>the seller keeps sending requests</text>
            <rect x={BAN_X - 20} y={44} width={40} height={20} rx={10} className={cn(TONES.bad.softFill, TONES.bad.stroke)} strokeWidth={1.5} />
            <text x={BAN_X} y={58.5} textAnchor="middle" className={cn(TONES.bad.text, "text-[12px] font-bold")}>ban</text>

            {LANES.map((lane, i) => {
              const top = LANE0 + i * LANE_PITCH;
              const cy = top + 20;
              const gap = gapSeconds(lane.id, minutes);
              const tone = toneOf(lane.id);
              return (
                <g key={lane.id}>
                  <rect x={6} y={top} width={408} height={LANE_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                  <text x={14} y={top + 24} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{lane.name}</text>
                  <line x1={STRIP.x0} x2={STRIP.x1} y1={cy} y2={cy} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                  {TICKS.map((tick) => (
                    <line key={tick.s} x1={X(tick.s)} x2={X(tick.s)} y1={cy - 6} y2={cy + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                  ))}
                  {gap > 0 ? (
                    <rect x={STRIP.x0} y={cy - 6} width={Math.max(0, X(gap) - STRIP.x0)} height={12} rx={6} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke, "transition-all duration-300 motion-reduce:transition-none")} />
                  ) : null}
                  {laneDots(lane.id, minutes).map((d) => {
                    const x = X(d.at);
                    if (x > headX + 0.5) return null;
                    return <circle key={d.at} cx={x} cy={cy} r={3.6} className={d.accepted ? TONES.good.solidFill : TONES.bad.solidFill} />;
                  })}
                  {!settled && sweep < 1 ? <line x1={headX} x2={headX} y1={cy - 11} y2={cy + 11} strokeWidth={1.5} strokeDasharray="3 3" className={TONES.accent.stroke} /> : null}
                  <text x={104} y={top + 47} className={cn(tone.text, "text-[12px] font-semibold")}>{laneLabel(lane.id, minutes)}</text>
                  <text x={404} y={top + 47} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{lane.lookups}</text>
                </g>
              );
            })}

            <line x1={BAN_X} x2={BAN_X} y1={64} y2={LANE0 + 2 * LANE_PITCH + LANE_H + 4} strokeWidth={2} strokeDasharray="5 4" className={TONES.bad.stroke} />

            <text x={14} y={LANE0 + 2 * LANE_PITCH + LANE_H + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>time since ban</text>
            {TICKS.map((tick) => (
              <text key={tick.label} x={X(tick.s)} y={LANE0 + 2 * LANE_PITCH + LANE_H + 20} textAnchor={tick.anchor} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{tick.label}</text>
            ))}

            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={lifetimeToFraction(minutes)}
              marks={[{ at: 0 }, { at: lifetimeToFraction(5), label: "5 min" }, { at: lifetimeToFraction(15), label: "15 min" }, { at: 1 }]}
              ends={["1 min", "1 h"]}
              caption="token lifetime"
            />
            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          </svg>
        </PictureSlider>
      </div>
    </BeatFrame>
  );
}
