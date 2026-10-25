"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { KeyRound, Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { stepByKey } from "../models/picture-controls";
import { ringArcs, ringPoint, posToAngle, type RingPoint } from "../sysdesign-m9-ring-play/model";
import {
  COPIES,
  DEFAULT_KEY,
  KEY_MAX,
  MACHINES,
  POINTS,
  angleToDeg,
  arcSegments,
  clampKey,
  copiesPerMachine,
  degToPos,
  describeKey,
  listMachines,
  machineCountText,
  pointsOf,
  walkFor,
  writeVerdict,
  type Machine,
} from "./model";

const W = 420;
const H = 448;
const CX = 210;
const CY = 172;
const R = 80;
const RING_W = 14;
const DOT_R = 9.5;
const TRAIL_R = R + RING_W / 2 + 6;
const KEY_R = R + 27;
const BADGE_R = R - RING_W / 2 - 15;
const CARD = { w: 74, h: 78, gap: 8, x0: 9, y: 326 };
const CARD_BOTTOM = CARD.y + CARD.h;
const cardCx = (i: number) => CARD.x0 + CARD.w / 2 + i * (CARD.w + CARD.gap);

/** Seconds: the walker runs along the trail, then the copies leave one after another. */
const WALK_S = 0.8;
const COPY_GAP = 0.2;
const FLIGHT = 0.6;

const COLOURS: Record<Machine, { stroke: string; fill: string }> = {
  A: { stroke: "stroke-blue-500 dark:stroke-blue-400", fill: "fill-blue-500 dark:fill-blue-400" },
  B: { stroke: "stroke-orange-500 dark:stroke-orange-400", fill: "fill-orange-500 dark:fill-orange-400" },
  C: { stroke: "stroke-violet-500 dark:stroke-violet-400", fill: "fill-violet-500 dark:fill-violet-400" },
  D: { stroke: "stroke-teal-500 dark:stroke-teal-400", fill: "fill-teal-500 dark:fill-teal-400" },
  E: { stroke: "stroke-fuchsia-500 dark:stroke-fuchsia-400", fill: "fill-fuchsia-500 dark:fill-fuchsia-400" },
};

// The ring is the chapter 9.3 ring: its arcs come from the module 9 helpers, fed positions in whole degrees.
const RING_POINTS: RingPoint[] = POINTS.map((p, index) => ({ pos: degToPos(p.deg), node: p.machine, index }));
const ARCS = ringArcs(RING_POINTS);
const ARC_LINES = Object.fromEntries(MACHINES.map((m) => [m, ARCS.filter((a) => a.node === m).flatMap((a) => arcSegments(a.from, a.to, CX, CY, R))])) as Record<Machine, ReturnType<typeof arcSegments>>;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const r2 = (v: number) => Math.round(v * 100) / 100;
const onRing = (deg: number, radius: number) => ringPoint(degToPos(deg), CX, CY, radius);

/** A point on the quadratic curve under the cards from one card to another. */
function flightPoint(from: number, to: number, u: number): { x: number; y: number } {
  const x0 = cardCx(from);
  const x1 = cardCx(to);
  const cy = CARD_BOTTOM + 34;
  const v = 1 - u;
  return { x: r2(v * v * x0 + 2 * v * u * ((x0 + x1) / 2) + u * u * x1), y: r2(v * v * CARD_BOTTOM + 2 * v * u * cy + u * u * CARD_BOTTOM) };
}

