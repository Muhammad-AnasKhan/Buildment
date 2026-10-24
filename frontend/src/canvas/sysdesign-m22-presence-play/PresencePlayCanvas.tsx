"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots } from "../models/server-load";
import { withCommas } from "../models/picture-controls";
import { GATEWAYS, PEAK_MESSAGES } from "../models/dardasha-numbers";
import {
  BAR_MAX,
  dotsPerSecond,
  GAP_DEFAULT,
  GAP_STEPS,
  gapText,
  perSecond,
  presenceRun,
  presenceValueText,
  presenceVerdict,
  storeTone,
  storeWritesText,
  timesText,
  type PingEnd,
} from "../models/dardasha-presence";

const W = 420;
const H = 452;
const ROW_A = 88;
const ROW_B = 198;
const PHONES = { x: 70, y: ROW_A };
const GATEWAY = { x: 350, y: ROW_A };
const STORE = { x: 350, y: ROW_B };
const CARD_HALF_W = 56;
const CARD_HALF_H = 30;
const BAR = { x0: 20, x1: 400, h: 16 };
const BAR_1 = { label: 276, y: 284 };
const BAR_2 = { label: 332, y: 340 };
const RAIL = { x0: 50, x1: 370, y: 412 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const barWidth = (v: number) => r1(Math.max(3, (v / BAR_MAX) * (BAR.x1 - BAR.x0)));

const FILL: Record<Tone, string> = {
  good: "fill-emerald-600/70 dark:fill-emerald-400/70",
  warn: "fill-amber-600/70 dark:fill-amber-400/70",
  bad: "fill-red-600/70 dark:fill-red-400/70",
  accent: "fill-blue-600/70 dark:fill-blue-400/70",
};

/** 22.4 beat 7: drag the gap between pings, and choose where a ping ends. */
export function PresencePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [gap, setGap] = useState<number>(GAP_DEFAULT);
  const [end, setEnd] = useState<PingEnd>("store");

  const p = presenceRun(gap, end);
  const verdict = presenceVerdict(p);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const storeStress = storeTone(p.storeWrites);
  const pingTone: Tone = end === "store" ? (p.timesMessages >= 3 ? "bad" : "warn") : "accent";

  // Dots follow the rates: all the pings reach the gateway; only some reach the store.
  const toGateway = clock.reduced ? [] : flowDots(clock.seconds, dotsPerSecond(p.pingsPerSecond));
  const toStore = clock.reduced ? [] : flowDots(clock.seconds, dotsPerSecond(p.storeWrites));
  const link1 = { x0: PHONES.x + CARD_HALF_W + 4, x1: GATEWAY.x - CARD_HALF_W - 4 };
  const link2 = { y0: GATEWAY.y + CARD_HALF_H + 4, y1: STORE.y - CARD_HALF_H - 4 };

  const description = `Dardasha presence at peak. ${presenceValueText(p)}. Messages are ${withCommas(PEAK_MESSAGES)} a second. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>gap</b> between pings, then choose where a ping <b>ends</b>.
        </>
      }
      controls={
        <BeatChoice<PingEnd>
          label="A ping ends at"
          options={[
            { id: "store", label: "Ping ends at the store" },
            { id: "gateway", label: "Ping ends at the gateway" },
          ]}
          value={end}
          onChange={setEnd}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Links, with ping dots: a ping is one dot. */}
          <line x1={link1.x0} x2={link1.x1} y1={ROW_A} y2={ROW_A} strokeWidth={1.75} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={GATEWAY.x} x2={GATEWAY.x} y1={link2.y0} y2={link2.y1} strokeWidth={1.75} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <g aria-hidden>
            {toGateway.map((d) => (
              <circle key={`a${d.id}`} cx={r1(link1.x0 + (link1.x1 - link1.x0) * d.progress)} cy={ROW_A} r={3.4} className={TONES.accent.solidFill} />
            ))}
            {toStore.map((d) => (
              <circle key={`b${d.id}`} cx={GATEWAY.x} cy={r1(link2.y0 + (link2.y1 - link2.y0) * d.progress)} r={3.4} className={TONES[end === "store" ? storeStress : "good"].solidFill} />
            ))}
          </g>

          <SvgNode x={PHONES.x} y={PHONES.y} label="Phones" kind="phone" status="3M connected" statusTone="accent" />
          <SvgNode x={GATEWAY.x} y={GATEWAY.y} label="Gateways" kind="router" status={`${GATEWAYS} gateways`} statusTone="good" />
          <SvgNode x={STORE.x} y={STORE.y} label="Presence" kind="database" status={storeWritesText(p)} statusTone={storeStress} mark={storeStress === "bad" ? "bad" : undefined} />

          {/* How long until a friend who left shows offline. */}
          <g>
            <rect x={7} y={ROW_B - 21} width={126} height={42} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={17} y={ROW_B - 5} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>shown offline after</text>
            <text x={17} y={ROW_B + 14} className={cn(NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{gapText(p.offlineAfter)}</text>
          </g>

          {/* Two bars on one scale: pings a second, and messages a second. */}
          <text x={BAR.x0} y={BAR_1.label} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{end === "store" ? "pings a second, all to the store" : "pings a second, end at the gateway"}</text>
          <text x={BAR.x1} y={BAR_1.label} textAnchor="end" className={cn(TONES[pingTone].text, "text-[13px] font-bold tabular-nums")}>{perSecond(p.pingsPerSecond)}</text>
          <rect x={BAR.x0} y={BAR_1.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={8} className="fill-muted" />
          <rect x={BAR.x0} y={BAR_1.y} width={barWidth(p.pingsPerSecond)} height={BAR.h} rx={8} className={cn(FILL[pingTone], "transition-all duration-200 motion-reduce:transition-none")} />

          <text x={BAR.x0} y={BAR_2.label} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>messages a second</text>
          <text x={BAR.x1} y={BAR_2.label} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{perSecond(PEAK_MESSAGES)}</text>
          <rect x={BAR.x0} y={BAR_2.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={8} className="fill-muted" />
          <rect x={BAR.x0} y={BAR_2.y} width={barWidth(PEAK_MESSAGES)} height={BAR.h} rx={8} className={FILL.accent} />
          <text x={BAR.x1} y={BAR_2.y + BAR.h + 14} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`pings are ${timesText(p.timesMessages)}x the messages`}</text>

          {/* The gap between pings: a rail with five stops. */}
          <text x={W / 2} y={RAIL.y - 26} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>a phone pings every</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={GAP_STEPS.map((v) => ({ value: v, label: gapText(v) }))}
            value={gap}
            onChange={setGap}
            ariaLabel="Gap between pings in seconds"
            valueText={presenceValueText(p)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
