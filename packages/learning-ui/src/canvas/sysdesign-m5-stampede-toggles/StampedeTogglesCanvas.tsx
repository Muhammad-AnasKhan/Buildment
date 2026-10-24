"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { OverlayButton } from "../primitives/slider-zone";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  CHART_SECONDS,
  chartSecond,
  DEFAULT_SETTINGS,
  EXPIRIES,
  peakText,
  queueAt,
  shoppersWaiting,
  spikeHeight,
  STORY,
  stampede,
  type Settings,
} from "../models/stampede";

// 5.6: Matjar's hot key expires every minute. Switch the fixes on and off
// (chips inside the picture) and watch the queue at the database, the wait
// of the shoppers and a chart of the database load over three minutes.

const W = 420;
const H = 402;
const ROW = 82;
const SHOP = { x: 58, y: ROW };
const APPS = { x: 210, y: ROW };
const CACHE = { x: 362, y: ROW };
const DB = { x: 210, y: 164 };
const GRID = { x: 292, y: 152, cols: 8, gap: 12 };
const PLOT = { x0: 36, x1: 400, y0: 316, y1: 362 };
const CHIP_H = 36;
const ROWS = { a: 224, b: 268 };

type Chip = { id: string; label: string; x: number; w: number; row: "a" | "b" };
const CHIPS: Chip[] = [
  { id: "coalesce", label: "Coalesce", x: 44, w: 96, row: "a" },
  { id: "lease", label: "Shared lease", x: 150, w: 118, row: "a" },
  { id: "stale", label: "Serve stale", x: 278, w: 108, row: "a" },
  { id: "one", label: "1 hot key", x: 20, w: 96, row: "b" },
  { id: "many", label: "1,000 keys together", x: 124, w: 160, row: "b" },
  { id: "jitter", label: "Random TTL", x: 292, w: 108, row: "b" },
];

const r1 = (v: number) => Math.round(v * 10) / 10;
const px = (sec: number) => PLOT.x0 + (sec / CHART_SECONDS) * (PLOT.x1 - PLOT.x0);
const frac = (v: number) => v - Math.floor(v);

function ChipShape({ chip, on, disabled }: { chip: Chip; on: boolean; disabled: boolean }) {
  const y = ROWS[chip.row] - CHIP_H / 2;
  return (
    <g opacity={disabled ? 0.55 : 1} aria-hidden>
      <rect x={chip.x} y={y} width={chip.w} height={CHIP_H} rx={CHIP_H / 2} strokeWidth={1.5} className={on ? cn(TONES.accent.solidFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line)} />
      <text x={chip.x + chip.w / 2} y={y + CHIP_H / 2 + 4.5} textAnchor="middle" className={cn(on ? "fill-white dark:fill-blue-950" : NEUTRAL.text, "text-[13px] font-semibold")}>
        {chip.label}
      </text>
    </g>
  );
}

