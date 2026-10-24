"use client";

import { useId, useRef, useState } from "react";
import { Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow, chipRowWidth } from "../primitives/radio-chip-row";
import { SnapStopsRail, type RailStop } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ACK_SNAPS,
  CONSUMERS,
  DEFAULTS,
  GAP_SNAPS,
  N,
  flow,
  flowSummary,
  gapUsed,
  percent,
  type Consumer,
  type DotKind,
} from "../models/dedupe-flow";

const W = 420;
const H = 478;
const COLS = 25;
const DOT_PITCH = 14.4;
const DOT_X0 = (W - (COLS - 1) * DOT_PITCH) / 2;
const ROW_PITCH = 12;
const GRID_Y = 80;
const BAND = { x: 14, y: 190, w: 392, h: 52 };
const BAR = { x: 30, y: 282, w: 360, h: 16, scale: 1.8 };
const CONSUMER_CAPTION_Y = 350;
const CONSUMER_Y = 372;
const RAIL_CAPTION_Y = 410;
const RAIL_Y = 436;
const CURSOR_PER_SECOND = 16;

const DOT_CLASS: Record<DotKind, string> = {
  original: cn(TONES.accent.solidFill, "stroke-transparent"),
  copy: "fill-blue-200 stroke-blue-400 dark:fill-blue-500/25 dark:stroke-blue-400",
  "copy-hit": "fill-red-100 stroke-red-600 dark:fill-red-500/20 dark:stroke-red-400",
};

const ACK_STOPS: RailStop[] = ACK_SNAPS.map((v) => ({ value: v, label: percent(v) }));
const GAP_STOPS: RailStop[] = GAP_SNAPS.map((v) => ({ value: v, label: percent(v) }));

const CONSUMER_NOTE: Record<Consumer, string> = { none: "applies every copy", separate: "checks, works, records", same: "one transaction" };

/** Boxes for the steps the consumer takes, right-aligned in the consumer band. */
function Pipeline({ consumer, gap }: { consumer: Consumer; gap: number }) {
  const y = BAND.y + 7;
  const box = (x: number, w: number, text: string, accent = false) => (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={13} strokeWidth={1.75} className={cn(accent ? TONES.good.softFill : NEUTRAL.surface, accent ? TONES.good.stroke : NEUTRAL.line)} />
      <text x={x + w / 2} y={y + 17.5} textAnchor="middle" className={cn(accent ? TONES.good.text : NEUTRAL.text, "text-[12px] font-bold")}>{text}</text>
    </g>
  );
  if (consumer === "none") {
    return (
      <g>
        {box(340, 56, "work")}
        <text x={368} y={BAND.y + 45} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>no record</text>
      </g>
    );
  }
  if (consumer === "same") {
    return (
      <g>
        {box(250, 146, "claim id + work", true)}
        <text x={323} y={BAND.y + 45} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>all or nothing</text>
      </g>
    );
  }
  return (
    <g>
      {box(240, 56, "work")}
      {box(330, 66, "record")}
      <g aria-hidden>
        <line x1={296} x2={330} y1={y + 13} y2={y + 13} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.faintStroke} />
        <circle cx={313} cy={y + 13} r={9} className={cn(TONES.warn.softFill, TONES.warn.stroke)} strokeWidth={1.5} />
        <Zap x={307} y={y + 7} width={12} height={12} strokeWidth={2.5} className={cn("fill-none", TONES.warn.stroke)} />
      </g>
      <text x={313} y={BAND.y + 45} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold tabular-nums")}>gap {percent(gap)}</text>
    </g>
  );
}

