"use client";

import { useId, useRef, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { ladderStep, SliderRail } from "../primitives/picture-slider";
import { InfoChip, infoChipWidth } from "../primitives/svg-info-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ALERT_FAILURES,
  BUG_LADDER,
  BUG_MAX,
  BUG_MIN,
  BUG_SNAPS,
  DEFAULT_BUG,
  DEFAULT_SHARE,
  REQUESTS_PER_MIN,
  SHARE_LADDER,
  SHARE_MAX,
  SHARE_MIN,
  SHARE_SNAPS,
  STABLE_FAIL,
  dashboardRate,
  formatCount,
  formatMinutes,
  formatPercent,
  isHidden,
  minutesToAlert,
  pileProgress,
  pileSeconds,
  railToValue,
  requestsExposed,
  unit,
  valueToRail,
  verdictFor,
} from "./model";

const W = 420;
const H = 506;
const SOURCE = { y: 46, h: 26 };
const LANE = { y: 150, h: 140, gap: 8, x: 12, w: 396 };
const TILE = { y: 302, h: 48, w: 124 };
const TILE_X = [12, 148, 284];
const SHARE_RAIL = { x0: 40, x1: 380, y: 392 };
const BUG_RAIL = { x0: 40, x1: 380, y: 460 };
const SLOTS = 12;
const TRIP_S = 1.2;
const PILE_COLS = 6;
const PILE_STEP = 11;

const frac = (v: number) => v - Math.floor(v);
const r1 = (v: number) => Math.round(v * 10) / 10;

