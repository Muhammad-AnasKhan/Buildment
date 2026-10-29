"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { KeyRound } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatActionButton } from "../primitives/beat-choice";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { HASH_SPACE } from "../models/hash32";
import { withCommas } from "../models/picture-controls";
import {
  DEFAULT_POINTS,
  KEY_COUNT,
  MAX_NODES,
  MIN_NODES,
  NODE_NAMES,
  POINT_LADDER,
  SAMPLE_KEYS,
  START_NODES,
  angleToPos,
  assign,
  busiestOverFair,
  compare,
  idealMove,
  keyHashes,
  modMoveShare,
  moveVerdict,
  nodesOf,
  ownerPoint,
  percentText,
  pointsFromFraction,
  pointsToFraction,
  posToAngle,
  ratioText,
  ringArcs,
  sectorPaths,
  ringPoint,
  spreadVerdict,
} from "./model";
import { useSvgTouchDrag } from "../primitives/svg-touch-drag";

const W = 420;
const H = 462;
const CX = 210;
const CY = 186;
const R = 114;
const RING_W = 16;
const KEY_R = 131;
const RAIN_R = 150;
const HANDLE_R = 10;
const ROW_HALF = 76;
const SWATCH_X = CX - 66;
const NAME_X = CX - 58;
const BX = CX - 10;
const BAR_W = 76;
const BAR_MAX = 2.2;
const FAIR_X = BX + BAR_W / BAR_MAX;
const METER = { x: 146, w: 260, y: 358 };
const RAIL = { x0: 34, x1: 386, y: 422 };
/** Seconds the keys take to move, from the first to the last. */
const FLIGHT = 0.7;
const STAGGER = 0.6;
const SETTLE = FLIGHT + STAGGER;

const NODE_COLOURS = [
  { stroke: "stroke-blue-500 dark:stroke-blue-400", fill: "fill-blue-500 dark:fill-blue-400" },
  { stroke: "stroke-orange-500 dark:stroke-orange-400", fill: "fill-orange-500 dark:fill-orange-400" },
  { stroke: "stroke-violet-500 dark:stroke-violet-400", fill: "fill-violet-500 dark:fill-violet-400" },
  { stroke: "stroke-teal-500 dark:stroke-teal-400", fill: "fill-teal-500 dark:fill-teal-400" },
  { stroke: "stroke-fuchsia-500 dark:stroke-fuchsia-400", fill: "fill-fuchsia-500 dark:fill-fuchsia-400" },
  { stroke: "stroke-sky-500 dark:stroke-sky-400", fill: "fill-sky-500 dark:fill-sky-400" },
  { stroke: "stroke-lime-600 dark:stroke-lime-400", fill: "fill-lime-600 dark:fill-lime-400" },
  { stroke: "stroke-slate-500 dark:stroke-slate-400", fill: "fill-slate-500 dark:fill-slate-400" },
] as const;
const colourOf = (name: string) => NODE_COLOURS[Math.max(0, NODE_NAMES.indexOf(name as (typeof NODE_NAMES)[number]))];

type MoveEvent = { kind: "add" | "remove"; name: string; before: string[]; after: string[]; v: number };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** Room for each node's row: roomy with few nodes, tighter with eight. */
const pitchFor = (count: number) => Math.max(17, Math.min(24, 120 / count));
const rowY = (index: number, count: number) => CY + (index - (count - 1) / 2) * pitchFor(count);

