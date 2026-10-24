"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { ladderStep, SliderRail } from "../primitives/picture-slider";
import { SliderZone } from "../primitives/slider-zone";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  cdnLoad,
  DEFAULT_R,
  DEFAULT_T,
  EDGES,
  fetchDotRate,
  formatHit,
  formatPerMinute,
  formatRate,
  formatSeconds,
  R_LADDER,
  R_MAX,
  R_MIN,
  rFraction,
  rFromFraction,
  sourceEdge,
  T_LADDER,
  T_MAX,
  T_MIN,
  tFraction,
  tFromFraction,
} from "../models/cdn-origin";

// 5.7: twenty edges keep a copy of the page for T seconds. Drag the lifetime
// and the traffic each edge gets, and watch the edge hit rate, the origin's
// requests a minute and the oldest page a shopper can see. The shield toggle
// puts one more copy between the edges and the origin.

const W = 420;
const H = 380;
const EDGE_Y = 78;
const ROW2 = 172;
const EDGE_X = [62, 210, 358] as const;
const EDGE_LABELS = ["Edge 1", "Edge 2", "Edge 20"] as const;
const SHOPPER = { x: 62, y: ROW2 };
const SHIELD = { x: 210, y: ROW2 };
const ORIGIN = { x: 358, y: ROW2 };
const RAIL_T = { x0: 34, x1: 386, y: 262 };
const RAIL_R = { x0: 34, x1: 386, y: 334 };
const TRAVEL = 1.3;

const r1 = (v: number) => Math.round(v * 10) / 10;
const hitTone = (h: number): Tone => (h >= 0.99 ? "good" : h >= 0.9 ? "accent" : "warn");

type Pt = { x: number; y: number };

/** Dots that leave a point every 1/rate seconds and take TRAVEL seconds to reach the next. */
function fetchDots(seconds: number, rate: number, from: (n: number) => Pt, to: (n: number) => Pt, tone: Tone) {
  const newest = Math.floor(seconds * rate);
  const inFlight = Math.ceil(rate * TRAVEL) + 1;
  const out = [];
  for (let k = 0; k < inFlight; k++) {
    const n = newest - k;
    if (n < 0) break;
    const p = (seconds - n / rate) / TRAVEL;
    if (p < 0 || p > 1) continue;
    const a = from(n);
    const b = to(n);
    out.push(<circle key={`${tone}-${n}`} cx={r1(a.x + (b.x - a.x) * p)} cy={r1(a.y + (b.y - a.y) * p)} r={5} className={cn(TONES[tone].solidFill, "stroke-card")} strokeWidth={1.5} />);
  }
  return out;
}

