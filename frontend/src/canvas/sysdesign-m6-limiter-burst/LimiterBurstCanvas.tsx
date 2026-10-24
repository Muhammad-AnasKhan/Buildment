"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  A_AT,
  B_LADDER,
  B_RANGE,
  LIMIT,
  burstVerdict,
  clampB,
  clock,
  leakyDelays,
  limiterRows,
  type LimiterId,
} from "../models/limiter-burst";

const W = 420;
const H = 424;
const STRIP = { t0: 50, t1: 120, x0: 118, x1: 380 };
const SCALE = (STRIP.x1 - STRIP.x0) / (STRIP.t1 - STRIP.t0);
const ROW0 = 72;
const ROW_H = 42;
const ROW_PITCH = 46;
const LEAKY_H = 56;
const DOT = { r: 3.1, gap: 6.4 };
/** Furthest a waiting leaky-bucket request slides to the right, for the longest wait. */
const SLIDE_MAX = 26;
const RAIL = { y: 384 };
const PERIOD_S = 6;

const xOf = (seconds: number) => Math.round((STRIP.x0 + (seconds - STRIP.t0) * SCALE) * 100) / 100;
const r2 = (v: number) => Math.round(v * 100) / 100;
const reveal = (s: number, from: number, to: number) => Math.max(0, Math.min(1, (s - from) / (to - from)));
const A_X = xOf(A_AT) - 4;
const RAIL_X0 = xOf(B_RANGE.min) + 4;
const RAIL_X1 = xOf(B_RANGE.max) + 4;

/** 6.5: drag the second burst across the minute line and watch five limiters decide. */
export function LimiterBurstCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [b, setB] = useState<number>(B_RANGE.default);
  const [runStart, setRunStart] = useState(0);
  const titleId = useId();
  const descId = useId();

  const rows = limiterRows(b);
  const verdict = burstVerdict(b);
  const delays = leakyDelays(b);
  const maxDelay = delays.length ? Math.max(...delays) : 0;
  const elapsed = beat.seconds - runStart;
  const settled = beat.reduced || elapsed < 0;
  const phase = settled ? Infinity : elapsed % PERIOD_S;

  const bX = xOf(b) + 4;
  const change = (v: number) => {
    setB(clampB(v));
    setRunStart(beat.seconds + 1.1);
  };

  const layout = rows.map((row, i) => {
    const top = ROW0 + i * ROW_PITCH;
    return { row, top, h: row.id === "leaky" ? LEAKY_H : ROW_H, cy: top + ROW_H / 2 };
  });
  const bottom = layout[layout.length - 1].top + LEAKY_H;
  const axisY = bottom + 18;
  const description = `Burst A: 5 requests at 0:59. Burst B: 5 requests at ${clock(b)}. Burst B accepted: ${rows.map((r) => `${r.name} ${r.accepted} of 5`).join(", ")}. ${verdict.text}.`;

  const dotY = (cy: number, i: number) => r2(cy - 2 * DOT.gap + i * DOT.gap);
  const pending = "fill-card stroke-muted-foreground/60";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the rail to move <b>burst B</b> across the minute line.</>}
      controls={<BeatButton onClick={() => setRunStart(beat.seconds)}>Replay</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {layout.map(({ row, top, h, cy }) => (
            <g key={row.id}>
              <rect x={6} y={top} width={408} height={h} rx={10} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={14} y={top + 18} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{row.name}</text>
              <text x={14} y={top + 34} className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{`B: ${row.accepted} of ${LIMIT}`}</text>
              {row.id === "leaky" && maxDelay > 0 ? (
                <text x={14} y={top + 50} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{delays.length === 1 ? `waits ${maxDelay} s` : `last waits ${maxDelay} s`}</text>
              ) : null}
              <line x1={STRIP.x0} x2={STRIP.x1 + 30} y1={cy} y2={cy} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
            </g>
          ))}

          {/* The minute line: a new fixed window starts here. */}
          <line x1={xOf(60)} x2={xOf(60)} y1={ROW0 - 8} y2={bottom + 4} strokeWidth={1.5} strokeDasharray="4 3" className={TONES.accent.stroke} />

          {layout.map(({ row, cy }) => {
            const id: LimiterId = row.id;
            return (
              <g key={`dots-${row.id}`}>
                {/* Burst A: everyone starts fresh and allows all 5. */}
                {Array.from({ length: LIMIT }, (_, i) => {
                  const on = phase >= 0.2 + i * 0.08;
                  return <circle key={`a${i}`} cx={A_X} cy={dotY(cy, i)} r={DOT.r} strokeWidth={1.5} className={on ? cn(TONES.good.solidFill, TONES.good.stroke) : pending} />;
                })}
                {/* Burst B: accepted dots first (top), refused below; waiting leaky-bucket dots slide right. */}
                {Array.from({ length: LIMIT }, (_, i) => {
                  const accepted = i < row.accepted;
                  const decided = phase >= 1.4 + i * 0.12;
                  const delay = id === "leaky" && accepted ? (delays[i] ?? 0) : 0;
                  const slide = (delay / 48) * SLIDE_MAX * reveal(phase, 2.4, 3.4);
                  const x = r2(bX + slide);
                  return (
                    <g key={`b${i}`}>
                      {slide > 1 ? <line x1={bX} x2={x} y1={dotY(cy, i)} y2={dotY(cy, i)} strokeWidth={1.5} className={TONES.good.stroke} opacity={0.5} /> : null}
                      <circle
                        cx={x}
                        cy={dotY(cy, i)}
                        r={DOT.r}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-colors duration-200 motion-reduce:transition-none",
                          !decided ? pending : accepted ? cn(TONES.good.solidFill, TONES.good.stroke) : cn(TONES.bad.softFill, TONES.bad.stroke)
                        )}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Burst A tag, and the time axis. */}
          <circle cx={A_X} cy={ROW0 - 20} r={9} className={cn(NEUTRAL.surface, NEUTRAL.doneStroke)} strokeWidth={1.5} />
          <text x={A_X} y={ROW0 - 16} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-bold")}>A</text>
          {[
            { s: 50, label: "0:50" },
            { s: 60, label: "1:00" },
            { s: 120, label: "2:00" },
          ].map((tick) => (
            <text key={tick.label} x={xOf(tick.s)} y={axisY} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{tick.label}</text>
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL_X0}
            x1={RAIL_X1}
            y={RAIL.y}
            label="When burst B arrives"
            valueText={`${clock(b)}. ${verdict.text}`}
            value={b}
            ladder={B_LADDER}
            fromFraction={(f) => {
              const raw = clampB(B_RANGE.min + f * (B_RANGE.max - B_RANGE.min));
              return B_RANGE.snaps.find((s) => Math.abs(s - raw) <= 1) ?? raw;
            }}
            onChange={change}
          >
            <SliderRail
              x0={RAIL_X0}
              x1={RAIL_X1}
              y={RAIL.y}
              fraction={(b - B_RANGE.min) / (B_RANGE.max - B_RANGE.min)}
              marks={[
                { at: 0 },
                { at: (60 - B_RANGE.min) / 60, label: "1:00" },
                { at: (75 - B_RANGE.min) / 60, label: "1:15" },
                { at: (90 - B_RANGE.min) / 60, label: "1:30" },
                { at: 1 },
              ]}
              ends={["0:59", "1:59"]}
              caption="drag burst B"
            />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
