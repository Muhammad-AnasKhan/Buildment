"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatCountShort } from "../models/envelope-estimate";
import { withCommas } from "../models/picture-controls";
import { flowDots } from "../models/server-load";
import {
  ADMIT_STOPS,
  admittedBy,
  DEFAULT_ADMIT,
  FANS,
  lineDots,
  logFraction,
  planPill,
  roomFlow,
  roomValueText,
  roomVerdict,
  SALE_SHOWN,
  SALE_SPEED,
  SEATS,
  sellOutText,
  soldBy,
  waitingRoom,
} from "../models/waiting-room";

const W = 420;
const H = 376;
const CARD_Y = 96;
const XS = [62, 210, 358] as const;
const HALF = 56;
const LINE = { x0: 11, y0: 146, cols: 10, rows: 4, step: 11.4 };
const LINE_DOTS = LINE.cols * LINE.rows;
const GAUGE_Y = 156;
const GAUGE_W = 100;
const SOLD = { x0: 92, x1: 406, y: 232 };
const RAIL = { x0: 40, x1: 380, y: 312 };
/** One loop: the sale runs for 12 seconds of screen time, then holds for 2. */
const PLAY_SECONDS = SALE_SHOWN / SALE_SPEED;
const LOOP_SECONDS = PLAY_SECONDS + 2;

const r1 = (v: number) => Math.round(v * 10) / 10;

const planTone = (timesPlan: number): Tone => (timesPlan > 1 ? "bad" : timesPlan > 0.5 ? "warn" : "good");

/** A thin log gauge under a card: a fill, and a tick for the mark the fill is compared with. */
function Gauge({ x, fill, tick, tickLabel, tone }: { x: number; fill: number; tick: number; tickLabel: string; tone: Tone }) {
  const tx = r1(x + tick * GAUGE_W);
  return (
    <g aria-hidden>
      <rect x={x} y={GAUGE_Y - 5} width={GAUGE_W} height={10} rx={5} className="fill-muted" />
      <rect x={x} y={GAUGE_Y - 5} width={r1(Math.max(10, fill * GAUGE_W))} height={10} rx={5} className={cn(TONES[tone].solidFill, "transition-all duration-200 motion-reduce:transition-none")} />
      <line x1={tx} x2={tx} y1={GAUGE_Y - 11} y2={GAUGE_Y + 11} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.doneStroke} />
      <text x={tx} y={GAUGE_Y + 28} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium tabular-nums")}>
        {tickLabel}
      </text>
    </g>
  );
}

