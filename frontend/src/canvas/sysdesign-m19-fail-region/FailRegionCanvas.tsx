"use client";

import { useId, useRef, useState } from "react";
import { Database, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgButton } from "../primitives/svg-button";
import { InfoChip, infoChipWidth } from "../primitives/svg-info-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { StepBar, type BarStep } from "../primitives/svg-step-bar";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { COST_MAX, DEFAULT_RUNG, RUNGS, STEP_SCALE_MAX, USERS, costText, lostText, roundedDown, rungAt, usersOnA, verdictFor, type Rung } from "./model";

const W = 420;
const H = 440;
const CARD = { y: 50, w: 198, h: 134, ax: 8, bx: 214 };
const TILE = { y: 36, w: 90, h: 32, gap: 6 };
const DOT = { y1: 94, y2: 116, x0: 39, step: 24, r: 6 };
const BAR = { x0: 14, x1: 406, y: 216, keyY: 248, scaleMax: STEP_SCALE_MAX };
const ROW_Y = 296;
const RAIL = { x0: 56, x1: 364, y: 392 };
/** Seconds the steps take to fill, however long they are in the story. */
const FILL_SECONDS = 3.5;

const r1 = (v: number) => Math.round(v * 10) / 10;
const dotAt = (cardX: number, slot: number) => ({ x: cardX + DOT.x0 + (slot % 6) * DOT.step, y: CARD.y + (slot < 6 ? DOT.y1 : DOT.y2) });

type Tile = { kind: "data" | "app"; text: string; live: boolean };

function tilesOf(rung: Rung): Tile[] {
  const appText = rung.app === "none" ? "none" : rung.app;
  return [
    { kind: "data", text: rung.data, live: rung.data === "live copy" },
    { kind: "app", text: appText, live: rung.app === "small" || rung.app === "full" },
  ];
}

