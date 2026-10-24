"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SliderZone } from "../primitives/slider-zone";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { cacheAt, DEFAULT_S, flightProgress, flights, playhead, raceResult, RACE, S_MAX, S_MIN, S_SNAPS, TIMELINE_MS } from "../models/stale-race";
import { clamp, snapTo, stepByKey } from "../models/picture-controls";

// 5.5: the delete-then-stale-set race on a timeline. The reader's late set is
// the knob: drag it along the ruler and the cache card shows what it holds at
// the end. A playhead sweeps the ruler and the messages fly between the
// cards as it passes them. A toggle turns leases on.

const W = 420;
const H = 336;
const T0 = 24;
const T1 = 396;
const MS = (T1 - T0) / TIMELINE_MS;
const tx = (ms: number) => T0 + ms * MS;
const BAND = { top: 246, h: 22 };
const KNOB_Y = 288;
const TAG = { fixed0: 200, fixed1: 226, set: 314 };
const TAG_H = 20;
const tagW = (text: string) => Math.round(text.length * 6.6 + 18);

const POS = {
  cache: { x: 210, y: 80 },
  reader: { x: 66, y: 150 },
  db: { x: 210, y: 150 },
  writer: { x: 354, y: 150 },
} as const;

const r1 = (v: number) => Math.round(v * 10) / 10;

function Tag({ x, y, text, tone }: { x: number; y: number; text: string; tone: Tone }) {
  const w = tagW(text);
  const t = TONES[tone];
  return (
    <g>
      <rect x={x - w / 2} y={y - TAG_H / 2} width={w} height={TAG_H} rx={TAG_H / 2} className={NEUTRAL.surface} />
      <rect x={x - w / 2} y={y - TAG_H / 2} width={w} height={TAG_H} rx={TAG_H / 2} strokeWidth={1.5} className={cn(t.softFill, t.stroke)} />
      <text x={x} y={y + 4} textAnchor="middle" className={cn(t.text, "text-[11.5px] font-semibold tabular-nums")}>{text}</text>
    </g>
  );
}

