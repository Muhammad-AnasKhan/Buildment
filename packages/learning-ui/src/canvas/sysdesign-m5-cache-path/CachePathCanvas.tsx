"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SliderZone } from "../primitives/slider-zone";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_HITS,
  dotPose,
  dotsAt,
  HIT_MAX,
  HIT_SNAPS,
  oneDecimal,
  pathNumbers,
  PATH,
  queriesText,
  type Hits,
  type LayerId,
} from "../models/cache-path";
import { snapTo, stepByKey } from "../models/picture-controls";

// 5.2: a vertical path of cards from the shopper to the database. Each cache
// has a hit-rate bar beside it; drag it and the dots turn back at the layer
// that hits, in the right proportions. Two numbers sit next to what they
// describe: the time added after the edge, and the queries a second at the
// database.

const W = 420;
const H = 404;
const CARD_X = 62;
const ROW_Y = [74, 138, 232, 296, 360] as const;
const LANE_DOWN = 134;
const LANE_UP = 150;
const BX0 = 180;
const BX1 = 386;
const BAR_DY = 12;

type BarRow = { key: keyof Hits; label: string; row: number };
const BARS: BarRow[] = [
  { key: "edge", label: "CDN edge hit rate", row: 1 },
  { key: "memory", label: "App cache hit rate", row: 2 },
  { key: "valkey", label: "Valkey hit rate", row: 3 },
];

const barX = (pct: number) => BX0 + (pct / HIT_MAX) * (BX1 - BX0);
const rowY = (row: number) => {
  const i = Math.max(0, Math.min(ROW_Y.length - 1, Math.floor(row)));
  const j = Math.min(ROW_Y.length - 1, i + 1);
  return ROW_Y[i] + (ROW_Y[j] - ROW_Y[i]) * (row - i);
};

const dotTone = (layer: LayerId): Tone => (layer === "database" ? "warn" : layer === "valkey" ? "accent" : "good");
const r2 = (v: number) => Math.round(v * 100) / 100;

