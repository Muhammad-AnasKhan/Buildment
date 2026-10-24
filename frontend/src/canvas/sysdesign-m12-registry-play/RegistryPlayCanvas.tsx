"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { chipWidth } from "../primitives/svg-chip";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgPillButton } from "../primitives/svg-pill-button";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import {
  DEFAULT_INTERVAL,
  DEFAULT_TTL,
  FUTURE,
  INTERVAL_LADDER,
  NAMES,
  PAST,
  RATE,
  TTL_LADDER,
  addEvent,
  ladderFromFraction,
  ladderToFraction,
  lostBeatsSurvived,
  registryAt,
  type Config,
  type InstanceId,
  type InstanceView,
  type RegEvent,
} from "../models/registry-lease";
import { useModelClock } from "./use-model-clock";

const W = 420;
const H = 452;
const ROW_TOP = 46;
const ROW_PITCH = 72;
const CARD_X = 66;
const TRACK = { x0: 134, x1: 410 };
const PANEL_Y = 266;
const PANEL_H = 96;
const RAIL_Y = 410;
const LEASE_RAIL = { x0: 36, x1: 186 };
const BEAT_RAIL = { x0: 246, x1: 396 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const rowTop = (i: number) => ROW_TOP + i * ROW_PITCH;

/** 12.9 beat 2: three instances renew leases in a registry; crash one, lose beats, change the lease and the beat interval. */
export function RegistryPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useModelClock(box, RATE);
  const titleId = useId();
  const descId = useId();
  const hatchId = useId().replace(/:/g, "");
  const [cfg, setCfg] = useState<Config>({ ttl: DEFAULT_TTL, interval: DEFAULT_INTERVAL });
  const [events, setEvents] = useState<RegEvent[]>([]);

  const view = registryAt(cfg, events, clock.t);
  const t = view.time;
  const survives = lostBeatsSurvived(cfg.ttl, cfg.interval);

  const X = (tau: number) => r1(Math.max(TRACK.x0, Math.min(TRACK.x1, TRACK.x0 + ((tau - (t - PAST)) / (PAST + FUTURE)) * (TRACK.x1 - TRACK.x0))));

  function change(next: Config) {
    setCfg(next);
    setEvents([]);
    clock.restart();
  }
  function press(kind: RegEvent["kind"], inst: InstanceId) {
    setEvents((now) => addEvent(now, kind, inst, clock.now()));
  }
  function reset() {
    setEvents([]);
    clock.restart();
  }

  const statusOf = (v: InstanceView): { text: string; tone: Tone } => {
    if (v.crashedAt !== null) return v.listed ? { text: "crashed", tone: "bad" } : { text: "gone", tone: "warn" };
    return v.listed ? { text: "listed", tone: "good" } : { text: "removed", tone: "bad" };
  };

  const listed = view.instances.filter((v) => v.listed);
  const recentWatch = view.watch.slice(-3);
  const watchText = (i: number) => {
    const w = recentWatch[i];
    return `${Math.floor(w.told)} s  ${NAMES[w.inst]} ${w.kind}`;
  };
  const leaseText = `lease ${cfg.ttl} s, beat every ${cfg.interval} s: survives ${survives} lost ${survives === 1 ? "beat" : "beats"}`;
  const description = `A registry with three instances. ${view.instances
    .map((v) => `${NAMES[v.inst]} ${v.crashedAt !== null ? "crashed" : "beating"}, ${v.listed ? "listed" : "not listed"}`)
    .join(". ")}. ${view.verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint="The blue line is now. Ticks are beats, the green bar is the lease left, red hatching is a dead one still listed."
      controls={
        <>
          <BeatButton pressed={clock.paused} onClick={() => clock.setPaused(!clock.paused)}>
            {clock.paused ? "Resume the clock" : "Pause the clock"}
          </BeatButton>
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <defs>
            <pattern id={hatchId} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width={7} height={7} className="fill-red-50 dark:fill-red-500/15" />
              <line x1={0} y1={0} x2={0} y2={7} strokeWidth={2.5} className="stroke-red-500/70 dark:stroke-red-400/70" />
            </pattern>
          </defs>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={view.verdict.text} tone={view.verdict.tone} />

          {view.instances.map((v, i) => {
            const top = rowTop(i);
            const status = statusOf(v);
            const crashed = v.crashedAt !== null;
            const barFrom = X(t);
            const barTo = X(v.expiry);
            return (
              <g key={v.inst}>
                <SvgNode x={CARD_X} y={top + 30} label={NAMES[v.inst]} kind="server" status={status.text} statusTone={status.tone} />

                {/* The time strip: a window from 6 s ago to 30 s ahead. */}
                <rect x={TRACK.x0} y={top + 2} width={TRACK.x1 - TRACK.x0} height={26} rx={8} strokeWidth={1.5} className={cn("fill-muted/60", NEUTRAL.line)} />
                {v.stale ? (
                  <rect x={X(v.stale.from)} y={top + 6} width={Math.max(0, X(v.stale.to) - X(v.stale.from))} height={18} rx={4} fill={`url(#${hatchId})`} strokeWidth={1.5} className={TONES.bad.stroke} />
                ) : null}
                {!crashed && v.listed && barTo > barFrom ? (
                  <rect x={barFrom} y={top + 10} width={barTo - barFrom} height={10} rx={5} className={TONES.good.solidFill} />
                ) : null}
                {v.beats.map((b) => {
                  const x = X(b.time);
                  if (b.state === "unsent") return null;
                  const future = b.time > t;
                  return b.state === "lost" ? (
                    <circle key={b.time} cx={x} cy={top + 15} r={5} strokeWidth={2} className={cn("fill-card", TONES.bad.stroke)} />
                  ) : (
                    <line key={b.time} x1={x} x2={x} y1={top + 6} y2={top + 24} strokeWidth={2.5} strokeLinecap="round" opacity={future ? 0.35 : 1} className="stroke-foreground" />
                  );
                })}
                {v.goneAt !== null && v.goneAt >= t - PAST ? (
                  <g aria-hidden>
                    <line x1={X(v.goneAt) - 5} x2={X(v.goneAt) + 5} y1={top + 10} y2={top + 20} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
                    <line x1={X(v.goneAt) - 5} x2={X(v.goneAt) + 5} y1={top + 20} y2={top + 10} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
                  </g>
                ) : null}
                <line x1={X(t)} x2={X(t)} y1={top} y2={top + 30} strokeWidth={2.5} strokeLinecap="round" className={TONES.accent.stroke} />

                <SvgPillButton
                  x={TRACK.x0}
                  y={top + 47}
                  width={chipWidth("Crashed")}
                  text={crashed ? "Crashed" : "Crash"}
                  label={crashed ? `${NAMES[v.inst]} has crashed` : `Crash ${NAMES[v.inst]}`}
                  tone={crashed ? "bad" : undefined}
                  disabled={crashed}
                  onPress={() => press("crash", v.inst)}
                />
                <SvgPillButton
                  x={TRACK.x0 + chipWidth("Crashed") + 8}
                  y={top + 47}
                  width={chipWidth("Lose beat")}
                  text="Lose beat"
                  label={`Lose the next beat of ${NAMES[v.inst]}`}
                  disabled={crashed}
                  onPress={() => press("lose", v.inst)}
                />
              </g>
            );
          })}

          {/* The registry's live keys, and what the watcher has been told. */}
          <Panel x={10} title="Registry" count={`${listed.length} listed`}>
            {listed.length === 0 ? (
              <text x={22} y={PANEL_Y + 52} className={cn(NEUTRAL.mutedText, "text-[12px]")}>nothing listed</text>
            ) : (
              listed.map((v, k) => (
                <g key={v.inst}>
                  <text x={22} y={PANEL_Y + 52 + k * 18} className={cn(v.crashedAt !== null ? TONES.bad.text : NEUTRAL.text, "text-[12px] font-semibold")}>{NAMES[v.inst]}</text>
                  <text x={193} y={PANEL_Y + 52 + k * 18} textAnchor="end" className={cn(v.crashedAt !== null ? TONES.bad.text : NEUTRAL.mutedText, "text-[12px] tabular-nums")}>
                    {v.crashedAt !== null ? "stale " : ""}
                    {Math.ceil(v.expiry - t - 1e-6)} s
                  </text>
                </g>
              ))
            )}
          </Panel>
          <Panel x={215} title="Watcher" count={`${view.watch.length} told`}>
            {recentWatch.length === 0 ? (
              <text x={227} y={PANEL_Y + 52} className={cn(NEUTRAL.mutedText, "text-[12px]")}>waiting for news</text>
            ) : (
              recentWatch.map((w, k) => (
                <text key={`${w.inst}-${w.kind}-${w.time}`} x={227} y={PANEL_Y + 52 + k * 18} className={cn(w.kind === "gone" ? TONES.bad.text : NEUTRAL.text, "text-[12px] tabular-nums")}>
                  {watchText(k)}
                </text>
              ))
            )}
          </Panel>

          {/* The two rails. */}
          <RailSlider
            svgRef={svg}
            x0={LEASE_RAIL.x0}
            x1={LEASE_RAIL.x1}
            y={RAIL_Y}
            label="Lease length"
            valueText={leaseText}
            value={cfg.ttl}
            ladder={TTL_LADDER}
            fromFraction={(f) => ladderFromFraction(TTL_LADDER, f)}
            onChange={(ttl) => ttl !== cfg.ttl && change({ ...cfg, ttl })}
          >
            <SliderRail
              x0={LEASE_RAIL.x0}
              x1={LEASE_RAIL.x1}
              y={RAIL_Y}
              fraction={ladderToFraction(TTL_LADDER, cfg.ttl)}
              marks={TTL_LADDER.map((v) => ({ at: ladderToFraction(TTL_LADDER, v) }))}
              ends={["4 s", "30 s"]}
              caption={`lease ${cfg.ttl} s`}
            />
          </RailSlider>
          <RailSlider
            svgRef={svg}
            x0={BEAT_RAIL.x0}
            x1={BEAT_RAIL.x1}
            y={RAIL_Y}
            label="Beat interval"
            valueText={leaseText}
            value={cfg.interval}
            ladder={INTERVAL_LADDER}
            fromFraction={(f) => ladderFromFraction(INTERVAL_LADDER, f)}
            onChange={(interval) => interval !== cfg.interval && change({ ...cfg, interval })}
          >
            <SliderRail
              x0={BEAT_RAIL.x0}
              x1={BEAT_RAIL.x1}
              y={RAIL_Y}
              fraction={ladderToFraction(INTERVAL_LADDER, cfg.interval)}
              marks={INTERVAL_LADDER.map((v) => ({ at: ladderToFraction(INTERVAL_LADDER, v) }))}
              ends={["1 s", "5 s"]}
              caption={`beat every ${cfg.interval} s`}
            />
          </RailSlider>
        </svg>
        <div className="sr-only" aria-live="polite" role="status">
          <p>{view.verdict.text}</p>
          <p>Registry lists: {listed.length === 0 ? "nothing" : listed.map((v) => NAMES[v.inst]).join(", ")}.</p>
          <p>Watcher told: {recentWatch.length === 0 ? "nothing yet" : recentWatch.map((_, k) => watchText(k)).join("; ")}.</p>
        </div>
      </div>
    </BeatFrame>
  );
}

/** A small card with a title and a count, for the registry and the watcher lists. */
function Panel({ x, title, count, children }: { x: number; title: string; count: string; children: ReactNode }) {
  const w = 195;
  return (
    <g>
      <rect x={x} y={PANEL_Y + 3} width={w} height={PANEL_H} rx={14} className="fill-foreground/[0.06]" />
      <rect x={x} y={PANEL_Y} width={w} height={PANEL_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      <text x={x + 12} y={PANEL_Y + 22} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{title}</text>
      <text x={x + w - 12} y={PANEL_Y + 22} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{count}</text>
      {children}
    </g>
  );
}
