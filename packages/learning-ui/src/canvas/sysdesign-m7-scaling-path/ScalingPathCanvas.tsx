"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgChip } from "../primitives/svg-chip";
import { NODE_H, NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BIG_CAPACITY,
  CACHE_HIT,
  CAPACITY,
  DEFAULT_CONFIG,
  GOAL_TRAFFIC,
  TRAFFIC_LADDER,
  describeConfig,
  load,
  nextPartitions,
  nextReplicas,
  status,
  statusText,
  trafficFromFraction,
  trafficToFraction,
  verdict,
  withCommas,
  type Config,
} from "../models/db-scaling";

// 7.6: drag the traffic up and watch which part is full. Add the step that
// takes load off that part: an index, a cache, read replicas, partitions, a
// bigger machine, and (with the search box) a search index. Numbers are made up.

const W = 420;
const H = 356;
const ROW1 = 168;
const ROW2 = 252;
const COLS = { left: 64, mid: 210, right: 356 } as const;
const CHIP_A = 58;
const CHIP_B = 94;
const RAIL = { x0: 34, x1: 386, y: 322 };
const DOT_SPEED = 46;

type Pt = { x: number; y: number };
type Flow = { id: string; a: Pt; b: Pt; share: number; dashed?: boolean; hot?: boolean };

const f1 = (cx: number) => ({ left: cx - NODE_W / 2, right: cx + NODE_W / 2 });

function FlowLine({ flow, seconds, still, density }: { flow: Flow; seconds: number; still: boolean; density: number }) {
  const { a, b } = flow;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const count = flow.share > 0 ? Math.max(1, Math.round(6 * flow.share * density)) : 0;
  const head = `${b.x},${b.y} ${b.x - ux * 8 - uy * 4},${b.y - uy * 8 + ux * 4} ${b.x - ux * 8 + uy * 4},${b.y - uy * 8 - ux * 4}`;
  const dotClass = flow.hot ? TONES.bad.solidFill : TONES.accent.solidFill;
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={2} strokeDasharray={flow.dashed ? "4 4" : undefined} className={NEUTRAL.faintStroke} />
      <polygon points={head} className={NEUTRAL.faintFill} />
      {Array.from({ length: count }, (_, i) => {
        const phase = still ? (i + 0.5) / count : ((seconds * DOT_SPEED) / len + i / count) % 1;
        return <circle key={i} cx={a.x + (b.x - a.x) * phase} cy={a.y + (b.y - a.y) * phase} r={3.6} className={dotClass} />;
      })}
    </g>
  );
}

function Ghost({ cx, cy, title, sub }: { cx: number; cy: number; title: string; sub: string }) {
  return (
    <g>
      <rect x={cx - NODE_W / 2} y={cy - NODE_H / 2} width={NODE_W} height={NODE_H} rx={14} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-card", NEUTRAL.faintStroke)} />
      <text x={cx} y={cy - 2} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>{title}</text>
      <text x={cx} y={cy + 15} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{sub}</text>
    </g>
  );
}

