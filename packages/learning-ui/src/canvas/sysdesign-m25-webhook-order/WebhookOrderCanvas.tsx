"use client";

import { useId, useRef, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgChip } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_ORDER,
  EVENT_STATE,
  markerStep,
  ORDER_STOPS,
  orderLabel,
  orderValueText,
  orderVerdict,
  runOrder,
  STATES,
  TRUTH,
  type EventKey,
  type State,
  type Step,
} from "../models/webhook-order";

const W = 420;
const H = 372;
const CARD = { x0: 10, pitch: 100, w: 92, h: 44, top: 62 };
const STRIP = { x0: 14, cell: 98, h: 26 };
const ROWS = [
  { key: "last", name: "Last event wins", label: 132, strip: 138, chips: 169 },
  { key: "forward", name: "Forward only", label: 210, strip: 216, chips: 247 },
] as const;
const CHIP_H = 18;
const RAIL = { x0: 44, x1: 376, y: 332 };
const TOGGLE_Y = 290;

const cardX = (i: number) => CARD.x0 + i * CARD.pitch;
const stateX = (s: State) => STRIP.x0 + STATES.indexOf(s) * STRIP.cell;

/** The status after the kth arrival; 0 is before any arrival. */
const stateAt = (steps: readonly Step[], k: number): State => (k <= 0 ? "created" : steps[Math.min(steps.length, k) - 1].state);

/** 25.4 beat 3: pick the arrival order and compare two rules for the payment's status. */
export function WebhookOrderCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [order, setOrder] = useState<number>(DEFAULT_ORDER);
  const [twice, setTwice] = useState(false);

  const result = runOrder(order, twice);
  const verdict = orderVerdict(result);
  const n = result.seq.length;
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  // Where the marker is: it visits each arrival in turn. A still picture rests on the end.
  const m = clock.reduced ? n : markerStep(clock.seconds, n);
  const valueText = orderValueText(result, twice);
  const description = `A payment really went authorized, captured, refunded. The events arrive as ${result.seq.map((e) => EVENT_STATE[e]).join(", ")}. Last event wins ends on ${result.lastFinal}. Forward only ends on ${result.forwardFinal}. ${verdict.text}.`;

  const rows = [
    { ...ROWS[0], steps: result.last, final: result.lastFinal },
    { ...ROWS[1], steps: result.forward, final: result.forwardFinal },
  ];

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>knob</b> to choose the order the events arrive in. Try <b>Captured arrives twice</b>.
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The events in the order they arrive. */}
          {result.seq.map((event: EventKey, i) => {
            const x = cardX(i);
            const lit = !clock.reduced && m === i + 1;
            return (
              <g key={`${i}-${event}`} aria-hidden>
                <rect x={x} y={CARD.top + 3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
                <rect x={x} y={CARD.top} width={CARD.w} height={CARD.h} rx={12} strokeWidth={lit ? 2 : 1.5} className={cn(lit ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), "transition-colors duration-200 motion-reduce:transition-none")} />
                <circle cx={x + 17} cy={CARD.top + 16} r={9} className={TONES.accent.solidFill} />
                <text x={x + 17} y={CARD.top + 20.5} textAnchor="middle" className="fill-white text-[12px] font-bold dark:fill-blue-950">
                  {i + 1}
                </text>
                <text x={x + 34} y={CARD.top + 21} className={cn(NEUTRAL.text, "text-[15px] font-bold")}>
                  {event}
                </text>
                <text x={x + CARD.w / 2} y={CARD.top + 37} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>
                  {EVENT_STATE[event]}
                </text>
              </g>
            );
          })}
          <text x={14} y={CARD.top - 5} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
            Events arrive in this order (it really went A, C, R):
          </text>

          {/* Two rules, each a strip of states with a marker and a row of what happened at each arrival. */}
          {rows.map((row) => {
            const ok = row.final === TRUTH;
            const tone = ok ? "good" : "bad";
            const lit = stateAt(row.steps, m);
            const Icon = ok ? CircleCheck : CircleX;
            return (
              <g key={row.key}>
                <text x={14} y={row.label} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>
                  {row.name}
                </text>
                <text x={W - 36} y={row.label} textAnchor="end" className={cn(TONES[tone].text, "text-[12.5px] font-semibold")}>
                  {`ends on ${row.final}`}
                </text>
                <Icon x={W - 30} y={row.label - 13} width={16} height={16} strokeWidth={2.25} className={cn(TONES[tone].stroke, "fill-none")} aria-hidden />

                <g aria-hidden>
                  <rect x={STRIP.x0} y={row.strip} width={STRIP.cell * STATES.length} height={STRIP.h} rx={13} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
                  {STATES.map((s) => {
                    const on = lit === s;
                    const x = stateX(s);
                    return (
                      <g key={s}>
                        <rect x={x + 2} y={row.strip + 2} width={STRIP.cell - 4} height={STRIP.h - 4} rx={11} className={cn(on ? cn(TONES.accent.softFill, TONES.accent.stroke) : "fill-transparent stroke-transparent", "transition-colors duration-200 motion-reduce:transition-none")} strokeWidth={1.5} />
                        <text x={x + STRIP.cell / 2} y={row.strip + 17.5} textAnchor="middle" className={cn(on ? TONES.accent.text : NEUTRAL.mutedText, on ? "font-bold" : "font-medium", "text-[11.5px]")}>
                          {s}
                        </text>
                      </g>
                    );
                  })}
                  {/* The final state keeps a ring in green or red, whatever the marker is doing. */}
                  <rect x={stateX(row.final) + 1} y={row.strip + 1} width={STRIP.cell - 2} height={STRIP.h - 2} rx={12} fill="none" strokeWidth={2.5} className={TONES[tone].stroke} />
                </g>

                {row.steps.map((step, i) => {
                  const x = cardX(i);
                  const ignored = step.ignored;
                  const last = i === row.steps.length - 1;
                  return (
                    <g key={`${i}-${step.event}`} aria-hidden>
                      <rect
                        x={x}
                        y={row.chips}
                        width={CARD.w}
                        height={CHIP_H}
                        rx={CHIP_H / 2}
                        strokeWidth={last ? 2 : 1.25}
                        strokeDasharray={ignored ? "3 3" : undefined}
                        className={cn(last ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn(ignored ? "fill-transparent" : NEUTRAL.surface, ignored ? NEUTRAL.faintStroke : NEUTRAL.line))}
                      />
                      <text x={x + CARD.w / 2} y={row.chips + 13} textAnchor="middle" className={cn(last ? TONES[tone].text : ignored ? NEUTRAL.mutedText : NEUTRAL.text, ignored ? "font-medium italic" : "font-semibold", "text-[11.5px]")}>
                        {ignored ? "ignored" : step.state}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* The two inputs: the arrival order and a second captured event. */}
          <text x={14} y={TOGGLE_Y + 5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            Arrival order
          </text>
          <SvgChip x={W - 14 - 189} y={TOGGLE_Y} text="Captured arrives twice" width={189} label="Captured arrives twice" pressed={twice} onPress={() => setTwice((v) => !v)} />
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={ORDER_STOPS.map((v) => ({ value: v, label: orderLabel(v) }))}
            value={order}
            onChange={setOrder}
            ariaLabel="Arrival order of the three events"
            valueText={valueText}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
