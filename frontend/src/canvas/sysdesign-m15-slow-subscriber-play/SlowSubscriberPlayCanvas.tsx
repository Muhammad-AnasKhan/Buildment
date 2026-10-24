"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import { flowDots, flowDotsPerSecond } from "../models/server-load";
import { DEFAULT_SPEED, FAST_MS, ORDERS_PER_S, POOL, SPEEDS, direct, oneDecimal, queues, speedToFraction, valueText, verdictFor, type Design } from "./model";

const W = 420;
const H = 424;
const ORDER = { x: 62, y: 174 };
const QUEUE_X = 210;
const SUB_X = 358;
const HALF = 56;
const ROWS = [
  { id: "email", label: "Email", y: 104 },
  { id: "receipts", label: "Receipts", y: 174 },
  { id: "stats", label: "Stats", y: 244 },
] as const;
const INFO_Y = 294;
const RAIL = { x0: 40, x1: 380, y: 384 };

const r1 = (v: number) => Math.round(v * 10) / 10;
const GAP = 4;

/** 15.7 beat 2: slow Receipts down, and compare calling each subscriber in turn with a queue for each. */
export function SlowSubscriberPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [design, setDesign] = useState<Design>("queues");

  const d = direct(speed);
  const q = queues(speed);
  const verdict = verdictFor(design, speed);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());
  const isDirect = design === "direct";
  const slow = speed < ORDERS_PER_S;
  const perMs = Math.round(1000 / speed);

  const backlog: Record<string, number> = { email: q.email, receipts: q.receipts, stats: q.stats };
  const rate = (id: string) => (isDirect ? d.delivered : Math.min(ORDERS_PER_S, id === "receipts" ? speed : 30));
  const dots = (k: number, perSecond: number) => (clock.reduced ? [] : flowDots(clock.seconds + k * 0.37, perSecond));

  const orderStatus = isDirect ? (d.behind ? `${withCommas(d.waitingAfter)} waiting` : `${Math.round(d.timeMs)} ms each`) : `${q.orderMs} ms each`;
  const orderTone: Tone = isDirect ? (d.behind ? "bad" : "warn") : "good";

  const infoA = { label: "an order takes", value: `${isDirect ? Math.round(d.timeMs) : q.orderMs} ms`, tone: isDirect ? (d.behind ? ("bad" as Tone) : ("warn" as Tone)) : ("good" as Tone) };
  const infoB = isDirect
    ? { label: `the pool of ${POOL} can place`, value: `${oneDecimal(d.capacity)} a second`, tone: d.behind ? ("bad" as Tone) : null }
    : { label: "Receipts queue, after 10 min", value: q.receipts > 0 ? withCommas(q.receipts) : "empty", tone: q.receipts > 0 ? ("warn" as Tone) : ("good" as Tone) };

  const description = `20 orders arrive a second. The order service has a pool of ${POOL} workers and three subscribers: Email and Stats at 30 events a second, Receipts at ${speed} a second. ${valueText(design, speed)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag <b>Receipts&apos; speed</b> down, then switch the design and compare.</>}
      controls={
        <BeatChoice<Design>
          label="Design"
          options={[
            { id: "direct", label: "Call each in turn" },
            { id: "queues", label: "A queue for each" },
          ]}
          value={design}
          onChange={setDesign}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <text x={W / 2} y={60} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-medium")}>{`${ORDERS_PER_S} orders a second, counts after 10 minutes`}</text>

          {/* The links. Calling in turn: one link from the order service to each subscriber. With queues: order service, queue, subscriber. */}
          {ROWS.map((row, k) => {
            const slowRow = row.id === "receipts" && slow;
            if (isDirect) {
              const x0 = ORDER.x + HALF + GAP;
              const x1 = SUB_X - HALF - GAP;
              return (
                <g key={row.id}>
                  <LinkLine x1={x0} y1={ORDER.y} x2={x1} y2={row.y} className={slowRow ? TONES.warn.stroke : NEUTRAL.faintStroke} />
                  {dots(k, flowDotsPerSecond(d.delivered / 30)).map((p) => (
                    <circle key={p.id} cx={r1(x0 + (x1 - x0) * p.progress)} cy={r1(ORDER.y + (row.y - ORDER.y) * p.progress)} r={3.6} className={TONES.accent.solidFill} />
                  ))}
                </g>
              );
            }
            const a0 = ORDER.x + HALF + GAP;
            const a1 = QUEUE_X - HALF - GAP;
            const b0 = QUEUE_X + HALF + GAP;
            const b1 = SUB_X - HALF - GAP;
            return (
              <g key={row.id}>
                <LinkLine x1={a0} y1={ORDER.y} x2={a1} y2={row.y} className={NEUTRAL.faintStroke} />
                <line x1={b0} x2={b1} y1={row.y} y2={row.y} strokeWidth={1.75} strokeLinecap="round" className={slowRow ? TONES.warn.stroke : NEUTRAL.faintStroke} />
                {dots(k, flowDotsPerSecond(ORDERS_PER_S / 30)).map((p) => (
                  <circle key={`a${p.id}`} cx={r1(a0 + (a1 - a0) * p.progress)} cy={r1(ORDER.y + (row.y - ORDER.y) * p.progress)} r={3.4} className={TONES.accent.solidFill} />
                ))}
                {dots(k + 3, flowDotsPerSecond(rate(row.id) / 30)).map((p) => (
                  <circle key={`b${p.id}`} cx={r1(b0 + (b1 - b0) * p.progress)} cy={row.y} r={3.4} className={slowRow ? TONES.warn.solidFill : TONES.accent.solidFill} />
                ))}
              </g>
            );
          })}

          {/* How long each call takes, on its own pill on the link. */}
          {isDirect
            ? ROWS.map((row) => {
                const t = 0.55;
                const x = r1(ORDER.x + HALF + GAP + (SUB_X - HALF - GAP - (ORDER.x + HALF + GAP)) * t);
                const y = r1(ORDER.y + (row.y - ORDER.y) * t);
                const slowRow = row.id === "receipts" && slow;
                const text = row.id === "receipts" ? `${perMs} ms` : `${Math.round(FAST_MS)} ms`;
                return (
                  <g key={`p${row.id}`}>
                    <rect x={x - 29} y={y - 11} width={58} height={22} rx={11} className="fill-card" />
                    <rect x={x - 29} y={y - 11} width={58} height={22} rx={11} strokeWidth={1.5} className={cn(slowRow ? cn(TONES.warn.softFill, TONES.warn.stroke) : cn("fill-none", NEUTRAL.line))} />
                    <text x={x} y={y + 4.5} textAnchor="middle" className={cn(slowRow ? TONES.warn.text : NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{text}</text>
                  </g>
                );
              })
            : null}

          <SvgNode x={ORDER.x} y={ORDER.y} label="Orders" kind="server" status={orderStatus} statusTone={orderTone} mark={isDirect && d.behind ? "bad" : undefined} />
          {!isDirect
            ? ROWS.map((row) => (
                <SvgNode key={`q${row.id}`} x={QUEUE_X} y={row.y} label="Queue" kind="queue" status={backlog[row.id] > 0 ? `${withCommas(backlog[row.id])} waiting` : "empty"} statusTone={backlog[row.id] > 0 ? "warn" : "good"} />
              ))
            : null}
          {ROWS.map((row) => {
            const r = rate(row.id);
            const tone: Tone = row.id === "receipts" && slow ? "warn" : isDirect && d.behind ? "warn" : "good";
            return <SvgNode key={row.id} x={SUB_X} y={row.y} label={row.label} kind="worker" status={`${Number.isInteger(r) ? r : oneDecimal(r)} a second`} statusTone={tone} />;
          })}

          {/* Two numbers: what an order costs, and what the design can carry. */}
          {[infoA, infoB].map((c, i) => {
            const x = 14 + i * 200;
            return (
              <g key={c.label}>
                <rect x={x} y={INFO_Y} width={192} height={44} rx={13} strokeWidth={c.tone ? 2 : 1.5} className={cn(NEUTRAL.surface, c.tone ? TONES[c.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={x + 12} y={INFO_Y + 17} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{c.label}</text>
                <text x={x + 12} y={INFO_Y + 37} className={cn(c.tone ? TONES[c.tone].text : NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{c.value}</text>
              </g>
            );
          })}

          {/* Receipts' speed, inside the picture. */}
          <text x={22} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`Receipts' speed: ${speed} events a second (${perMs} ms each)`}</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={SPEEDS.map((v) => ({ value: v, label: String(v), at: speedToFraction(v) }))}
            value={speed}
            onChange={setSpeed}
            ariaLabel="Receipts speed in events per second"
            valueText={valueText(design, speed)}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
