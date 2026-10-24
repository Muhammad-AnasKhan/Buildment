"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_JOBS,
  JOBS,
  SCRAPER_ALLOWED,
  SCRAPER_BURST,
  gatewayOutcome,
  gatewayVerdict,
  toggleJob,
  type Caller,
  type GatewayOutcome,
  type JobId,
  type Jobs,
} from "../models/gateway-jobs";

const W = 420;
const H = 346;
const CALLER_Y = 76;
const SERVICE_Y = 302;
const CALLER_X: Record<Caller, number> = { scraper: 62, stranger: 210, huda: 358 };
const BOX = { x: 6, y: 124, w: 408, h: 104 };
const BLOCK = { w: 62, h: 64, gap: 4, y: 154 };
const TOP_EDGE = CALLER_Y + NODE_H / 2;
const BOTTOM_EDGE = SERVICE_Y - NODE_H / 2;
const ARROW_X = 316;

const APPROACH = 0.4;
const STEP = 0.22;
const EXIT = 0.45;
const BYPASS_TRAVEL = 1.5;
const BAD_HOLD = 0.7;
const PERIOD_S = 7.5;

const r2 = (v: number) => Math.round(v * 100) / 100;
const blockX = (i: number) => BOX.x + 8 + i * (BLOCK.w + BLOCK.gap);

type Plan = { caller: Caller; start: number; stoppedAt: JobId | null };

/** Every request in one loop: Huda one, the stranger one, the scraper a burst of six. */
function plans(o: GatewayOutcome): Plan[] {
  const out: Plan[] = [
    { caller: "huda", start: 0.3, stoppedAt: o.stoppedAt.huda },
    { caller: "stranger", start: 1.4, stoppedAt: o.stoppedAt.stranger },
  ];
  for (let i = 0; i < SCRAPER_BURST; i++) out.push({ caller: "scraper", start: 2.5 + i * 0.2, stoppedAt: o.stoppedAt.scraper && i >= SCRAPER_ALLOWED ? o.stoppedAt.scraper : null });
  return out;
}

type Dot = { x: number; y: number; tone: Tone };
type Frame = { dots: Dot[]; lit: Partial<Record<JobId, "ok" | "bad">>; arrived: number };

/** Where every request is at time t: dots outside the gateway, blocks lit inside it. */
function frameAt(o: GatewayOutcome, t: number): Frame {
  const frame: Frame = { dots: [], lit: {}, arrived: 0 };
  if (!Number.isFinite(t)) return frame;
  const bypass = o.clientsKnowServices;
  for (const p of plans(o)) {
    const x = CALLER_X[p.caller];
    const age = t - p.start;
    if (age < 0) continue;
    if (bypass) {
      const u = age / BYPASS_TRAVEL;
      if (u > 1) {
        if (p.caller === "scraper") frame.arrived++;
        continue;
      }
      frame.dots.push({ x, y: r2(TOP_EDGE + 2 + (BOTTOM_EDGE - TOP_EDGE - 4) * u), tone: "warn" });
      continue;
    }
    const stopIdx = p.stoppedAt ? o.path.indexOf(p.stoppedAt) : -1;
    const stations = stopIdx >= 0 ? stopIdx + 1 : o.path.length;
    if (age < APPROACH) {
      frame.dots.push({ x, y: r2(TOP_EDGE + 2 + (BOX.y - TOP_EDGE - 2) * (age / APPROACH)), tone: o.readableOnWire ? "warn" : "accent" });
      continue;
    }
    const inside = age - APPROACH;
    const index = Math.floor(inside / STEP);
    if (index < stations) {
      const id = o.path[index];
      frame.lit[id] = stopIdx >= 0 && index === stopIdx ? "bad" : "ok";
      continue;
    }
    if (stopIdx >= 0) {
      if (inside < stopIdx * STEP + BAD_HOLD && p.stoppedAt) frame.lit[p.stoppedAt] = "bad";
      continue;
    }
    const u = (inside - stations * STEP) / EXIT;
    if (u <= 1) frame.dots.push({ x, y: r2(BOX.y + BOX.h + 2 + (BOTTOM_EDGE - BOX.y - BOX.h - 2) * u), tone: "accent" });
    else if (p.caller === "scraper") frame.arrived++;
  }
  return frame;
}