/** 13.2: drag the key round the ring, tap Write, and see which machines hold the copies. */
export function RingWriteCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const dragging = useRef(false);
  const [key, setKey] = useState(DEFAULT_KEY);
  const [skip, setSkip] = useState(true);
  const [wrote, setWrote] = useState<{ key: number; skip: boolean; id: number } | null>(null);

  const walk = walkFor(key, skip);
  const shown = wrote !== null && wrote.key === key && wrote.skip === skip;
  const verdict = writeVerdict(walk);
  const per = copiesPerMachine(walk);
  const coordinator = walk.copies[0];
  const t = shown ? clock.seconds : 0;

  const keyAt = onRing(key, KEY_R);
  const from = posToAngle(degToPos(key));
  const trail = arcSegments(from, from + (walk.sweep * Math.PI) / 180, CX, CY, TRAIL_R);
  // The walker rides the trail once, as the Write starts.
  const walkU = shown && t < WALK_S ? clamp01(t / WALK_S) : -1;
  const walker = walkU >= 0 ? onRing(key + walk.sweep * walkU, TRAIL_R) : null;

  const follow = (e: PointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(m.inverse());
    setKey(angleToDeg(Math.atan2(q.x - CX, CY - q.y)));
  };
  const onKey = (e: KeyboardEvent) => {
    const next = stepByKey(key, e.key, { min: 0, max: KEY_MAX, step: 1, page: 15 });
    if (next === null) return;
    e.preventDefault();
    setKey(clampKey(next));
  };
  const write = () => {
    setWrote({ key, skip, id: (wrote?.id ?? 0) + 1 });
    clock.restart();
  };

  const flights = shown
    ? walk.copies.slice(1).flatMap((m, i) => {
        const to = MACHINES.indexOf(m);
        const fromIdx = MACHINES.indexOf(coordinator);
        const u = (t - WALK_S - (i + 1) * COPY_GAP) / FLIGHT;
        return to === fromIdx || u <= 0 || u >= 1 ? [] : [{ i, m, at: flightPoint(fromIdx, to, u) }];
      })
    : [];

  const description = `A hash ring with five machines, A to E, owning two points each. The key is at ${key} degrees. ${
    skip ? "Repeated machines are skipped" : "Repeated machines are not skipped"
  }, so the ${COPIES} copies go to ${listMachines(walk.copies)}, which is ${machineCountText(walk)}.${shown ? ` Written: ${verdict.text}.` : " Tap Write to place them."}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>key</b> round the ring, then tap <b>Write</b>. The outlined machine is the coordinator.
        </>
      }
      controls={
        <>
          <BeatButton pressed={skip} onClick={() => setSkip((s) => !s)}>
            Skip repeats
          </BeatButton>
          <BeatActionButton onClick={write}>Write</BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The ring: each machine's arcs in its own colour, cut at the points. */}
          <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={RING_W} className="stroke-muted" />
          {MACHINES.map((m) => (
            <g key={m}>
              {ARC_LINES[m].map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={RING_W} className={COLOURS[m].stroke} />
              ))}
            </g>
          ))}

          {/* The walk: a thin trail from the key, clockwise, to the last point looked at. */}
          {trail.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          ))}

          {/* The points: a dot per point, taken ones outlined, skipped ones faded. */}
          {POINTS.map((p, index) => {
            const step = walk.steps.find((s) => s.index === index);
            const at = onRing(p.deg, R);
            const taken = !!step && step.rank !== null;
            const skipped = !!step && step.rank === null;
            return (
              <g key={`${p.machine}-${p.deg}`}>
                <circle cx={at.x} cy={at.y} r={DOT_R} strokeWidth={taken ? 3 : 2} className={cn(skipped ? "fill-slate-300 dark:fill-slate-600" : COLOURS[p.machine].fill, taken ? TONES.accent.stroke : "stroke-card", "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={at.x} y={at.y + 4.2} textAnchor="middle" className={cn(skipped ? "fill-slate-700 dark:fill-slate-200" : "fill-white dark:fill-slate-950", "text-[12px] font-bold")}>
                  {p.machine}
                </text>
              </g>
            );
          })}

          {/* Inside the ring: 1, 2, 3 for the points that hold a copy, a cross for a skipped repeat. */}
          {walk.steps.map((s) => {
            const at = onRing(s.deg, BADGE_R);
            return (
              <g key={`b${s.index}`}>
                <circle cx={at.x} cy={at.y} r={8.5} strokeWidth={1.5} className={s.rank ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-muted", NEUTRAL.line)} />
                <text x={at.x} y={at.y + 4.2} textAnchor="middle" className={cn(s.rank ? TONES.accent.text : NEUTRAL.mutedText, "text-[12px] font-bold")}>
                  {s.rank ?? "×"}
                </text>
              </g>
            );
          })}
          <text x={CX} y={CY - 2} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
            key at
          </text>
          <text x={CX} y={CY + 20} textAnchor="middle" className={cn(NEUTRAL.text, "text-[20px] font-bold tabular-nums")}>
            {key}
          </text>

          {walker ? <circle cx={walker.x} cy={walker.y} r={5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} /> : null}

          {/* The key you drag: a handle outside the ring, with a big grab area round the whole ring. */}
          <g
            role="slider"
            tabIndex={0}
            aria-label="Key on the ring"
            aria-valuemin={0}
            aria-valuemax={KEY_MAX}
            aria-valuenow={key}
            aria-valuetext={describeKey(key, skip)}
            className="group cursor-grab touch-none outline-none active:cursor-grabbing"
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
            <circle cx={CX} cy={CY} r={R + 14} fill="none" stroke="transparent" strokeWidth={56} pointerEvents="stroke" />
            <circle cx={keyAt.x} cy={keyAt.y} r={16} className={TONES.accent.softFill} />
            <circle cx={keyAt.x} cy={keyAt.y} r={10} strokeWidth={2.5} className={cn("fill-card", TONES.accent.stroke)} />
            <KeyRound x={keyAt.x - 7} y={keyAt.y - 7} width={14} height={14} strokeWidth={2.25} className="fill-none text-blue-700 dark:text-blue-300" aria-hidden />
            <circle cx={keyAt.x} cy={keyAt.y} r={19} strokeWidth={2.5} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
          </g>

          {/* How many different machines hold the key. */}
          <text x={CX} y={314} textAnchor="middle" className={cn(shown ? TONES[verdict.tone].text : NEUTRAL.mutedText, "text-[13px] font-semibold")}>
            {shown ? `${machineCountText(walk)} hold a copy` : "Tap Write to place the copies"}
          </text>

          {/* The machines: points as small dots, and the copy each one holds. */}
          {MACHINES.map((m, i) => {
            const cx = cardCx(i);
            const left = cx - CARD.w / 2;
            const n = per[m];
            const has = shown && n > 0;
            const pts = pointsOf(m);
            const widths = pts.map((d) => 7 + String(d).length * 6.4);
            const total = widths.reduce((a, b) => a + b, 0) + 8 * (pts.length - 1);
            let px = cx - total / 2;
            const isLead = shown && m === coordinator;
            const rank = walk.steps.find((s) => s.rank !== null && s.machine === m)?.rank ?? 0;
            const pill = !has ? null : n > 1 ? { text: `${n} copies`, tone: "warn" as const } : { text: isLead ? "lead" : `copy ${rank}`, tone: "good" as const };
            return (
              <g key={m}>
                {isLead ? <rect x={left - 5} y={CARD.y - 5} width={CARD.w + 10} height={CARD.h + 10} rx={19} strokeWidth={2.5} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                <rect x={left} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={left} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, has ? TONES[pill!.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                <circle cx={left + 17} cy={CARD.y + 17} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={left + 9} y={CARD.y + 9} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={left + 34} y={CARD.y + 22} className={cn(NEUTRAL.text, "text-[14px] font-bold")}>
                  {m}
                </text>
                {pts.map((d, j) => {
                  const x = px;
                  px += widths[j] + 8;
                  return (
                    <g key={d}>
                      <circle cx={x + 3.5} cy={CARD.y + 42} r={3.5} className={COLOURS[m].fill} />
                      <text x={x + 9} y={CARD.y + 46} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                        {d}
                      </text>
                    </g>
                  );
                })}
                {pill ? (
                  <g key={`${wrote?.id}-${m}`} className="animate-in fade-in zoom-in-95 fill-mode-backwards motion-reduce:animate-none" style={{ animationDelay: `${WALK_S + FLIGHT + Math.max(0, walk.copies.indexOf(m)) * COPY_GAP}s`, animationDuration: "400ms" }}>
                    <rect x={left + 7} y={CARD.y + 52} width={CARD.w - 14} height={20} rx={10} className={TONES[pill.tone].softFill} />
                    <text x={cx} y={CARD.y + 66} textAnchor="middle" className={cn(TONES[pill.tone].text, "text-[11.5px] font-semibold")}>
                      {pill.text}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Copies leaving the coordinator, under the cards. */}
          {flights.map((f) => (
            <circle key={f.i} cx={f.at.x} cy={f.at.y} r={5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} />
          ))}

          {shown ? <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} /> : null}
        </svg>
      </div>
    </BeatFrame>
  );
}