export function CachePathCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [hits, setHits] = useState<Hits>(DEFAULT_HITS);
  const n = pathNumbers(hits);
  const added = `${oneDecimal(n.addedMs)} ms`;
  const queries = queriesText(n.queries);
  const dbTone: Tone = n.queries < 200 ? "good" : n.queries < 1000 ? "warn" : "bad";
  const set = (key: keyof Hits, value: number) => setHits((h) => (h[key] === value ? h : { ...h, [key]: Math.max(0, Math.min(HIT_MAX, Math.round(value))) }));
  const summary = `Edge hit rate ${hits.edge}%, app memory ${hits.memory}%, Valkey ${hits.valkey}%. Time added after the edge ${added}. ${queries} queries a second reach the database. ${n.verdict}.`;

  const dots = clock.reduced ? [] : dotsAt(clock.seconds, hits);
  const gapMid = (ROW_Y[1] + ROW_Y[2]) / 2;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag a <b>hit rate</b> bar left and right. Arrow keys work too.</>}>
      <div ref={box} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* The long link: the edge talks to the origin 160 ms away. */}
          <line x1={CARD_X} x2={CARD_X} y1={ROW_Y[1] + 30} y2={ROW_Y[2] - 30} strokeWidth={2} strokeDasharray="5 5" className={NEUTRAL.faintStroke} />

          {/* Two lanes: requests go down the left one, answers come back up the right one. */}
          <line x1={LANE_DOWN} x2={LANE_DOWN} y1={ROW_Y[0]} y2={ROW_Y[4]} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          <line x1={LANE_UP} x2={LANE_UP} y1={ROW_Y[0]} y2={ROW_Y[4]} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          {ROW_Y.slice(1).map((y) => (
            <line key={y} x1={CARD_X + 56} x2={LANE_UP} y1={y} y2={y} strokeWidth={1.5} strokeLinecap="round" className={NEUTRAL.faintStroke} />
          ))}
          <line x1={CARD_X + 56} x2={LANE_DOWN} y1={ROW_Y[0]} y2={ROW_Y[0]} strokeWidth={1.5} strokeLinecap="round" className={NEUTRAL.faintStroke} />

          {dots.map((d) => {
            const pose = dotPose(d.layer, d.tau);
            if (!pose) return null;
            const x = pose.lane === "down" ? LANE_DOWN : pose.lane === "up" ? LANE_UP : LANE_DOWN + (LANE_UP - LANE_DOWN) * pose.across;
            const tone = pose.lane === "down" ? "accent" : dotTone(d.layer);
            return <circle key={d.n} cx={r2(x)} cy={r2(rowY(pose.row))} r={5} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={1.5} />;
          })}

          <SvgNode x={CARD_X} y={ROW_Y[0]} label="Shopper" kind="phone" status="Singapore" />
          <SvgNode x={CARD_X} y={ROW_Y[1]} label="CDN edge" kind="cdn" status="Singapore" />
          <SvgNode x={CARD_X} y={ROW_Y[2]} label="App cache" kind="server" status="EU West" />
          <SvgNode x={CARD_X} y={ROW_Y[3]} label="Valkey" kind="cache" status="EU West" />
          <SvgNode x={CARD_X} y={ROW_Y[4]} label="Database" kind="database" status={`${queries}/s`} statusTone={dbTone} />

          {/* "160 ms trip" sits on the long link, between the two cards. */}
          <rect x={CARD_X - 46} y={gapMid - 10} width={92} height={20} rx={10} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={CARD_X} y={gapMid + 4} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>
            {PATH.originMs} ms trip
          </text>

          <text x={BX0} y={ROW_Y[0] + 4} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
            1,000 page views a second
          </text>

          {BARS.map((b) => {
            const y = ROW_Y[b.row] + BAR_DY;
            const pct = hits[b.key];
            const hx = barX(pct);
            return (
              <g key={b.key} aria-hidden>
                <text x={BX0} y={ROW_Y[b.row] - 12} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{b.label}</text>
                <text x={BX1} y={ROW_Y[b.row] - 12} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{pct}%</text>
                <line x1={BX0} x2={BX1} y1={y} y2={y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                <line x1={BX0} x2={hx} y1={y} y2={y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                {HIT_SNAPS.filter((s) => s > 0).map((s) => (
                  <line key={s} x1={barX(s)} x2={barX(s)} y1={y - 9} y2={y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                ))}
                <circle cx={hx} cy={y} r={17} className={TONES.accent.softFill} />
                <circle cx={hx} cy={y} r={11} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
                <line x1={hx - 3} x2={hx - 3} y1={y - 4.5} y2={y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                <line x1={hx + 3} x2={hx + 3} y1={y - 4.5} y2={y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
              </g>
            );
          })}

          {/* Number one, by the long link: the wait that is left after the edge. */}
          <text x={BX0} y={gapMid - 7} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
            time added after the edge
          </text>
          <text x={BX0} y={gapMid + 17} className={cn(TONES[n.addedMs < 20 ? "good" : "warn"].text, "text-[20px] font-bold tabular-nums")}>
            {added}
          </text>

          {/* Number two, by the database: how many queries get through every cache. */}
          <text x={BX0} y={ROW_Y[4] + 2} className={cn(TONES[dbTone].text, "text-[24px] font-bold tabular-nums")}>
            {queries}
          </text>
          <text x={BX0} y={ROW_Y[4] + 22} className={cn(NEUTRAL.mutedText, LABEL_HALO, "text-[12px] font-medium")}>
            queries a second reach the database
          </text>

          <VerdictBanner width={W} text={n.verdict} tone={n.tone} />
        </svg>

        {BARS.map((b) => {
          const zone = { x: BX0 - 18, y: ROW_Y[b.row] + BAR_DY - 22, w: BX1 - BX0 + 36, h: 44 };
          const fromX = (fx: number) => ((zone.x + fx * zone.w - BX0) / (BX1 - BX0)) * HIT_MAX;
          return (
            <SliderZone
              key={b.key}
              view={{ w: W, h: H }}
              box={zone}
              label={b.label}
              valueMin={0}
              valueMax={HIT_MAX}
              valueNow={hits[b.key]}
              valueText={`${hits[b.key]} percent. ${added} added after the edge, ${queries} queries a second. ${n.verdict}`}
              onFraction={(fx) => set(b.key, snapTo(Math.round(fromX(fx)), HIT_SNAPS, 1.5))}
              onKey={(key) => {
                const next = stepByKey(hits[b.key], key, { min: 0, max: HIT_MAX, step: 1, page: 10 });
                if (next === null) return false;
                set(b.key, next);
                return true;
              }}
            />
          );
        })}
      </div>
    </BeatFrame>
  );
}