/** 19.4 beat 2: pick a plan on the ladder, fail Region A, and compare time down, lost writes and cost. */
export function FailRegionCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [index, setIndex] = useState<number>(DEFAULT_RUNG);
  const [fail, setFail] = useState<{ since: number } | null>(null);

  const rung = rungAt(index);
  const failed = fail !== null;
  const progress = !fail ? 0 : clock.reduced ? 1 : Math.min(1, (clock.seconds - fail.since) / FILL_SECONDS);
  const done = failed && progress >= 1;
  const verdict = verdictFor(rung, failed);
  const steps: BarStep[] = rung.steps.map((s) => ({ id: s.id, label: s.label, amount: s.minutes, tone: s.tone }));
  const onA = usersOnA(rung);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const failA = () => setFail((cur) => (cur ? null : { since: clock.seconds }));
  const pickRung = (v: number) => {
    setIndex(v);
    setFail((cur) => (cur ? { since: clock.seconds } : cur));
  };
  const reset = () => {
    setIndex(DEFAULT_RUNG);
    setFail(null);
  };

  const aTone: Tone = failed ? "bad" : "good";
  const bPill: { text: string; tone: Tone } = done ? { text: "serving", tone: "good" } : failed ? { text: "moving", tone: "warn" } : rung.id === "active" ? { text: "live", tone: "good" } : { text: "standby", tone: "accent" };
  const aTiles: Tile[] = [
    { kind: "data", text: "database", live: true },
    { kind: "app", text: "app", live: true },
  ];

  const tile = (t: Tile, cardX: number, i: number, lost: boolean) => {
    const x = cardX + (CARD.w - (2 * TILE.w + TILE.gap)) / 2 + i * (TILE.w + TILE.gap);
    const y = CARD.y + TILE.y;
    const Icon = t.kind === "data" ? Database : Server;
    return (
      <g key={`${cardX}-${t.kind}`} opacity={lost ? 0.5 : 1}>
        <rect x={x} y={y} width={TILE.w} height={TILE.h} rx={9} strokeWidth={1.5} strokeDasharray={t.live ? undefined : "4 3"} className={cn(t.live ? "fill-card" : "fill-transparent", lost ? TONES.bad.stroke : t.live ? NEUTRAL.line : NEUTRAL.faintStroke)} />
        <Icon x={x + 7} y={y + 9} width={14} height={14} strokeWidth={2} className={t.live ? (t.kind === "data" ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300") : "text-muted-foreground"} aria-hidden />
        <text x={x + 26} y={y + 20.5} className={cn(t.live ? NEUTRAL.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{t.text}</text>
      </g>
    );
  };

  const users = Array.from({ length: USERS }, (_, i) => {
    const homeA = i < onA;
    const bSlot = homeA ? USERS - onA + i : i - onA;
    const where = !homeA ? "b" : failed ? (done ? "b" : "dark") : "a";
    const slot = where === "b" ? bSlot : i;
    const p = dotAt(where === "b" ? CARD.bx : CARD.ax, slot);
    const dark = where === "dark";
    return { i, x: p.x, y: p.y, dark };
  });

  const downText = rung.id === "active" ? "A's users" : "users";
  const description = failed
    ? `${rung.name}. Region A has failed. ${verdict.text}. ${lostText(rung)}. ${costText(rung)}.`
    : `${rung.name}. Region A is serving ${onA} of ${USERS} users and Region B is on standby. Tap Region A to fail it.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Pick a <b>plan</b> on the ladder, then tap <b>Region A</b> to fail it.
        </>
      }
      controls={<BeatButton onClick={reset}>Reset</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Region A: tap it to fail it. */}
          <SvgButton x={CARD.ax} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} label={failed ? "Region A is down. Tap to bring it back." : "Fail Region A"} pressed={failed} onPress={failA}>
            <rect x={CARD.ax} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={16} className="fill-foreground/[0.06]" />
            <rect x={CARD.ax} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} strokeWidth={failed ? 2.5 : 1.5} className={cn(NEUTRAL.surface, failed ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
            {failed ? <rect x={CARD.ax} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} className={TONES.bad.softFill} /> : null}
            <circle cx={CARD.ax + 18} cy={CARD.y + 17} r={10} className="fill-blue-100 dark:fill-blue-500/20" />
            <Server x={CARD.ax + 11} y={CARD.y + 10} width={14} height={14} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
            <text x={CARD.ax + 34} y={CARD.y + 22} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>Region A</text>
            <rect x={CARD.ax + CARD.w - 66} y={CARD.y + 7} width={58} height={20} rx={10} className={cn(TONES[aTone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={CARD.ax + CARD.w - 37} y={CARD.y + 21} textAnchor="middle" className={cn(TONES[aTone].text, "text-[11.5px] font-semibold")}>{failed ? "down" : "up"}</text>
            {aTiles.map((t, i) => tile(t, CARD.ax, i, failed))}
          </SvgButton>

          {/* Region B: what runs there depends on the plan. */}
          <g>
            <rect x={CARD.bx} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={16} className="fill-foreground/[0.06]" />
            <rect x={CARD.bx} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} strokeWidth={done ? 2.5 : 1.5} className={cn(NEUTRAL.surface, done ? TONES.good.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
            <circle cx={CARD.bx + 18} cy={CARD.y + 17} r={10} className="fill-blue-100 dark:fill-blue-500/20" />
            <Server x={CARD.bx + 11} y={CARD.y + 10} width={14} height={14} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
            <text x={CARD.bx + 34} y={CARD.y + 22} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>Region B</text>
            <rect x={CARD.bx + CARD.w - 74} y={CARD.y + 7} width={66} height={20} rx={10} className={cn(TONES[bPill.tone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={CARD.bx + CARD.w - 41} y={CARD.y + 21} textAnchor="middle" className={cn(TONES[bPill.tone].text, "text-[11.5px] font-semibold")}>{bPill.text}</text>
            {tilesOf(rung).map((t, i) => tile(t, CARD.bx, i, false))}
          </g>

          {/* The users: green while served, grey while dark, then green again on B. */}
          <g aria-hidden className="pointer-events-none">
            {users.map((u) => (
              <g key={u.i} style={{ transform: `translate(${r1(u.x)}px, ${r1(u.y)}px)` }} className="transition-transform duration-500 motion-reduce:transition-none">
                <circle r={DOT.r} className={cn(u.dark ? NEUTRAL.doneFill : TONES.good.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
              </g>
            ))}
          </g>

          {/* The steps fill left to right once Region A has failed. */}
          <text x={BAR.x0} y={BAR.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{failed ? `${downText} are down` : "time to get back"}</text>
          {failed ? (
            <text x={BAR.x1} y={BAR.y - 8} textAnchor="end" className={cn(TONES[verdict.tone].text, "text-[12.5px] font-bold tabular-nums")}>{`${rung.id === "active" ? "" : "about "}${roundedDown(rung)} min`}</text>
          ) : null}
          <StepBar x0={BAR.x0} x1={BAR.x1} y={BAR.y} steps={steps} scaleMax={BAR.scaleMax} progress={progress} unit="min" keyY={BAR.keyY} showKey={failed} />
          {!failed ? <text x={BAR.x0} y={BAR.keyY + 14} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>tap Region A to fail it</text> : null}

          {/* Writes lost, and what the plan costs. */}
          {failed ? <InfoChip x={14} y={ROW_Y} width={infoChipWidth(lostText(rung))} text={lostText(rung)} tone={rung.id === "backup" ? "bad" : "warn"} /> : null}
          <g aria-hidden>
            <rect x={224} y={ROW_Y} width={182} height={26} rx={13} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={236} y={ROW_Y + 17.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{`cost ${rung.cost.toFixed(1)} x`}</text>
            <rect x={306} y={ROW_Y + 9} width={88} height={8} rx={4} className="fill-muted" />
            <rect x={306} y={ROW_Y + 9} height={8} rx={4} style={{ width: `${r1((rung.cost / COST_MAX) * 88)}px` }} className={cn(rung.cost >= 2 ? TONES.warn.solidFill : TONES.accent.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
          </g>
          {rung.id === "active" ? <text x={14} y={ROW_Y + 50} className={cn(TONES.warn.text, "text-[12px] font-semibold")}>Same record written in both: one edit is lost.</text> : null}

          <text x={34} y={RAIL.y - 30} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>plan, cheapest to dearest</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={RUNGS.map((r, i) => ({ value: i, label: r.lines }))}
            value={index}
            onChange={pickRung}
            ariaLabel="Disaster recovery plan"
            valueText={`${rung.name}, about ${roundedDown(rung)} minutes to get back, cost ${rung.cost.toFixed(1)} regions`}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