/** 14.5 beat: pick a consumer, how often acks are lost and how often it crashes in the gap, and count the effects. */
export function DedupeFlowCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [pick, setPick] = useState<{ consumer: Consumer; ack: number; gap: number }>({ ...DEFAULTS });
  const titleId = useId();
  const descId = useId();
  const f = flow(pick.consumer, pick.ack, pick.gap);
  const usesGap = gapUsed(pick.consumer);
  const total = f.dots.length;
  const cursor = clock.reduced ? -1 : Math.floor(clock.seconds * CURSOR_PER_SECOND) % total;
  const posOf = (i: number) => ({ x: DOT_X0 + (i % COLS) * DOT_PITCH, y: GRID_Y + Math.floor(i / COLS) * ROW_PITCH });
  const cur = cursor >= 0 ? posOf(cursor) : null;
  const curKind = cursor >= 0 ? f.dots[cursor] : null;
  const expectedX = BAR.x + N * BAR.scale;
  const greenW = Math.min(f.effectsShown, N) * BAR.scale;
  const redW = Math.max(0, f.extraShown) * BAR.scale;
  const extraTone = f.extraShown > 0 ? "bad" : "good";
  const chipsX = (W - chipRowWidth(CONSUMERS.map((c) => c.text))) / 2;
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const legend = [
    { key: "original", text: "message", w: 52 },
    { key: "copy", text: "copy", w: 30 },
    { key: "copy-hit", text: "copy applied", w: 74 },
  ] as const;
  const legendTotal = legend.reduce((a, l) => a + 14 + l.w, 0) + 10 * (legend.length - 1);
  let lx = W - 14 - legendTotal;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Pick a consumer, then drag <b>ack lost</b>. Watch the effects pass the expected {N}.</>}>
      <div ref={box}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{flowSummary(f)}</desc>
          <DotGrid width={W} height={H} />
          <g role="status" aria-live="polite">
            <VerdictBanner width={W} text={f.verdict.text} tone={f.verdict.tone} />
          </g>

          <text x={14} y={64} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>What arrives</text>
          <g aria-hidden>
            {legend.map((l) => {
              const x = lx;
              lx += 14 + l.w + 10;
              return (
                <g key={l.key}>
                  <circle cx={x + 5} cy={60} r={4} strokeWidth={1.5} className={DOT_CLASS[l.key]} />
                  <text x={x + 14} y={64} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{l.text}</text>
                </g>
              );
            })}
          </g>

          {/* One dot for each message that arrives, with the copies spread among them. */}
          <g aria-hidden>
            {f.dots.map((kind, i) => {
              const p = posOf(i);
              return <circle key={i} cx={r1(p.x)} cy={p.y} r={4} strokeWidth={1.5} className={cn(DOT_CLASS[kind], "transition-colors duration-200 motion-reduce:transition-none")} />;
            })}
            {cur ? <circle cx={r1(cur.x)} cy={cur.y} r={7.5} strokeWidth={2} className={cn("fill-none", curKind === "copy-hit" ? TONES.bad.stroke : curKind === "copy" ? NEUTRAL.doneStroke : TONES.accent.stroke)} /> : null}
          </g>

          <g aria-hidden>
            <line x1={W / 2} x2={W / 2} y1={GRID_Y + 8 * ROW_PITCH - 2} y2={BAND.y - 5} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.doneStroke} />
            <polygon points={`${W / 2},${BAND.y - 1} ${W / 2 - 5},${BAND.y - 9} ${W / 2 + 5},${BAND.y - 9}`} className={NEUTRAL.doneFill} />
          </g>

          {/* The consumer. */}
          <rect x={BAND.x} y={BAND.y + 3} width={BAND.w} height={BAND.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={BAND.x} y={BAND.y} width={BAND.w} height={BAND.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <circle cx={BAND.x + 22} cy={BAND.y + 22} r={12} className="fill-blue-100 dark:fill-blue-500/20" />
          <Cpu x={BAND.x + 14} y={BAND.y + 14} width={16} height={16} strokeWidth={2} className="fill-none stroke-blue-700 dark:stroke-blue-300" aria-hidden />
          <text x={BAND.x + 42} y={BAND.y + 21} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>Consumer</text>
          <text x={BAND.x + 42} y={BAND.y + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{CONSUMER_NOTE[pick.consumer]}</text>
          <Pipeline consumer={pick.consumer} gap={f.gap} />

          {/* The count: effects applied against the expected 100, the difference in red. */}
          <g role="status" aria-live="polite">
            <text x={BAR.x} y={BAR.y - 14} className={cn(NEUTRAL.text, "text-[14.5px] font-bold tabular-nums")}>{`${f.effectsShown} effects applied`}</text>
            <rect x={W - 14 - 82} y={BAR.y - 33} width={82} height={26} rx={13} strokeWidth={1.75} className={cn(TONES[extraTone].softFill, TONES[extraTone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={W - 14 - 41} y={BAR.y - 15.5} textAnchor="middle" className={cn(TONES[extraTone].text, "text-[12.5px] font-bold tabular-nums")}>{`${f.extraShown} extra`}</text>
          </g>
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={5} className="fill-muted" />
          <rect x={BAR.x} y={BAR.y} width={greenW} height={BAR.h} rx={5} className={cn(TONES.good.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
          <rect x={expectedX} y={BAR.y} width={redW} height={BAR.h} rx={0} className={cn(TONES.bad.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
          <line x1={expectedX} x2={expectedX} y1={BAR.y - 4} y2={BAR.y + BAR.h + 4} strokeWidth={2} className="stroke-foreground" />
          <text x={expectedX} y={BAR.y + BAR.h + 20} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{`expected ${N}`}</text>

          <text x={14} y={CONSUMER_CAPTION_Y} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Consumer</text>
          <RadioChipRow
            x={chipsX}
            y={CONSUMER_Y}
            options={CONSUMERS.map((c) => ({ id: c.id, text: c.text, label: c.label }))}
            value={pick.consumer}
            onChange={(consumer) => setPick((p) => ({ ...p, consumer }))}
            ariaLabel="How the consumer protects itself"
          />

          <text x={14} y={RAIL_CAPTION_Y} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>Ack lost: {percent(f.a)}</text>
          <SnapStopsRail
            svgRef={svgRef}
            x0={30}
            x1={190}
            y={RAIL_Y}
            stops={ACK_STOPS}
            value={f.a}
            onChange={(v) => setPick((p) => ({ ...p, ack: v }))}
            ariaLabel="Chance the ack is lost"
            valueText={`${percent(f.a)} of acks are lost, ${f.effectsShown} effects`}
            onGrab={grab}
          />
          <text x={222} y={RAIL_CAPTION_Y} className={cn(usesGap ? NEUTRAL.text : NEUTRAL.mutedText, "text-[12.5px] font-semibold tabular-nums")}>Crash in the gap: {percent(usesGap ? f.gap : pick.gap)}</text>
          <SnapStopsRail
            svgRef={svgRef}
            x0={246}
            x1={396}
            y={RAIL_Y}
            stops={GAP_STOPS}
            value={snapGap(pick.gap)}
            onChange={(v) => setPick((p) => ({ ...p, gap: v }))}
            ariaLabel="Chance of a crash between the work and the record"
            valueText={`${percent(pick.gap)} of attempts crash in the gap`}
            disabled={!usesGap}
            onGrab={grab}
          />
        </svg>
      </div>
    </BeatFrame>
  );
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const snapGap = (v: number) => (GAP_SNAPS as readonly number[]).reduce((best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best), GAP_SNAPS[0]);
