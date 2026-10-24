"use client";

import { useId, useRef, useState } from "react";
import { Database } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { KeyedSlider } from "../primitives/keyed-slider";
import { SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import {
  DATA_GB,
  PROGRESS,
  REQUESTS_PER_SECOND,
  describeProgress,
  durationText,
  progressFromFraction,
  progressToFraction,
  rebalance,
  roundGB,
  type MapState,
  type Scheme,
} from "./model";

const W = 420;
const H = 356;
const CARD_W = 74;
const CARD_H = 56;
const CARD_TOP = 58;
const XS = [51, 131, 211, 291, 371];
const BUS_NEW = 134;
const BUS_WASTE = 152;
const TRACK = { x: 14, w: 392, h: 14 };
const RAIL = { x0: 34, x1: 386, y: 318 };

const SCHEMES = [
  { id: "mod", label: "Hash mod N" },
  { id: "fixed", label: "Fixed partitions" },
] as const;
const MAPS = [
  { id: "old", label: "Clients: old map" },
  { id: "fresh", label: "Clients: fresh map" },
] as const;

function MiniNode({ cx, label, volume, fresh }: { cx: number; label: string; volume: number; fresh: boolean }) {
  const left = cx - CARD_W / 2;
  return (
    <g>
      {fresh ? <rect x={left - 4} y={CARD_TOP - 4} width={CARD_W + 8} height={CARD_H + 8} rx={16} strokeWidth={2.2} strokeDasharray="5 3" className={cn("fill-none", TONES.accent.stroke)} /> : null}
      <rect x={left} y={CARD_TOP + 3} width={CARD_W} height={CARD_H} rx={12} className="fill-foreground/[0.06]" />
      <rect x={left} y={CARD_TOP} width={CARD_W} height={CARD_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      <circle cx={left + 15} cy={CARD_TOP + 16} r={10} className="fill-emerald-100 dark:fill-emerald-500/20" />
      <Database x={left + 9} y={CARD_TOP + 10} width={12} height={12} strokeWidth={2.2} className="fill-none text-emerald-700 dark:text-emerald-300" aria-hidden />
      <text x={left + 30} y={CARD_TOP + 20} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
        {label}
      </text>
      <rect x={left + 6} y={CARD_TOP + 31} width={CARD_W - 12} height={18} rx={9} className={fresh ? TONES.accent.softFill : "fill-muted"} />
      <text x={cx} y={CARD_TOP + 44} textAnchor="middle" className={cn(fresh ? TONES.accent.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
        {withCommas(roundGB(volume))} GB
      </text>
    </g>
  );
}

/** Where a dot is along a path of straight pieces, from 0 to 1. */
function along(points: readonly [number, number][], f: number): { x: number; y: number } {
  const lens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let d = f * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] === 0 ? 0 : Math.min(1, d / lens[i]);
      return { x: points[i][0] + (points[i + 1][0] - points[i][0]) * k, y: points[i][1] + (points[i + 1][1] - points[i][1]) * k };
    }
    d -= lens[i];
  }
  return { x: points[0][0], y: points[0][1] };
}

/** 9.5: drag a node move forward in time and watch how much data moves, and how many requests go to the wrong node. */
export function RebalancePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [scheme, setScheme] = useState<Scheme>("mod");
  const [map, setMap] = useState<MapState>("old");
  const [progress, setProgress] = useState<number>(PROGRESS.default);

  const r = rebalance(scheme, map, progress);
  const running = progress > 0 && progress < 100 && !clock.reduced;
  const moveText = progress === 0 ? "move not started" : `${progress}% done, ${durationText((r.seconds * progress) / 100)} in`;
  const wrongTone: Tone = r.wrong > 1500 ? "bad" : "warn";
  const targetX = TRACK.x + (r.totalGB / DATA_GB) * TRACK.w;

  const summary = `Four nodes become five. ${scheme === "mod" ? "Hash mod N" : "Fixed partitions"} must move ${withCommas(r.totalGB)} GB, which takes about ${durationText(r.seconds)} at 100 MB a second. ${describeProgress(scheme, map, progress)}. Clients hold the ${map === "old" ? "old" : "fresh"} map. ${r.verdict.text}.`;

  const t = clock.seconds;
  const newPath = (x: number): [number, number][] => [[x, CARD_TOP + CARD_H], [x, BUS_NEW], [XS[4], BUS_NEW], [XS[4], CARD_TOP + CARD_H + 6]];
  const wasteDots = (dir: 1 | -1) =>
    Array.from({ length: 4 }, (_, i) => {
      const f = (((i / 4 + t * 0.32) % 1) + 1) % 1;
      const x = dir === 1 ? 60 + f * 232 : 292 - f * 232;
      return <circle key={`${dir}-${i}`} cx={x} cy={BUS_WASTE} r={2.8} className={TONES.warn.solidFill} />;
    });

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Pick a <b>scheme</b> and a <b>map</b>, then drag across the picture to move time forward.
        </>
      }
      controls={
        <>
          <BeatChoice label="How keys are placed" options={SCHEMES} value={scheme} onChange={setScheme} />
          <BeatChoice label="What clients know" options={MAPS} value={map} onChange={setMap} />
        </>
      }
    >
      <div ref={box}>
        <KeyedSlider
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          label="How far the move has got"
          valueText={describeProgress(scheme, map, progress)}
          value={progress}
          range={{ min: PROGRESS.min, max: PROGRESS.max, step: 1, page: 10 }}
          fromFraction={progressFromFraction}
          onChange={setProgress}
          onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
        >
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
            <title id={titleId}>{title}</title>
            <desc id={descId}>{summary}</desc>
            <DotGrid width={W} height={H} />

            {/* The wiring: every old node feeds the new one; under hash mod N the old nodes also shuffle data between themselves. */}
            {XS.slice(0, 4).map((x) => (
              <path key={`n-${x}`} d={`M${x} ${CARD_TOP + CARD_H}V${BUS_NEW}H${XS[4]}V${CARD_TOP + CARD_H + 6}`} fill="none" strokeWidth={2} strokeLinejoin="round" className={progress > 0 ? TONES.accent.stroke : NEUTRAL.faintStroke} opacity={progress > 0 ? 0.75 : 1} />
            ))}
            <polygon points={`${XS[4]},${CARD_TOP + CARD_H + 1} ${XS[4] - 5},${CARD_TOP + CARD_H + 9} ${XS[4] + 5},${CARD_TOP + CARD_H + 9}`} className={progress > 0 ? TONES.accent.solidFill : NEUTRAL.faintFill} />
            {scheme === "mod" ? (
              <g>
                {XS.slice(0, 4).map((x) => (
                  <line key={`w-${x}`} x1={x + 9} x2={x + 9} y1={CARD_TOP + CARD_H} y2={BUS_WASTE} strokeWidth={2} className={progress > 0 ? TONES.warn.stroke : NEUTRAL.faintStroke} opacity={progress > 0 ? 0.8 : 1} />
                ))}
                <line x1={60} x2={300} y1={BUS_WASTE} y2={BUS_WASTE} strokeWidth={2} className={progress > 0 ? TONES.warn.stroke : NEUTRAL.faintStroke} opacity={progress > 0 ? 0.8 : 1} />
                <polygon points={`52,${BUS_WASTE} 60,${BUS_WASTE - 4.5} 60,${BUS_WASTE + 4.5}`} className={progress > 0 ? TONES.warn.solidFill : NEUTRAL.faintFill} />
                <polygon points={`308,${BUS_WASTE} 300,${BUS_WASTE - 4.5} 300,${BUS_WASTE + 4.5}`} className={progress > 0 ? TONES.warn.solidFill : NEUTRAL.faintFill} />
              </g>
            ) : null}
            <text x={W / 2} y={scheme === "mod" ? 174 : 160} textAnchor="middle" className={cn(scheme === "mod" ? TONES.warn.text : NEUTRAL.mutedText, "text-[12px] font-semibold")}>
              {scheme === "mod" ? "waste: 75% of it moves between old nodes" : "all moved data goes to the new node"}
            </text>

            {running
              ? XS.slice(0, 4).flatMap((x, i) =>
                  [0, 1, 2].map((d) => {
                    const p = along(newPath(x), (((d / 3 + t * 0.28 + i * 0.11) % 1) + 1) % 1);
                    return <circle key={`f-${i}-${d}`} cx={p.x} cy={p.y} r={3.2} className={TONES.accent.solidFill} />;
                  })
                )
              : null}
            {running && scheme === "mod" ? (
              <g>
                {wasteDots(1)}
                {wasteDots(-1)}
              </g>
            ) : null}

            {XS.map((x, i) => (
              <MiniNode key={x} cx={x} label={`node ${i + 1}`} volume={r.volumes[i]} fresh={i === 4} />
            ))}

            {/* Two bars: how much has moved, and how many requests now go to a node that no longer holds the key. */}
            <text x={TRACK.x} y={202} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
              Data moved
            </text>
            <text x={TRACK.x + TRACK.w} y={202} textAnchor="end" className={cn(TONES.accent.text, "text-[12.5px] font-bold tabular-nums")}>
              {withCommas(roundGB(r.movedGB))} of {withCommas(r.totalGB)} GB
            </text>
            <rect x={TRACK.x} y={210} width={TRACK.w} height={TRACK.h} rx={7} className="fill-muted" />
            {r.movedShare > 0 ? <rect x={TRACK.x} y={210} width={Math.max(4, r.movedShare * TRACK.w)} height={TRACK.h} rx={7} className={TONES.accent.solidFill} /> : null}
            <line x1={targetX} x2={targetX} y1={206} y2={228} strokeWidth={2} strokeDasharray="3 2.5" className="stroke-foreground" />

            <text x={TRACK.x} y={252} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
              Wrong-node requests
            </text>
            <text x={TRACK.x + TRACK.w} y={252} textAnchor="end" className={cn(r.wrong > 0 ? TONES[wrongTone].text : TONES.good.text, "text-[12.5px] font-bold tabular-nums")}>
              {withCommas(Math.round(r.wrong))} of {withCommas(REQUESTS_PER_SECOND)} a sec
            </text>
            <rect x={TRACK.x} y={260} width={TRACK.w} height={TRACK.h} rx={7} className="fill-muted" />
            {r.wrong > 0 ? <rect x={TRACK.x} y={260} width={Math.max(4, (r.wrong / REQUESTS_PER_SECOND) * TRACK.w)} height={TRACK.h} rx={7} className={cn(TONES[wrongTone].solidFill, "transition-colors duration-200 motion-reduce:transition-none")} /> : null}

            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={progressToFraction(progress)}
              marks={[25, 50, 75].map((p) => ({ at: progressToFraction(p) }))}
              ends={["start", durationText(r.seconds)]}
              caption={moveText}
            />
            <VerdictBanner width={W} text={r.verdict.text} tone={r.verdict.tone} />
          </svg>
        </KeyedSlider>
      </div>
    </BeatFrame>
  );
}
