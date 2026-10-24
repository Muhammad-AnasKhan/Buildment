"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SliderRail } from "../primitives/picture-slider";
import { RailSlider } from "../primitives/rail-slider";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import {
  DEFAULT_SALT,
  NOOR,
  SALTS,
  SHARDS,
  SHARD_LADDER,
  SHARD_LIMIT,
  averageLoad,
  hottestVerdict,
  loadTone,
  loadsFor,
  readCost,
  shardsFromFraction,
  shardsToFraction,
} from "./model";

const W = 420;
const H = 434;
const CARD = { x: 70, y: 82 };
const BAND = { y: 130, h: 190 };
const PAD_TOP = 34;
const PAD_BOTTOM = 18;
const SCALE_MAX = 2200;
const CHIPS_Y = 346;
const CHIP_W = 40;
const RAIL = { x0: 34, x1: 386, y: 398 };
/** Seconds a sub-key takes to fall onto its shard, and the gap between sub-keys. */
const FALL = 0.5;
const GAP = 0.04;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** 9.4: drag the shard count and split Noor's key into sub-keys, and watch the hottest shard. */
export function CelebrityPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [shards, setShards] = useState<number>(SHARDS.default);
  const [salt, setSalt] = useState<number>(DEFAULT_SALT);
  const [falling, setFalling] = useState(false);

  const m = loadsFor(shards, salt);
  const verdict = hottestVerdict(m.hottestLoad);
  const avg = averageLoad(shards);
  const t = falling ? clock.seconds : 1e6;

  const chooseSalt = (k: number) => {
    if (k === salt) return;
    setSalt(k);
    setFalling(true);
    clock.restart();
  };
  const reset = () => {
    setShards(SHARDS.default);
    setSalt(DEFAULT_SALT);
    setFalling(false);
  };

  const barH = BAND.h - PAD_TOP - PAD_BOTTOM;
  const scale = barH / SCALE_MAX;
  const base = BAND.y + PAD_TOP + barH;
  const cellW = Math.min(48, 392 / shards);
  const barW = Math.min(34, cellW - 8);
  const left = (W - shards * cellW) / 2;
  const cx = (s: number) => left + (s + 0.5) * cellW;

  const hot = loadTone(m.hottestLoad);
  const chipsW = SALTS.length * CHIP_W + (SALTS.length - 1) * 8;
  const chipsX = W - 14 - chipsW;
  const pulse = hot === "bad" && !clock.reduced ? 0.7 + 0.3 * Math.sin(clock.seconds * 4) : 1;

  const summary = `${shards} shards. Background writes are ${withCommas(Math.round(m.background))} a second on each. Noor's key takes ${withCommas(NOOR)} a second${salt === 1 ? " on one shard" : `, split into ${salt} sub-keys that land by hash on ${new Set(m.landing).size} shards`}. The hottest shard is shard ${m.hottest + 1} at ${withCommas(m.hottestLoad)} writes a second, against a limit of ${withCommas(SHARD_LIMIT)}. The average is ${withCommas(Math.round(avg))}. ${readCost(salt)}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the rail to change the <b>shards</b>, then tap a number to <b>split Noor&apos;s key</b>.
        </>
      }
      controls={<BeatActionButton onClick={reset}>Reset</BeatActionButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {/* The hottest shard as a card, with what the lines in the chart mean. */}
          <g opacity={pulse}>
            <SvgNode x={CARD.x} y={CARD.y} label={`Shard ${m.hottest + 1}`} kind="database" status={`${withCommas(m.hottestLoad)} a sec`} statusTone={hot} mark={hot} />
          </g>
          <line x1={150} x2={176} y1={62} y2={62} strokeWidth={1.8} strokeDasharray="3 2.5" className="stroke-foreground" />
          <text x={184} y={66} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>
            limit {withCommas(SHARD_LIMIT)} a sec
          </text>
          <line x1={150} x2={176} y1={84} y2={84} strokeWidth={2} strokeDasharray="1 3.5" strokeLinecap="round" className="stroke-muted-foreground" />
          <text x={184} y={88} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>
            average {withCommas(Math.round(avg))} a sec
          </text>
          <rect x={150} y={96} width={252} height={24} rx={12} className="fill-card" />
          <rect x={150} y={96} width={252} height={24} rx={12} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
          <text x={276} y={112.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12.5px] font-bold")}>
            {readCost(salt)}
          </text>

          {/* The shards: grey for the background load, blue blocks for Noor's sub-keys. */}
          {Array.from({ length: shards }, (_, s) => s).map((s) => {
            const x = cx(s);
            const bgH = m.background * scale;
            let top = base - bgH;
            const mine = m.landing.map((shard, j) => ({ shard, j })).filter((p) => p.shard === s);
            const isHot = s === m.hottest;
            const total = m.load[s];
            return (
              <g key={s}>
                <rect x={x - barW / 2} y={base - bgH} width={barW} height={bgH} className="fill-muted-foreground/35" />
                {mine.map(({ j }) => {
                  const landed = t >= j * GAP + FALL;
                  const h = m.perSubKey * scale;
                  top -= landed ? h : 0;
                  return landed ? <rect key={j} x={x - barW / 2} y={top} width={barW} height={Math.max(1, h)} strokeWidth={1} className={cn(TONES.accent.solidFill, "stroke-card")} /> : null;
                })}
                {mine.map(({ j }) => {
                  const f = clamp01((t - j * GAP) / FALL);
                  if (f <= 0 || f >= 1) return null;
                  const y0 = BAND.y - 4;
                  const y1 = base - total * scale;
                  return <circle key={`fall-${j}`} cx={x} cy={y0 + (y1 - y0) * f * f} r={3.4} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.2} />;
                })}
                {isHot ? <rect x={x - barW / 2 - 2} y={base - total * scale - 2} width={barW + 4} height={total * scale + 2} rx={3} strokeWidth={2.4} className={cn("fill-none", TONES[hot].stroke)} /> : null}
                <text x={x} y={base + 14} textAnchor="middle" className={cn(isHot ? TONES[hot].text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                  {s + 1}
                </text>
              </g>
            );
          })}

          {/* The limit and the average, across the whole chart. */}
          <line x1={14} x2={W - 14} y1={base - SHARD_LIMIT * scale} y2={base - SHARD_LIMIT * scale} strokeWidth={1.8} strokeDasharray="4 3" className="stroke-foreground" />
          <line x1={14} x2={W - 14} y1={base - avg * scale} y2={base - avg * scale} strokeWidth={2} strokeDasharray="1 3.5" strokeLinecap="round" className="stroke-muted-foreground" />

          {/* The hottest shard's value, on a small pill above its bar. The pill hides the lines behind it. */}
          {(() => {
            const text = withCommas(m.hottestLoad);
            const w = text.length * 7.6 + 16;
            const top = base - m.load[m.hottest] * scale - 28;
            return (
              <g>
                <rect x={cx(m.hottest) - w / 2} y={top} width={w} height={19} rx={9.5} className="fill-card" />
                <rect x={cx(m.hottest) - w / 2} y={top} width={w} height={19} rx={9.5} strokeWidth={1.8} className={cn(TONES[hot].softFill, TONES[hot].stroke)} />
                <text x={cx(m.hottest)} y={top + 13.5} textAnchor="middle" className={cn(TONES[hot].text, "text-[12.5px] font-bold tabular-nums")}>
                  {text}
                </text>
              </g>
            );
          })()}

          <text x={14} y={CHIPS_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            Split Noor&apos;s key into
          </text>
          <g role="radiogroup" aria-label="Sub-keys for Noor's key">
            {SALTS.map((k, i) => (
              <SvgRadioChip
                key={k}
                x={chipsX + i * (CHIP_W + 8)}
                y={CHIPS_Y}
                width={CHIP_W}
                text={String(k)}
                label={k === 1 ? "One key, no salt" : `Split into ${k} sub-keys`}
                checked={k === salt}
                onSelect={() => chooseSalt(k)}
              />
            ))}
          </g>

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Number of shards"
            valueText={`${shards} shards, hottest shard ${withCommas(m.hottestLoad)} writes a second`}
            value={shards}
            ladder={SHARD_LADDER}
            fromFraction={shardsFromFraction}
            onChange={setShards}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={shardsToFraction(shards)}
              marks={[4, 8, 12, 16].map((s) => ({ at: shardsToFraction(s), label: String(s) }))}
              ends={["fewer", "more"]}
              caption={`${shards} shards`}
            />
          </RailSlider>
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
