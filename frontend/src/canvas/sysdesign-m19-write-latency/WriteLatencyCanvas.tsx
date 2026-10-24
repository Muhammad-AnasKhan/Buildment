"use client";

import { useId, useRef, useState } from "react";
import { Crown, Server, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgButton } from "../primitives/svg-button";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { InfoChip, infoChipWidth } from "../primitives/svg-info-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_DESIGN,
  DEFAULT_LOCATION,
  DESIGNS,
  REGIONS,
  euRowsStayInEu,
  formatMs,
  leaderOf,
  nearestOther,
  regionAt,
  regionIndex,
  regionName,
  roundTrip,
  verdictFor,
  writeMs,
  writeSchedule,
  type DesignId,
  type RegionId,
} from "./model";

const W = 420;
const H = 374;
const CHIP_Y = 66;
const CARD = { w: 96, h: 56, y: 150 };
const CX: Record<RegionId, number> = { naw: 70, nae: 210, eu: 350 };
const LINE_Y = CARD.y + CARD.h / 2;
const CUSTOMER_Y = 118;
const CROWN_Y = 230;
const RING_R = 17;
const RING_LEN = 2 * Math.PI * RING_R;
const RAIL = { x0: 60, x1: 360, y: 336 };

const r1 = (v: number) => Math.round(v * 10) / 10;

const PACKET: Record<string, string> = { write: TONES.accent.solidFill, copy: TONES.warn.solidFill, ack: TONES.good.solidFill, reply: TONES.accent.solidFill };

