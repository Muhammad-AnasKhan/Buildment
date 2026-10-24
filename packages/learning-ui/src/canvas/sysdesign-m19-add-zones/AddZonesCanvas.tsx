"use client";

import { useId, useRef, useState } from "react";
import { Server, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { dotRate, laneDots } from "../models/lane-dots";
import {
  DEFAULT_ZONES,
  SHARED_DOWNTIME_MINUTES,
  ZONE_COUNTS,
  appDown,
  availability,
  capacityMultiple,
  downtimeMinutes,
  failedCount,
  formatAvailability,
  formatHours,
  formatMinutes,
  formatMultiple,
  loadShare,
  verdictFor,
  zoneName,
} from "./model";

const W = 420;
const H = 358;
const USER = { x: 210, y: 66, w: 76, h: 24 };
const CARD_W = 92;
const CARD_H = 56;
const GAP = 8;
const CARD_TOP = 118;
const BAR_Y = 183;
const BAR_W = CARD_W - 12;
const READ_Y = 208;
const READ_H = 58;
const RAIL = { x0: 60, x1: 360, y: 322 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const leftOf = (n: number, i: number) => (W - (n * CARD_W + (n - 1) * GAP)) / 2 + i * (CARD_W + GAP);

/** 19.2 beat 2: drag the zone count, tap a zone to fail it, and watch uptime, load and capacity. */
export function AddZonesCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [n, setN] = useState<number>(DEFAULT_ZONES);
  const [failed, setFailed] = useState<boolean[]>([false, false, false, false]);
  const [bad, setBad] = useState(false);

  const f = failedCount(n, failed);
  const down = appDown(n, f, bad);
  const load = loadShare(n, f);
  const verdict = verdictFor(n, f, bad);
  const minutes = bad ? SHARED_DOWNTIME_MINUTES : downtimeMinutes(n);
  const multiple = capacityMultiple(n);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const reset = () => {
    setN(DEFAULT_ZONES);
    setFailed([false, false, false, false]);
    setBad(false);
  };
  const toggle = (i: number) => setFailed((cur) => cur.map((v, k) => (k === i ? !v : v)));

  const liveIndexes = Array.from({ length: n }, (_, i) => i).filter((i) => !failed[i] && !bad);
  const loadTone = (v: number | null): Tone => (v === null || v > 1 + 1e-9 ? "bad" : v >= 1 - 1e-9 ? "warn" : "good");

  const description = `The app runs in ${n} ${n === 1 ? "zone" : "zones"}. ${verdict.text}. Availability ${formatAvailability(availability(n))}, ${formatMinutes(minutes)} down a year. Capacity to buy: ${formatMultiple(multiple)}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the rail to choose the <b>zones</b>, then tap a zone to fail it.
        </>
      }
      controls={
        <>
          <BeatButton pressed={bad} onClick={() => setBad((v) => !v)}>
            Bad release to all zones
          </BeatButton>
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Requests go from the users to each live zone; a failed zone gets none. */}
          {Array.from({ length: n }, (_, i) => {
            if (!liveIndexes.includes(i)) return null;
            const x2 = leftOf(n, i) + CARD_W / 2;
            const y1 = USER.y + USER.h / 2 + 3;
            const y2 = CARD_TOP - 7;
            const share = down ? 1 : (load ?? 1);
            const dots = laneDots(clock.seconds, dotRate(share), clock.reduced, i, 1.2);
            const angle = Math.atan2(y2 - y1, x2 - USER.x);
            const tip = { x: x2, y: y2 + 5 };
            const back = (a: number, d: number) => ({ x: r1(tip.x - Math.cos(angle + a) * d), y: r1(tip.y - Math.sin(angle + a) * d) });
            const p1 = back(0.45, 8);
            const p2 = back(-0.45, 8);
            return (
              <g key={`req-${i}`} aria-hidden>
                <LinkLine x1={USER.x} y1={y1} x2={x2} y2={y2} className={down ? TONES.bad.stroke : NEUTRAL.faintStroke} />
                <polygon points={`${tip.x},${tip.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} className={down ? TONES.bad.solidFill : NEUTRAL.faintFill} />
                {dots.map((p, k) => (
                  <circle key={k} cx={r1(USER.x + (x2 - USER.x) * p)} cy={r1(y1 + (y2 - y1) * p)} r={3.4} className={down ? TONES.bad.solidFill : TONES.accent.solidFill} />
                ))}
              </g>
            );
          })}

          <g aria-hidden>
            <rect x={USER.x - USER.w / 2} y={USER.y - USER.h / 2} width={USER.w} height={USER.h} rx={USER.h / 2} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <User x={USER.x - USER.w / 2 + 9} y={USER.y - 7} width={14} height={14} strokeWidth={2} className="text-violet-700 dark:text-violet-300" aria-hidden />
            <text x={USER.x - USER.w / 2 + 29} y={USER.y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Users</text>
          </g>

          {/* The zones: they slide to make room as the count changes. */}
          {Array.from({ length: n }, (_, i) => {
            const isDown = failed[i] || bad;
            const tone: Tone = isDown ? "bad" : loadTone(load);
            const status = isDown ? "down" : `${Math.round((load ?? 0) * 100)}% load`;
            const fill = Math.min(1, load ?? 0);
            return (
              <g key={i} style={{ transform: `translate(${leftOf(n, i)}px, 0px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
                <SvgButton
                  x={0}
                  y={CARD_TOP}
                  width={CARD_W}
                  height={CARD_H}
                  rx={12}
                  label={`${zoneName(i)} is ${isDown ? "down" : "up"}. ${failed[i] ? "Tap to restore it." : "Tap to fail it."}`}
                  pressed={failed[i]}
                  onPress={() => toggle(i)}
                >
                  <g opacity={isDown ? 0.7 : 1}>
                    <rect x={0} y={CARD_TOP + 3} width={CARD_W} height={CARD_H} rx={12} className="fill-foreground/[0.06]" />
                    <rect x={0} y={CARD_TOP} width={CARD_W} height={CARD_H} rx={12} strokeWidth={isDown ? 2 : 1.5} strokeDasharray={isDown ? "5 3" : undefined} className={cn(NEUTRAL.surface, isDown ? TONES.bad.stroke : NEUTRAL.line)} />
                    {isDown ? <rect x={0} y={CARD_TOP} width={CARD_W} height={CARD_H} rx={12} className="fill-muted/70" /> : null}
                    <circle cx={15} cy={CARD_TOP + 15} r={10} className="fill-blue-100 dark:fill-blue-500/20" />
                    <Server x={8} y={CARD_TOP + 8} width={14} height={14} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                    <text x={29} y={CARD_TOP + 19.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{zoneName(i)}</text>
                    <rect x={6} y={CARD_TOP + 30} width={CARD_W - 12} height={20} rx={10} className={cn(TONES[tone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                    <text x={CARD_W / 2} y={CARD_TOP + 44} textAnchor="middle" className={cn(TONES[tone].text, "text-[11.5px] font-semibold tabular-nums")}>{status}</text>
                  </g>
                </SvgButton>
                {/* The load bar of a live zone: amber at 100%, red past it. */}
                {!isDown ? (
                  <g aria-hidden>
                    <rect x={6} y={BAR_Y} width={BAR_W} height={8} rx={4} className="fill-muted" />
                    <rect x={6} y={BAR_Y} height={8} rx={4} style={{ width: `${r1(fill * BAR_W)}px` }} className={cn(TONES[tone].solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Two readouts: the downtime a year, and the capacity to buy. */}
          <g>
            <rect x={14} y={READ_Y} width={190} height={READ_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={24} y={READ_Y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>Downtime a year</text>
            <text x={24} y={READ_Y + 42} className={cn(n === 1 && !bad ? TONES.bad.text : NEUTRAL.text, "text-[18px] font-bold tabular-nums")}>{formatMinutes(minutes)}</text>
            <text x={194} y={READ_Y + 42} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold tabular-nums")}>{formatHours(minutes)}</text>
          </g>
          <g>
            <rect x={216} y={READ_Y} width={190} height={READ_H} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={226} y={READ_Y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>Capacity needed</text>
            <text x={396} y={READ_Y + 17} textAnchor="end" className={cn(multiple >= 2 ? TONES.warn.text : NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{formatMultiple(multiple)}</text>
            <rect x={226} y={READ_Y + 26} width={170} height={10} rx={5} className="fill-muted" />
            <rect x={226} y={READ_Y + 26} height={10} rx={5} style={{ width: `${r1((multiple / 2) * 170)}px` }} className={cn(multiple >= 2 ? TONES.warn.solidFill : TONES.accent.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
            <line x1={311} x2={311} y1={READ_Y + 23} y2={READ_Y + 39} strokeWidth={1.5} className={NEUTRAL.doneStroke} />
            <text x={226} y={READ_Y + 53} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{n === 1 ? "no zone may fail" : "to survive losing a zone"}</text>
          </g>

          <text x={34} y={RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>zones the app uses</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={ZONE_COUNTS.map((v) => ({ value: v, label: String(v) }))}
            value={n}
            onChange={setN}
            ariaLabel="Number of zones"
            valueText={`${n} ${n === 1 ? "zone" : "zones"}, ${formatMinutes(downtimeMinutes(n))} down a year`}
            onGrab={grab}
            knob={<text y={4.5} textAnchor="middle" className="fill-white text-[13px] font-bold dark:fill-blue-950">{n}</text>}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
