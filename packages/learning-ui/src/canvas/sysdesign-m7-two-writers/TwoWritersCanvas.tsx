"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_THINK,
  STRATEGIES,
  THINK_LADDER,
  describeRun,
  niceTicks,
  run,
  spreadChips,
  thinkFromFraction,
  thinkToFraction,
  type Seg,
  type SegKind,
  type Strategy,
} from "../models/two-writers";

// 7.5: two writers hit one row. Choose nothing, a row lock or a version check
// and drag the think time. Bars show each writer's read, think and write; a
// hatched bar is a wait for the lock; a red mark is a refused write. Three
// counters sit on the picture: lost updates, retries and the finish time.

const W = 420;
const H = 340;
const PLOT = { x0: 70, x1: 408 };
const LANES = { a: 70, b: 112, row: 156 } as const;
const BAR_H = 18;
const MIN_W = 6;
const AXIS_Y = 182;
const LEGEND_Y = 216;
const COUNTER = { y: 228, w: 124, h: 32, xs: [12, 148, 284] as const };
const RAIL = { x0: 34, x1: 386, y: 304 };
const SWEEP_SECONDS = 7;
const CHIP_W = 40;

const KIND_LABEL: Record<SegKind, string> = { read: "read", think: "think", write: "write", wait: "wait for lock", refused: "refused" };

function Bars({ segs, y, x, hatch, lost, cursor }: { segs: Seg[]; y: number; x: (t: number) => number; hatch: string; lost: boolean; cursor: number | null }) {
  // Long bars first, so the short read and write marks sit on top of them.
  const order: SegKind[] = ["wait", "think", "read", "write", "refused"];
  return (
    <g>
      {[...segs].sort((p, q) => order.indexOf(p.kind) - order.indexOf(q.kind)).map((s, i) => {
        const x1 = x(s.from);
        const w = Math.max(MIN_W, x(s.to) - x1);
        const live = cursor !== null && cursor >= s.from && cursor <= Math.max(s.to, s.from + 1);
        const top = y - BAR_H / 2;
        const lastWrite = s.kind === "write" && lost && s === segs[segs.length - 1];
        const ring = live ? "stroke-blue-600 dark:stroke-blue-400" : undefined;
        if (s.kind === "wait") {
          const label = "waits";
          const lw = Math.ceil(label.length * 6.3) + 10;
          return (
            <g key={i}>
              <rect x={x1} y={top} width={w} height={BAR_H} rx={5} className="fill-card" />
              <rect x={x1} y={top} width={w} height={BAR_H} rx={5} fill={`url(#${hatch})`} />
              <rect x={x1} y={top} width={w} height={BAR_H} rx={5} strokeWidth={live ? 2.5 : 1.5} className={cn("fill-none", ring ?? TONES.warn.stroke)} />
              {w > lw + 16 ? (
                <>
                  <rect x={x1 + w / 2 - lw / 2} y={top + 3} width={lw} height={BAR_H - 6} rx={4} className="fill-card" />
                  <text x={x1 + w / 2} y={y + 4} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>{label}</text>
                </>
              ) : null}
            </g>
          );
        }
        if (s.kind === "think") {
          return (
            <g key={i}>
              <rect x={x1} y={top} width={w} height={BAR_H} rx={5} strokeWidth={live ? 2.5 : 1.5} className={cn("fill-muted", ring ?? NEUTRAL.faintStroke)} />
              {w > 52 ? <text x={x1 + w / 2} y={y + 4} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>think</text> : null}
            </g>
          );
        }
        if (s.kind === "refused") {
          return <rect key={i} x={x1 - MIN_W / 2} y={top - 3} width={MIN_W} height={BAR_H + 6} rx={2} className={TONES.bad.solidFill} />;
        }
        const fill = s.kind === "read" ? TONES.accent.softFill : lastWrite ? TONES.bad.solidFill : TONES.accent.solidFill;
        const stroke = s.kind === "read" ? (ring ?? TONES.accent.stroke) : lastWrite ? TONES.bad.stroke : (ring ?? TONES.accent.stroke);
        return <rect key={i} x={x1} y={top} width={w} height={BAR_H} rx={3} strokeWidth={live ? 2.5 : 1.5} className={cn(fill, stroke)} />;
      })}
    </g>
  );
}