/** 9.3: drag the key round the ring and the points dial, then add or remove a node and watch the keys move. */
export function RingPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const touchRef = useSvgTouchDrag<SVGGElement>();
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [count, setCount] = useState(START_NODES);
  const [v, setV] = useState<number>(DEFAULT_POINTS);
  const [event, setEvent] = useState<MoveEvent | null>(null);
  const [probe, setProbe] = useState(Math.round(HASH_SPACE * 0.3));
  const dragging = useRef(false);

  const nodes = useMemo(() => nodesOf(count), [count]);
  const A = useMemo(() => assign(nodes, v), [nodes, v]);
  const ratio = busiestOverFair(A.counts);
  const before = useMemo(() => (event ? assign(event.before, event.v) : null), [event]);
  const move = useMemo(() => (before ? compare(before, A) : null), [before, A]);
  const ideal = event ? idealMove(event.kind, event.before.length) : 0;
  const modShare = useMemo(() => (event ? modMoveShare(event.before.length, event.after.length) : 0), [event]);
  const verdict: { text: string; tone: Tone } = event && move ? moveVerdict(event.kind, event.name, move.share, ideal) : spreadVerdict(ratio);

  const sectors = useMemo(() => sectorPaths(ringArcs(A.points), CX, CY, R), [A]);
  const ghost = useMemo(() => {
    if (!event || event.kind !== "remove" || !before) return [];
    return sectorPaths(ringArcs(before.points).filter((a) => a.node === event.name), CX, CY, R);
  }, [event, before]);

  const t = event ? clock.seconds : 1e6;
  const u = event ? smooth(t / SETTLE) : 1;
  const hs = keyHashes();
  const owner = ownerPoint(A.points, probe).node;
  const ownerIdx = nodes.indexOf(owner);
  const probeAt = ringPoint(probe, CX, CY, KEY_R);
  const ownerPt = ownerPoint(A.points, probe);
  const probeDeg = Math.round((posToAngle(probe) * 180) / Math.PI) % 360;
  const linkFrom = posToAngle(probe);
  const linkTo = linkFrom + (((ownerPt.pos - probe) % HASH_SPACE) + HASH_SPACE) % HASH_SPACE / HASH_SPACE * Math.PI * 2;
  const link = sectorPaths(
    linkTo > Math.PI * 2
      ? [{ node: owner, from: linkFrom, to: Math.PI * 2 }, { node: owner, from: 0, to: linkTo - Math.PI * 2 }]
      : [{ node: owner, from: linkFrom, to: linkTo }],
    CX,
    CY,
    R + RING_W / 2 + 4.5
  );

  // Keys that moved: each leaves the old owner's bar at its own moment and lands on the new one's.
  const movers = useMemo(() => {
    if (!event || !before || !move) return [];
    return move.movedSamples.map((k, i, all) => ({ k, from: before.owners[k], to: A.owners[k], delay: (i / Math.max(1, all.length)) * STAGGER }));
  }, [event, before, move, A]);
  const moverOf = new Map(movers.map((m) => [m.k, m]));
  const layoutBefore = event ? event.before : nodes;
  const endY = (name: string, list: readonly string[]) => rowY(list.indexOf(name), list.length);

  const shownFill = (name: string, i: number) => {
    const after = A.counts[i];
    const was = event && before ? (before.nodes.includes(name) ? before.counts[before.nodes.indexOf(name)] : 0) : after;
    return (was + (after - was) * u) / (KEY_COUNT / nodes.length);
  };

  const summary = `A hash ring with ${nodes.length} nodes and ${v} point${v === 1 ? "" : "s"} each. The busiest node holds ${ratioText(ratio)} times its fair share of the ${withCommas(KEY_COUNT)} keys. ${
    event && move ? `After ${event.kind === "add" ? "adding" : "removing"} ${event.name}, ${percentText(move.share)} of keys changed owner; a perfect ring would move ${percentText(ideal)}, and hash mod N would move ${percentText(modShare)}. ` : ""
  }The key on the ring is at ${probeDeg} degrees and belongs to ${owner}.`;

  // Pointer to position: the angle round the ring's centre.
  const follow = (e: PointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(m.inverse());
    setProbe(angleToPos(Math.atan2(q.x - CX, CY - q.y)));
  };
  const probeKey = (e: KeyboardEvent) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 15, PageDown: -15 };
    let next: number | null = null;
    if (e.key in step) next = angleToPos(((probeDeg + step[e.key]) * Math.PI) / 180);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = angleToPos((359 * Math.PI) / 180);
    if (next === null) return;
    e.preventDefault();
    setProbe(next);
  };

  const changePoints = (value: number) => {
    if (value === v) return;
    setV(value);
    setEvent(null);
  };
  const addNode = () => {
    if (count >= MAX_NODES) return;
    const list = nodesOf(count + 1);
    setEvent({ kind: "add", name: NODE_NAMES[count], before: nodes, after: list, v });
    setCount(count + 1);
    clock.restart();
  };
  const removeNode = () => {
    if (count <= MIN_NODES) return;
    const list = nodesOf(count - 1);
    setEvent({ kind: "remove", name: NODE_NAMES[count - 1], before: nodes, after: list, v });
    setCount(count - 1);
    clock.restart();
  };

  const rowTop = rowY(0, nodes.length);
  const rowBottom = rowY(nodes.length - 1, nodes.length);
  const rain = clock.reduced ? [] : Array.from({ length: 7 }, (_, j) => {
    const phase = clock.seconds / 0.95 + j / 7;
    const cycle = Math.floor(phase);
    const k = SAMPLE_KEYS[(cycle * 13 + j * 29 + 7) % SAMPLE_KEYS.length];
    return { j, k, f: phase - cycle };
  });

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>key</b> round the ring and the <b>dial</b> under it. Then add or remove a node.
        </>
      }
      controls={
        <>
          <BeatActionButton onClick={addNode} disabled={count >= MAX_NODES}>
            Add node
          </BeatActionButton>
          <BeatActionButton onClick={removeNode} disabled={count <= MIN_NODES}>
            Remove node
          </BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {/* The ring: one colour per node, cut into arcs at the points. */}
          <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={RING_W} className="stroke-muted" />
          {sectors.map((s) => (
            <path key={s.key} d={s.d} fill="none" strokeWidth={RING_W} className={colourOf(s.node).stroke} />
          ))}
          {event && event.kind === "add"
            ? sectors.filter((s) => s.node === event.name).map((s) => <path key={`glow-${s.key}`} d={s.d} fill="none" strokeWidth={RING_W + 9} opacity={0.5 * (1 - clamp01(t / 1.1))} className={colourOf(s.node).stroke} pointerEvents="none" />)
            : null}
          {ghost.map((s) => (
            <path key={`ghost-${s.key}`} d={s.d} fill="none" strokeWidth={RING_W + 9} opacity={0.55 * (1 - clamp01(t / 0.9))} className={colourOf(s.node).stroke} pointerEvents="none" />
          ))}
          {/* The points themselves, while there are few enough to tell apart. */}
          {A.points.length <= 40
            ? A.points.map((p) => {
                const at = ringPoint(p.pos, CX, CY, R);
                const fresh = event?.kind === "add" && p.node === event.name;
                const scale = fresh ? smooth((t - 0.1) / 0.45) : 1;
                return <circle key={`${p.node}-${p.index}`} cx={at.x} cy={at.y} r={5.2 * scale} strokeWidth={2.2} className={cn(colourOf(p.node).fill, "stroke-card")} />;
              })
            : null}

          {/* Keys landing on the ring: where they land follows the arcs, so a big arc catches more of them. */}
          {rain.map(({ j, k, f }) => {
            const a = posToAngle(hs[k]);
            const rr = RAIN_R - (RAIN_R - (R + RING_W / 2 + 3)) * f;
            return <circle key={j} cx={CX + rr * Math.sin(a)} cy={CY - rr * Math.cos(a)} r={2.6} opacity={Math.sin(Math.PI * f)} className={colourOf(A.owners[k]).fill} />;
          })}

          {/* The key: an arc from it clockwise to the point that owns it. */}
          {link.map((s) => (
            <path key={s.key} d={s.d} fill="none" strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          ))}
          <circle cx={ringPoint(ownerPt.pos, CX, CY, R).x} cy={ringPoint(ownerPt.pos, CX, CY, R).y} r={8} strokeWidth={3} className={cn("fill-card", TONES.accent.stroke)} />

          {/* Sample keys round the outside, in the colour of their owner. */}
          {SAMPLE_KEYS.map((k) => {
            const at = ringPoint(hs[k], CX, CY, KEY_R);
            const m = moverOf.get(k);
            const landed = m ? t >= m.delay + FLIGHT : true;
            const owned = m && !landed ? m.from : A.owners[k];
            const since = m ? t - (m.delay + FLIGHT) : 9;
            const halo = since >= 0 && since < 0.5 ? since / 0.5 : -1;
            const pop = m && since >= 0 && since < 0.3 ? 1 + 0.9 * Math.sin((since / 0.3) * Math.PI) : 1;
            return (
              <g key={k}>
                {halo >= 0 ? <circle cx={at.x} cy={at.y} r={3 + 9 * halo} strokeWidth={2} opacity={1 - halo} className={cn("fill-none", colourOf(A.owners[k]).stroke)} /> : null}
                <circle cx={at.x} cy={at.y} r={2 * pop} className={colourOf(owned).fill} />
              </g>
            );
          })}

          {/* The key you drag: a handle on the ring, with a big grab area round the whole ring. */}
          <g ref={touchRef}
            role="slider"
            tabIndex={0}
            aria-label="Key on the ring"
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={probeDeg}
            aria-valuetext={`key at ${probeDeg} degrees, it belongs to ${owner}`}
            className="group cursor-grab touch-none outline-none active:cursor-grabbing"
            onKeyDown={probeKey}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              clock.freeze();
              follow(e);
            }}
            onPointerMove={(e) => dragging.current && follow(e)}
            onPointerUp={() => {
              dragging.current = false;
              clock.unfreeze();
            }}
            onPointerCancel={() => {
              dragging.current = false;
              clock.unfreeze();
            }}
          >
            <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="transparent" strokeWidth={46} pointerEvents="stroke" />
            <circle cx={probeAt.x} cy={probeAt.y} r={HANDLE_R + 6} className={TONES.accent.softFill} />
            <circle cx={probeAt.x} cy={probeAt.y} r={HANDLE_R} strokeWidth={2.5} className={cn("fill-card", TONES.accent.stroke)} />
            <KeyRound x={probeAt.x - 7} y={probeAt.y - 7} width={14} height={14} strokeWidth={2.25} className="fill-none text-blue-700 dark:text-blue-300" aria-hidden />
            <circle cx={probeAt.x} cy={probeAt.y} r={HANDLE_R + 8} strokeWidth={2.5} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
          </g>

          {/* Inside the ring: one bar per node against the fair share. */}
          <text x={FAIR_X} y={rowTop - 15} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
            fair share
          </text>
          <line x1={FAIR_X} x2={FAIR_X} y1={rowTop - 10} y2={rowBottom + 10} strokeWidth={1.6} strokeDasharray="3 3" className="stroke-foreground" />
          {nodes.map((n, i) => {
            const y = rowY(i, nodes.length);
            const w = Math.min(BAR_W, (shownFill(n, i) / BAR_MAX) * BAR_W);
            return (
              <g key={n} transform={`translate(0 ${y})`}>
                {i === ownerIdx ? <rect x={CX - ROW_HALF} y={-8.5} width={ROW_HALF * 2} height={17} rx={8.5} strokeWidth={2} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                <circle cx={SWATCH_X} cy={0} r={4.5} className={colourOf(n).fill} />
                <text x={NAME_X} y={4.3} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
                  {n}
                </text>
                <rect x={BX} y={-4.5} width={BAR_W} height={9} rx={4.5} className="fill-muted" />
                <rect x={BX} y={-4.5} width={Math.max(0, w)} height={9} rx={4.5} className={colourOf(n).fill} />
              </g>
            );
          })}
          {event?.kind === "remove" && t < SETTLE + 0.3
            ? (() => {
                const gy = endY(event.name, layoutBefore);
                const was = before ? before.counts[before.nodes.indexOf(event.name)] / (KEY_COUNT / before.nodes.length) : 0;
                return <rect x={BX} y={gy - 4.5} width={Math.max(0, Math.min(BAR_W, (was / BAR_MAX) * BAR_W) * (1 - u))} height={9} rx={4.5} className={colourOf(event.name).fill} />;
              })()
            : null}

          {/* Keys in flight between the bars: out of the old owner, into the new one. */}
          {event
            ? movers.map((m) => {
                const f = clamp01((t - m.delay) / FLIGHT);
                if (f <= 0 || f >= 1) return null;
                const e = smooth(f);
                const y0 = nodes.includes(m.from) ? endY(m.from, nodes) : endY(m.from, layoutBefore);
                const y1 = endY(m.to, nodes);
                return <circle key={m.k} cx={BX + 6 + 18 * Math.sin(Math.PI * e)} cy={y0 + (y1 - y0) * e} r={3.2} strokeWidth={1.2} className={cn(colourOf(m.to).fill, "stroke-card")} />;
              })
            : null}

          {/* How much moved, against what a perfect ring would move and what hash mod N would. */}
          <rect x={14} y={METER.y - 13} width={118} height={26} rx={13} className="fill-card" />
          <rect x={14} y={METER.y - 13} width={118} height={26} rx={13} strokeWidth={1.5} className={cn(event && move ? TONES[verdict.tone].softFill : "fill-muted", event && move ? TONES[verdict.tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={73} y={METER.y + 4.6} textAnchor="middle" className={cn(event && move ? TONES[verdict.tone].text : NEUTRAL.mutedText, "text-[12.5px] font-bold tabular-nums")}>
            {event && move ? `moved ${percentText(move.share)}` : "moved: none yet"}
          </text>
          {event && move ? (
            <g>
              <rect x={METER.x} y={METER.y - 5} width={METER.w} height={10} rx={5} className="fill-muted" />
              <rect x={METER.x} y={METER.y - 5} width={Math.max(2, move.share * METER.w)} height={10} rx={5} className={TONES[verdict.tone].solidFill} />
              <line x1={METER.x + ideal * METER.w} x2={METER.x + ideal * METER.w} y1={METER.y - 13} y2={METER.y + 13} strokeWidth={2} strokeDasharray="3 2.5" className={TONES.accent.stroke} />
              <text x={METER.x + ideal * METER.w} y={METER.y - 17} textAnchor="middle" className={cn(TONES.accent.text, "text-[11.5px] font-semibold")}>
                ideal {percentText(ideal).replace(".0%", "%")}
              </text>
              <line x1={METER.x + modShare * METER.w} x2={METER.x + modShare * METER.w} y1={METER.y - 13} y2={METER.y + 13} strokeWidth={2.5} className="stroke-muted-foreground" />
              <text x={Math.min(METER.x + modShare * METER.w, 354)} y={METER.y - 17} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>
                hash mod N: {percentText(modShare).replace(".0%", "%")}
              </text>
              <text x={METER.x + METER.w} y={METER.y + 28} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {withCommas(move.moved)} of {withCommas(KEY_COUNT)} keys changed owner
              </text>
            </g>
          ) : (
            <text x={METER.x} y={METER.y + 4.5} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
              Tap Add node or Remove node
            </text>
          )}

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Points per node"
            valueText={`${v} point${v === 1 ? "" : "s"} per node, busiest node ${ratioText(ratio)} times its share`}
            value={v}
            ladder={POINT_LADDER}
            fromFraction={pointsFromFraction}
            onChange={changePoints}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={pointsToFraction(v)}
              marks={POINT_LADDER.map((p) => ({ at: pointsToFraction(p), label: String(p) }))}
              ends={["few", "many"]}
              caption={`${v} point${v === 1 ? "" : "s"} per node`}
            />
          </RailSlider>
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
