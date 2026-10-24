"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SvgChip, chipWidth } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { withCommas } from "../models/picture-controls";
import {
  DEFAULT_FANOUT,
  DEFAULT_SIZE,
  FANOUTS,
  SIZES,
  dotCount,
  dotOrder,
  gossipValueText,
  gossipVerdict,
  informedAt,
  informedCurve,
  litDots,
  messagesPerNode,
  railFraction,
  railValue,
  roundsToHalf,
  suspicionRounds,
} from "../models/gossip-spread";

const W = 420;
const H = 436;
const PANEL = { x: 12, y: 50, w: 128, h: 150 };
const DOT_PITCH = 15.5;
const CH = { x0: 172, x1: 404, top: 74, base: 176 };
const STATS_Y = 210;
const STATS_H = 52;
const CHIP_Y = 286;
const RAIL_X0 = 118;
const RAIL_X1 = 386;
const RAIL_Y = [338, 390] as const;
/** Rounds the playhead moves in a second, and the rounds it rests at the end. */
const ROUNDS_PER_S = 2.5;
const HOLD_ROUNDS = 3;
const X_MAX_NORMAL = 30;
const X_MAX_SUSPECT = 40;

const r1 = (v: number) => Math.round(v * 10) / 10;

type Point = [number, number];
const pathOf = (points: readonly Point[]) => points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${r1(x)} ${r1(y)}`).join(" ");

/** 12.8 beat 2: drag the cluster size and the fanout, and watch the rounds a piece of news needs. */
export function GossipSpreadCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const beat = useBeatClock(box);
  const [nodes, setNodes] = useState<number>(DEFAULT_SIZE);
  const [fanout, setFanout] = useState<number>(DEFAULT_FANOUT);
  const [suspected, setSuspected] = useState(false);
  const titleId = useId();
  const descId = useId();

  const curve = useMemo(() => informedCurve(nodes, fanout), [nodes, fanout]);
  const rounds = curve.length - 1;
  const half = roundsToHalf(nodes, fanout);
  const total = suspected ? suspicionRounds(nodes, fanout) : rounds;
  const xMax = suspected ? X_MAX_SUSPECT : X_MAX_NORMAL;

  // The playhead walks along the rounds and rests at the end; reduced motion shows the end.
  const head = beat.reduced ? total : Math.min(total, (beat.seconds * ROUNDS_PER_S) % (total + HOLD_ROUNDS));
  const finished = head >= total - 1e-6;
  const verdict = gossipVerdict(nodes, fanout, suspected, finished);

  const falseNow = informedAt(curve, head);
  const correctedNow = suspected && head > half ? informedAt(curve, head - half) : 0;
  const falseDone = falseNow >= nodes - 0.5;
  const correctedDone = suspected && head >= half && correctedNow >= nodes - 0.5;

  // Sample dots: lit in a fixed scattered order, green where the correction has arrived.
  const dots = dotCount(nodes);
  const order = useMemo(() => dotOrder(dots), [dots]);
  const informedDots = litDots(falseNow, nodes, dots, falseDone);
  const correctedDotsLit = suspected && correctedNow >= 1 ? litDots(correctedNow, nodes, dots, correctedDone) : 0;
  const rank = useMemo(() => {
    const out = new Array<number>(dots).fill(0);
    order.forEach((dot, k) => { out[dot] = k; });
    return out;
  }, [order, dots]);
  const rows = Math.ceil(dots / 7);
  const gridTop = 104 - ((rows - 1) * DOT_PITCH) / 2;
  const gridLeft = PANEL.x + PANEL.w / 2 - 3 * DOT_PITCH;

  const px = (round: number) => CH.x0 + (round / xMax) * (CH.x1 - CH.x0);
  const py = (informed: number) => CH.base - (Math.min(informed, nodes) / nodes) * (CH.base - CH.top);
  const curvePoints = (shift: number): Point[] => curve.map((x, r) => [px(r + shift), py(x)] as Point);
  const upTo = (shift: number, c: number): Point[] => {
    const local = c - shift;
    if (local <= 0) return [];
    const pts: Point[] = [];
    for (let r = 0; r <= Math.floor(local); r++) pts.push([px(r + shift), py(curve[Math.min(r, rounds)])]);
    if (local > Math.floor(local)) pts.push([px(c), py(informedAt(curve, local))]);
    return pts;
  };
  const flat = (): Point => [px(xMax), py(nodes)];
  const redFull = [...curvePoints(0), flat()];
  const greenFull = suspected ? [...curvePoints(half), flat()] : [];
  const redDone = upTo(0, head);
  const greenDone = suspected ? upTo(half, head) : [];

  // The end marker: where everyone knows, or where the correction is done.
  const endX = px(total);
  const endLabel = suspected ? `done: ${total}` : `all know: ${total}`;
  const endW = Math.ceil(endLabel.length * 6.6 + 18);
  const pillRight = endX + 6 + endW <= CH.x1 + 4;
  const pillX = pillRight ? endX + 6 : Math.max(CH.x0, endX - 6 - endW);
  const pillY = CH.base - 36;

  const ticks = suspected ? [0, 10, 20, 30, 40] : [0, 10, 20, 30];
  const sampleCaption = nodes <= 49 ? "1 dot = 1 node" : `1 dot ~ ${withCommas(Math.round(nodes / dots))} nodes`;

  const stats = [
    { x: 14, label: "rounds to reach everyone", value: String(rounds) },
    suspected
      ? { x: 212, label: "suspicion time must be above", value: `${total} rounds` }
      : { x: 212, label: "messages per node per round", value: String(messagesPerNode(fanout)) },
  ];

  const rails = [
    { key: "size", y: RAIL_Y[0], name: "Nodes", value: withCommas(nodes), label: "Cluster size, in nodes", ladder: SIZES as readonly number[], log: true, current: nodes, ticks: SIZES.map((v) => ({ v, text: withCommas(v) })), set: setNodes },
    { key: "fanout", y: RAIL_Y[1], name: "Fanout", value: String(fanout), label: "Fanout, nodes told per round", ladder: FANOUTS as readonly number[], log: false, current: fanout, ticks: FANOUTS.map((v) => ({ v, text: String(v) })), set: setFanout },
  ];

  const chipText = "Suspect a healthy node";
  const chipW = chipWidth(chipText);
  const description = suspected
    ? `${withCommas(nodes)} nodes, fanout ${fanout}. A false suspicion reaches half the cluster by round ${half}; the correction then needs ${rounds} more rounds, so the cluster is mixed for about ${total} rounds.`
    : `${withCommas(nodes)} nodes, fanout ${fanout}. News from one node reaches every node in about ${rounds} rounds. ${messagesPerNode(fanout)} messages per node per round.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the <b>two rails</b>, then tap <b>Suspect a healthy node</b> to start a false rumor.</>}>
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* A sample of the cluster: dots light up as the news arrives. */}
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          {Array.from({ length: dots }, (_, i) => {
            const cx = r1(gridLeft + (i % 7) * DOT_PITCH);
            const cy = r1(gridTop + Math.floor(i / 7) * DOT_PITCH);
            const k = rank[i];
            const corrected = suspected && k < correctedDotsLit;
            const informed = k < informedDots;
            const tone = !informed ? "fill-muted-foreground/25" : suspected ? (corrected ? TONES.good.solidFill : TONES.bad.solidFill) : TONES.accent.solidFill;
            return <circle key={i} cx={cx} cy={cy} r={5.2} className={cn("transition-colors duration-200 motion-reduce:transition-none", tone)} />;
          })}
          {suspected ? (
            <g>
              <circle cx={PANEL.x + 16} cy={PANEL.y + PANEL.h - 36} r={4.5} className={TONES.bad.solidFill} />
              <text x={PANEL.x + 28} y={PANEL.y + PANEL.h - 32} className={cn(NEUTRAL.text, "text-[12px]")}>false news</text>
              <circle cx={PANEL.x + 16} cy={PANEL.y + PANEL.h - 15} r={4.5} className={TONES.good.solidFill} />
              <text x={PANEL.x + 28} y={PANEL.y + PANEL.h - 11} className={cn(NEUTRAL.text, "text-[12px]")}>correction</text>
            </g>
          ) : (
            <text x={PANEL.x + PANEL.w / 2} y={PANEL.y + PANEL.h - 12} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>{sampleCaption}</text>
          )}

          {/* The growth curve: share of nodes that know, by round. */}
          <text x={CH.x0} y={PANEL.y + 12} className={cn(NEUTRAL.mutedText, "text-[12px]")}>share who know, by round</text>
          <line x1={CH.x0} x2={CH.x1} y1={CH.base} y2={CH.base} strokeWidth={2} className={NEUTRAL.line} />
          <line x1={CH.x0} x2={CH.x0} y1={CH.top} y2={CH.base} strokeWidth={1.5} className={NEUTRAL.line} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={r1(px(t))} x2={r1(px(t))} y1={CH.base} y2={CH.base + 5} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={r1(px(t))} y={CH.base + 20} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{t}</text>
            </g>
          ))}
          <path d={pathOf(redFull)} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className={suspected ? "stroke-red-600/30 dark:stroke-red-400/30" : "stroke-muted-foreground/40"} />
          {suspected ? <path d={pathOf(greenFull)} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-emerald-600/30 dark:stroke-emerald-400/30" /> : null}
          {redDone.length > 1 ? <path d={pathOf(redDone)} fill="none" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" className={suspected ? TONES.bad.stroke : TONES.accent.stroke} /> : null}
          {greenDone.length > 1 ? <path d={pathOf(greenDone)} fill="none" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" className={TONES.good.stroke} /> : null}
          <circle cx={r1(px(head))} cy={r1(py(falseNow))} r={5.5} strokeWidth={2} className={cn("stroke-card", suspected ? TONES.bad.solidFill : TONES.accent.solidFill)} />
          {suspected && correctedNow > 0 ? <circle cx={r1(px(head))} cy={r1(py(correctedNow))} r={5.5} strokeWidth={2} className={cn("stroke-card", TONES.good.solidFill)} /> : null}
          <line x1={r1(endX)} x2={r1(endX)} y1={CH.top} y2={CH.base} strokeWidth={1.5} strokeDasharray="3 4" className={NEUTRAL.doneStroke} />
          <rect x={r1(pillX)} y={pillY} width={endW} height={24} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={r1(pillX + endW / 2)} y={pillY + 16} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>{endLabel}</text>

          {/* The two numbers that matter. */}
          {stats.map((s) => (
            <g key={s.label}>
              <rect x={s.x} y={STATS_Y} width={194} height={STATS_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={s.x + 12} y={STATS_Y + 19} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{s.label}</text>
              <text x={s.x + 12} y={STATS_Y + 43} className={cn(NEUTRAL.text, "text-[22px] font-bold tabular-nums")}>{s.value}</text>
            </g>
          ))}

          <SvgChip
            x={(W - chipW) / 2}
            y={CHIP_Y}
            text={chipText}
            width={chipW}
            label={suspected ? "Suspect a healthy node, on. Press to turn off" : "Suspect a healthy node"}
            pressed={suspected}
            onPress={() => {
              setSuspected((s) => !s);
              beat.restart();
            }}
          />

          {rails.map((r) => {
            const hx = RAIL_X0 + railFraction(r.ladder, r.current, r.log) * (RAIL_X1 - RAIL_X0);
            const valueText = gossipValueText(r.key === "size" ? r.current : nodes, r.key === "fanout" ? r.current : fanout);
            return (
              <g key={r.key}>
                <text x={8} y={r.y - 2} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>{r.name}</text>
                <text x={8} y={r.y + 15} className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{r.value}</text>
                <RailSlider
                  svgRef={svg}
                  x0={RAIL_X0}
                  x1={RAIL_X1}
                  y={r.y}
                  label={r.label}
                  valueText={valueText}
                  value={r.current}
                  ladder={r.ladder}
                  fromFraction={(f) => railValue(r.ladder, f, r.log)}
                  onChange={(v) => r.set(v)}
                  onGrab={(g) => (g ? beat.freeze() : beat.unfreeze())}
                >
                  <g aria-hidden>
                    <line x1={RAIL_X0} x2={RAIL_X1} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                    <line x1={RAIL_X0} x2={hx} y1={r.y} y2={r.y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                    {r.ticks.map((t) => {
                      const x = RAIL_X0 + railFraction(r.ladder, t.v, r.log) * (RAIL_X1 - RAIL_X0);
                      return (
                        <g key={t.v}>
                          <line x1={x} x2={x} y1={r.y - 9} y2={r.y + 9} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
                          <text x={x} y={r.y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t.text}</text>
                        </g>
                      );
                    })}
                    <circle cx={hx} cy={r.y} r={17} className={TONES.accent.softFill} />
                    <circle cx={hx} cy={r.y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
                    <line x1={hx - 3} x2={hx - 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                    <line x1={hx + 3} x2={hx + 3} y1={r.y - 4.5} y2={r.y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                  </g>
                </RailSlider>
              </g>
            );
          })}
        </svg>
      </div>
    </BeatFrame>
  );
}