export function TwoWritersCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const hatch = useId().replace(/:/g, "");
  const [strategy, setStrategy] = useState<Strategy>("none");
  const [think, setThink] = useState<number>(DEFAULT_THINK);

  const r = run(strategy, think);
  const x = (t: number) => PLOT.x0 + (t / r.domain) * (PLOT.x1 - PLOT.x0);
  const ticks = niceTicks(r.domain);
  const cursor = clock.reduced ? null : ((clock.seconds % SWEEP_SECONDS) / SWEEP_SECONDS) * r.domain;
  const chipX = spreadChips(r.row.map((c) => x(c.at)), CHIP_W, PLOT.x0, PLOT.x1);
  const kinds = new Set<SegKind>([...r.a, ...r.b].map((s) => s.kind));
  const legend = (["read", "think", "write", "wait", "refused"] as SegKind[]).filter((k) => kinds.has(k));
  const lostB = r.lostUpdates > 0;

  const counters = [
    { label: "lost updates", num: String(r.lostUpdates), tone: r.lostUpdates > 0 ? TONES.bad : TONES.good },
    { label: "retries", num: String(r.retries), tone: r.retries > 0 ? TONES.warn : TONES.good },
    { label: "ms to finish", num: String(r.finish), tone: TONES.accent },
  ];

  const swatch = (k: SegKind) =>
    k === "read" ? cn(TONES.accent.softFill, TONES.accent.stroke) : k === "think" ? cn("fill-muted", NEUTRAL.faintStroke) : k === "write" ? cn(TONES.accent.solidFill, TONES.accent.stroke) : k === "wait" ? cn("fill-amber-100 dark:fill-amber-500/25", TONES.warn.stroke) : cn(TONES.bad.solidFill, TONES.bad.stroke);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>think time</b>, then switch what protects the row.</>}
      controls={<BeatSegmented label="Row" options={STRATEGIES} value={strategy} onChange={setStrategy} />}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={describeRun(r)} className="block h-auto w-full select-none">
          <defs>
            <pattern id={hatch} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform={`translate(${clock.reduced ? 0 : Math.round(clock.seconds * 10) % 8} 0) rotate(45)`}>
              <line x1={0} y1={0} x2={0} y2={8} strokeWidth={3} className={cn(TONES.warn.stroke, "opacity-50")} />
            </pattern>
          </defs>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={r.verdict.text} tone={r.verdict.tone} />

          {/* Lanes. */}
          {([
            ["Writer A", LANES.a],
            ["Writer B", LANES.b],
            ["Row", LANES.row],
          ] as const).map(([name, y]) => (
            <g key={name}>
              <line x1={PLOT.x0} x2={PLOT.x1} y1={y} y2={y} strokeWidth={1.5} strokeDasharray="3 4" className={NEUTRAL.faintStroke} />
              <text x={8} y={y + 4} className={cn(NEUTRAL.text, "text-[12px] font-bold")}>{name}</text>
            </g>
          ))}

          <Bars segs={r.a} y={LANES.a} x={x} hatch={hatch} lost={false} cursor={cursor} />
          <Bars segs={r.b} y={LANES.b} x={x} hatch={hatch} lost={lostB} cursor={cursor} />

          {/* The row's value over time. */}
          {r.row.map((c, i) => {
            const last = i === r.row.length - 1;
            const tone = c.lost ? TONES.bad : last ? TONES.good : null;
            return (
              <g key={`${c.at}-${c.value}`} className="animate-in fade-in duration-300 motion-reduce:animate-none">
                <rect x={chipX[i] - CHIP_W / 2} y={LANES.row - 10} width={CHIP_W} height={20} rx={10} strokeWidth={tone ? 2 : 1.5} className={cn(tone ? tone.softFill : NEUTRAL.surface, tone ? tone.stroke : NEUTRAL.line)} />
                <text x={chipX[i]} y={LANES.row + 4.2} textAnchor="middle" className={cn(tone ? tone.text : NEUTRAL.text, "text-[11.5px] font-bold tabular-nums")}>{c.value}</text>
              </g>
            );
          })}

          {/* Time axis. */}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          <text x={8} y={AXIS_Y + 14} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>time, ms</text>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={AXIS_Y} y2={AXIS_Y + 5} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={Math.max(PLOT.x0 + 6, Math.min(PLOT.x1 - 6, x(t)))} y={AXIS_Y + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t}</text>
            </g>
          ))}
          {cursor !== null ? <polygon points={`${x(cursor) - 5},${AXIS_Y - 10} ${x(cursor) + 5},${AXIS_Y - 10} ${x(cursor)},${AXIS_Y - 2}`} className={TONES.accent.solidFill} /> : null}

          {/* What the colours mean, for the bars in use. */}
          {legend.map((k, i) => {
            const lx = 12 + i * 78;
            return (
              <g key={k}>
                <rect x={lx} y={LEGEND_Y - 9} width={12} height={12} rx={3} strokeWidth={1.25} className={swatch(k)} />
                <text x={lx + 17} y={LEGEND_Y + 1} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{k === "wait" ? "wait" : KIND_LABEL[k]}</text>
              </g>
            );
          })}

          {/* The three counters. */}
          {counters.map((c, i) => (
            <g key={c.label}>
              <rect x={COUNTER.xs[i]} y={COUNTER.y + 2} width={COUNTER.w} height={COUNTER.h} rx={12} className="fill-foreground/[0.06]" />
              <rect x={COUNTER.xs[i]} y={COUNTER.y} width={COUNTER.w} height={COUNTER.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={COUNTER.xs[i] + 12} y={COUNTER.y + 22} className={cn(c.tone.text, "text-[18px] font-bold tabular-nums")}>{c.num}</text>
              <text x={COUNTER.xs[i] + 52} y={COUNTER.y + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{c.label}</text>
            </g>
          ))}

          {/* The think time: drag along the rail. */}
          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Think time for each writer"
            valueText={`${think} milliseconds of think time. ${r.verdict.text}`}
            value={think}
            ladder={THINK_LADDER}
            fromFraction={thinkFromFraction}
            onChange={setThink}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={thinkToFraction(think)}
              marks={THINK_LADDER.map((t) => ({ at: thinkToFraction(t), label: String(t) }))}
              ends={["no think", "long think"]}
              caption={`think time ${think} ms`}
            />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}