export function StaleRaceCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [s, setS] = useState<number>(DEFAULT_S);
  const [leases, setLeases] = useState(false);
  const [pressed, setPressed] = useState(false);

  const result = raceResult(s, leases);
  // While the learner holds the knob, show how the race ends, not a moment in the middle of it.
  const t = clock.reduced || pressed ? TIMELINE_MS : playhead(clock.seconds);
  const cache = cacheAt(t, s, leases);
  const finalCache = cacheAt(TIMELINE_MS, s, leases);
  const setS_ = (next: number) => setS(clamp(Math.round(next), S_MIN, S_MAX));
  const setText = `set 999 at ${s} ms`;
  const setTagW = tagW(setText);
  const setTagX = clamp(tx(s), 4 + setTagW / 2, W - 4 - setTagW / 2);
  const delTagX = tx(RACE.delete) + 10;

  const readerStatus = t >= 12 ? { text: "holds 999", tone: "warn" as const } : { text: "needs p42" };
  const dbStatus = t >= RACE.write ? { text: "p42 = 899", tone: "good" as const } : { text: "p42 = 999" };
  const centre = (id: keyof typeof POS) => POS[id];
  const summary = `Timeline from 0 to 60 ms. The reader reads 999 at 10 ms, the writer commits 899 at 20 ms and deletes the key at 25 ms. The reader's set of 999 arrives at ${s} ms${leases ? ", with leases on" : ""}. The cache ends with ${result.finalText}. ${result.windowText}. ${result.verdict}.`;

  const dotsNow = clock.reduced ? [] : flights(s, leases).map((f) => ({ f, p: flightProgress(f, t) })).filter((d) => d.p !== null);
  const refusedMark = !result.accepted && t >= s;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <BeatButton pressed={leases} onClick={() => setLeases((v) => !v)}>
          {leases ? "Leases on" : "Leases off"}
        </BeatButton>
      }
      hint={<>Drag the <b>set 999</b> knob along the timeline.</>}
    >
      <div ref={box} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Links between the apps, the cache and the database. */}
          {(
            [
              ["reader", "cache"],
              ["writer", "cache"],
              ["reader", "db"],
              ["writer", "db"],
            ] as const
          ).map(([a, b]) => (
            <LinkLine key={`${a}-${b}`} x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} />
          ))}

          {dotsNow.map(({ f, p }) => {
            const a = centre(f.from);
            const b = centre(f.to);
            const q = p as number;
            return (
              <circle key={f.id} cx={r1(a.x + (b.x - a.x) * q)} cy={r1(a.y + (b.y - a.y) * q)} r={6} className={cn(TONES[f.tone].solidFill, "stroke-card")} strokeWidth={1.5} />
            );
          })}
          {refusedMark ? (
            <g aria-hidden>
              <circle cx={POS.reader.x + (POS.cache.x - POS.reader.x) * 0.72} cy={POS.reader.y + (POS.cache.y - POS.reader.y) * 0.72} r={9} className={cn(TONES.warn.softFill, TONES.warn.stroke)} strokeWidth={1.5} />
              <path d={`M${r1(POS.reader.x + (POS.cache.x - POS.reader.x) * 0.72 - 3.5)} ${r1(POS.reader.y + (POS.cache.y - POS.reader.y) * 0.72 - 3.5)} l7 7 m0 -7 l-7 7`} fill="none" strokeWidth={2} strokeLinecap="round" className={TONES.warn.stroke} />
            </g>
          ) : null}

          <SvgNode x={POS.cache.x} y={POS.cache.y} label="Cache" kind="cache" status={cache.text} statusTone={cache.tone} mark={finalCache.tone === "bad" && t >= TIMELINE_MS ? "bad" : undefined} />
          <SvgNode x={POS.reader.x} y={POS.reader.y} label="Reader app" kind="server" status={readerStatus.text} statusTone={readerStatus.tone} />
          <SvgNode x={POS.db.x} y={POS.db.y} label="Database" kind="database" status={dbStatus.text} statusTone={dbStatus.tone} />
          <SvgNode x={POS.writer.x} y={POS.writer.y} label="Writer app" kind="server" status="price 899" />

          {/* How long the cache is wrong, by the cache itself. */}
          <Tag x={348} y={80} text={result.windowText} tone={result.stale ? (result.stale.to === null ? "bad" : "warn") : "good"} />
          {leases ? <Tag x={72} y={80} text="leases on" tone="accent" /> : null}

          {/* Fixed events: tags above the ruler, each with a stem to its tick. */}
          {[
            { at: RACE.write, x: tx(RACE.write), y: TAG.fixed0, text: "write 899", tone: "good" as const },
            { at: RACE.read, x: tx(RACE.read), y: TAG.fixed1, text: "read 999", tone: "accent" as const },
            { at: RACE.delete, x: delTagX, y: TAG.fixed1, text: "delete", tone: "accent" as const },
          ].map((e) => (
            <line key={`stem-${e.at}`} x1={tx(e.at)} x2={tx(e.at)} y1={e.y + TAG_H / 2} y2={BAND.top} strokeWidth={1.5} className={TONES[e.tone].stroke} />
          ))}
          {[
            { x: tx(RACE.write), y: TAG.fixed0, text: "write 899", tone: "good" as const },
            { x: tx(RACE.read), y: TAG.fixed1, text: "read 999", tone: "accent" as const },
            { x: delTagX, y: TAG.fixed1, text: "delete", tone: "accent" as const },
          ].map((e) => (
            <Tag key={e.text} x={e.x} y={e.y} text={e.text} tone={e.tone} />
          ))}

          {/* The ruler. */}
          <rect x={T0 - 8} y={BAND.top} width={T1 - T0 + 16} height={BAND.h} rx={BAND.h / 2} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          {[0, 10, 20, 30, 40, 50, 60].map((v) => (
            <text key={v} x={tx(v)} y={BAND.top + 15.5} textAnchor={v === 0 ? "start" : v === 60 ? "end" : "middle"} dx={v === 0 ? -2 : v === 60 ? 4 : 0} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
              {v === 60 ? "60 ms" : v}
            </text>
          ))}
          <line x1={T0} x2={tx(t)} y1={BAND.top} y2={BAND.top} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          {[RACE.read, RACE.write, RACE.delete].map((v) => (
            <circle key={v} cx={tx(v)} cy={BAND.top} r={4} strokeWidth={1.5} className={cn(NEUTRAL.surface, TONES.accent.stroke)} />
          ))}
          <circle cx={tx(t)} cy={BAND.top} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />

          {/* The stale stretch, under the ruler. */}
          {result.stale ? (
            <rect
              x={tx(result.stale.from)}
              y={BAND.top + BAND.h + 3}
              width={Math.max(3, tx(result.stale.to ?? TIMELINE_MS) - tx(result.stale.from))}
              height={6}
              rx={3}
              className={result.stale.to === null ? TONES.bad.solidFill : TONES.warn.solidFill}
            />
          ) : null}

          {/* The knob and its tag: the reader's late set. */}
          <line x1={tx(s)} x2={tx(s)} y1={KNOB_Y} y2={TAG.set - TAG_H / 2} strokeWidth={1.5} className={TONES.bad.stroke} />
          <circle cx={tx(s)} cy={KNOB_Y} r={16} className={TONES.bad.softFill} />
          <circle cx={tx(s)} cy={KNOB_Y} r={10} strokeWidth={2.5} className={cn(TONES.bad.solidFill, "stroke-card")} />
          <line x1={tx(s) - 3} x2={tx(s) - 3} y1={KNOB_Y - 4.5} y2={KNOB_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
          <line x1={tx(s) + 3} x2={tx(s) + 3} y1={KNOB_Y - 4.5} y2={KNOB_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
          <Tag x={setTagX} y={TAG.set} text={setText} tone="bad" />

          <VerdictBanner width={W} text={result.verdict} tone={result.tone} />
        </svg>

        <SliderZone
          view={{ w: W, h: H }}
          box={{ x: T0 - 16, y: BAND.top - 6, w: T1 - T0 + 32, h: TAG.set + TAG_H / 2 - BAND.top + 6 }}
          label="When the reader stores its old price, in milliseconds"
          valueMin={S_MIN}
          valueMax={S_MAX}
          valueNow={s}
          valueText={`${s} milliseconds${leases ? ", leases on" : ""}. ${result.windowText}. ${result.verdict}`}
          onPress={(p) => {
            setPressed(p);
            if (p) clock.freeze();
            else clock.unfreeze();
          }}
          onFraction={(fx) => {
            const ms = ((T0 - 16 + fx * (T1 - T0 + 32)) - T0) / MS;
            setS_(snapTo(Math.round(ms), S_SNAPS, 1));
          }}
          onKey={(key) => {
            const next = stepByKey(s, key, { min: S_MIN, max: S_MAX, step: 1, page: 10 });
            if (next === null) return false;
            setS_(next);
            return true;
          }}
        />
      </div>
    </BeatFrame>
  );
}
