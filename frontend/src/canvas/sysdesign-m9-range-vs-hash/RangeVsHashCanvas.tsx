"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatChoice } from "../primitives/beat-choice";
import { KeyedSlider } from "../primitives/keyed-slider";
import { SliderRail } from "../primitives/picture-slider";
import { NODE_H, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { YearStrip, type MarkedDay } from "../primitives/year-strip";
import { withCommas } from "../models/picture-controls";
import {
  ORDERS_PER_DAY,
  QUARTERS,
  SHARD_LIMIT,
  START,
  TODAY,
  WINDOW_DAYS,
  clampStart,
  describeWindow,
  loadTone,
  orderDots,
  rangeVsHashVerdict,
  startFromFraction,
  startToFraction,
  touchedShards,
  windowDays,
  writesPerShard,
  type Mode,
} from "./model";

const W = 420;
const H = 406;
const STRIP = { x: 14, y: 68, pitch: 7.4 };
const CELL = 6;
/** Distance between two day columns on the strip, per day. */
const DAY_W = STRIP.pitch / 7;
const dayX = (day: number) => STRIP.x + (day - 1) * DAY_W + CELL / 2;
const RAIL = { x0: dayX(START.min), x1: dayX(START.max), y: 366 };
const BRACKET_Y = 126;
const LABEL_Y = 142;
const CARD_TOP = [156, 232];
const COL_X = [10, 216];
const AREA_W = 74;
const BAR_MAX = 1500;
const DOT_PITCH_X = 10;
const DOT_PITCH_Y = 4.8;

const MODES = [
  { id: "range", label: "Range" },
  { id: "hash", label: "Hash" },
] as const;

/** Where one day's cell sits on the strip (centre), for the dots to fly from. */
function stripCell(day: number) {
  const d0 = day - 1;
  return { x: STRIP.x + Math.floor(d0 / 7) * STRIP.pitch + CELL / 2, y: STRIP.y + (d0 % 7) * STRIP.pitch + CELL / 2 };
}

/** 9.2: slide a week across the year and flip between range and hash: one tells you where the week is, the other where the writes go. */
export function RangeVsHashCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [mode, setMode] = useState<Mode>("range");
  const [start, setStart] = useState<number>(START.default);
  // Dots start from the week on the strip and fly to their shard when the mode flips.
  const [landed, setLanded] = useState(true);
  const frames = useRef<number[]>([]);
  useEffect(() => {
    const pending = frames;
    return () => pending.current.forEach(cancelAnimationFrame);
  }, []);
  const changeMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    if (clock.reduced) return;
    setLanded(false);
    frames.current.forEach(cancelAnimationFrame);
    const a = requestAnimationFrame(() => {
      frames.current.push(requestAnimationFrame(() => setLanded(true)));
    });
    frames.current = [a];
  };

  const touched = touchedShards(start, mode);
  const writes = writesPerShard(mode);
  const verdict = rangeVsHashVerdict(mode, start);
  const dots = useMemo(() => orderDots(start, mode), [start, mode]);
  const days = windowDays(start);
  const marked: MarkedDay[] = days.map((d) => ({ day: d - 1, fraction: 1, tone: "accent" }));
  const today = stripCell(TODAY);
  const origin = stripCell(start + 3);

  const summary = `Suq's orders are split over four shards by ${mode === "range" ? "quarter of the year" : "a hash of the order id"}. The ${describeWindow(start, mode)}. All 3,000 new writes a second are dated today, so ${mode === "range" ? "shard 4 takes all 3,000, three times its limit of 1,000" : "each shard takes 750, three quarters of its limit"}. ${verdict.text}.`;

  // Dots of each shard, laid out as seven day columns by seven order rows.
  const slotOf = (day: number, slot: number) => ({ col: day - start, row: slot });

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap <b>Range</b> or <b>Hash</b>, then drag across the picture to slide the <b>week</b> along the year.
        </>
      }
      controls={<BeatChoice label="How the orders are split" options={MODES} value={mode} onChange={changeMode} />}
    >
      <div ref={box}>
        <KeyedSlider
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          label="Start day of the week"
          valueText={describeWindow(start, mode)}
          value={start}
          range={{ min: START.min, max: START.max, step: 1, page: WINDOW_DAYS }}
          fromFraction={startFromFraction}
          onChange={(v) => setStart(clampStart(v))}
          onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
        >
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
            <title id={titleId}>{title}</title>
            <desc id={descId}>{summary}</desc>
            <DotGrid width={W} height={H} />

            {/* The year: one square a day, the played week in blue, today ringed. */}
            <YearStrip x={STRIP.x} y={STRIP.y} pitch={STRIP.pitch} marked={marked} />
            <line x1={today.x} x2={today.x} y1={STRIP.y - 6} y2={today.y - 5} strokeWidth={1.2} className="stroke-foreground" />
            <rect x={today.x - 4.5} y={today.y - 4.5} width={9} height={9} rx={2.5} strokeWidth={1.5} className="fill-none stroke-foreground" />
            <text x={today.x} y={STRIP.y - 10} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>
              today
            </text>

            {/* Quarters, one per shard under range. */}
            {QUARTERS.map((q) => {
              const x0 = STRIP.x + (q.from - 1) * DAY_W + 1;
              const x1 = STRIP.x + q.to * DAY_W - 1;
              const lit = mode === "range" && touched.includes(q.shard);
              return (
                <g key={q.shard}>
                  <path d={`M${x0} ${BRACKET_Y - 5} V${BRACKET_Y} H${x1} V${BRACKET_Y - 5}`} fill="none" strokeWidth={1.5} className={lit ? TONES.accent.stroke : NEUTRAL.faintStroke} />
                  <text x={(x0 + x1) / 2} y={LABEL_Y} textAnchor="middle" className={cn(lit ? TONES.accent.text : NEUTRAL.mutedText, "text-[12px] font-semibold")}>
                    Shard {q.shard + 1}
                  </text>
                </g>
              );
            })}

            {/* The four shards: a card, a write bar against the limit, and the orders that live on it. */}
            {writes.map((w, s) => {
              const cx = COL_X[s % 2] + 56;
              const top = CARD_TOP[Math.floor(s / 2)];
              const cy = top + NODE_H / 2;
              const ax = COL_X[s % 2] + 120;
              const tone = loadTone(w);
              const fill = Math.min(AREA_W, (w / BAR_MAX) * AREA_W);
              const limitX = ax + (SHARD_LIMIT / BAR_MAX) * AREA_W;
              const clipped = w / BAR_MAX * AREA_W > AREA_W;
              const lit = touched.includes(s);
              const flowDots = fill > 12 ? Math.floor(fill / 15) : 0;
              const speed = (w / BAR_MAX) * 0.9;
              return (
                <g key={s}>
                  <SvgNode x={cx} y={cy} label={`Shard ${s + 1}`} kind="database" status={`${withCommas(w)} a sec`} statusTone={tone} mark={lit ? "accent" : undefined} />
                  <rect x={ax} y={top + 2} width={AREA_W} height={14} rx={5} className="fill-muted" />
                  {fill > 0 ? <rect x={ax} y={top + 2} width={fill} height={14} rx={5} className={cn(TONES[tone].solidFill, "transition-colors duration-200 motion-reduce:transition-none")} /> : null}
                  {Array.from({ length: flowDots }, (_, i) => {
                    const phase = (((i / flowDots + clock.seconds * speed) % 1) + 1) % 1;
                    return <circle key={i} cx={ax + 5 + phase * Math.max(0, fill - (clipped ? 30 : 10))} cy={top + 9} r={1.8} className="fill-white/75" />;
                  })}
                  {clipped ? (
                    <text x={ax + AREA_W - 5} y={top + 13} textAnchor="end" className="fill-white text-[11.5px] font-bold">
                      3x
                    </text>
                  ) : null}
                  <line x1={limitX} x2={limitX} y1={top - 2} y2={top + 20} strokeWidth={1.8} strokeDasharray="3 2.5" className="stroke-foreground" />

                  {/* The week's orders: a column per day, a row per order. Faint slots are empty. */}
                  {Array.from({ length: WINDOW_DAYS * ORDERS_PER_DAY }, (_, k) => {
                    const col = Math.floor(k / ORDERS_PER_DAY);
                    const row = k % ORDERS_PER_DAY;
                    return <circle key={k} cx={ax + 5 + col * DOT_PITCH_X} cy={top + 28 + row * DOT_PITCH_Y} r={1.1} className="fill-muted-foreground/25" />;
                  })}
                  {dots
                    .filter((d) => d.shard === s)
                    .map((d, i) => {
                      const { col, row } = slotOf(d.day, d.slot);
                      const px = ax + 5 + col * DOT_PITCH_X;
                      const py = top + 28 + row * DOT_PITCH_Y;
                      return (
                        <circle
                          key={`${d.day}-${d.slot}`}
                          cx={px}
                          cy={py}
                          r={2}
                          className={TONES.accent.solidFill}
                          style={{
                            transform: landed ? "translate(0px, 0px)" : `translate(${origin.x - px}px, ${origin.y - py}px)`,
                            transition: landed && !clock.reduced ? `transform 650ms cubic-bezier(0.2, 0.8, 0.3, 1) ${(i % 20) * 12}ms` : "none",
                          }}
                        />
                      );
                    })}
                </g>
              );
            })}

            <text x={14} y={314} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
              Bar: writes a second now. Dashed: limit {withCommas(SHARD_LIMIT)}.
            </text>
            <text x={14} y={330} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
              Dots: the week&apos;s orders. Ring: reads go here.
            </text>

            <SliderRail
              x0={RAIL.x0}
              x1={RAIL.x1}
              y={RAIL.y}
              fraction={startToFraction(start)}
              marks={[{ at: startToFraction(88) }, { at: startToFraction(120) }, { at: startToFraction(179) }, { at: startToFraction(271) }]}
              ends={["Jan", "Dec"]}
              caption={`week starts on day ${start}`}
            />
            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          </svg>
        </KeyedSlider>
      </div>
    </BeatFrame>
  );
}
