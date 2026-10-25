"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { BeatChoice } from "../primitives/beat-choice";
import { PictureSlider, SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { BACKEND_LADDER, backendsFromFraction, backendsToFraction, fanOutFrame, LOAD_PERIOD, type CallFrame, type FanOutFrame } from "../models/fan-out";
import { AREA, backendGrid, PANEL } from "../models/fan-out-layout";
import { askedShards, FAST_MS_STORY, indexTile, searchLoad, searchTally, scatterVerdict, SLOW_MS_STORY, writeCostText, SHARDS, type IndexMode } from "./model";

const W = 420;
const H = 372;
const APP = { x: 104, y: 236 };
const APP_TOP = APP.y - NODE_H / 2;
const PANEL_BOTTOM = PANEL.y + PANEL.h;
const TALLY = { x: 190, y: 198, w: 218, h: 96 };
const TALLY_COLS = 14;
const TALLY_KEEP = TALLY_COLS * 3;
const RAIL = { x0: 34, x1: 386, y: 330 };

const MODES = [
  { id: "local", label: "Local index" },
  { id: "global", label: "Global index" },
] as const;

function appStatus(frame: FanOutFrame, asked: number) {
  if (!frame.ready) return { text: `${frame.backCount} of ${asked} back`, tone: undefined };
  return frame.slowPage
    ? { text: `slow: ${SLOW_MS_STORY} ms`, tone: "bad" as const }
    : { text: `fast: ${FAST_MS_STORY} ms`, tone: "good" as const };
}

/** A shard tile's colours: quiet until asked, blue while it works, green or red once it has answered. */
function tileClass(call: CallFrame | undefined, asked: boolean) {
  if (!call || !asked) return { box: cn(NEUTRAL.surface, NEUTRAL.faintStroke), icon: "stroke-muted-foreground" };
  if (call.slow) {
    return call.back > 0
      ? { box: cn(TONES.bad.solidFill, TONES.bad.stroke), icon: "stroke-white", text: "fill-white" }
      : { box: cn(TONES.bad.softFill, TONES.bad.stroke), icon: TONES.bad.stroke, text: TONES.bad.text };
  }
  return call.back > 0
    ? { box: cn(TONES.good.softFill, TONES.good.stroke), icon: TONES.good.stroke, text: TONES.good.text }
    : { box: cn(TONES.accent.softFill, TONES.accent.stroke), icon: TONES.accent.stroke, text: TONES.accent.text };
}

/** 9.6: drag the shard count and flip between a local and a global index, and watch how often a search is slow. */
export function ScatterPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(ref);
  const [n, setN] = useState<number>(SHARDS.default);
  const [mode, setMode] = useState<IndexMode>("local");
  const [first, setFirst] = useState(0);
  const [tallyFrom, setTallyFrom] = useState(0);
  const [skipped, setSkipped] = useState<number[]>([]);

  // One search every LOAD_PERIOD seconds; reduced motion shows the finished search.
  const cycles = clock.reduced ? 0 : Math.floor(clock.seconds / LOAD_PERIOD);
  const t = clock.reduced ? LOAD_PERIOD : clock.seconds - cycles * LOAD_PERIOD;
  const current = first + cycles;
  const load = useMemo(() => searchLoad(n, mode, current), [n, mode, current]);
  const frame = fanOutFrame(load, t);
  const lastDone = frame.ready ? current : current - 1;
  const tally = useMemo(() => searchTally(n, mode, tallyFrom, lastDone, skipped, TALLY_KEEP), [n, mode, tallyFrom, lastDone, skipped]);
  const total = tally.fast + tally.slow;
  const verdict = scatterVerdict(n, mode);
  const grid = useMemo(() => backendGrid(n), [n]);
  const indexAt = useMemo(() => indexTile(n, APP.x), [n]);
  const asked = askedShards(n, mode);
  const status = appStatus(frame, asked);
  const waiting = !frame.ready;

  const restartTally = () => {
    setTallyFrom(current);
    setSkipped([]);
  };
  const changeN = (v: number) => {
    setN(v);
    restartTally();
  };
  const changeMode = (m: IndexMode) => {
    if (m === mode) return;
    setMode(m);
    restartTally();
  };
  const runSearch = () => {
    if (!frame.ready) setSkipped((s) => [...s, current]);
    setFirst(current + 1);
    clock.restart();
  };

  const tallyText = total === 0 ? "none yet" : `${tally.slow} slow of ${total}`;
  const summary = `${mode === "local" ? `A search asks all ${n} shard${n === 1 ? "" : "s"} and waits for the slowest` : "A search asks one index shard"}. Each shard is slow 1 time in 100, so ${verdict.percent} of searches hit a slow shard. This search: ${frame.ready ? (frame.slowPage ? `slow, ${SLOW_MS_STORY} ms` : `fast, ${FAST_MS_STORY} ms`) : "waiting for replies"}. Searches so far: ${tallyText}. ${writeCostText(mode)}.`;
  const out = frame.calls[0]?.out ?? 0;
  const pending = waiting && tally.recent.length < TALLY_KEEP;
  const slots = tally.recent.length + (pending ? 1 : 0);
  const wireY = (p: number) => APP_TOP + (PANEL_BOTTOM - APP_TOP) * p;
  const idx = grid.tiles[indexAt];
  const costTone = mode === "global" ? "warn" : null;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag across the picture to change the number of <b>shards</b>, then flip the <b>index</b>.</>}
      controls={
        <>
          <BeatChoice label="Which index answers the search" options={MODES} value={mode} onChange={changeMode} />
          <BeatButton onClick={runSearch}>Run a search</BeatButton>
        </>
      }
    >
      <div ref={ref}>
        <PictureSlider
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          label="Number of shards"
          valueText={`${n} shard${n === 1 ? "" : "s"}, ${verdict.percent} slow`}
          value={n}
          ladder={BACKEND_LADDER}
          fromFraction={backendsFromFraction}
          onChange={changeN}
        >
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
            <title id={titleId}>{title}</title>
            <desc id={descId}>{summary}</desc>
            <DotGrid width={W} height={H} />

            {/* The wire from the search app to the shards: lit while the search waits. */}
            <line
              x1={APP.x}
              x2={APP.x}
              y1={PANEL_BOTTOM}
              y2={APP_TOP}
              strokeWidth={waiting ? 3 : 2}
              strokeLinecap="round"
              className={cn("transition-colors duration-200 motion-reduce:transition-none", waiting ? TONES.accent.stroke : NEUTRAL.faintStroke)}
            />
            {/* Under a global index, one line goes out, to the one index shard. */}
            {mode === "global" && idx ? (
              <line
                x1={APP.x}
                x2={idx.x}
                y1={PANEL_BOTTOM}
                y2={idx.y + grid.h / 2}
                strokeWidth={waiting ? 3 : 2}
                strokeLinecap="round"
                className={cn("transition-colors duration-200 motion-reduce:transition-none", waiting ? TONES.accent.stroke : NEUTRAL.faintStroke)}
              />
            ) : null}
            {waiting && out > 0 && out < 1 ? (
              <g>
                {[0.08, 0.16].map((d, i) => (
                  <circle key={d} cx={APP.x} cy={wireY(Math.max(0, out - d))} r={5.5 - i * 1.5} opacity={0.35 - i * 0.12} className={TONES.accent.solidFill} />
                ))}
                <circle cx={APP.x} cy={wireY(out)} r={6.5} className={TONES.accent.solidFill} />
                <circle cx={APP.x} cy={wireY(out)} r={2.4} className="fill-card" />
              </g>
            ) : null}

            {/* The shards: a card each for a few, a grid of tiles for many. */}
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <text x={AREA.x0} y={PANEL.y + 19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>
              {n} shard{n === 1 ? "" : "s"}
            </text>
            <text x={AREA.x1} y={PANEL.y + 19} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
              {mode === "local" ? "each slow 1 time in 100" : "asks 1 index shard"}
            </text>

            {grid.tiles.map((c, i) => {
              const callAt = mode === "local" ? i : i === indexAt ? 0 : -1;
              const call = callAt >= 0 ? frame.calls[callAt] : undefined;
              // Calls reach the tiles in a wave from the left, so the fan-out reads as motion.
              const askedNow = !!call && call.out >= Math.min(1, 0.15 + 0.85 * c.frac);
              const cls = tileClass(call, askedNow);
              const left = c.x - grid.w / 2;
              const top = c.y - grid.h / 2;
              const slowWaiting = !!call && call.slow && askedNow && call.back <= 0;
              const pulse = slowWaiting && !clock.reduced ? 0.5 + 0.5 * Math.sin(clock.seconds * 8) : 0;
              const replying = !!call && call.back > 0 && call.back < 1 && !clock.reduced;
              const iconSize = grid.card ? 16 : Math.round(grid.w * 0.55);
              const reading = !call || !askedNow ? "" : call.back > 0 ? `${call.slow ? SLOW_MS_STORY : FAST_MS_STORY} ms` : call.slow ? "slow" : "asked";
              const dim = mode === "global" && i !== indexAt;
              return (
                <g key={`b-${i}`} opacity={dim ? 0.55 : 1}>
                  {mode === "global" && i === indexAt ? <rect x={left - 4} y={top - 4} width={grid.w + 8} height={grid.h + 8} rx={9} strokeWidth={2} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                  {slowWaiting ? <rect x={left - 3} y={top - 3} width={grid.w + 6} height={grid.h + 6} rx={8} strokeWidth={1.5} opacity={0.5 + 0.4 * pulse} className={cn("fill-none", TONES.bad.stroke)} /> : null}
                  {replying && call ? (
                    <rect
                      x={left - 5 * call.back}
                      y={top - 5 * call.back}
                      width={grid.w + 10 * call.back}
                      height={grid.h + 10 * call.back}
                      rx={6 + 3 * call.back}
                      strokeWidth={1.5}
                      opacity={1 - call.back}
                      className={cn("fill-none", call.slow ? TONES.bad.stroke : TONES.good.stroke)}
                    />
                  ) : null}
                  <rect x={left} y={top} width={grid.w} height={grid.h} rx={grid.card ? 9 : Math.max(3, grid.w / 6)} strokeWidth={1.5} className={cls.box} />
                  {grid.w >= 26 ? (
                    <Server x={c.x - iconSize / 2} y={grid.card ? top + 6 : c.y - iconSize / 2} width={iconSize} height={iconSize} strokeWidth={2} className={cn("fill-none", cls.icon)} aria-hidden />
                  ) : null}
                  {grid.card ? (
                    <text x={c.x} y={top + grid.h - 8} textAnchor="middle" className={cn(askedNow ? cls.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                      {reading}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <SvgNode x={APP.x} y={APP.y} label="Search app" kind="server" status={status.text} statusTone={status.tone} mark={frame.ready && frame.slowPage ? "bad" : undefined} />

            {/* What a global index costs: every order is written twice. */}
            <rect x={14} y={282} width={168} height={24} rx={12} className="fill-card" />
            <rect x={14} y={282} width={168} height={24} rx={12} strokeWidth={1.5} className={cn(costTone ? TONES[costTone].softFill : "fill-muted", costTone ? TONES[costTone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
            <text x={98} y={298} textAnchor="middle" className={cn(costTone ? TONES[costTone].text : NEUTRAL.mutedText, "text-[12.5px] font-bold")}>
              {writeCostText(mode)}
            </text>

            {/* The tally: every finished search since the shards or the index last changed. */}
            <g>
              <rect x={TALLY.x} y={TALLY.y} width={TALLY.w} height={TALLY.h} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
              <text x={TALLY.x + 12} y={TALLY.y + 19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Searches</text>
              <rect x={TALLY.x + 108} y={TALLY.y + 11} width={9} height={9} rx={2} className={TONES.good.solidFill} />
              <text x={TALLY.x + 121} y={TALLY.y + 19} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>fast</text>
              <rect x={TALLY.x + 156} y={TALLY.y + 11} width={9} height={9} rx={2} className={TONES.bad.solidFill} />
              <text x={TALLY.x + 169} y={TALLY.y + 19} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>slow</text>
              {Array.from({ length: slots }, (_, i) => {
                const x = TALLY.x + 12 + (i % TALLY_COLS) * 14;
                const y = TALLY.y + 30 + Math.floor(i / TALLY_COLS) * 14;
                if (i >= tally.recent.length) {
                  return <rect key="pending" x={x} y={y} width={10} height={10} rx={2.5} strokeWidth={1.5} strokeDasharray="2.5 2" className={cn("fill-none", NEUTRAL.doneStroke)} />;
                }
                return <rect key={i} x={x} y={y} width={10} height={10} rx={2.5} className={tally.recent[i] ? TONES.bad.solidFill : TONES.good.solidFill} />;
              })}
              <text x={TALLY.x + 12} y={TALLY.y + TALLY.h - 10} className={cn(tally.slow > 0 ? TONES.bad.text : NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>
                {tallyText}
              </text>
            </g>

            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={backendsToFraction(n)}
              marks={[{ at: backendsToFraction(10) }, { at: backendsToFraction(20) }, { at: backendsToFraction(50) }]}
              ends={["1", "100"]}
              caption="shards"
            />
            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          </svg>
        </PictureSlider>
      </div>
    </BeatFrame>
  );
}