export function ScalingPathCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG);
  const set = (patch: Partial<Config>) => setCfg((c) => ({ ...c, ...patch }));

  const l = load(cfg);
  const v = verdict(cfg, l);
  const p = cfg.partitions;
  const n = cfg.replicas;
  const prim = status(l.primaryUtil);
  const rep = l.replicaUtil === null ? null : status(l.replicaUtil);
  const srch = l.searchStoreUtil === null ? null : status(l.searchStoreUtil);
  const density = Math.max(0.2, Math.min(1, Math.log10(cfg.traffic / 500) / 2 + 0.2));
  const searchStoreOn = cfg.scenario && cfg.searchIndex;
  const searchOnDb = cfg.scenario && !cfg.searchIndex;

  // Where the requests flow.
  const app = { x: COLS.mid, y: ROW1 };
  const cache = { x: COLS.left, y: ROW1 };
  const primary = { x: COLS.mid, y: ROW2 };
  const replicas = { x: COLS.left, y: ROW2 };
  const search = { x: COLS.right, y: ROW1 };
  const flows: Flow[] = [];
  const plainShare = (l.reads - l.searches) / cfg.traffic;
  const writeShare = l.writes / cfg.traffic;
  const dbShare = (l.dbReads + l.dbSearches) / cfg.traffic;
  const primaryHot = l.primaryUtil > 1;
  const replicaHot = (l.replicaUtil ?? 0) > 1;
  if (cfg.cache) {
    flows.push({ id: "app-cache", a: { x: f1(app.x).left, y: app.y }, b: { x: f1(cache.x).right, y: cache.y }, share: plainShare });
    flows.push(
      n > 0
        ? { id: "cache-replicas", a: { x: cache.x, y: cache.y + NODE_H / 2 }, b: { x: replicas.x, y: replicas.y - NODE_H / 2 }, share: dbShare, hot: replicaHot }
        : { id: "cache-primary", a: { x: cache.x + 18, y: cache.y + NODE_H / 2 }, b: { x: f1(primary.x).left + 14, y: primary.y - NODE_H / 2 }, share: dbShare, hot: primaryHot }
    );
  } else {
    flows.push(
      n > 0
        ? { id: "app-replicas", a: { x: app.x - 30, y: app.y + NODE_H / 2 }, b: { x: replicas.x + 30, y: replicas.y - NODE_H / 2 }, share: dbShare, hot: replicaHot }
        : { id: "app-primary-reads", a: { x: app.x + 22, y: app.y + NODE_H / 2 }, b: { x: primary.x + 22, y: primary.y - NODE_H / 2 }, share: dbShare, hot: primaryHot }
    );
  }
  flows.push({ id: "app-primary-writes", a: { x: app.x - 14, y: app.y + NODE_H / 2 }, b: { x: primary.x - 14, y: primary.y - NODE_H / 2 }, share: writeShare, hot: primaryHot });
  if (n > 0) flows.push({ id: "primary-replicas", a: { x: f1(primary.x).left, y: primary.y }, b: { x: f1(replicas.x).right, y: replicas.y }, share: writeShare, dashed: true });
  if (searchStoreOn) flows.push({ id: "app-search", a: { x: f1(app.x).right, y: app.y }, b: { x: f1(search.x).left, y: search.y }, share: l.searches / cfg.traffic });

  const chips = [
    { id: "index", text: "Index", w: 54, pressed: cfg.index, label: cfg.index ? "Index on. Tap to turn off." : "Index off. Tap to turn on.", press: () => set({ index: !cfg.index }) },
    { id: "cache", text: "Cache", w: 58, pressed: cfg.cache, label: cfg.cache ? "Cache on. Tap to turn off." : "Cache off. Tap to turn on.", press: () => set({ cache: !cfg.cache }) },
    { id: "replicas", text: `Replicas: ${n}`, w: 92, pressed: n > 0, label: `Read replicas: ${n}. Tap to change.`, press: () => set({ replicas: nextReplicas(n) }) },
    { id: "partitions", text: `Partitions: ${p}`, w: 104, pressed: p > 1, label: `Partitions: ${p}. Tap to change.`, press: () => set({ partitions: nextPartitions(p) }) },
  ];
  const chipsB = [
    { id: "bigger", text: "Bigger machine", w: 122, pressed: cfg.bigger, label: cfg.bigger ? "Bigger machine on. Tap to turn off." : "Bigger machine off. Tap to turn on.", press: () => set({ bigger: !cfg.bigger }) },
    ...(cfg.scenario ? [{ id: "searchIndex", text: "Search index", w: 108, pressed: cfg.searchIndex, label: cfg.searchIndex ? "Search index on. Tap to turn off." : "Search index off. Tap to turn on.", press: () => set({ searchIndex: !cfg.searchIndex }) }] : []),
  ];
  const place = (list: { w: number }[]) => {
    let x = 12;
    return list.map((c) => {
      const at = x;
      x += c.w + 8;
      return at;
    });
  };
  const xsA = place(chips);
  const xsB = place(chipsB);

  const capacityText = ["each machine handles", `${withCommas(cfg.bigger ? BIG_CAPACITY : CAPACITY)} units a second`];
  const description = `${describeConfig(cfg, l, v)} Cache hit rate ${Math.round(CACHE_HIT * 100)} percent.`;

  const ringFor = (u: number | null) => (u !== null && u > 1 ? ("bad" as const) : undefined);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>traffic</b> up, then tap the step that fixes the red part. Goal: {withCommas(GOAL_TRAFFIC)} requests a second.</>}
      controls={
        <>
          <BeatButton pressed={cfg.scenario} onClick={() => set({ scenario: !cfg.scenario, searchIndex: false })}>Add the search box</BeatButton>
          <BeatButton onClick={() => setCfg({ ...DEFAULT_CONFIG, traffic: cfg.traffic })}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={v.text} tone={v.tone} />

          {/* The steps: tap to add. */}
          {chips.map((c, i) => <SvgChip key={c.id} x={xsA[i]} y={CHIP_A} width={c.w} text={c.text} label={c.label} pressed={c.pressed} onPress={c.press} />)}
          {chipsB.map((c, i) => <SvgChip key={c.id} x={xsB[i]} y={CHIP_B} width={c.w} text={c.text} label={c.label} pressed={c.pressed} onPress={c.press} />)}
          <text x={W - 12} y={CHIP_B + 4.5} textAnchor="end" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{`Cost: ${l.cost} per hour`}</text>

          {/* The architecture. */}
          {flows.map((f) => <FlowLine key={f.id} flow={f} seconds={clock.seconds} still={clock.reduced} density={density} />)}

          <SvgNode x={app.x} y={app.y} label="App" kind="server" status={`${withCommas(cfg.traffic)}/s`} />
          {cfg.cache ? <SvgNode x={cache.x} y={cache.y} label="Cache" kind="cache" status={`${Math.round(CACHE_HIT * 100)}% hits`} statusTone="good" /> : <Ghost cx={cache.x} cy={cache.y} title="Cache" sub="off" />}

          {p > 1 ? (
            <g aria-hidden>
              {[2, 1].map((k) => (
                <rect key={k} x={primary.x - NODE_W / 2 + 5 * k} y={primary.y - NODE_H / 2 - 5 * k} width={NODE_W} height={NODE_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              ))}
            </g>
          ) : null}
          <SvgNode x={primary.x} y={primary.y} label={p > 1 ? `Primary ×${p}` : "Primary"} kind="database" status={statusText(prim)} statusTone={prim.tone} mark={ringFor(l.primaryUtil)} />

          {n > 0 && rep ? (
            <>
              {n > 1 ? (
                <g aria-hidden>
                  {[2, 1].filter((k) => k < n).map((k) => (
                    <rect key={k} x={replicas.x - NODE_W / 2 + 5 * k} y={replicas.y - NODE_H / 2 - 5 * k} width={NODE_W} height={NODE_H} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                  ))}
                </g>
              ) : null}
              <SvgNode x={replicas.x} y={replicas.y} label={n > 1 ? `Replica ×${n}` : "Replica"} kind="database" status={statusText(rep)} statusTone={rep.tone} mark={ringFor(l.replicaUtil)} />
            </>
          ) : (
            <Ghost cx={replicas.x} cy={replicas.y} title="Replicas" sub="none" />
          )}

          {cfg.scenario ? (
            searchStoreOn && srch ? (
              <SvgNode x={search.x} y={search.y} label="Search store" kind="database" status={statusText(srch)} statusTone={srch.tone} />
            ) : (
              <Ghost cx={search.x} cy={search.y} title="Search store" sub="no index" />
            )
          ) : null}

          {searchOnDb ? (
            <>
              <text x={search.x} y={ROW2 - 26} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>searches hit</text>
              <text x={search.x} y={ROW2 - 12} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>the database</text>
            </>
          ) : null}
          {capacityText.map((line, i) => (
            <text key={i} x={search.x} y={ROW2 + 6 + i * 14} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{line}</text>
          ))}

          {/* The traffic: drag along the rail. */}
          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Traffic in requests a second"
            valueText={`${withCommas(cfg.traffic)} requests a second. ${v.text}`}
            value={cfg.traffic}
            ladder={TRAFFIC_LADDER}
            fromFraction={trafficFromFraction}
            onChange={(t) => set({ traffic: t })}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={trafficToFraction(cfg.traffic)}
              marks={TRAFFIC_LADDER.map((t) => ({ at: trafficToFraction(t), label: withCommas(t), ...(t === GOAL_TRAFFIC ? { tone: "warn" as const } : {}) }))}
              ends={["fewer", "more"]}
              caption="requests a second"
            />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}
