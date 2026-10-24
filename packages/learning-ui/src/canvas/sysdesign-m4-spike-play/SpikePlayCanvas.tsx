"use client";

import { useMemo, useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailStrip } from "../primitives/rail-strip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  AFTER,
  BOOT,
  BOOT_LADDER,
  bootFromFraction,
  bootToFraction,
  formatCount,
  PER_SERVER,
  spikeAt,
  spikeRun,
  spikeVerdict,
  STRIP_SECONDS,
  TARGETS,
  type SpikeRun,
  type Target,
} from "../models/autoscale-gap";

const W = 420;
const H = 272;
const BOX = { x: 8, y: 46, w: 404, h: 118 };
const PLOT = { x0: 50, x1: 402, yBase: 144, yTop: 66 };
const Y_MAX = 1000;
const SLOTS = 10;
const CARD = { y: 174, w: 34, h: 42, gap: 6, x0: 13 };
const CHIP = { y: 226, h: 26 };
/** Simulated seconds that pass in one second on screen, and the pause at the end of a sweep. */
const SPEED = 40;
const HOLD = 2;

const X = (t: number) => PLOT.x0 + (Math.max(0, Math.min(STRIP_SECONDS, t)) / STRIP_SECONDS) * (PLOT.x1 - PLOT.x0);
const Y = (rps: number) => PLOT.yBase - (Math.max(0, Math.min(Y_MAX, rps)) / Y_MAX) * (PLOT.yBase - PLOT.yTop);

/** The capacity line as a list of steps: from second `t`, the fleet can finish `cap` a second. */
function capacitySteps(run: SpikeRun): { t: number; cap: number }[] {
  const times = [...new Set(run.servers.map((s) => s.readyAt))].sort((a, b) => a - b);
  return times.map((t) => ({ t, cap: run.servers.filter((s) => s.readyAt <= t).length * PER_SERVER }));
}

const targetLabel = (t: Target) => `${Math.round(t * 100)}% target`;

