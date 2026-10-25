"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { GAUGE_H, LimitGauge } from "../primitives/limit-gauge";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowRate } from "../models/envelope-estimate";
import { FANOUT_PLAN, SLOW_SHARE_LIMIT } from "../models/feed-numbers";
import {
  accountsText,
  DEFAULT_PUSHED,
  fanout,
  fanoutValueText,
  fanoutVerdict,
  GROUPS,
  LINE_STOPS,
  lineName,
  percent,
  percentOne,
  READ_SCALE,
  slowestText,
  stopLabel,
  WRITE_SCALE,
  writesText,
} from "../models/fanout-line";
import { withCommas } from "../models/picture-controls";

const W = 420;
const CARD = { y: 50, w: 70, h: 86, gap: 8, x0: 19 };
const cardX = (i: number) => CARD.x0 + i * (CARD.w + CARD.gap);
/** The line stands in the gap between two cards, or just outside the first and last. */
const STOP_X = [cardX(0) - 5, ...[1, 2, 3, 4].map((k) => cardX(k) - CARD.gap / 2), cardX(4) + CARD.w + 5] as const;
const RAIL = { x0: STOP_X[0], x1: STOP_X[STOP_X.length - 1], y: 190 };
const TICKS = ["100", "1K", "10K", "100K", "1M"];
const GAUGE_X = 16;
const GAUGE_W = W - 32;
const WRITE_Y = 252;
const READ_Y = WRITE_Y + GAUGE_H + 8;
const CAPTION_Y = READ_Y + GAUGE_H + 22;
const H = CAPTION_Y + 14;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 21.3: drag the line across the five account groups and watch the two gauges. */
export function FanoutPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const { seconds, reduced, freeze, unfreeze } = useBeatClock(box);
  const [pushed, setPushed] = useState<number>(DEFAULT_PUSHED);

  const r = fanout(pushed);
  const verdict = fanoutVerdict(r);
  const valueText = fanoutValueText(r);
  const grab = (g: boolean) => (g ? freeze() : unfreeze());

  const fromFraction = (f: number) => {
    const x = RAIL.x0 + f * (RAIL.x1 - RAIL.x0);
    let best = 0;
    STOP_X.forEach((sx, i) => {
      if (Math.abs(sx - x) < Math.abs(STOP_X[best] - x)) best = i;
    });
    return LINE_STOPS[best];
  };
  const onKey = (value: number, key: string): number | null => {
    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        return Math.min(GROUPS.length, value + 1);
      case "ArrowLeft":
      case "ArrowDown":
        return Math.max(0, value - 1);
      case "Home":
        return 0;
      case "End":
        return GROUPS.length;
      default:
        return null;
    }
  };

  const lineX = STOP_X[r.pushed];
  const description = `Fan-out line across five account groups, from everyday accounts with 100 followers to celebrity accounts with 1 million. ${valueText}. Slowest post to land: ${slowestText(r.slowestSeconds)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>line</b> along the groups, or use the arrow keys. Cards right of the line are pulled.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <TightRailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Line between push and pull"
            valueText={valueText}
            value={r.pushed}
            min={0}
            max={GROUPS.length}
            fromFraction={fromFraction}
            onKey={onKey}
            onChange={setPushed}
            onGrab={grab}
            above={RAIL.y - 40}
            below={50}
            side={10}
          >
            {/* The five groups on a log axis: followers each rise from left to right. */}
            {GROUPS.map((g, i) => {
              const pulled = i >= r.pushed;
              const x = cardX(i);
              const cx = x + CARD.w / 2;
              return (
                <g key={g.id}>
                  <rect x={x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={13} className="fill-foreground/[0.06]" />
                  <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={13} strokeWidth={pulled ? 2 : 1.5} className={cn(NEUTRAL.surface, pulled ? TONES.accent.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                  <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={13} className={cn(TONES.accent.softFill, "transition-opacity duration-200 motion-reduce:transition-none")} style={{ opacity: pulled ? 1 : 0 }} />
                  <text x={cx} y={CARD.y + 18} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
                    {g.name}
                  </text>
                  <text x={cx} y={CARD.y + 40} textAnchor="middle" className={cn(NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>
                    {accountsText(g.accounts)}
                  </text>
                  <text x={cx} y={CARD.y + 54} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                    accounts
                  </text>
                  <rect x={cx - 25} y={CARD.y + 62} width={50} height={18} rx={9} className={cn(pulled ? TONES.accent.solidFill : "fill-muted", "transition-colors duration-200 motion-reduce:transition-none")} />
                  <text x={cx} y={CARD.y + 75} textAnchor="middle" className={cn(pulled ? "fill-white dark:fill-blue-950" : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
                    {pulled ? "pull" : "push"}
                  </text>
                  <text x={cx} y={CARD.y + CARD.h + 17} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>
                    {TICKS[i]}
                  </text>
                  <text x={cx} y={CARD.y + CARD.h + 30} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                    followers
                  </text>
                </g>
              );
            })}

            {/* The line, its rail and its knob. */}
            <line x1={RAIL.x0} x2={RAIL.x1} y1={RAIL.y} y2={RAIL.y} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
            {STOP_X.map((x, i) => (
              <circle key={i} cx={x} cy={RAIL.y} r={3.2} className={NEUTRAL.faintFill} />
            ))}
            <g style={{ transform: `translateX(${lineX}px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
              <line x1={0} x2={0} y1={CARD.y - 8} y2={RAIL.y} strokeWidth={3.5} strokeLinecap="round" className={TONES.accent.stroke} />
              <g transform={`translate(0 ${RAIL.y})`}>
                <circle r={19} className={TONES.accent.softFill} />
                <circle r={13} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
                <circle r={4} className="fill-card" />
              </g>
            </g>
            {STOP_X.map((x, i) => {
              const [a, b] = stopLabel(LINE_STOPS[i]);
              const on = LINE_STOPS[i] === r.pushed;
              return (
                <text key={`s${i}`} x={x} y={RAIL.y + 33} textAnchor="middle" className={cn(on ? cn(NEUTRAL.text, "font-bold") : cn(NEUTRAL.mutedText, "font-medium"), "text-[11.5px] tabular-nums")}>
                  <tspan x={x}>{a}</tspan>
                  <tspan x={x} dy={13}>
                    {b}
                  </tspan>
                </text>
              );
            })}
          </TightRailSlider>

          <LimitGauge
            x={GAUGE_X}
            y={WRITE_Y}
            width={GAUGE_W}
            title="Timeline writes a second"
            value={`${writesText(Math.round(r.writesPerSecond))}, ${percent(r.planShare)} of plan`}
            fill={r.writesPerSecond / WRITE_SCALE}
            limitAt={FANOUT_PLAN / WRITE_SCALE}
            limitLabel={`plan ${withCommas(FANOUT_PLAN)}`}
            over={r.writesOver}
            flow={reduced ? 0 : flowRate(Math.max(r.planShare, 0.02))}
            seconds={seconds}
          />
          <LimitGauge
            x={GAUGE_X}
            y={READ_Y}
            width={GAUGE_W}
            title="Feed opens that meet a slow lookup"
            value={percentOne(r.slowShare)}
            fill={r.slowShare / READ_SCALE}
            limitAt={SLOW_SHARE_LIMIT / READ_SCALE}
            limitLabel={`limit ${percent(SLOW_SHARE_LIMIT)}`}
            note={`${r.lookups} ${r.lookups === 1 ? "lookup" : "lookups"} per open`}
            over={r.readsOver}
            flow={reduced ? 0 : flowRate(Math.max(r.slowShare / SLOW_SHARE_LIMIT, 0.02))}
            seconds={seconds}
          />

          <text x={W / 2} y={r1(CAPTION_Y)} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            {`Slowest post to land: ${slowestText(r.slowestSeconds)}`}
          </text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">
          {`${lineName(r.pushed)}. ${verdict.text}.`}
        </p>
      </div>
    </BeatFrame>
  );
}