export function StampedeTogglesCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const o = stampede(settings);
  const many = settings.mode === "many";
  const seconds = clock.seconds;
  const queue = queueAt(settings, o, seconds, clock.reduced);
  const waiting = !clock.reduced && shoppersWaiting(settings, o, seconds);
  const now = clock.reduced ? CHART_SECONDS : chartSecond(seconds);

  const flip = (key: "coalesce" | "lease" | "stale" | "jitter") => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const setMode = (mode: Settings["mode"]) => setSettings((s) => ({ ...s, mode, jitter: mode === "one" ? false : s.jitter }));
  const isOn = (id: string) => (id === "one" ? !many : id === "many" ? many : settings[id as "coalesce" | "lease" | "stale" | "jitter"]);
  const isDisabled = (id: string) => (id === "jitter" ? !many : id === "coalesce" || id === "lease" || id === "stale" ? many : false);
  const press = (id: string) => (id === "one" ? setMode("one") : id === "many" ? setMode("many") : flip(id as "coalesce" | "lease" | "stale" | "jitter"));

  const summary = many
    ? `1,000 keys stored together expire every ${STORY.ttlSeconds} seconds${settings.jitter ? ", with random lifetimes of 54 to 66 seconds" : ""}. ${o.pill} reach the database. ${o.verdict}.`
    : `One hot key expires every ${STORY.ttlSeconds} seconds. Coalescing ${settings.coalesce ? "on" : "off"}, shared lease ${settings.lease ? "on" : "off"}, serve stale ${settings.stale ? "on" : "off"}. ${o.queries} queries reach the database at each expiry and shoppers wait ${o.waitMs} ms. ${o.verdict}.`;

  // Requests from shoppers to the app servers, and from the servers to the cache.
  const stream = (x0: number, x1: number, tone: Tone) =>
    Array.from({ length: 4 }, (_, j) => {
      const p = frac(seconds * 0.7 + j / 4);
      return <circle key={j} cx={r1(x0 + (x1 - x0) * p)} cy={ROW} r={4.5} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={1.5} />;
    });

  const spikes = EXPIRIES.map((e) => {
    const w = Math.max(5, (o.spikeSeconds / CHART_SECONDS) * (PLOT.x1 - PLOT.x0));
    const x = Math.min(px(e) - w / 2, PLOT.x1 - w);
    const h = Math.max(2, spikeHeight(o.peakPerSecond) * (PLOT.y1 - PLOT.y0));
    return { e, x, w, h };
  });
  const capY = PLOT.y1 - spikeHeight(STORY.databaseCapacity) * (PLOT.y1 - PLOT.y0);

  return (
    <BeatFrame label={title} limits={limits} hint={<>Tap a fix to switch it on or off. Try <b>1,000 keys together</b>, then <b>Random TTL</b>.</>}>
      <div ref={box} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          <line x1={SHOP.x} x2={APPS.x} y1={ROW} y2={ROW} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={APPS.x} x2={CACHE.x} y1={ROW} y2={ROW} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={APPS.x} x2={DB.x} y1={ROW} y2={DB.y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {stream(SHOP.x + 6, APPS.x - 6, waiting ? "warn" : "accent")}
          {stream(APPS.x + 6, CACHE.x - 6, "accent")}

          {/* Twenty app servers, drawn as a stack. */}
          <rect x={APPS.x - 56 + 10} y={APPS.y - 30 + 8} width={112} height={60} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <rect x={APPS.x - 56 + 5} y={APPS.y - 30 + 4} width={112} height={60} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <SvgNode x={SHOP.x} y={SHOP.y} label="Shoppers" kind="user" status={o.waitMs > 0 ? `waits ${o.waitMs} ms` : "no wait"} statusTone={o.waitMs > 0 ? "warn" : "good"} />
          <SvgNode x={APPS.x} y={APPS.y} label="App servers" kind="server" status={`${STORY.servers} servers`} />
          <SvgNode x={CACHE.x} y={CACHE.y} label="Cache" kind="cache" status={many ? "1,000 keys" : "60 s lifetime"} />
          <SvgNode x={DB.x} y={DB.y} label="Database" kind="database" status={o.pill} statusTone={o.tone} mark={o.tone === "bad" ? "bad" : undefined} />

          <text x={GRID.x} y={GRID.y - 14} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>database queue</text>
          {Array.from({ length: queue.count }, (_, i) => (
            <circle key={i} cx={GRID.x + (i % GRID.cols) * GRID.gap} cy={GRID.y + Math.floor(i / GRID.cols) * GRID.gap} r={4.5} className={cn(TONES[o.tone].solidFill, "stroke-card")} strokeWidth={1.25} />
          ))}
          {queue.more
            ? [0, 1, 2].map((i) => <circle key={`more-${i}`} cx={GRID.x + GRID.cols * GRID.gap + 2 + i * 6} cy={GRID.y + 2 * GRID.gap} r={1.8} className={TONES[o.tone].solidFill} />)
            : null}

          {CHIPS.map((c) => (
            <ChipShape key={c.id} chip={c} on={isOn(c.id)} disabled={isDisabled(c.id)} />
          ))}

          {/* The load on the database over three minutes. */}
          <text x={PLOT.x0} y={PLOT.y0 - 10} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>database load over 3 minutes</text>
          <text x={PLOT.x1} y={PLOT.y0 - 10} textAnchor="end" className={cn(TONES[o.tone].text, "text-[12.5px] font-bold tabular-nums")}>peak {peakText(o)}</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={capY} y2={capY} strokeWidth={1.5} strokeDasharray="5 4" className={TONES.warn.stroke} />
          {spikes.map((s) => (
            <rect key={s.e} x={r1(s.x)} y={r1(PLOT.y1 - s.h)} width={r1(s.w)} height={r1(s.h)} rx={1.5} className={TONES[o.tone].solidFill} />
          ))}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.y1} y2={PLOT.y1} strokeWidth={1.5} className={NEUTRAL.line} />
          <line x1={PLOT.x0} x2={r1(px(now))} y1={PLOT.y1} y2={PLOT.y1} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          <circle cx={r1(px(now))} cy={PLOT.y1} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
          {[0, 60, 120, 180].map((v) => (
            <text key={v} x={px(v)} y={PLOT.y1 + 17} textAnchor={v === 0 ? "start" : v === 180 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
              {v === 0 ? "0" : `${v / 60} min`}
            </text>
          ))}
          <line x1={PLOT.x0} x2={PLOT.x0 + 22} y1={PLOT.y1 + 32} y2={PLOT.y1 + 32} strokeWidth={1.5} strokeDasharray="5 4" className={TONES.warn.stroke} />
          <text x={PLOT.x0 + 30} y={PLOT.y1 + 36} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>what the database can do, about 800 a second</text>

          <VerdictBanner width={W} text={o.verdict} tone={o.tone} />
        </svg>

        {CHIPS.map((c) => (
          <OverlayButton
            key={c.id}
            view={{ w: W, h: H }}
            box={{ x: c.x - 3, y: ROWS[c.row] - 22, w: c.w + 6, h: 44 }}
            label={c.id === "one" || c.id === "many" ? `Mode: ${c.label}` : c.label}
            pressed={isOn(c.id)}
            disabled={isDisabled(c.id)}
            onClick={() => press(c.id)}
          />
        ))}
      </div>
    </BeatFrame>
  );
}
