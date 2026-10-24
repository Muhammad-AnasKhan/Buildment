"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import { ROW_LIMIT } from "../models/lamha-numbers";
import {
  boxLayout,
  boxTone,
  perShardText,
  railFraction,
  readText,
  SHARD_STOPS,
  SHARDS_DEFAULT,
  shardsPlay,
  shardsVerdict,
  TOO_MANY_BELOW,
  valueText,
  VIEW_STOPS,
  VIEWS_DEFAULT,
} from "../models/lamha-shards";

const W = 420;
const H = 446;
const AREA = { x0: 20, x1: 400, top: 68, height: 124 };
const BUS_Y = 56;
const VIEWS_RAIL = { x0: 40, x1: 380, y: 300 };
const SHARDS_RAIL = { x0: 40, x1: 380, y: 400 };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 27.5 beat 3: drag the views and the shard count; each box fills toward the row limit. */
export function ShardsPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [views, setViews] = useState<number>(VIEWS_DEFAULT);
  const [shards, setShards] = useState<number>(SHARDS_DEFAULT);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  const m = shardsPlay(views, shards);
  const verdict = shardsVerdict(m);
  const tone = boxTone(m.perShard);
  const layout = boxLayout(shards, AREA.x1 - AREA.x0, AREA.height);
  const rowW = layout.perRow * layout.w + (layout.perRow - 1) * layout.gap;
  const left = (AREA.x0 + AREA.x1) / 2 - rowW / 2;
  const fill = Math.min(1, m.limitShare);

  const dots = clock.reduced ? [] : flowDots(clock.seconds, flowDotsPerSecond(Math.min(1, views / VIEW_STOPS[VIEW_STOPS.length - 1])));
  const markX = r1(SHARDS_RAIL.x0 + railFraction(m.fewest) * (SHARDS_RAIL.x1 - SHARDS_RAIL.x0));
  const markAnchor = markX < 130 ? "start" : markX > 300 ? "end" : "middle";
  const tooMany = m.perShard < TOO_MANY_BELOW;
  const description = `Lamha view counter for one video. ${valueText(m)}. The fewest shards that fit the plan is ${m.fewest}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>views</b> rail, then the <b>shards</b> rail, or use the arrow keys.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Views arrive along a bus above the row; the dots follow the rate. */}
          <g aria-hidden>
            <line x1={AREA.x0} x2={AREA.x1} y1={BUS_Y} y2={BUS_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
            {dots.map((d) => (
              <circle key={d.id} cx={r1(AREA.x0 + (AREA.x1 - AREA.x0) * d.progress)} cy={BUS_Y} r={3.6} className={TONES.accent.solidFill} />
            ))}
          </g>

          {/* The shard boxes: each fills toward the 1,000 limit; the line across is half of it, the plan. */}
          <g aria-hidden>
            {Array.from({ length: shards }, (_, i) => {
              const row = Math.floor(i / 16);
              const col = i % 16;
              const x = r1(left + col * (layout.w + layout.gap));
              const y = r1(AREA.top + row * (layout.h + layout.rowGap));
              const fh = r1(layout.h * fill);
              return (
                <g key={i}>
                  <rect x={x} y={y} width={r1(layout.w)} height={r1(layout.h)} rx={5} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                  <rect x={x} y={r1(y + layout.h - fh)} width={r1(layout.w)} height={fh} rx={5} strokeWidth={1.5} className={cn(TONES[tone].softFill, TONES[tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                  <line x1={x} x2={r1(x + layout.w)} y1={r1(y + layout.h / 2)} y2={r1(y + layout.h / 2)} strokeWidth={1.5} strokeDasharray="3 2" className={NEUTRAL.doneStroke} />
                </g>
              );
            })}
          </g>

          <text x={AREA.x0} y={AREA.top + AREA.height + 26} className={cn(TONES[tone].text, "text-[14px] font-bold tabular-nums")}>{perShardText(m)}</text>
          <text x={AREA.x0} y={AREA.top + AREA.height + 46} className={cn(tooMany ? TONES.warn.text : NEUTRAL.text, "text-[13px] font-semibold tabular-nums")}>{readText(m)}</text>
          <text x={AREA.x1} y={AREA.top + AREA.height + 46} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`full box = ${withCommas(ROW_LIMIT)} a second, line = half`}</text>

          {/* The views rail. */}
          <text x={VIEWS_RAIL.x0 - 6} y={VIEWS_RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>views a second, one video</text>
          <SnapStopsRail
            svgRef={svg}
            x0={VIEWS_RAIL.x0}
            x1={VIEWS_RAIL.x1}
            y={VIEWS_RAIL.y}
            stops={VIEW_STOPS.map((v) => ({ value: v, label: withCommas(v) }))}
            value={views}
            onChange={setViews}
            ariaLabel="Views a second for one video"
            valueText={valueText(m)}
            onGrab={grab}
          />

          {/* The shards rail, with the fewest shards that fit the plan marked. */}
          <text x={SHARDS_RAIL.x0 - 6} y={SHARDS_RAIL.y - 52} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>shards</text>
          <g aria-hidden>
            <line x1={markX} x2={markX} y1={SHARDS_RAIL.y - 30} y2={SHARDS_RAIL.y + 8} strokeWidth={2} strokeDasharray="3 3" className={TONES.good.stroke} />
            <text x={markX} y={SHARDS_RAIL.y - 34} textAnchor={markAnchor} className={cn(TONES.good.text, LABEL_HALO, "text-[11.5px] font-semibold tabular-nums")}>{`fewest that fit: ${m.fewest}`}</text>
          </g>
          <SnapStopsRail
            svgRef={svg}
            x0={SHARDS_RAIL.x0}
            x1={SHARDS_RAIL.x1}
            y={SHARDS_RAIL.y}
            stops={SHARD_STOPS.map((v) => ({ value: v, label: String(v) }))}
            value={shards}
            onChange={setShards}
            ariaLabel="Number of shards"
            valueText={valueText(m)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}

