"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { spread, stepByKey, withCommas } from "../models/picture-controls";
import { BACKGROUND_EACH, CEILING, DEFAULT_DEMAND, DEMAND_MAX, DEMAND_PAGE, DEMAND_STEP, PROVISIONED, SHARE, describeDemand, outcome, rejectedShare, snapDemand, verdict } from "./model";

const W = 420;
const H = 458;
const BASE = 330;
const SCALE = 0.12;
const CARD_TOP = 60;
const CARD_BOTTOM = 392;
const HOT = { x: 10, w: 150 };
const OTHERS = [168, 252, 336].map((x) => ({ x, w: 76 }));
const BAR_CX = HOT.x + 44;
const BAR_W = 40;
const TABLE = { x: 24, w: 372, y: 416, h: 12 };
const yOf = (v: number) => BASE - v * SCALE;

const r1 = (v: number) => Math.round(v * 10) / 10;
const fall = (phase: number, from: number, to: number) => from + (to - from) * phase;

/** 13.4: drag the hot key's writes per second and see what the partition accepts and rejects. */
export function HotPartitionCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const dragging = useRef(false);
  const [demand, setDemand] = useState(DEFAULT_DEMAND);
  const [adaptive, setAdaptive] = useState(false);

  const o = outcome(demand, adaptive);
  const v = verdict(demand, adaptive);
  const limitY = yOf(o.limit);
  const demandY = yOf(demand);
  const acceptedY = yOf(o.accepted);
  const useW = (o.tableUse / PROVISIONED) * TABLE.w;
  const share = rejectedShare(o);

  const follow = (e: PointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const y = p.matrixTransform(m.inverse()).y;
    setDemand(snapDemand((BASE - y) / SCALE));
  };
  const onKey = (e: KeyboardEvent) => {
    const next = stepByKey(demand, e.key, { min: 0, max: DEMAND_MAX, step: DEMAND_STEP, page: DEMAND_PAGE });
    if (next === null) return;
    e.preventDefault();
    setDemand(snapDemand(next));
  };

  // Requests falling into the partitions: more of them for the hot one as it climbs, and the rejected ones turn away at the line.
  const hotCount = demand === 0 ? 0 : Math.max(2, Math.round(demand / 250));
  const falling = clock.reduced
    ? []
    : [
        ...Array.from({ length: hotCount }, (_, j) => {
          const phase = (clock.seconds * 0.8 + j / hotCount) % 1;
          const turned = spread(j + 1) < share;
          const end = o.rejected > 0 ? limitY : demandY;
          if (turned && phase > 0.7) {
            const k = (phase - 0.7) / 0.3;
            return { key: `h${j}`, x: BAR_CX + 6 + k * 30, y: end - k * 4, tone: "bad" as const, opacity: 1 - k };
          }
          const stop = turned ? 0.7 : 1;
          const y = fall(Math.min(phase, stop) / stop, CARD_TOP + 12, end);
          return { key: `h${j}`, x: BAR_CX, y, tone: turned ? ("bad" as const) : ("accent" as const), opacity: turned ? 1 : Math.min(1, (1 - phase) * 6) };
        }),
        ...OTHERS.map((c, i) => {
          const phase = (clock.seconds * 0.55 + i / 3) % 1;
          return { key: `o${i}`, x: c.x + c.w / 2, y: fall(phase, CARD_TOP + 12, yOf(BACKGROUND_EACH)), tone: "accent" as const, opacity: Math.min(1, (1 - phase) * 6) };
        }),
      ];

  const description = `A table of ${withCommas(PROVISIONED)} write units a second in four partitions, ${SHARE} each. Adaptive capacity is ${adaptive ? "on" : "off"}. The hot key sends ${withCommas(demand)} writes a second to its partition, which accepts ${withCommas(o.accepted)} and rejects ${withCommas(o.rejected)}. The table takes ${withCommas(o.tableUse)} of ${withCommas(PROVISIONED)}. ${v.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>hot key&apos;s bar</b> up and down. Then turn adaptive capacity on.
        </>
      }
      controls={
        <BeatChoice<"off" | "on">
          label="Adaptive capacity"
          options={[
            { id: "off", label: "Adaptive off" },
            { id: "on", label: "Adaptive on" },
          ]}
          value={adaptive ? "on" : "off"}
          onChange={(id) => setAdaptive(id === "on")}
        />
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Four partition cards. */}
          {[HOT, ...OTHERS].map((c, i) => (
            <g key={c.x}>
              <rect x={c.x} y={CARD_TOP + 3} width={c.w} height={CARD_BOTTOM - CARD_TOP} rx={14} className="fill-foreground/[0.06]" />
              <rect x={c.x} y={CARD_TOP} width={c.w} height={CARD_BOTTOM - CARD_TOP} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, i === 0 ? TONES.accent.stroke : NEUTRAL.line)} />
              <line x1={c.x + 8} x2={c.x + c.w - 8} y1={BASE} y2={BASE} strokeWidth={1.5} className={NEUTRAL.line} />
            </g>
          ))}

          {/* The three quiet partitions: 200 a second each, against their share of 500. */}
          {OTHERS.map((c, i) => {
            const cx = c.x + c.w / 2;
            return (
              <g key={c.x}>
                <rect x={cx - 12} y={yOf(BACKGROUND_EACH)} width={24} height={BACKGROUND_EACH * SCALE} rx={4} className={TONES.accent.solidFill} opacity={0.75} />
                <line x1={c.x + 8} x2={c.x + c.w - 8} y1={yOf(SHARE)} y2={yOf(SHARE)} strokeWidth={2} strokeDasharray="5 4" className={NEUTRAL.doneStroke} />
                <text x={cx} y={BASE + 38} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{`P${i + 2}`}</text>
                <text x={cx} y={BASE + 55} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{`${BACKGROUND_EACH}/s`}</text>
              </g>
            );
          })}

          {/* The hot partition: accepted part, rejected cap above the line, and the line itself. */}
          <rect x={BAR_CX - BAR_W / 2} y={acceptedY} width={BAR_W} height={Math.max(0, BASE - acceptedY)} rx={4} className={cn(o.rejected > 0 ? TONES.warn.solidFill : TONES.good.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} opacity={0.85} />
          {o.rejected > 0 ? <rect x={BAR_CX - BAR_W / 2} y={demandY} width={BAR_W} height={acceptedY - demandY} rx={4} strokeWidth={2} strokeDasharray="4 3" className={cn(TONES.bad.softFill, TONES.bad.stroke)} /> : null}
          <line x1={HOT.x + 8} x2={HOT.x + HOT.w - 8} y1={r1(limitY)} y2={r1(limitY)} strokeWidth={2.5} strokeDasharray="6 4" className={adaptive ? TONES.good.stroke : NEUTRAL.doneStroke} />
          <text x={BAR_CX} y={BASE + 38} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold")}>P1 hot key</text>
          <text x={BAR_CX} y={BASE + 55} textAnchor="middle" className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{`${withCommas(demand)}/s`}</text>

          {/* Labels on their own pills, to the right of the bar. */}
          <g>
            <rect x={HOT.x + 76} y={r1(limitY + 6)} width={72} height={22} rx={11} strokeWidth={1.5} className={cn(NEUTRAL.surface, adaptive ? TONES.good.stroke : NEUTRAL.line)} />
            <text x={HOT.x + 112} y={r1(limitY + 21)} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>
              {adaptive ? `top ${withCommas(o.limit)}` : `share ${o.limit}`}
            </text>
          </g>
          {o.rejected > 0 ? (
            <g>
              <rect x={HOT.x + 76} y={r1(Math.max(CARD_TOP + 6, demandY - 22))} width={72} height={22} rx={11} strokeWidth={1.5} className={cn(TONES.bad.softFill, TONES.bad.stroke)} />
              <text x={HOT.x + 112} y={r1(Math.max(CARD_TOP + 6, demandY - 22) + 15)} textAnchor="middle" className={cn(TONES.bad.text, "text-[11.5px] font-semibold tabular-nums")}>
                {`${withCommas(o.rejected)} lost`}
              </text>
            </g>
          ) : null}

          {/* Requests falling in. */}
          {falling.map((d) => (
            <circle key={d.key} cx={r1(d.x)} cy={r1(d.y)} r={3.2} opacity={d.opacity} className={TONES[d.tone].solidFill} />
          ))}

          {/* The handle: the whole hot card is the slider. */}
          <g
            role="slider"
            tabIndex={0}
            aria-label="Hot key writes per second"
            aria-valuemin={0}
            aria-valuemax={DEMAND_MAX}
            aria-valuenow={demand}
            aria-valuetext={describeDemand(demand, adaptive)}
            className="group cursor-ns-resize touch-none outline-none"
            onKeyDown={onKey}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              follow(e);
            }}
            onPointerMove={(e) => dragging.current && follow(e)}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          >
            <path d={`M${HOT.x} ${CARD_TOP} h${HOT.w} v${CARD_BOTTOM - CARD_TOP} h${-HOT.w} Z`} fill="none" pointerEvents="all" />
            <circle cx={BAR_CX} cy={r1(demandY)} r={19} className={TONES.accent.softFill} />
            <circle cx={BAR_CX} cy={r1(demandY)} r={12} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
            <line x1={BAR_CX - 3} x2={BAR_CX - 3} y1={r1(demandY) - 4.5} y2={r1(demandY) + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
            <line x1={BAR_CX + 3} x2={BAR_CX + 3} y1={r1(demandY) - 4.5} y2={r1(demandY) + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
            <rect x={HOT.x - 3} y={CARD_TOP - 3} width={HOT.w + 6} height={CARD_BOTTOM - CARD_TOP + 6} rx={17} strokeWidth={2.5} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
          </g>

          {/* The whole table against what it is paying for. */}
          <text x={TABLE.x} y={TABLE.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{`table takes ${withCommas(o.tableUse)}`}</text>
          <text x={TABLE.x + TABLE.w} y={TABLE.y - 8} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12.5px] tabular-nums")}>{`${withCommas(PROVISIONED)} paid for`}</text>
          <rect x={TABLE.x} y={TABLE.y} width={TABLE.w} height={TABLE.h} rx={6} className="fill-muted" />
          <rect x={TABLE.x} y={TABLE.y} width={Math.max(4, useW)} height={TABLE.h} rx={6} className={cn(TONES.accent.solidFill, "transition-[width] duration-200 motion-reduce:transition-none")} />
          <text x={TABLE.x + TABLE.w / 2} y={TABLE.y + 32} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`one partition tops out at ${withCommas(CEILING)}/s`}</text>

          <VerdictBanner width={W} text={v.text} tone={v.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