/** 18.6 beat 4: drag the canary's share and the bug's error rate, and see how long the alert takes and what the dashboard shows. */
export function CanaryBlastCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [share, setShare] = useState(DEFAULT_SHARE);
  const [bug, setBug] = useState(DEFAULT_BUG);

  const minutes = minutesToAlert(share, bug);
  const exposed = requestsExposed(bug);
  const dash = dashboardRate(share, bug);
  const hidden = isHidden(share, bug);
  const verdict = verdictFor(share, bug);

  const canaryW = Math.max(96, Math.round((LANE.w * share) / 100));
  const stableW = LANE.w - LANE.gap - canaryW;
  const canaryX = LANE.x + stableW + LANE.gap;
  const stableC = LANE.x + stableW / 2;
  const canaryC = canaryX + canaryW / 2;
  const sourceText = `${formatCount(REQUESTS_PER_MIN)} requests a minute`;
  const sourceW = infoChipWidth(sourceText);

  // The crowd: each dot picks a lane by a repeatable draw, so the canary gets about `share` percent of them.
  const dots: { key: number; x: number; y: number; red: boolean }[] = [];
  for (let j = 0; j < SLOTS; j++) {
    const phase = clock.seconds / TRIP_S + j / SLOTS;
    const cycle = Math.floor(phase);
    const p = frac(phase);
    const canary = unit(j, cycle) < share / 100;
    const red = canary && unit(j + 100, cycle) < bug / 100;
    const tx = canary ? canaryC : stableC;
    const y0 = SOURCE.y + SOURCE.h + 8;
    const y1 = LANE.y - 6;
    dots.push({ key: j, x: r1(210 + (tx - 210) * p), y: r1(y0 + (y1 - y0) * p), red });
  }

  // The failures pile up in the canary lane until the alert fires.
  const duration = pileSeconds(minutes);
  const progress = clock.reduced ? 1 : pileProgress(clock.seconds, duration);
  const piled = Math.round(progress * ALERT_FAILURES);
  const alerted = progress >= 1;
  const pileX = canaryC - ((PILE_COLS - 1) * PILE_STEP) / 2;

  const tiles: { label: string; value: string; tone: Tone | null }[] = [
    { label: "Alert after", value: formatMinutes(minutes), tone: minutes > 10 ? "warn" : "good" },
    { label: "Requests exposed", value: formatCount(exposed), tone: null },
    { label: "Dashboard rate", value: formatPercent(dash), tone: hidden ? "bad" : null },
  ];

  const description = `${verdict.text}. Canary share ${share}%, bug rate ${bug}%. The alert fires after ${formatMinutes(minutes)}, when ${ALERT_FAILURES} canary requests have failed. About ${formatCount(exposed)} requests reach the bug first. The whole-service dashboard shows ${formatPercent(dash)}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>share</b> and the <b>bug rate</b>, and watch the alert bell.
        </>
      }
      controls={
        <BeatButton
          onClick={() => {
            setShare(DEFAULT_SHARE);
            setBug(DEFAULT_BUG);
          }}
        >
          Reset
        </BeatButton>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <InfoChip x={(W - sourceW) / 2} y={SOURCE.y} width={sourceW} height={SOURCE.h} text={sourceText} />

          {/* The two lanes. The canary lane is as wide as its share, but never so narrow that its words do not fit. */}
          <g>
            <rect x={LANE.x} y={LANE.y + 3} width={stableW} height={LANE.h} rx={14} className="fill-foreground/[0.06]" />
            <rect x={LANE.x} y={LANE.y} width={stableW} height={LANE.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={LANE.x + 14} y={LANE.y + 22} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Stable</text>
            <text x={stableC} y={LANE.y + 74} textAnchor="middle" className={cn(NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>{`${100 - share}% of users`}</text>
            <text x={stableC} y={LANE.y + 98} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>{`fails ${STABLE_FAIL}% of requests`}</text>
          </g>
          <g>
            <rect x={canaryX} y={LANE.y + 3} width={canaryW} height={LANE.h} rx={14} className="fill-foreground/[0.06]" />
            <rect x={canaryX} y={LANE.y} width={canaryW} height={LANE.h} rx={14} strokeWidth={alerted ? 2.5 : 1.5} className={cn(NEUTRAL.surface, alerted ? TONES.bad.stroke : TONES.warn.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={canaryX + 12} y={LANE.y + 22} className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{`Canary ${share}%`}</text>
            {Array.from({ length: ALERT_FAILURES }, (_, k) => (
              <circle
                key={k}
                cx={pileX + (k % PILE_COLS) * PILE_STEP}
                cy={LANE.y + 42 + Math.floor(k / PILE_COLS) * PILE_STEP}
                r={3.6}
                strokeWidth={1.25}
                className={k < piled ? cn(TONES.bad.solidFill, "stroke-card") : "fill-none stroke-muted-foreground/35"}
              />
            ))}
            {alerted ? (
              <BellRing x={canaryC - 10} y={LANE.y + 100} width={20} height={20} strokeWidth={2.25} className="text-red-600 dark:text-red-400" aria-hidden />
            ) : (
              <Bell x={canaryC - 10} y={LANE.y + 100} width={20} height={20} strokeWidth={2.25} className="text-muted-foreground" aria-hidden />
            )}
            <text x={canaryC} y={LANE.y + 134} textAnchor="middle" className={cn(alerted ? TONES.bad.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>{alerted ? "alert fired" : `alert at ${ALERT_FAILURES}`}</text>
          </g>

          {/* Users stream into the lanes; red dots are failed canary requests. */}
          {dots.map((d) => (
            <circle key={d.key} cx={d.x} cy={d.y} r={3.6} strokeWidth={1} className={cn(d.red ? TONES.bad.solidFill : TONES.accent.solidFill, "stroke-card")} />
          ))}

          {/* Three results. */}
          {tiles.map((t, i) => (
            <g key={t.label}>
              <rect x={TILE_X[i]} y={TILE.y} width={TILE.w} height={TILE.h} rx={12} className="fill-card" />
              <rect x={TILE_X[i]} y={TILE.y} width={TILE.w} height={TILE.h} rx={12} strokeWidth={1.75} className={cn("transition-colors duration-200 motion-reduce:transition-none", t.tone ? cn(TONES[t.tone].softFill, TONES[t.tone].stroke) : cn("fill-transparent", NEUTRAL.line))} />
              <text x={TILE_X[i] + TILE.w / 2} y={TILE.y + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{t.label}</text>
              <text x={TILE_X[i] + TILE.w / 2} y={TILE.y + 39} textAnchor="middle" className={cn(t.tone ? TONES[t.tone].text : NEUTRAL.text, "text-[18px] font-bold tabular-nums")}>{t.value}</text>
            </g>
          ))}

          <TightRailSlider
            svgRef={svg}
            x0={SHARE_RAIL.x0}
            x1={SHARE_RAIL.x1}
            y={SHARE_RAIL.y}
            label="Canary share of traffic"
            valueText={`${share}% of users`}
            value={share}
            min={SHARE_MIN}
            max={SHARE_MAX}
            fromFraction={(f) => railToValue(f, SHARE_MIN, SHARE_MAX, SHARE_SNAPS)}
            onKey={(v, k) => ladderStep(SHARE_LADDER, v, k)}
            onChange={setShare}
            above={24}
            below={40}
            side={26}
          >
            <SliderRail
              x0={SHARE_RAIL.x0}
              x1={SHARE_RAIL.x1}
              y={SHARE_RAIL.y}
              fraction={valueToRail(share, SHARE_MIN, SHARE_MAX)}
              marks={SHARE_SNAPS.map((s) => ({ at: valueToRail(s, SHARE_MIN, SHARE_MAX), label: `${s}%` }))}
              ends={[`${SHARE_MIN}%`, `${SHARE_MAX}%`]}
              caption={`Canary share: ${share}% of users`}
            />
          </TightRailSlider>

          <TightRailSlider
            svgRef={svg}
            x0={BUG_RAIL.x0}
            x1={BUG_RAIL.x1}
            y={BUG_RAIL.y}
            label="Bug error rate"
            valueText={`${bug}% of canary requests fail`}
            value={bug}
            min={BUG_MIN}
            max={BUG_MAX}
            fromFraction={(f) => railToValue(f, BUG_MIN, BUG_MAX, BUG_SNAPS)}
            onKey={(v, k) => ladderStep(BUG_LADDER, v, k)}
            onChange={setBug}
            above={24}
            below={40}
            side={26}
          >
            <SliderRail
              x0={BUG_RAIL.x0}
              x1={BUG_RAIL.x1}
              y={BUG_RAIL.y}
              fraction={valueToRail(bug, BUG_MIN, BUG_MAX)}
              marks={BUG_SNAPS.map((s) => ({ at: valueToRail(s, BUG_MIN, BUG_MAX), label: `${s}%` }))}
              ends={[`${BUG_MIN}%`, `${BUG_MAX}%`]}
              caption={`Bug: ${bug}% of canary requests fail`}
            />
          </TightRailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