/** 4.6: drag the boot time and pick the target; requests spill over while new servers start. */
export function SpikePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [boot, setBoot] = useState<number>(BOOT.default);
  const [target, setTarget] = useState<Target>(0.6);
  const run = useMemo(() => spikeRun(boot, target), [boot, target]);
  const verdict = spikeVerdict(run);

  const cycle = STRIP_SECONDS + HOLD * SPEED;
  const tc = clock.reduced ? STRIP_SECONDS : Math.min(STRIP_SECONDS, (clock.seconds * SPEED) % cycle);
  const here = spikeAt(run, tc);
  const steps = capacitySteps(run).filter((s) => s.t <= STRIP_SECONDS);
  const sec = Math.floor(tc);

  // The gap between the load and the capacity, as rectangles; the part the cursor has passed is stronger.
  const gaps: { a: number; b: number; cap: number }[] = [];
  steps.forEach((s, i) => {
    const end = i + 1 < steps.length ? steps[i + 1].t : STRIP_SECONDS;
    if (s.cap < AFTER && s.t < STRIP_SECONDS) gaps.push({ a: s.t, b: Math.min(end, STRIP_SECONDS), cap: s.cap });
  });
  let path = "";
  steps.forEach((s, i) => {
    if (i === 0) path = `M${X(0).toFixed(1)} ${Y(s.cap).toFixed(1)}`;
    else if (s.t <= STRIP_SECONDS) path += ` L${X(s.t).toFixed(1)} ${Y(steps[i - 1].cap).toFixed(1)} L${X(s.t).toFixed(1)} ${Y(s.cap).toFixed(1)}`;
  });
  path += ` L${X(STRIP_SECONDS).toFixed(1)} ${Y(steps[steps.length - 1].cap).toFixed(1)}`;

  // Requests that spill over fall from the load line at the cursor.
  const falling: { x: number; y: number; o: number }[] = [];
  if (!clock.reduced && here.dropsNow > 0 && tc < STRIP_SECONDS) {
    const n = Math.min(5, Math.ceil(here.dropsNow / PER_SERVER) + 1);
    for (let k = 0; k < n; k++) {
      const phase = (clock.seconds * 1.4 + k / n) % 1;
      falling.push({ x: X(tc) + (k - (n - 1) / 2) * 8, y: Y(AFTER) + 6 + phase * (PLOT.yBase - Y(AFTER) - 12), o: 1 - phase });
    }
  }

  const summary = `Traffic rises from 300 to ${AFTER} requests a second at 8 pm. Servers do ${PER_SERVER} a second each and the autoscaler aims for ${Math.round(target * 100)}% busy. A new server needs ${boot} seconds to boot. The fleet starts at ${run.servers.filter((s) => s.startedAt === null).length} and ends at ${run.finalFleet}. ${verdict.text}.`;

  const controls = (
    <div role="group" aria-label="Autoscaler target" className="flex gap-2">
      {TARGETS.map((t) => (
        <BeatButton key={t} pressed={target === t} onClick={() => { setTarget(t); clock.restart(); }}>
          {targetLabel(t)}
        </BeatButton>
      ))}
    </div>
  );

  return (
    <BeatFrame label={title} limits={limits} controls={controls} hint={<>Drag the rail to change the <b>boot time</b>.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* The time strip: load against capacity, from the spike at 8 pm. */}
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={16} y={BOX.y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>requests a second</text>
          <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.yBase} y2={PLOT.yBase} strokeWidth={1.5} className={NEUTRAL.line} />
          <text x={PLOT.x0 - 8} y={Y(AFTER) + 4} textAnchor="end" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{AFTER}</text>
          <text x={PLOT.x0 - 8} y={PLOT.yBase + 4} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>0</text>
          {[0, 100, 200, 300, 400].map((t) => (
            <text key={t} x={X(t)} y={BOX.y + BOX.h - 6} textAnchor={t === 0 ? "start" : t === STRIP_SECONDS ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
              {t === 0 ? "8 pm" : `${t} s`}
            </text>
          ))}
          {gaps.map((g) => {
            const top = Y(AFTER);
            const bottom = Y(g.cap);
            const passed = Math.max(g.a, Math.min(g.b, tc));
            return (
              <g key={`${g.a}-${g.b}`}>
                <rect x={X(g.a)} y={top} width={Math.max(0, X(g.b) - X(g.a))} height={bottom - top} className={TONES.bad.softFill} />
                {passed > g.a ? <rect x={X(g.a)} y={top} width={X(passed) - X(g.a)} height={bottom - top} opacity={0.45} className={TONES.bad.solidFill} /> : null}
              </g>
            );
          })}
          <line x1={PLOT.x0} x2={PLOT.x1} y1={Y(AFTER)} y2={Y(AFTER)} strokeWidth={2} strokeLinecap="round" className="stroke-foreground/70" />
          <path d={path} fill="none" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" className={TONES.accent.stroke} />
          {falling.map((f, i) => (
            <g key={i} opacity={f.o} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
              <line x1={-3.5} x2={3.5} y1={-3.5} y2={3.5} strokeWidth={2} strokeLinecap="round" className={TONES.bad.stroke} />
              <line x1={-3.5} x2={3.5} y1={3.5} y2={-3.5} strokeWidth={2} strokeLinecap="round" className={TONES.bad.stroke} />
            </g>
          ))}
          <line x1={X(tc)} x2={X(tc)} y1={PLOT.yTop - 4} y2={PLOT.yBase} strokeWidth={1.75} className="stroke-foreground/60" />
          <circle cx={X(tc)} cy={PLOT.yTop - 4} r={4.5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2} />

          {/* The fleet: ready, booting, or not started. */}
          {Array.from({ length: SLOTS }, (_, i) => {
            const x = CARD.x0 + i * (CARD.w + CARD.gap);
            const srv = run.servers[i];
            const state = !srv ? "none" : srv.readyAt <= sec ? "ready" : srv.startedAt !== null && srv.startedAt <= sec ? "booting" : "none";
            const progress = srv && srv.startedAt !== null && state === "booting" ? Math.max(0, Math.min(1, (tc - srv.startedAt) / (srv.readyAt - srv.startedAt))) : 0;
            const t = state === "booting" ? TONES.warn : TONES.good;
            return (
              <g key={i}>
                {state === "none" ? (
                  <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={9} strokeWidth={1.5} strokeDasharray="4 4" className={cn("fill-none", NEUTRAL.faintStroke)} />
                ) : (
                  <>
                    <rect x={x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={9} className="fill-foreground/[0.06]" />
                    <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx={9} strokeWidth={state === "booting" ? 2 : 1.5} strokeDasharray={state === "booting" ? "4 3" : undefined} className={cn(NEUTRAL.surface, state === "booting" ? TONES.warn.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                    <Server x={x + CARD.w / 2 - 8} y={CARD.y + 7} width={16} height={16} strokeWidth={2} className={state === "booting" ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300"} aria-hidden />
                    <rect x={x + 5} y={CARD.y + 29} width={CARD.w - 10} height={7} rx={3.5} className="fill-muted" />
                    <rect x={x + 5} y={CARD.y + 29} width={state === "ready" ? CARD.w - 10 : (CARD.w - 10) * progress} height={7} rx={3.5} className={t.solidFill} />
                  </>
                )}
              </g>
            );
          })}

          {/* Three numbers: ready, booting, dropped so far. */}
          <rect x={14} y={CHIP.y} width={96} height={CHIP.h} rx={13} className={TONES.good.softFill} />
          <text x={62} y={CHIP.y + 17.5} textAnchor="middle" className={cn(TONES.good.text, "text-[12px] font-bold tabular-nums")}>{`Ready ${here.ready}`}</text>
          <rect x={118} y={CHIP.y} width={108} height={CHIP.h} rx={13} className={here.booting > 0 ? TONES.warn.softFill : "fill-muted"} />
          <text x={172} y={CHIP.y + 17.5} textAnchor="middle" className={cn(here.booting > 0 ? TONES.warn.text : NEUTRAL.mutedText, "text-[12px] font-bold tabular-nums")}>{`Booting ${here.booting}`}</text>
          <rect x={234} y={CHIP.y} width={172} height={CHIP.h} rx={13} className={here.dropsSoFar > 0 ? TONES.bad.softFill : "fill-muted"} />
          <text x={320} y={CHIP.y + 17.5} textAnchor="middle" className={cn(here.dropsSoFar > 0 ? TONES.bad.text : NEUTRAL.mutedText, "text-[12px] font-bold tabular-nums")}>{`Dropped ${formatCount(here.dropsSoFar)}`}</text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <RailStrip
          label="Boot time of a new server"
          valueText={`${boot} seconds to boot, ${Math.round(target * 100)}% target. ${verdict.text}`}
          value={boot}
          ladder={BOOT_LADDER}
          fraction={bootToFraction(boot)}
          fromFraction={bootFromFraction}
          onChange={(v) => { setBoot(v); clock.restart(); }}
          marks={BOOT_LADDER.map((v) => ({ at: bootToFraction(v), label: v === 0 || v === BOOT.max ? undefined : String(v) }))}
          ends={["0 s", "180 s"]}
          caption="seconds to boot a server"
        />
      </div>
    </BeatFrame>
  );
}
