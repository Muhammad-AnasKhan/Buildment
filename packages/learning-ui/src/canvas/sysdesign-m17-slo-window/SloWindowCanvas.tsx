"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  PROBE_MIN,
  TARGETS,
  TARGET_DEFAULT,
  WINDOWS,
  WINDOW_DEFAULT,
  allowedMinutes,
  badPerMillion,
  formatCount,
  formatMinutes,
  probe,
  probeScale,
  sliverWidth,
  targetText,
  valueText,
  verdictFor,
} from "./model";

const W = 420;
const H = 444;
const BAR = { x0: 20, x1: 400, y: 112, h: 28 };
const CARD_Y = 172;
const CARD_H = 70;
const PROBE_X0 = 20;
const PROBE_W = 380;
const RAIL = { x0: 40, x1: 380, y: 376 };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 17.3 beat 4: pick a target and a window, see the bad minutes allowed and whether a 25 minute outage fits. */
export function SloWindowCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [target, setTarget] = useState<number>(TARGET_DEFAULT);
  const [days, setDays] = useState<number>(WINDOW_DEFAULT);

  const allowed = allowedMinutes(target, days);
  const p = probe(allowed);
  const verdict = verdictFor(target, days);
  const scale = probeScale(allowed);
  const sliver = r1(sliverWidth(target, BAR.x1 - BAR.x0));
  const allowedW = r1((allowed / scale) * PROBE_W);
  const probeIn = r1((Math.min(allowed, PROBE_MIN) / scale) * PROBE_W);
  const probeOver = r1(((PROBE_MIN - Math.min(allowed, PROBE_MIN)) / scale) * PROBE_W);
  const widths = WINDOWS.map((d) => chipWidth(`${d} days`));
  const chipXs = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 8 * (WINDOWS.length - 1))) / 2, 8);
  const dayX = (d: number) => r1(BAR.x0 + (d / days) * (BAR.x1 - BAR.x0));
  const budgetTone = p.fits ? "good" : "bad";

  const description = `An SLO of ${targetText(target)} percent over ${days} days allows ${formatMinutes(allowed)} bad minutes, or ${formatCount(badPerMillion(target))} bad requests per million. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>rail</b> to change the target. Tap a <b>window</b>. Watch the 25 minute outage.</>}>
      <div>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="Window">
            {WINDOWS.map((d, i) => (
              <SvgRadioChip key={d} x={chipXs[i]} y={66} width={widths[i]} text={`${d} days`} label={`${d} day window`} checked={d === days} onSelect={() => setDays(d)} />
            ))}
          </g>

          {/* The window as one bar split into days, with the allowed bad time as a sliver at its end. */}
          <text x={BAR.x0} y={BAR.y - 7} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{`the last ${days} days`}</text>
          <text x={BAR.x1} y={BAR.y - 7} textAnchor="end" className={cn(TONES.warn.text, "text-[12px] font-bold")}>allowed bad time</text>
          <rect x={BAR.x0} y={BAR.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={8} className="fill-muted" />
          {Array.from({ length: days - 1 }, (_, k) => (
            <line key={k} x1={dayX(k + 1)} x2={dayX(k + 1)} y1={BAR.y + 3} y2={BAR.y + BAR.h - 3} strokeWidth={days > 30 ? 0.75 : 1} className="stroke-muted-foreground/30" />
          ))}
          <rect
            x={BAR.x1 - sliver}
            y={BAR.y}
            width={sliver}
            height={BAR.h}
            rx={sliver < 8 ? 1.5 : 8}
            className={cn(TONES.warn.solidFill, "transition-[x,width] duration-300 motion-reduce:transition-none")}
            style={{ x: BAR.x1 - sliver, width: sliver }}
          />
          <text x={BAR.x0} y={BAR.y + BAR.h + 19} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>start of the window</text>
          <text x={BAR.x1} y={BAR.y + BAR.h + 19} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>now</text>

          {/* The two big numbers. */}
          <g>
            <rect x={13} y={CARD_Y} width={194} height={CARD_H} rx={14} strokeWidth={2} className={cn(NEUTRAL.surface, TONES.warn.stroke)} />
            <text x={25} y={CARD_Y + 22} className={cn(NEUTRAL.mutedText, "text-[12px]")}>bad minutes allowed</text>
            <text x={25} y={CARD_Y + 55} className={cn(TONES.warn.text, "text-[28px] font-bold tabular-nums")}>{formatMinutes(allowed)}</text>
          </g>
          <g>
            <rect x={213} y={CARD_Y} width={194} height={CARD_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={225} y={CARD_Y + 22} className={cn(NEUTRAL.mutedText, "text-[12px]")}>bad requests per million</text>
            <text x={225} y={CARD_Y + 55} className={cn(NEUTRAL.text, "text-[28px] font-bold tabular-nums")}>{formatCount(badPerMillion(target))}</text>
          </g>

          {/* The probe: a 25 minute outage against the allowance, on one minute scale. */}
          <text x={PROBE_X0} y={266} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>allowed</text>
          <text x={PROBE_X0 + PROBE_W} y={266} textAnchor="end" className={cn(TONES.warn.text, "text-[12px] font-bold tabular-nums")}>{`${formatMinutes(allowed)} min`}</text>
          <rect x={PROBE_X0} y={272} width={PROBE_W} height={16} rx={8} className="fill-muted/50" />
          <rect x={PROBE_X0} y={272} width={Math.max(3, allowedW)} height={16} rx={8} className={cn(TONES.warn.solidFill, "transition-[width] duration-300 motion-reduce:transition-none")} style={{ width: Math.max(3, allowedW) }} />

          <text x={PROBE_X0} y={312} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>a bad deploy</text>
          <text x={PROBE_X0 + PROBE_W} y={312} textAnchor="end" className={cn(NEUTRAL.text, "text-[12px] font-bold tabular-nums")}>{`${PROBE_MIN} min`}</text>
          <rect x={PROBE_X0} y={318} width={PROBE_W} height={16} rx={8} className="fill-muted/50" />
          <rect x={PROBE_X0} y={318} width={Math.max(3, probeIn)} height={16} rx={8} className={cn(TONES[budgetTone].solidFill, "transition-[width] duration-300 motion-reduce:transition-none")} style={{ width: Math.max(3, probeIn) }} />
          {probeOver > 0 ? (
            <rect x={PROBE_X0 + probeIn} y={318} width={probeOver} height={16} rx={0} className={cn(TONES.bad.solidFill, "stroke-card")} strokeWidth={1} />
          ) : null}

          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={TARGETS.map((t) => ({ value: t, label: `${targetText(t)}%` }))}
            value={target}
            onChange={setTarget}
            ariaLabel="SLO target"
            valueText={valueText(target, days)}
            tone="warn"
          />
          <text x={W / 2} y={RAIL.y + 54} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>SLO target: the share of good requests</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{`${verdict.text}. ${valueText(target, days)}.`}</p>
      </div>
    </BeatFrame>
  );
}
