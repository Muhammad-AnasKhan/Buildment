"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  AXIS_MS,
  clampK,
  confirmOutcome,
  confirmVerdict,
  cursorMs,
  DEFAULT_K,
  FOLLOWERS,
  K_LADDER,
  msText,
  trip,
  type FollowerId,
} from "./model";

const W = 420;
const H = 414;
const CARD_X = 60;
const ROW: Record<"leader" | FollowerId, number> = { leader: 96, west: 176, eu: 256 };
const X = (ms: number) => 128 + ms * 3.05;
const RAIL = { x0: 34, x1: 386, y: 372 };
const TICKS = [0, 20, 40, 60, 80];
const r1 = (v: number) => Math.round(v * 10) / 10;

/** The point a fraction p of the way along a line. */
const along = (x0: number, y0: number, x1: number, y1: number, p: number) => ({ x: r1(x0 + (x1 - x0) * p), y: r1(y0 + (y1 - y0) * p) });

/** Beat 3 of 8.3: how many followers must confirm before the leader says OK. */
export function ConfirmCountCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [k, setK] = useState<number>(DEFAULT_K);
  const [westOn, setWestOn] = useState(true);
  const o = confirmOutcome(k, westOn);
  const v = confirmVerdict(o);
  const c = cursorMs(clock.seconds);
  const okMs = o.writeMs;
  const okShown = okMs !== null && c >= okMs;

  const change = (next: number) => {
    const nk = clampK(next);
    if (nk !== k) {
      setK(nk);
      clock.restart();
    }
  };
  const flipWest = () => {
    setWestOn((on) => !on);
    clock.restart();
  };

  const summary =
    o.stalled
      ? `The leader needs ${o.k} followers to confirm but only ${o.live.length} is switched on, so writes are stuck.`
      : `The leader waits for ${o.k} ${o.k === 1 ? "follower" : "followers"}. A write takes ${msText(o.writeMs ?? 0)} and exists on ${o.copies} ${o.copies === 1 ? "machine" : "machines"} when the client hears OK. ${o.atRisk > 0 ? `${o.atRisk} writes are at risk if the leader crashes.` : "No acknowledged write is lost if the leader crashes."}`;

  const barEnd = o.stalled ? c : Math.min(c, okMs ?? 0);
  const barWidth = Math.max(2, X(barEnd) - X(0));

  const copyLine = (id: FollowerId) => {
    const t = trip(id);
    const live = o.live.includes(id);
    const waited = o.waitedFor.includes(id);
    const y = ROW[id];
    const apex = { x: X(t.arrive), y };
    const start = { x: X(t.out), y: ROW.leader };
    const end = { x: X(t.back), y: ROW.leader };
    const outP = (c - t.out) / (t.arrive - t.out);
    const backP = (c - t.arrive) / (t.back - t.arrive);
    return (
      <g key={`copy-${id}`}>
        <line x1={start.x} y1={start.y} x2={apex.x} y2={apex.y} strokeWidth={2} strokeLinecap="round" strokeDasharray={live ? undefined : "4 4"} className={live ? TONES.accent.stroke : NEUTRAL.faintStroke} />
        {live ? (
          <>
            <line x1={apex.x} y1={apex.y} x2={end.x} y2={end.y} strokeWidth={2} strokeLinecap="round" className={waited ? TONES.good.stroke : NEUTRAL.faintStroke} />
            <circle cx={end.x} cy={end.y} r={5} strokeWidth={2} className={cn(waited ? cn(TONES.good.solidFill, TONES.good.stroke) : cn(NEUTRAL.surface, NEUTRAL.faintStroke))} />
            {outP > 0 && outP < 1 ? <circle {...pt(along(start.x, start.y, apex.x, apex.y, outP))} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} /> : null}
            {backP > 0 && backP < 1 ? <circle {...pt(along(apex.x, apex.y, end.x, end.y, backP))} r={5} className={cn(waited ? TONES.good.solidFill : NEUTRAL.faintFill, "stroke-card")} strokeWidth={1.5} /> : null}
          </>
        ) : (
          <g className={TONES.bad.stroke} strokeWidth={2.5} strokeLinecap="round" fill="none">
            <line x1={apex.x - 5} y1={apex.y - 5} x2={apex.x + 5} y2={apex.y + 5} />
            <line x1={apex.x - 5} y1={apex.y + 5} x2={apex.x + 5} y2={apex.y - 5} />
          </g>
        )}
      </g>
    );
  };

  const token = (id: "leader" | FollowerId, cx: number, letter: string) => {
    const on = id === "leader" ? okShown : okShown && o.waitedFor.includes(id);
    const off = id !== "leader" && !o.live.includes(id);
    return (
      <g key={`token-${id}`}>
        <circle cx={cx} cy={316} r={13} strokeWidth={1.5} strokeDasharray={on ? undefined : "3 3"} className={cn(SHAPE_TRANSITION, on ? cn(TONES.good.softFill, TONES.good.stroke) : cn(NEUTRAL.surface, off ? TONES.bad.stroke : NEUTRAL.line))} />
        <text x={cx} y={320.5} textAnchor="middle" className={cn("text-[12px] font-bold", on ? TONES.good.text : NEUTRAL.mutedText)}>{letter}</text>
      </g>
    );
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint="Drag the OK marker; switch off West."
      controls={
        <BeatButton pressed={westOn} onClick={flipWest}>
          West follower: {westOn ? "on" : "off"}
        </BeatButton>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} tone={v.tone} text={v.text} />

          {/* Time axis, in milliseconds after the client sends the write. */}
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={63} y2={69} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={X(t)} y={57} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t === 80 ? "80 ms" : t}</text>
            </g>
          ))}
          {(["leader", "west", "eu"] as const).map((id) => (
            <line key={`row-${id}`} x1={X(0)} x2={X(AXIS_MS)} y1={ROW[id]} y2={ROW[id]} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          ))}

          <SvgNode x={CARD_X} y={ROW.leader} label="Leader" kind="database" status="disk 0.3 ms" />
          {(["west", "eu"] as const).map((id) => {
            const live = o.live.includes(id);
            return (
              <g key={`node-${id}`} opacity={live ? 1 : 0.5}>
                <SvgNode x={CARD_X} y={ROW[id]} label={FOLLOWERS[id].label} kind="database" status={live ? `${FOLLOWERS[id].rttMs} ms away` : "switched off"} statusTone={live ? undefined : "bad"} />
              </g>
            );
          })}

          {/* How long the client waits. */}
          <rect x={X(0)} y={91} width={r1(barWidth)} height={10} rx={5} strokeWidth={1.5} className={cn(o.stalled ? TONES.bad.softFill : TONES.accent.softFill, o.stalled ? TONES.bad.stroke : TONES.accent.stroke)} />
          <text x={X(0)} y={80} className={cn(o.stalled ? TONES.bad.text : TONES.accent.text, "text-[12.5px] font-semibold tabular-nums")}>
            {o.stalled ? "client waits, no OK comes" : `client waits ${msText(o.writeMs ?? 0)}`}
          </text>
          {!o.stalled ? (
            <text x={408} y={80} textAnchor="end" className={cn(o.atRisk > 0 ? TONES.warn.text : TONES.good.text, "text-[12.5px] font-semibold tabular-nums")}>
              {o.atRisk} writes at risk
            </text>
          ) : null}

          {copyLine("west")}
          {copyLine("eu")}

          {okShown && okMs !== null ? (
            <g>
              <circle cx={X(okMs)} cy={ROW.leader} r={10} strokeWidth={2} className={cn(TONES.good.solidFill, "stroke-card")} />
              <text x={X(okMs)} y={ROW.leader + 4} textAnchor="middle" className="fill-white text-[11.5px] font-bold dark:fill-emerald-950">OK</text>
            </g>
          ) : null}

          {/* Copies the leader knows about when it says OK. */}
          <text x={10} y={320.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Copies at OK</text>
          {token("leader", 134, "L")}
          {token("west", 168, "W")}
          {token("eu", 202, "E")}
          <text x={226} y={320.5} className={cn(o.stalled ? TONES.bad.text : TONES.good.text, "text-[13px] font-bold tabular-nums")}>
            {o.stalled ? "none" : `${o.copies} ${o.copies === 1 ? "copy" : "copies"}`}
          </text>

          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Followers that must confirm before OK"
            valueText={`${o.k} ${o.k === 1 ? "follower" : "followers"} must confirm. ${v.text}`}
            value={o.k}
            ladder={K_LADDER}
            fromFraction={(f) => clampK(f * 2)}
            onChange={change}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          >
            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={o.k / 2}
              marks={[{ at: 0, label: "0" }, { at: 0.5, label: "1" }, { at: 1, label: "2" }]}
              ends={["", ""]}
              caption="followers that must confirm"
            />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}

function pt(p: { x: number; y: number }) {
  return { cx: p.x, cy: p.y };
}