/** 25.2 beat 7: drag the admit rate and watch the seat store's load and the sell-out time. */
export function WaitingRoomCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [admit, setAdmit] = useState<number>(DEFAULT_ADMIT);

  const r = waitingRoom(admit);
  const verdict = roomVerdict(r);
  const tone = planTone(r.timesPlan);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  // Where the sale is: a loop over the first 4 minutes, sped up. A still picture rests at the 4 minute mark.
  const sale = clock.reduced ? SALE_SHOWN : Math.min(PLAY_SECONDS, clock.seconds % LOOP_SECONDS) * SALE_SPEED;
  const sold = soldBy(r, sale);
  const waiting = lineDots(admittedBy(r, sale), LINE_DOTS);

  const flow = roomFlow(r);
  const dotsA = clock.reduced ? [] : flowDots(clock.seconds, flow);
  const dotsB = clock.reduced ? [] : flowDots(clock.seconds, flow);
  const laneA = { x0: XS[0] + HALF + 4, x1: XS[1] - HALF - 4 };
  const laneB = { x0: XS[1] + HALF + 4, x1: XS[2] - HALF - 4 };

  const insideShort = r.inside >= 1_000_000 ? `${formatCountShort(r.inside)} inside` : `${withCommas(r.inside)} inside`;
  const valueText = roomValueText(r);
  const description = `A waiting room admits ${withCommas(r.admit)} fans a second into booking. About ${withCommas(r.inside)} fans are inside against ${withCommas(SEATS)} seats. The seat store gets ${withCommas(r.load)} requests a second, ${planPill(r)}. ${verdict.text}.`;

  const lineDotsDrawn = Array.from({ length: LINE_DOTS }, (_, i) => {
    const col = i % LINE.cols;
    const row = Math.floor(i / LINE.cols);
    return { i, x: r1(LINE.x0 + col * LINE.step), y: r1(LINE.y0 + row * LINE.step) };
  });

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>knob</b> along the rail to change how many fans are let in each second.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Lanes between the cards, with dots that follow the load on the seat store. */}
          <line x1={laneA.x0} x2={laneA.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          <line x1={laneB.x0} x2={laneB.x1} y1={CARD_Y} y2={CARD_Y} strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {dotsA.map((d) => (
            <circle key={`a${d.id}`} cx={r1(laneA.x0 + (laneA.x1 - laneA.x0) * d.progress)} cy={CARD_Y} r={3.4} className={TONES.accent.solidFill} />
          ))}
          {dotsB.map((d) => (
            <circle key={`b${d.id}`} cx={r1(laneB.x0 + (laneB.x1 - laneB.x0) * d.progress)} cy={CARD_Y} r={3.4} className={TONES[tone === "good" ? "accent" : tone].solidFill} />
          ))}

          <SvgNode x={XS[0]} y={CARD_Y} label="Waiting" kind="queue" status="400,000 fans" />
          <SvgNode x={XS[1]} y={CARD_Y} label="Booking" kind="server" status={insideShort} statusTone="accent" />
          <SvgNode x={XS[2]} y={CARD_Y} label="Seat store" kind="database" status={planPill(r)} statusTone={tone} mark={r.timesPlan > 1 ? "bad" : undefined} />

          {/* The line outside: one dot is 10,000 fans; it shortens as fans are let in. */}
          <g aria-hidden>
            {lineDotsDrawn.map((d) => (
              <circle key={d.i} cx={d.x} cy={d.y} r={3.2} className={cn(d.i < waiting ? TONES.accent.solidFill : "fill-muted", "transition-colors duration-200 motion-reduce:transition-none")} />
            ))}
          </g>
          <text x={XS[0]} y={r1(LINE.y0 + (LINE.rows - 1) * LINE.step + 22)} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
            {`${withCommas(FANS)} in line`}
          </text>

          <Gauge x={XS[1] - GAUGE_W / 2} fill={logFraction(r.inside, 1_000, 3_000_000)} tick={logFraction(SEATS, 1_000, 3_000_000)} tickLabel="20,000 seats" tone="accent" />
          <Gauge x={XS[2] - GAUGE_W / 2} fill={logFraction(r.timesPlan, 0.005, 20)} tick={logFraction(1, 0.005, 20)} tickLabel="plan" tone={tone} />

          {/* Seats sold over the first four minutes of the sale, sped up. */}
          <text x={14} y={SOLD.y + 4} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>seats sold</text>
          <rect x={SOLD.x0} y={SOLD.y - 6} width={SOLD.x1 - SOLD.x0} height={12} rx={6} className="fill-muted" />
          <rect x={SOLD.x0} y={SOLD.y - 6} width={r1(Math.max(12, sold * (SOLD.x1 - SOLD.x0)))} height={12} rx={6} className={cn(TONES.accent.solidFill, "transition-all duration-200 motion-reduce:transition-none")} />
          <text x={W / 2} y={SOLD.y + 28} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
            The first 4 minutes of the sale, sped up
          </text>

          {/* The admit rate rail. */}
          <text x={34} y={RAIL.y - 26} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>fans let in each second</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={ADMIT_STOPS.map((v) => ({ value: v, label: withCommas(v) }))}
            value={admit}
            onChange={setAdmit}
            ariaLabel="Admit rate in fans a second"
            valueText={valueText}
            onGrab={grab}
          />
          <text x={W / 2} y={RAIL.y + 56} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>
            {`Admit ${withCommas(r.admit)} a second: sold out in ${sellOutText(r.sellOut)}`}
          </text>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