export function CdnOriginLoadCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [t, setT] = useState<number>(DEFAULT_T);
  const [r, setR] = useState<number>(DEFAULT_R);
  const [shield, setShield] = useState(false);
  const m = cdnLoad(t, r, shield);
  const seconds = clock.seconds;

  const oldest = formatSeconds(m.oldestSeconds);
  const origin = formatPerMinute(m.originPerMinute);
  const edgeAt = (n: number): Pt => ({ x: EDGE_X[sourceEdge(n)], y: EDGE_Y });
  const edgeRate = fetchDotRate(m.edgeMisses * 60);
  const originRate = fetchDotRate(m.originPerMinute);
  const summary = `${EDGES} edges, each serving ${formatRate(r)} for the page and keeping a copy for ${formatSeconds(t)}${shield ? ", with an origin shield" : ""}. Edge hit rate ${formatHit(m.hitRate)}. The origin gets ${origin}. The oldest page a shopper can see is about ${oldest}. ${m.verdict}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <BeatButton pressed={shield} onClick={() => setShield((v) => !v)}>
          {shield ? "Shield on" : "Shield off"}
        </BeatButton>
      }
      hint={<>Drag the <b>lifetime</b> and the <b>traffic</b> bars, then switch the shield on.</>}
    >
      <div ref={box} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Links. With a shield, the edges ask the shield; without, they ask the origin. */}
          <line x1={SHOPPER.x} x2={EDGE_X[0]} y1={SHOPPER.y} y2={EDGE_Y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {shield ? (
            <>
              {EDGE_X.map((x) => (
                <LinkLine key={x} x1={x} y1={EDGE_Y} x2={SHIELD.x} y2={SHIELD.y} strokeWidth={1.5} />
              ))}
              <LinkLine x1={SHIELD.x} y1={SHIELD.y} x2={ORIGIN.x} y2={ORIGIN.y} strokeWidth={1.5} />
            </>
          ) : (
            EDGE_X.map((x) => <LinkLine key={x} x1={x} y1={EDGE_Y} x2={ORIGIN.x} y2={ORIGIN.y} strokeWidth={1.5} />)
          )}

          {fetchDots(seconds, edgeRate, edgeAt, () => (shield ? SHIELD : ORIGIN), "accent")}
          {shield ? fetchDots(seconds, originRate, () => SHIELD, () => ORIGIN, "warn") : null}

          {EDGE_X.map((x, i) => (
            <SvgNode key={x} x={x} y={EDGE_Y} label={EDGE_LABELS[i]} kind="cdn" status={`${formatHit(m.hitRate)} hits`} statusTone={hitTone(m.hitRate)} />
          ))}
          <SvgNode x={SHOPPER.x} y={SHOPPER.y} label="Shopper" kind="phone" status={`oldest: ${oldest}`} statusTone={shield && t > 300 ? "warn" : undefined} />
          <g opacity={shield ? 1 : 0.5}>
            <SvgNode x={SHIELD.x} y={SHIELD.y} label="Shield" kind="cdn" status={m.shieldHitRate === null ? "off" : `${formatHit(m.shieldHitRate)} hits`} statusTone={m.shieldHitRate === null ? undefined : hitTone(m.shieldHitRate)} />
            {shield ? null : <rect x={SHIELD.x - 56} y={SHIELD.y - 30} width={112} height={60} rx={14} strokeWidth={1.75} strokeDasharray="5 4" className={cn("fill-none", NEUTRAL.doneStroke)} />}
          </g>
          <SvgNode x={ORIGIN.x} y={ORIGIN.y} label="Origin" kind="server" status={origin} statusTone={m.tone} />
          <text x={W - 6} y={ROW2 + 50} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>requests to the origin</text>

          <SliderRail
            x0={RAIL_T.x0}
            x1={RAIL_T.x1}
            y={RAIL_T.y}
            fraction={tFraction(t)}
            marks={[10, 60, 300].map((v) => ({ at: tFraction(v), label: formatSeconds(v) }))}
            ends={["1 s", "1 hour"]}
            caption={`Lifetime: ${formatSeconds(t)}`}
          />
          <SliderRail
            x0={RAIL_R.x0}
            x1={RAIL_R.x1}
            y={RAIL_R.y}
            fraction={rFraction(r)}
            marks={[1, 5, 50].map((v) => ({ at: rFraction(v), label: String(v) }))}
            ends={["0.1 a second", "100 a second"]}
            caption={`Per edge: ${formatRate(r)}`}
          />

          <VerdictBanner width={W} text={m.verdict} tone={m.tone} />
        </svg>

        <SliderZone
          view={{ w: W, h: H }}
          box={{ x: RAIL_T.x0 - 18, y: RAIL_T.y - 22, w: RAIL_T.x1 - RAIL_T.x0 + 36, h: 44 }}
          label="Edge lifetime in seconds"
          valueMin={T_MIN}
          valueMax={T_MAX}
          valueNow={t}
          valueText={`${formatSeconds(t)}. Origin ${origin}, oldest page about ${oldest}. ${m.verdict}`}
          onFraction={(fx) => setT(tFromFraction((RAIL_T.x0 - 18 + fx * (RAIL_T.x1 - RAIL_T.x0 + 36) - RAIL_T.x0) / (RAIL_T.x1 - RAIL_T.x0)))}
          onKey={(key) => {
            const next = ladderStep(T_LADDER, t, key);
            if (next === null) return false;
            setT(next);
            return true;
          }}
        />
        <SliderZone
          view={{ w: W, h: H }}
          box={{ x: RAIL_R.x0 - 18, y: RAIL_R.y - 22, w: RAIL_R.x1 - RAIL_R.x0 + 36, h: 44 }}
          label="Requests a second per edge"
          valueMin={R_MIN}
          valueMax={R_MAX}
          valueNow={r}
          valueText={`${formatRate(r)} per edge. Hit rate ${formatHit(m.hitRate)}, origin ${origin}. ${m.verdict}`}
          onFraction={(fx) => setR(rFromFraction((RAIL_R.x0 - 18 + fx * (RAIL_R.x1 - RAIL_R.x0 + 36) - RAIL_R.x0) / (RAIL_R.x1 - RAIL_R.x0)))}
          onKey={(key) => {
            const next = ladderStep(R_LADDER, r, key);
            if (next === null) return false;
            setR(next);
            return true;
          }}
        />
      </div>
    </BeatFrame>
  );
}
