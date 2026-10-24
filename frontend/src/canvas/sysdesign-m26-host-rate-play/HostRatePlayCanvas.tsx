"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { spread, withCommas } from "../models/picture-controls";
import {
  BIG_SITE_PAGES,
  CAPACITY,
  daysText,
  hostRate,
  hostValueText,
  hostVerdict,
  laneRate,
  lanesFor,
  limitWord,
  SITE_STEPS,
  SITES_DEFAULT,
  slotsFill,
  SLOTS,
  TARGET,
  WAIT_DEFAULT,
  WAIT_STEPS,
} from "../models/crawl-host-rate";

const W = 420;
const H = 520;
const SITES_PANEL = { x: 8, y: 46, w: 404, h: 66 };
const SLOTS_CARD = { x: 8, y: 126, w: 404, h: 88 };
const BAR = { x0: 20, x1: 400, y: 140, h: 20 };
const LANE_Y = 88;
const LANE_GAP = 16;
const DROP = { y0: 96, y1: BAR.y };
const SPEED_Y = 248;
const CARD_Y = 284;
const CARD_H = 46;
const SITES_RAIL = { x0: 40, x1: 380, y: 392 };
const WAIT_RAIL = { x0: 70, x1: 350, y: 478 };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 26.3: drag the sites with work waiting and the wait; the speed is the smaller of two limits. */
export function HostRatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [sites, setSites] = useState<number>(SITES_DEFAULT);
  const [wait, setWait] = useState<number>(WAIT_DEFAULT);

  const r = hostRate(sites, wait);
  const verdict = hostVerdict(r);
  const valueText = hostValueText(r);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  const lanes = lanesFor(sites);
  const laneX = (i: number) => r1(W / 2 - ((lanes - 1) * LANE_GAP) / 2 + i * LANE_GAP);
  const rate = laneRate(r);
  const dropAt = (i: number) => (clock.reduced ? spread(i + 1) : (clock.seconds * rate + spread(i + 1)) % 1);

  const sitesLimit = r.limit === "sites" || r.limit === "both";
  const slotsLimit = r.limit === "slots" || r.limit === "both";
  const tone: Tone = verdict.tone;
  const barW = BAR.x1 - BAR.x0;
  const targetX = r1(BAR.x0 + (TARGET / CAPACITY) * barW);

  const description = `Sites with work waiting: ${sites}. Each site gets one request every ${wait} seconds, so the sites allow ${withCommas(r.politeness)} pages a second. ${SLOTS} download slots at 0.4 seconds a fetch allow ${withCommas(CAPACITY)} pages a second. ${valueText}. ${verdict.text}. To reach ${TARGET} pages a second at this wait needs ${withCommas(r.sitesNeeded)} sites. One site of 1 million pages takes ${daysText(r.bigSiteDays)}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>sites</b> rail and the <b>wait</b> rail.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Sites with work waiting: one small icon each (up to 24), a lane down to the slots. */}
          <rect x={SITES_PANEL.x} y={SITES_PANEL.y} width={SITES_PANEL.w} height={SITES_PANEL.h} rx={14} className={NEUTRAL.surface} />
          <rect
            x={SITES_PANEL.x}
            y={SITES_PANEL.y}
            width={SITES_PANEL.w}
            height={SITES_PANEL.h}
            rx={14}
            strokeWidth={sitesLimit ? 2.5 : 1.5}
            className={cn("fill-none transition-colors duration-200 motion-reduce:transition-none", sitesLimit ? TONES.warn.stroke : NEUTRAL.line)}
          />
          <text x={20} y={66} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
            Sites with work waiting
          </text>
          <text x={400} y={66} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>
            {sites > lanes ? `x ${withCommas(sites)}` : `${withCommas(sites)}`}
          </text>
          <g aria-hidden>
            {Array.from({ length: lanes }, (_, i) => (
              <line key={`l${i}`} x1={laneX(i)} x2={laneX(i)} y1={LANE_Y + 8} y2={DROP.y1} strokeWidth={1} strokeDasharray="2 4" className={NEUTRAL.faintStroke} />
            ))}
            {Array.from({ length: lanes }, (_, i) => (
              <rect key={`s${i}`} x={r1(laneX(i) - 6)} y={LANE_Y - 6} width={12} height={12} rx={3} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
            ))}
            {Array.from({ length: lanes }, (_, i) => (
              <circle key={`d${i}`} cx={laneX(i)} cy={r1(DROP.y0 + dropAt(i) * (DROP.y1 - 4 - DROP.y0))} r={2.8} className={TONES.accent.solidFill} />
            ))}
          </g>

          {/* Fetch slots: the bar fills to the speed, against 2,000 a second. */}
          <rect x={SLOTS_CARD.x} y={SLOTS_CARD.y} width={SLOTS_CARD.w} height={SLOTS_CARD.h} rx={14} className={NEUTRAL.surface} />
          <rect
            x={SLOTS_CARD.x}
            y={SLOTS_CARD.y}
            width={SLOTS_CARD.w}
            height={SLOTS_CARD.h}
            rx={14}
            strokeWidth={slotsLimit ? 2.5 : 1.5}
            className={cn("fill-none transition-colors duration-200 motion-reduce:transition-none", slotsLimit ? TONES.warn.stroke : NEUTRAL.line)}
          />
          <rect x={BAR.x0} y={BAR.y} width={barW} height={BAR.h} rx={6} className="fill-muted" />
          <rect
            x={BAR.x0}
            y={BAR.y}
            width={barW}
            height={BAR.h}
            rx={6}
            style={{ transform: `scaleX(${Math.max(0.004, slotsFill(r))})`, transformBox: "fill-box", transformOrigin: "left center" }}
            className={cn(TONES[tone].solidFill, "transition-transform duration-200 motion-reduce:transition-none")}
          />
          <line x1={targetX} x2={targetX} y1={BAR.y - 3} y2={BAR.y + BAR.h + 5} strokeWidth={2} className={NEUTRAL.doneStroke} />
          <text x={BAR.x0} y={BAR.y + BAR.h + 20} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0</text>
          <text x={targetX} y={BAR.y + BAR.h + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>target 772</text>
          <text x={BAR.x1} y={BAR.y + BAR.h + 20} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>2,000</text>
          <text x={20} y={SLOTS_CARD.y + SLOTS_CARD.h - 10} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
            {`Fetch slots: ${SLOTS} at once, 0.4 s each`}
          </text>

          {/* The speed, and which limit is in force. */}
          <text x={20} y={SPEED_Y} className={cn(TONES[tone].text, "text-[17px] font-bold tabular-nums")}>
            {`Speed: ${withCommas(r.speed)} pages/s`}
          </text>
          <text x={400} y={SPEED_Y} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
            {`limit: ${limitWord(r.limit)}`}
          </text>

          {/* Two more numbers. */}
          {[
            { x: 8, label: `Needed for ${TARGET}/s`, value: `${withCommas(r.sitesNeeded)} sites` },
            { x: 214, label: `One site of ${BIG_SITE_PAGES / 1e6} million pages`, value: daysText(r.bigSiteDays) },
          ].map((c) => (
            <g key={c.label}>
              <rect x={c.x} y={CARD_Y + 3} width={198} height={CARD_H} rx={12} className="fill-foreground/[0.06]" />
              <rect x={c.x} y={CARD_Y} width={198} height={CARD_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={c.x + 12} y={CARD_Y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
              <text x={c.x + 12} y={CARD_Y + 37} className={cn(NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{c.value}</text>
            </g>
          ))}

          {/* The two rails. */}
          <text x={SITES_RAIL.x0} y={SITES_RAIL.y - 30} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
            {`Sites with work waiting: ${withCommas(sites)}`}
          </text>
          <SnapStopsRail
            svgRef={svg}
            x0={SITES_RAIL.x0}
            x1={SITES_RAIL.x1}
            y={SITES_RAIL.y}
            stops={SITE_STEPS.map((v) => ({ value: v, label: withCommas(v) }))}
            value={sites}
            onChange={setSites}
            ariaLabel="Sites with work waiting"
            valueText={valueText}
            onGrab={grab}
          />
          <text x={WAIT_RAIL.x0} y={WAIT_RAIL.y - 30} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
            {`Wait between requests to one site: ${wait} s`}
          </text>
          <SnapStopsRail
            svgRef={svg}
            x0={WAIT_RAIL.x0}
            x1={WAIT_RAIL.x1}
            y={WAIT_RAIL.y}
            stops={WAIT_STEPS.map((v) => ({ value: v, label: `${v} s` }))}
            value={wait}
            onChange={setWait}
            ariaLabel="Wait between requests to one site"
            valueText={valueText}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