function callerPill(c: Caller, o: GatewayOutcome): { text: string; tone: Tone | undefined } {
  if (o.clientsKnowServices) return { text: "calls direct", tone: "warn" };
  if (o.readableOnWire) return { text: "plain text", tone: "warn" };
  return c === "stranger" ? { text: "no token", tone: undefined } : { text: "valid token", tone: undefined };
}

/** 6.6: switch the gateway's jobs on and off and follow one request through. */
export function GatewayJobsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const beat = useBeatClock(box);
  const [jobs, setJobs] = useState<Jobs>(DEFAULT_JOBS);
  const [runStart, setRunStart] = useState(0);
  const titleId = useId();
  const descId = useId();

  const outcome = gatewayOutcome(jobs);
  const verdict = gatewayVerdict(jobs);
  const elapsed = beat.seconds - runStart;
  const t = beat.reduced || elapsed < 0 ? Infinity : elapsed % PERIOD_S;
  const frame = frameAt(outcome, t);
  const settled = !Number.isFinite(t);
  const piled = settled ? (outcome.scraperFloods ? SCRAPER_BURST : 0) : outcome.scraperFloods ? frame.arrived : 0;

  const flip = (id: JobId) => {
    setJobs((j) => toggleJob(j, id));
    setRunStart(beat.seconds + 0.9);
  };

  const bypass = outcome.clientsKnowServices;
  const lineClass = bypass ? TONES.warn.stroke : NEUTRAL.faintStroke;
  const description = `${JOBS.map((j) => `${j.label} ${jobs[j.id] ? "on" : "off"}`).join(", ")}. ${verdict.text}.`;

  const searchPill = outcome.scraperFloods ? { text: "flooded", tone: "bad" as Tone } : { text: "limited: 429", tone: "good" as Tone };
  const paymentsPill = outcome.strangerGetsIn ? { text: "stranger in", tone: "bad" as Tone } : { text: "blocked: 401", tone: "good" as Tone };
  const ordersPill = outcome.noRequestId ? { text: "no request id", tone: "warn" as Tone } : { text: "order 512 ok", tone: "good" as Tone };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap a job to switch it <b>on or off</b>, then watch the three callers.</>}
      controls={<BeatButton onClick={() => setRunStart(beat.seconds)}>Replay</BeatButton>}
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Lines from each caller to its service. With routing off they run straight past the gateway. */}
          {(Object.keys(CALLER_X) as Caller[]).map((c) => (
            <line key={c} x1={CALLER_X[c]} x2={CALLER_X[c]} y1={TOP_EDGE} y2={BOTTOM_EDGE} strokeWidth={2} strokeDasharray={bypass || outcome.readableOnWire ? "5 4" : undefined} className={outcome.readableOnWire && !bypass ? TONES.warn.stroke : lineClass} />
          ))}
          {frame.dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={5} className={TONES[d.tone].solidFill} />
          ))}
          {piled > 0
            ? Array.from({ length: piled }, (_, i) => <circle key={`pile${i}`} cx={78 + i * 9} cy={BOTTOM_EDGE - 14} r={3.4} className={TONES.bad.solidFill} />)
            : null}

          {/* The gateway: opaque, so the lines that bypass it pass behind. */}
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={16} strokeWidth={1.5} className={cn(NEUTRAL.surface, bypass ? TONES.warn.stroke : NEUTRAL.line)} strokeDasharray={bypass ? "6 4" : undefined} />
          <text x={BOX.x + 14} y={BOX.y + 22} className={cn(bypass ? TONES.warn.text : NEUTRAL.text, "text-[13px] font-bold")}>{bypass ? "Gateway: bypassed" : "Gateway"}</text>

          {JOBS.map((job, i) => {
            const on = jobs[job.id];
            const lit = bypass ? undefined : frame.lit[job.id];
            const x = blockX(i);
            const [first, second] = job.label.includes(" ") ? job.label.split(" ") : [job.label, ""];
            const look = lit === "bad" ? cn(TONES.bad.softFill, TONES.bad.stroke) : lit === "ok" ? cn(TONES.accent.softFill, TONES.accent.stroke) : on && !bypass ? cn(NEUTRAL.surface, NEUTRAL.line) : cn("fill-muted/40", NEUTRAL.faintStroke);
            const textClass = lit === "bad" ? TONES.bad.text : lit === "ok" ? TONES.accent.text : on && !bypass ? NEUTRAL.text : NEUTRAL.mutedText;
            return (
              <SvgButton key={job.id} x={x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} rx={11} label={`${job.full}: ${on ? "on" : "off"}. Tap to switch ${on ? "off" : "on"}.`} pressed={on} onPress={() => flip(job.id)}>
                <rect x={x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} rx={11} strokeWidth={1.5} strokeDasharray={on ? undefined : "4 3"} className={cn(look, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={x + BLOCK.w / 2} y={BLOCK.y + 20} textAnchor="middle" className={cn(textClass, "text-[12px] font-semibold")}>{first}</text>
                {second ? <text x={x + BLOCK.w / 2} y={BLOCK.y + 35} textAnchor="middle" className={cn(textClass, "text-[12px] font-semibold")}>{second}</text> : null}
                <rect x={x + 14} y={BLOCK.y + 42} width={34} height={16} rx={8} className={cn(on ? TONES.good.solidFill : "fill-muted-foreground/40", "transition-colors duration-200 motion-reduce:transition-none")} />
                <circle cx={on ? x + 40 : x + 22} cy={BLOCK.y + 50} r={6} className="fill-card transition-all duration-200 motion-reduce:transition-none" />
              </SvgButton>
            );
          })}

          {/* A gateway that keeps order data: a copy of every order runs from the gateway to Orders. */}
          {outcome.gatewayCopiesOrders ? (
            <g>
              <line x1={ARROW_X} x2={ARROW_X} y1={BOX.y + BOX.h} y2={BOTTOM_EDGE - 4} strokeWidth={2.5} strokeDasharray="6 4" className={TONES.bad.stroke} />
              <path d={`M ${ARROW_X - 6} ${BOTTOM_EDGE - 10} L ${ARROW_X} ${BOTTOM_EDGE - 2} L ${ARROW_X + 6} ${BOTTOM_EDGE - 10} Z`} className={TONES.bad.solidFill} />
              <rect x={ARROW_X - 90} y={BOX.y + BOX.h + 5} width={80} height={30} rx={10} strokeWidth={1.5} className={cn(TONES.bad.softFill, TONES.bad.stroke)} />
              <text x={ARROW_X - 50} y={BOX.y + BOX.h + 19} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold")}>copy of</text>
              <text x={ARROW_X - 50} y={BOX.y + BOX.h + 31} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold")}>every order</text>
            </g>
          ) : null}

          <SvgNode x={CALLER_X.scraper} y={CALLER_Y} label="Scraper" kind="worker" status={callerPill("scraper", outcome).text} statusTone={callerPill("scraper", outcome).tone} />
          <SvgNode x={CALLER_X.stranger} y={CALLER_Y} label="Stranger" kind="user" status={callerPill("stranger", outcome).text} statusTone={callerPill("stranger", outcome).tone} />
          <SvgNode x={CALLER_X.huda} y={CALLER_Y} label="Huda" kind="phone" status={callerPill("huda", outcome).text} statusTone={callerPill("huda", outcome).tone} />
          <SvgNode x={CALLER_X.scraper} y={SERVICE_Y} label="Search" kind="server" status={searchPill.text} statusTone={searchPill.tone} mark={outcome.scraperFloods ? "bad" : undefined} />
          <SvgNode x={CALLER_X.stranger} y={SERVICE_Y} label="Payments" kind="server" status={paymentsPill.text} statusTone={paymentsPill.tone} mark={outcome.strangerGetsIn ? "bad" : undefined} />
          <SvgNode x={CALLER_X.huda} y={SERVICE_Y} label="Orders" kind="database" status={ordersPill.text} statusTone={ordersPill.tone} />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
