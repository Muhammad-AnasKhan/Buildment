"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { flowDots } from "../models/server-load";
import {
  DEFAULT_POLL,
  POLL_STEPS,
  USERS,
  USER_LADDER,
  WAYS,
  clampUsers,
  costTone,
  dotRate,
  formatCount,
  formatDelay,
  formatRequests,
  messagesPerSecond,
  realtimeVerdict,
  usersFromFraction,
  usersToFraction,
  wayCost,
  type WayId,
} from "../models/realtime-cost";

const W = 420;
const H = 312;
const LANE_YS = [66, 104, 142, 180] as const;
const CARD = { x: 8, w: 92, h: 34 };
const LANE = { x0: 108, x1: 292 };
const SERVER = { x: 354, y: 118 };
const CHIPS_Y = 220;
const RAIL = { x0: 36, x1: 384, y: 270 };

const PIPE = "stroke-blue-200 dark:stroke-blue-400/25";

type Dot = { id: string; at: number; tone: "accent" | "good"; left: boolean };

/** Dots on one lane: requests heading to the server, events heading back, at rates that follow the model. */
function laneDots(way: WayId, seconds: number, lane: number, requests: number, messages: number): Dot[] {
  const t = seconds + lane * 0.37;
  const out: Dot[] = [];
  const go = (rate: number, tone: Dot["tone"], left: boolean, shift: number) => {
    for (const d of flowDots(t + shift, rate, 1.4)) out.push({ id: `${tone}-${left}-${d.id}`, at: d.progress, tone, left });
  };
  if (way === "polling" || way === "long") go(dotRate(requests), "accent", false, 0);
  if (way === "sse") go(dotRate(messages, 4), "good", true, 3.1);
  if (way === "ws") {
    go(dotRate(messages, 4), "good", true, 3.1);
    go(dotRate(messages / 2, 3), "accent", false, 1.7);
  }
  return out;
}

/** 3.5: drag the number of users, pick a poll interval, tap a lane; compare delay, requests and open connections. */
export function ChatFourWaysCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [users, setUsers] = useState<number>(USERS.default);
  const [poll, setPoll] = useState<number>(DEFAULT_POLL);
  const [focus, setFocus] = useState<WayId>("polling");

  const n = clampUsers(users);
  const costs = WAYS.map((w) => wayCost(w.id, n, poll));
  const focusIndex = WAYS.findIndex((w) => w.id === focus);
  const focusCost = costs[focusIndex];
  const tone = costTone(focusCost);
  const verdict = realtimeVerdict(focus, n, poll);
  const messages = messagesPerSecond(n);

  const summary = `${formatCount(n)} users get 2 messages a minute each. ${WAYS.map((w, i) => `${w.name}: ${formatDelay(costs[i].delayMs)} delay, ${formatRequests(costs[i].reqPerSec)} requests a second, ${formatCount(costs[i].open)} open connections`).join(". ")}. Looking at ${WAYS[focusIndex].name}: ${verdict.text}.`;

  const chipXs = rowPositions(POLL_STEPS.map((s) => chipWidth(`${s} s`)), 94);
  const chipSpots = POLL_STEPS.map((s, i) => ({ s, text: `${s} s`, x: chipXs[i] }));

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>users</b> rail, pick how often polling asks, tap a <b>lane</b> to look at it.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {WAYS.map((w, i) => {
            const y = LANE_YS[i];
            const c = costs[i];
            const dots = laneDots(w.id, clock.seconds, i, c.reqPerSec, messages);
            return (
              <g key={w.id}>
                <line x1={LANE.x0} x2={LANE.x1} y1={y} y2={y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
                {c.open > 0 ? <line x1={LANE.x0} x2={LANE.x1} y1={y} y2={y} strokeWidth={w.id === "long" ? 3 : 7} strokeLinecap="round" className={PIPE} /> : null}
                {dots.map((d) => {
                  const x = d.left ? LANE.x1 - (LANE.x1 - LANE.x0) * d.at : LANE.x0 + (LANE.x1 - LANE.x0) * d.at;
                  return (
                    <g key={d.id}>
                      <circle cx={x + (d.left ? 7 : -7)} cy={y} r={3} opacity={0.25} className={TONES[d.tone].solidFill} />
                      <circle cx={x} cy={y} r={4.5} className={TONES[d.tone].solidFill} />
                    </g>
                  );
                })}
              </g>
            );
          })}

          <SvgNode x={SERVER.x} y={SERVER.y} label="Server" kind="server" status={`${formatCount(focusCost.open)} open`} statusTone={tone} mark={tone === "bad" ? "bad" : undefined} />
          <rect x={SERVER.x - NODE_W / 2 + 7} y={SERVER.y + 38} width={NODE_W - 14} height={22} rx={11} className={cn(TONES[tone].softFill, TONES[tone].stroke)} strokeWidth={1.5} />
          <text x={SERVER.x} y={SERVER.y + 53.5} textAnchor="middle" className={cn(TONES[tone].text, "text-[12px] font-bold tabular-nums")}>{formatRequests(focusCost.reqPerSec)} req/s</text>

          {WAYS.map((w, i) => {
            const y = LANE_YS[i];
            const on = w.id === focus;
            const d = costs[i].delayMs;
            return (
              <g
                key={`lane-${w.id}`}
                role="button"
                tabIndex={0}
                aria-label={`Look at ${w.name}`}
                aria-pressed={on}
                className="group cursor-pointer outline-none"
                onClick={() => setFocus(w.id)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  setFocus(w.id);
                }}
              >
                <rect x={CARD.x} y={y - 19} width={LANE.x1 - CARD.x + 6} height={38} fill="none" pointerEvents="all" />
                <rect x={CARD.x} y={y - CARD.h / 2} width={CARD.w} height={CARD.h} rx={10} className="fill-card" />
                <rect
                  x={CARD.x}
                  y={y - CARD.h / 2}
                  width={CARD.w}
                  height={CARD.h}
                  rx={10}
                  strokeWidth={on ? 2.25 : 1.5}
                  className={cn("transition-colors duration-200 motion-reduce:transition-none group-hover:stroke-muted-foreground", on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-transparent", NEUTRAL.line))}
                />
                <text x={CARD.x + 10} y={y - 2} className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[12.5px] font-bold")}>{w.label}</text>
                <text x={CARD.x + 10} y={y + 12} className={cn(d >= 1000 ? TONES.warn.text : TONES.good.text, "text-[11.5px] font-semibold tabular-nums")}>{formatDelay(d)} late</text>
                <rect x={CARD.x - 3} y={y - CARD.h / 2 - 3} width={CARD.w + 6} height={CARD.h + 6} rx={13} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
              </g>
            );
          })}

          <text x={14} y={CHIPS_Y + 4.5} className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>Poll every</text>
          {chipSpots.map(({ s, text, x }) => (
            <SvgChip key={s} x={x} y={CHIPS_Y} text={text} label={`Poll every ${s} seconds`} pressed={s === poll} onPress={() => setPoll(s)} />
          ))}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Users online"
            valueText={`${formatCount(n)} users: ${verdict.text}`}
            value={n}
            ladder={USER_LADDER}
            fromFraction={usersFromFraction}
            onChange={(v) => setUsers(clampUsers(v))}
            onGrab={(grabbed) => (grabbed ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={usersToFraction(n)}
              marks={[1000, 10_000, 100_000].map((v) => ({ at: usersToFraction(v), label: formatCount(v) }))}
              ends={["100", ""]}
              caption="users online"
            />
          </RailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
