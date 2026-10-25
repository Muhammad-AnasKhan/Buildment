"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { PictureSlider, SliderRail } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  BACKEND_LADDER,
  BACKENDS,
  backendsFromFraction,
  backendsToFraction,
  fanOutFrame,
  fanOutVerdict,
  LOAD_PERIOD,
  pageLoad,
  tallyLoads,
  type CallFrame,
  type FanOutFrame,
} from "../models/fan-out";
import { AREA, backendGrid, PANEL } from "../models/fan-out-layout";

const W = 420;
const H = 372;
const APP = { x: 104, y: 236 };
const APP_TOP = APP.y - NODE_H / 2;
const PANEL_BOTTOM = PANEL.y + PANEL.h;
export const TALLY = { x: 190, y: 198, w: 218, h: 96 };
export const TALLY_COLS = 14;
export const TALLY_KEEP = TALLY_COLS * 3;
const RAIL = { x0: 34, x1: 386, y: 330 };

/** Where each backend sits: the centre of its tile in the panel. */
export function backendCells(n: number): { x: number; y: number }[] {
  return backendGrid(n).tiles.map(({ x, y }) => ({ x, y }));
}

function appStatus(frame: FanOutFrame, n: number) {
  if (!frame.ready) return { text: `${frame.backCount} of ${n} back`, tone: undefined };
  return frame.slowPage
    ? { text: `slow: ${frame.pageMs.toLocaleString("en-US")} ms`, tone: "bad" as const }
    : { text: `fast: ${frame.pageMs} ms`, tone: "good" as const };
}

/** A backend tile's colours: quiet until asked, blue while it works, green or red once it has answered. */
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

/** 2.4: drag how many backends one page calls; each is slow 1 time in 100, and the page waits for the slowest. */
export function FanOutPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(ref);
  const [n, setN] = useState<number>(BACKENDS.default);
  const [first, setFirst] = useState(0);
  const [tallyFrom, setTallyFrom] = useState(0);
  const [skipped, setSkipped] = useState<number[]>([]);

  // One page load every LOAD_PERIOD seconds; reduced motion shows the finished load.
  const cycles = clock.reduced ? 0 : Math.floor(clock.seconds / LOAD_PERIOD);
  const t = clock.reduced ? LOAD_PERIOD : clock.seconds - cycles * LOAD_PERIOD;
  const current = first + cycles;
  const load = useMemo(() => pageLoad(n, current), [n, current]);
  const frame = fanOutFrame(load, t);
  const lastDone = frame.ready ? current : current - 1;
  const tally = useMemo(() => tallyLoads(n, tallyFrom, lastDone, skipped, TALLY_KEEP), [n, tallyFrom, lastDone, skipped]);
  const total = tally.fast + tally.slow;
  const verdict = fanOutVerdict(n);
  const grid = useMemo(() => backendGrid(n), [n]);
  const status = appStatus(frame, n);
  const waiting = !frame.ready;

  const changeN = (v: number) => {
    setN(v);
    setTallyFrom(current);
    setSkipped([]);
  };
  const loadNow = () => {
    if (!frame.ready) setSkipped((s) => [...s, current]);
    setFirst(current + 1);
    clock.restart();
  };

  const tallyText = total === 0 ? "none yet" : `${tally.slow} slow of ${total}`;
  const summary = `The page calls ${n} backend${n === 1 ? "" : "s"} at once and waits for all of them. Each is slow 1 time in 100, so ${verdict.percent}% of page loads hit a slow call. This load: ${frame.ready ? (frame.slowPage ? "slow, 1,000 ms" : `fast, ${frame.pageMs} ms`) : "waiting for replies"}. Page loads so far: ${tallyText}.`;
  const out = frame.calls[0]?.out ?? 0;
  const pending = waiting && tally.recent.length < TALLY_KEEP;
  const slots = tally.recent.length + (pending ? 1 : 0);
  const wireY = (p: number) => APP_TOP + (PANEL_BOTTOM - APP_TOP) * p;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag across the picture to change how many <b>backends</b> the page calls.</>}
      controls={<BeatButton onClick={loadNow}>Load the page</BeatButton>}
    >
      <div ref={ref}>
        <PictureSlider
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          label="Backends one page calls"
          valueText={`${n} backend${n === 1 ? "" : "s"}: ${verdict.text}`}
          value={n}
          ladder={BACKEND_LADDER}
          fromFraction={backendsFromFraction}
          onChange={changeN}
        >
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
            <title id={titleId}>{title}</title>
            <desc id={descId}>{summary}</desc>
            <DotGrid width={W} height={H} />

            {/* One wire from the app server to the backends: lit while the page waits. */}
            <line
              x1={APP.x}
              x2={APP.x}
              y1={PANEL_BOTTOM}
              y2={APP_TOP}
              strokeWidth={waiting ? 3 : 2}
              strokeLinecap="round"
              className={cn("transition-colors duration-200 motion-reduce:transition-none", waiting ? TONES.accent.stroke : NEUTRAL.faintStroke)}
            />
            {waiting && out > 0 && out < 1 ? (
              <g>
                {[0.08, 0.16].map((d, i) => (
                  <circle key={d} cx={APP.x} cy={wireY(Math.max(0, out - d))} r={5.5 - i * 1.5} opacity={0.35 - i * 0.12} className={TONES.accent.solidFill} />
                ))}
                <circle cx={APP.x} cy={wireY(out)} r={6.5} className={TONES.accent.solidFill} />
                <circle cx={APP.x} cy={wireY(out)} r={2.4} className="fill-card" />
              </g>
            ) : null}

            {/* The backends: a card each for a few, a grid of tiles for many. */}
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
            <text x={AREA.x0} y={PANEL.y + 19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>
              {n} backend{n === 1 ? "" : "s"}
            </text>
            <text x={AREA.x1} y={PANEL.y + 19} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>
              each slow 1 time in 100
            </text>

            {grid.tiles.map((c, i) => {
              const call = frame.calls[i];
              // Calls reach the tiles in a wave from the left, so the fan-out reads as motion.
              const asked = !!call && call.out >= Math.min(1, 0.15 + 0.85 * c.frac);
              const cls = tileClass(call, asked);
              const left = c.x - grid.w / 2;
              const top = c.y - grid.h / 2;
              const slowWaiting = !!call && call.slow && asked && call.back <= 0;
              const pulse = slowWaiting && !clock.reduced ? 0.5 + 0.5 * Math.sin(clock.seconds * 8) : 0;
              const replying = !!call && call.back > 0 && call.back < 1 && !clock.reduced;
              const iconSize = grid.card ? 16 : Math.round(grid.w * 0.55);
              const reading = !call || !asked ? "" : call.back > 0 ? (call.slow ? "1 s" : `${load.ms[i]} ms`) : call.slow ? "slow" : "asked";
              return (
                <g key={`b-${i}`}>
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
                    <text x={c.x} y={top + grid.h - 8} textAnchor="middle" className={cn(asked ? cls.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                      {reading}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <SvgNode x={APP.x} y={APP.y} label="App server" kind="server" status={status.text} statusTone={status.tone} mark={frame.ready && frame.slowPage ? "bad" : undefined} />

            {/* The tally: every finished page load since the number of backends last changed. */}
            <g>
              <rect x={TALLY.x} y={TALLY.y} width={TALLY.w} height={TALLY.h} rx={12} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
              <text x={TALLY.x + 12} y={TALLY.y + 19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Page loads</text>
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
              caption="backends one page calls"
            />
            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          </svg>
        </PictureSlider>
      </div>
    </BeatFrame>
  );
}
