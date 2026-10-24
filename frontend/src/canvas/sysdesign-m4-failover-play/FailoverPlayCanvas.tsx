"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { dotRate, laneDots } from "../models/lane-dots";
import {
  addEvent,
  CAPACITY,
  detectionTime,
  failoverAt,
  formatCount,
  INTERVALS,
  SERVERS,
  settledAt,
  SPEED,
  THRESHOLD,
  TRAFFIC,
  type CheckInterval,
  type FailEvent,
} from "../models/failover";

const W = 420;
const H = 272;
const BAL = { x: 210, y: 82 };
const SRV_Y = 194;
const SRV_X = [70, 210, 350] as const;
const NODE_W = 112;
const NODE_H = 60;
const RING = { x: 346, y: 84, r: 24 };
const BAR = { y: 234, w: 100, h: 10 };

const loadTone = (busy: number): Tone => (busy > 1 ? "bad" : busy > 0.8 ? "warn" : "good");

const CIRC = 2 * Math.PI * RING.r;
const SEG = 360 / THRESHOLD;
const GAP = 22;

/** 4.4: tap a server to fail it, watch the dead server keep its share until the checks remove it, then the survivors take the load. */
export function FailoverPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [interval, setInterval_] = useState<CheckInterval>(10);
  const [events, setEvents] = useState<FailEvent[]>([]);

  const now = clock.reduced ? settledAt(events, interval) : clock.seconds * SPEED;
  const s = failoverAt(events, interval, now);
  const detect = detectionTime(interval);

  const tap = (server: number) => {
    const kind = s.status[server] === "up" ? "fail" : "restore";
    setEvents((list) => addEvent(list, { at: clock.reduced ? settledAt(list, interval) : now, server, kind }));
  };
  const chooseInterval = (v: CheckInterval) => {
    setInterval_(v);
    setEvents([]);
    clock.restart();
  };

  const summary = `${TRAFFIC} requests a second reach a balancer with ${SERVERS} servers that each finish ${CAPACITY} a second. Health checks run every ${interval} seconds and ${THRESHOLD} failed checks remove a server, so a dead server keeps its share for ${detect} seconds. ${s.failed >= 1 ? `${formatCount(s.failed)} requests have failed. ` : ""}${s.verdict}.`;

  const controls: ReactNode = (
    <div className="flex flex-wrap gap-2">
      <div role="group" aria-label="Health check interval" className="flex gap-2">
        {INTERVALS.map((v) => (
          <BeatButton key={v} pressed={interval === v} onClick={() => chooseInterval(v)}>
            {`every ${v} s`}
          </BeatButton>
        ))}
      </div>
      <BeatButton onClick={() => clock.restart()}>Replay</BeatButton>
    </div>
  );

  const failed = s.failed;
  const checkFill = (k: number) => (s.checkAge === null ? 0 : Math.max(0, Math.min(1, s.checkAge / interval - k)));

  return (
    <BeatFrame label={title} limits={limits} controls={controls} hint={<>Tap a <b>server</b> to fail it. Tap again to bring it back.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Lanes from the balancer to each server. A removed server's lane is dashed and empty. */}
          {SRV_X.map((sx, i) => (
            <line key={`lane-${i}`} x1={BAL.x} y1={BAL.y + NODE_H / 2} x2={sx} y2={SRV_Y - NODE_H / 2} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={s.status[i] === "out" ? "5 5" : undefined} className={s.status[i] === "dead" ? TONES.bad.stroke : NEUTRAL.faintStroke} />
          ))}
          {SRV_X.map((sx, i) => {
            const dead = s.status[i] === "dead";
            const rate = s.status[i] === "out" ? 0 : dotRate(s.share[i] / CAPACITY);
            return laneDots(clock.seconds, rate, clock.reduced, i, 1.0).map((p, k) => {
              const x1 = BAL.x;
              const y1 = BAL.y + NODE_H / 2 + 4;
              const x2 = sx;
              const y2 = SRV_Y - NODE_H / 2 - 4;
              return <circle key={`${i}-${k}`} cx={x1 + (x2 - x1) * p} cy={y1 + (y2 - y1) * p} r={4} className={dead ? TONES.bad.solidFill : TONES.accent.solidFill} />;
            });
          })}

          {/* The balancer, its failed-request counter and the check ring. */}
          <SvgNode x={BAL.x} y={BAL.y} label="Balancer" kind="router" status={s.failOpen ? "fail open" : `every ${interval} s`} statusTone={s.failOpen ? "bad" : undefined} />
          <rect x={12} y={BAL.y - 16} width={124} height={32} rx={16} strokeWidth={1.5} className={cn(failed >= 1 ? TONES.bad.softFill : "fill-muted", failed >= 1 ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={74} y={BAL.y + 5} textAnchor="middle" className={cn(failed >= 1 ? TONES.bad.text : NEUTRAL.mutedText, "text-[13.5px] font-bold tabular-nums")}>{`Failed: ${formatCount(failed)}`}</text>

          {Array.from({ length: THRESHOLD }, (_, k) => {
            const start = k * SEG + GAP / 2;
            const span = SEG - GAP;
            const f = checkFill(k);
            const dash = (deg: number) => `${((deg / 360) * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`;
            const common = { cx: RING.x, cy: RING.y, r: RING.r, fill: "none", strokeWidth: 5, strokeLinecap: "round" as const, strokeDashoffset: -((start / 360) * CIRC), transform: `rotate(-90 ${RING.x} ${RING.y})` };
            return (
              <g key={`seg-${k}`}>
                <circle {...common} strokeDasharray={dash(span)} className="stroke-muted" />
                {f >= 1 ? <circle {...common} strokeDasharray={dash(span)} className={TONES.bad.stroke} /> : f > 0.02 ? <circle {...common} strokeDasharray={dash(span * f)} className={TONES.warn.stroke} /> : null}
              </g>
            );
          })}
          <text x={RING.x} y={RING.y + 4.5} textAnchor="middle" className={cn(s.checkAge === null ? NEUTRAL.mutedText : NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>
            {s.checkAge === null ? `${interval} s` : `${Math.min(Math.floor(s.checkAge), detect)} s`}
          </text>
          <text x={RING.x} y={RING.y - RING.r - 9} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
            {s.checkAge === null ? "health checks" : `${s.checks} of ${THRESHOLD} failed`}
          </text>

          {/* Three servers: tap one to fail it. The pill is its busy share; the bar under it rises with the load. */}
          {SRV_X.map((sx, i) => {
            const st = s.status[i];
            const busy = s.busy[i];
            const label = st === "up" ? `${Math.round(busy * 100)}%` : st === "dead" ? "dead" : "out";
            const tone: Tone | undefined = st === "up" ? loadTone(busy) : st === "dead" ? "bad" : "warn";
            const fill = Math.min(1, busy) * BAR.w;
            const t = TONES[loadTone(busy)];
            return (
              <SvgButton key={`srv-${i}`} x={sx - NODE_W / 2} y={SRV_Y - NODE_H / 2} width={NODE_W} height={NODE_H + BAR.h + 16} rx={14} label={st === "up" ? `Fail Server ${i + 1}` : `Bring Server ${i + 1} back`} pressed={st !== "up"} onPress={() => tap(i)}>
                <g className={cn("transition-opacity duration-200 motion-reduce:transition-none", st === "out" ? "opacity-60" : "opacity-100")}>
                  <SvgNode x={sx} y={SRV_Y} label={`Server ${i + 1}`} kind="server" status={label} statusTone={tone} mark={st === "dead" ? "bad" : undefined} />
                </g>
                <rect x={sx - BAR.w / 2} y={BAR.y} width={BAR.w} height={BAR.h} rx={5} className="fill-muted" />
                <rect x={sx - BAR.w / 2} y={BAR.y} width={fill} height={BAR.h} rx={5} className={cn(t.solidFill, "transition-[width,fill] duration-300 motion-reduce:transition-none")} style={{ width: fill }} />
                <line x1={sx - BAR.w / 2 + BAR.w * 0.8} x2={sx - BAR.w / 2 + BAR.w * 0.8} y1={BAR.y - 3} y2={BAR.y + BAR.h + 3} strokeWidth={1.5} className="stroke-foreground/50" />
              </SvgButton>
            );
          })}
          <text x={210} y={H - 12} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`Time runs ${SPEED} times faster. The tick on each bar is 80%.`}</text>

          <VerdictBanner width={W} text={s.verdict} tone={s.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