/** 19.6 beat 3: drag the customer between regions, switch the design, and read the write delay and the rule check. */
export function WriteLatencyCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [design, setDesign] = useState<DesignId>(DEFAULT_DESIGN);
  const [where, setWhere] = useState<RegionId>(DEFAULT_LOCATION);

  const leader = leaderOf(design, where);
  const other = design === "global" ? nearestOther(leader) : null;
  const ms = writeMs(design, where);
  const verdict = verdictFor(design, where);
  const stays = euRowsStayInEu(design);
  const sched = writeSchedule(design, where);

  // Where the loop is: a still picture shows the finished write.
  const t = clock.reduced ? sched.total - 0.01 : clock.seconds % sched.total;
  const beat = sched.beats.find((b) => t >= b.start && t < b.end) ?? sched.beats[sched.beats.length - 1];
  const ring = Math.max(0, Math.min(1, (t - sched.ringStart) / (sched.ringEnd - sched.ringStart)));
  const packet = (() => {
    if (clock.reduced || beat.kind !== "leg") return null;
    const { from, to, kind } = beat.leg;
    const d = Math.sign(CX[to] - CX[from]);
    const x1 = CX[from] + d * (CARD.w / 2);
    const x2 = CX[to] - d * (CARD.w / 2);
    const p = (t - beat.start) / (beat.end - beat.start);
    return { x: r1(x1 + (x2 - x1) * p), kind };
  })();

  const widths = DESIGNS.map((d) => chipWidth(d.label));
  const chipX = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 8 * (DESIGNS.length - 1))) / 2);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const reset = () => {
    setDesign(DEFAULT_DESIGN);
    setWhere(DEFAULT_LOCATION);
  };

  const pillOf = (r: RegionId): { text: string; tone: Tone | null } => {
    if (r === leader) return { text: "leader", tone: "accent" };
    if (r === other) return { text: "confirms", tone: "warn" };
    return { text: design === "home" ? "idle" : "copy", tone: null };
  };

  const writeText = `Write: ${formatMs(ms)}`;
  const ruleText = `EU rows stay in the EU: ${stays ? "yes" : "no"}`;
  const description = `${DESIGNS.find((d) => d.id === design)?.full}. The customer is in ${regionName(where)} and the leader is in ${regionName(leader)}. ${verdict.text}. ${ruleText}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>customer</b> along the rail, then switch the design.
        </>
      }
      controls={<BeatButton onClick={reset}>Reset</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="Database design">
            {DESIGNS.map((d, i) => (
              <SvgRadioChip key={d.id} x={chipX[i]} y={CHIP_Y} width={widths[i]} text={d.label} label={d.full} checked={design === d.id} onSelect={() => setDesign(d.id)} />
            ))}
          </g>

          {/* The links between regions, with the round trip from the course table. */}
          <g aria-hidden>
            {([["naw", "nae"], ["nae", "eu"]] as const).map(([a, b]) => (
              <g key={`${a}-${b}`}>
                <line x1={CX[a] + CARD.w / 2} x2={CX[b] - CARD.w / 2} y1={LINE_Y} y2={LINE_Y} strokeWidth={2} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
                <text x={(CX[a] + CX[b]) / 2} y={LINE_Y - 8} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>{`${roundTrip(a, b)} ms`}</text>
              </g>
            ))}
          </g>

          {/* The three regions: tap one to put the customer there. */}
          {REGIONS.map((r) => {
            const pill = pillOf(r.id);
            const left = CX[r.id] - CARD.w / 2;
            const isLeader = r.id === leader;
            return (
              <SvgButton key={r.id} x={left} y={CARD.y} width={CARD.w} height={CARD.h} rx={13} label={`Put the customer in ${r.name}`} pressed={where === r.id} onPress={() => setWhere(r.id)}>
                {isLeader ? <rect x={left - 4} y={CARD.y - 4} width={CARD.w + 8} height={CARD.h + 8} rx={17} strokeWidth={2.5} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                <rect x={left} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={13} className="fill-foreground/[0.06]" />
                <rect x={left} y={CARD.y} width={CARD.w} height={CARD.h} rx={13} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                <circle cx={left + 15} cy={CARD.y + 15} r={10} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={left + 8} y={CARD.y + 8} width={14} height={14} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={left + 30} y={CARD.y + 19.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{r.name}</text>
                <rect x={left + 7} y={CARD.y + 30} width={CARD.w - 14} height={20} rx={10} className={cn(pill.tone ? TONES[pill.tone].softFill : "fill-muted", "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={CX[r.id]} y={CARD.y + 44} textAnchor="middle" className={cn(pill.tone ? TONES[pill.tone].text : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{pill.text}</text>
              </SvgButton>
            );
          })}

          {/* The customer sits above the region it is in. */}
          <g aria-hidden style={{ transform: `translate(${CX[where]}px, ${CUSTOMER_Y}px)` }} className="transition-transform duration-300 motion-reduce:transition-none">
            <text y={-21} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>customer</text>
            <circle r={14} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
            <User x={-7} y={-7} width={14} height={14} strokeWidth={2.4} className="text-white dark:text-blue-950" />
          </g>

          {/* A packet crossing a link: the write, the copy, the confirmation, the reply. */}
          {packet ? <circle cx={packet.x} cy={LINE_Y} r={5.5} className={cn(PACKET[packet.kind], "stroke-card")} strokeWidth={1.5} /> : null}

          {/* The crown marks the leader; its ring fills while the leader waits. */}
          <g aria-hidden style={{ transform: `translate(${CX[leader]}px, ${CROWN_Y}px)` }} className="transition-transform duration-300 motion-reduce:transition-none">
            <line x1={0} x2={0} y1={-CROWN_Y + CARD.y + CARD.h + 1} y2={-RING_R - 1} strokeWidth={2} className={TONES.accent.stroke} />
            <circle r={RING_R} strokeWidth={4} className="fill-card stroke-muted" />
            <circle r={RING_R} strokeWidth={4} strokeLinecap="round" fill="none" strokeDasharray={`${r1(RING_LEN * ring)} ${r1(RING_LEN)}`} transform="rotate(-90)" className={ring >= 1 ? TONES.good.stroke : TONES.accent.stroke} />
            <Crown x={-8} y={-8} width={16} height={16} strokeWidth={2.2} className="text-amber-600 dark:text-amber-400" />
          </g>

          {/* The result, in words. */}
          <InfoChip x={14} y={258} width={infoChipWidth(writeText)} text={writeText} tone={ms < 10 ? "good" : "warn"} />
          <InfoChip x={14 + infoChipWidth(writeText) + 8} y={258} width={infoChipWidth(ruleText)} text={ruleText} tone={stays ? "good" : "bad"} />

          <text x={34} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>where the customer is</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={REGIONS.map((r, i) => ({ value: i, label: r.name }))}
            value={regionIndex(where)}
            onChange={(v) => setWhere(regionAt(v))}
            ariaLabel="Where the customer is"
            valueText={`${regionName(where)}, write takes ${formatMs(ms)}`}
            onGrab={grab}
            knob={<User x={-7} y={-7} width={14} height={14} strokeWidth={2.4} className="text-white dark:text-blue-950" />}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
