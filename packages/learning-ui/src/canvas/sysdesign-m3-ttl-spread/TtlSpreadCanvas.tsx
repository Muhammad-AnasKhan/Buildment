"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_TTL,
  RESOLVERS,
  TIME_LADDER,
  TIME_MAX_PCT,
  TTL_STEPS,
  formatDuration,
  pctFromFraction,
  pctToFraction,
  resolversOnNew,
  spreadVerdict,
  sweepPct,
  timeAtPct,
} from "../models/ttl-spread";

const W = 420;
const H = 330;
const CARD_Y = 82;
const COLS = 10;
const DOT_X0 = 48;
const DOT_DX = 36;
const DOT_ROWS = [140, 176] as const;
const LEGEND_Y = 208;
const CHIPS_Y = 234;
const RAIL = { x0: 40, x1: 380, y: 292 };

/** 3.3: pick a TTL and drag time forward; each of 20 resolvers flips to the new address when its copy expires. */
export function TtlSpreadCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [ttl, setTtl] = useState<number>(DEFAULT_TTL);
  // Until the learner drags the rail, the clock sweeps by itself.
  const [manual, setManual] = useState<number | null>(null);

  const pct = manual ?? (clock.reduced ? 50 : sweepPct(clock.seconds));
  const t = timeAtPct(ttl, pct);
  const onNew = resolversOnNew(ttl, t);
  const old = RESOLVERS - onNew;
  const verdict = spreadVerdict(ttl, onNew);
  const step = TTL_STEPS.find((s) => s.seconds === ttl) ?? TTL_STEPS[3];
  const timeText = formatDuration(t);
  const maxText = ttl > 0 ? formatDuration(timeAtPct(ttl, TIME_MAX_PCT)) : "no wait";

  const summary = ttl > 0
    ? `The TTL is ${step.words}. ${timeText} after the change, ${onNew} of ${RESOLVERS} resolvers have the new address and ${old} still have the old one. Every resolver has it after one TTL, ${formatDuration(ttl)}.`
    : `The TTL is 0 seconds, so nothing is cached and all ${RESOLVERS} resolvers get the new address at once.`;

  const chipWidths = TTL_STEPS.map((s) => chipWidth(s.chip));
  const chipsW = chipWidths.reduce((a, w) => a + w, 0) + 8 * (TTL_STEPS.length - 1);
  const chipXs = rowPositions(chipWidths, Math.max(46, (W - chipsW) / 2 + 14));
  const chipSpots = TTL_STEPS.map((s, i) => ({ s, x: chipXs[i] }));

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<BeatButton onClick={() => { setManual(null); clock.restart(); }}>Play the clock</BeatButton>}
      hint={<>Tap a <b>TTL</b>, then drag the rail to move <b>time</b> forward.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          <SvgNode x={62} y={CARD_Y} label="Old" kind="server" status={`${old} resolvers`} statusTone={old > 0 ? "warn" : undefined} />
          <SvgNode x={358} y={CARD_Y} label="New" kind="server" status={`${onNew} resolvers`} statusTone={onNew > 0 ? "good" : undefined} />
          <text x={210} y={CARD_Y - 8} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>after the change</text>
          <text x={210} y={CARD_Y + 19} textAnchor="middle" className={cn(NEUTRAL.text, "text-[20px] font-bold tabular-nums")}>{timeText}</text>

          {Array.from({ length: RESOLVERS }, (_, k) => {
            const cx = DOT_X0 + (k % COLS) * DOT_DX;
            const cy = DOT_ROWS[Math.floor(k / COLS)];
            const on = k < onNew;
            return (
              <g key={k}>
                <circle cx={cx} cy={cy} r={12} strokeWidth={2} className={cn(on ? TONES.good.solidFill : TONES.warn.solidFill, "stroke-card transition-colors duration-200 motion-reduce:transition-none")} />
                {on ? <path d={`M${cx - 4.5} ${cy + 0.5} L${cx - 1.5} ${cy + 3.5} L${cx + 4.5} ${cy - 3.5}`} fill="none" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="stroke-card" /> : null}
              </g>
            );
          })}

          <circle cx={24} cy={LEGEND_Y} r={5} className={TONES.warn.solidFill} />
          <text x={34} y={LEGEND_Y + 4.5} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>old address</text>
          <circle cx={122} cy={LEGEND_Y} r={5} className={TONES.good.solidFill} />
          <text x={132} y={LEGEND_Y + 4.5} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>new address</text>
          <text x={W - 20} y={LEGEND_Y + 4.5} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>each dot is a resolver</text>

          <text x={16} y={CHIPS_Y + 4.5} className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>TTL</text>
          {chipSpots.map(({ s, x }) => (
            <SvgChip key={s.seconds} x={x} y={CHIPS_Y} text={s.chip} label={`TTL ${s.words}`} pressed={s.seconds === ttl} onPress={() => setTtl(s.seconds)} />
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Time after the change"
            valueText={`${timeText} after the change: ${onNew} of ${RESOLVERS} resolvers on the new address`}
            value={pct}
            ladder={TIME_LADDER}
            fromFraction={pctFromFraction}
            onChange={setManual}
            onGrab={(grabbed) => (grabbed ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={pctToFraction(pct)}
              marks={ttl > 0 ? [{ at: pctToFraction(100), label: `TTL ${step.chip}` }] : []}
              ends={["0", maxText]}
              caption="time after the change"
            />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
