"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SliderRail } from "../primitives/picture-slider";
import { RailSlider } from "../primitives/rail-slider";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BAD_PER_HOUR,
  GAP_COUNT,
  TIMEOUT,
  TIMEOUT_LADDER,
  TIMEOUT_SNAPS,
  WARN_PER_HOUR,
  beatGaps,
  falseAlarmsPerHour,
  formatAlarms,
  formatMs,
  lateGaps,
  noticeAfterMs,
  timeoutFromFraction,
  timeoutToFraction,
  timeoutValueText,
  timeoutVerdict,
} from "../models/failure-timeout";

const W = 420;
const H = 428;
const CARD_Y = 88;
const NODE_X = 72;
const MON_X = 348;
const LINK_X0 = 136;
const LINK_X1 = 284;
const LINK_Y = CARD_Y - 4;
const CH = { x0: 62, x1: 410, top: 144, base: 256, lo: 850, hi: 1350 };
const PITCH = (CH.x1 - CH.x0) / GAP_COUNT;
const BAR_W = 6.2;
const BIG_Y = 288;
const BIG_H = 56;
const RAIL = { x0: 34, x1: 386, y: 384 };
/** Seconds the sweep rests on each bar, and the empty steps before it starts again. */
const STEP_S = 0.25;
const REST_STEPS = 4;
const BEAT_PERIOD_S = 1.5;

const r1 = (v: number) => Math.round(v * 10) / 10;
const yOf = (ms: number) => r1(CH.base - ((Math.max(CH.lo, Math.min(CH.hi, ms)) - CH.lo) / (CH.hi - CH.lo)) * (CH.base - CH.top));
const barX = (i: number) => r1(CH.x0 + i * PITCH + (PITCH - BAR_W) / 2);

/** 12.2 beat 2: drag the timeout and watch false alarms an hour fall while the time to notice a crash grows. */
export function TimeoutSliderCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [timeout, setTimeoutMs] = useState<number>(TIMEOUT.default);
  const titleId = useId();
  const descId = useId();

  const gaps = beatGaps();
  const perHour = falseAlarmsPerHour(timeout);
  const notice = noticeAfterMs(timeout);
  const late = lateGaps(timeout);
  const verdict = timeoutVerdict(timeout);
  const alarmTone: Tone = perHour >= BAD_PER_HOUR ? "bad" : perHour >= WARN_PER_HOUR ? "warn" : "good";

  // The sweep walks along the bars; the monitor flashes red on a bar above the line.
  const step = beat.reduced ? -1 : Math.floor(beat.seconds / STEP_S) % (GAP_COUNT + REST_STEPS);
  const cursor = step >= 0 && step < GAP_COUNT ? step : -1;
  const alarming = cursor >= 0 && gaps[cursor] > timeout;
  const monitorStatus = beat.reduced ? (late > 0 ? `${late} alarms` : "no alarms") : alarming ? "suspects!" : "watching";
  const monitorTone: Tone = beat.reduced ? (late > 0 ? "bad" : "good") : alarming ? "bad" : "good";

  const phase = beat.reduced ? 0.5 : (beat.seconds % BEAT_PERIOD_S) / BEAT_PERIOD_S;
  const dotX = r1(LINK_X0 + phase * (LINK_X1 - LINK_X0));

  const lineY = yOf(timeout);
  const lineText = formatMs(timeout);
  const description = `Forty gaps between beats, ${late} longer than the ${lineText} timeout. About ${formatAlarms(perHour)} false alarms an hour; a real crash is noticed after ${formatMs(notice)}. ${verdict.text}.`;

  const bigCards = [
    { x: 14, label: "false alarms per hour", value: formatAlarms(perHour), tone: alarmTone as Tone | null },
    { x: 212, label: "a crash is noticed after", value: formatMs(notice), tone: null as Tone | null },
  ];

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>rail</b> to move the timeout line. Bars above the line are false alarms.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The node, its beats, and the monitor that waits for them. */}
          <LinkLine x1={LINK_X0} y1={LINK_Y} x2={LINK_X1} y2={LINK_Y} />
          <circle cx={dotX} cy={LINK_Y} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
          <text x={(LINK_X0 + LINK_X1) / 2} y={CARD_Y + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>a beat every 1,000 ms</text>
          <SvgNode x={NODE_X} y={CARD_Y} label="Node" kind="server" status="sends beats" statusTone="good" />
          <SvgNode x={MON_X} y={CARD_Y} label="Monitor" kind="clock" status={monitorStatus} statusTone={monitorTone} mark={alarming ? "bad" : undefined} arrival={alarming ? 0.6 : 0} />

          {/* The strip: 40 gaps between beat arrivals. */}
          <line x1={CH.x0} x2={CH.x1} y1={CH.base} y2={CH.base} strokeWidth={2} className={NEUTRAL.line} />
          <line x1={CH.x0} x2={CH.x1} y1={yOf(1000)} y2={yOf(1000)} strokeWidth={1.25} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
          {cursor >= 0 ? <rect x={r1(CH.x0 + cursor * PITCH)} y={CH.top - 6} width={r1(PITCH)} height={CH.base - CH.top + 6} rx={3} className="fill-muted-foreground/15" /> : null}
          {gaps.map((g, i) => {
            const top = yOf(g);
            return (
              <rect
                key={i}
                x={barX(i)}
                y={top}
                width={BAR_W}
                height={r1(Math.max(1, CH.base - top))}
                rx={2}
                className={cn("transition-colors duration-200 motion-reduce:transition-none", g > timeout ? TONES.bad.solidFill : "fill-blue-600/55 dark:fill-blue-400/55")}
              />
            );
          })}
          <line x1={CH.x0} x2={CH.x1} y1={lineY} y2={lineY} strokeWidth={2.5} strokeDasharray="7 4" className={TONES.warn.stroke} />
          <text x={CH.x0 - 5} y={lineY + 4.5} textAnchor="end" className={cn(TONES.warn.text, "text-[12px] font-bold tabular-nums")}>{lineText}</text>
          <text x={CH.x0} y={CH.base + 21} className={cn(NEUTRAL.mutedText, "text-[12px]")}>{`40 gaps between beats: ${late} over the timeout`}</text>

          {/* The two prices of the timeout. */}
          {bigCards.map((c) => (
            <g key={c.label}>
              <rect x={c.x} y={BIG_Y} width={194} height={BIG_H} rx={14} strokeWidth={c.tone ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone ? TONES[c.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={c.x + 12} y={BIG_Y + 20} className={cn(NEUTRAL.mutedText, "text-[12px]")}>{c.label}</text>
              <text x={c.x + 12} y={BIG_Y + 46} className={cn(c.tone ? TONES[c.tone].text : NEUTRAL.text, "text-[24px] font-bold tabular-nums")}>{c.value}</text>
            </g>
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Failure timeout"
            valueText={timeoutValueText(timeout)}
            value={timeout}
            ladder={TIMEOUT_LADDER}
            fromFraction={timeoutFromFraction}
            onChange={setTimeoutMs}
            onGrab={(g) => (g ? beat.freeze() : beat.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={timeoutToFraction(timeout)}
              marks={TIMEOUT_SNAPS.map((t) => ({ at: timeoutToFraction(t), label: t === 1000 ? "1,000" : t === 1200 ? "1,200" : t === 1500 ? "1,500" : undefined }))}
              ends={["900 ms", "2,000 ms"]}
              caption={`timeout ${lineText}`}
            />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}
