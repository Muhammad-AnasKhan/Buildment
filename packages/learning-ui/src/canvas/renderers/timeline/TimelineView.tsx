import { useId } from "react";
import { cn } from "../../../lib/utils";
import { itemsUpTo, type Trace, type TraceItem } from "../../sim";
import { LABEL_HALO, NEUTRAL, SHAPE_TRANSITION, TONES } from "../../primitives/tones";
import { timelineGeometry, type TimelineGeometry, type TimelineLayout } from "./geometry";

type TimelineViewProps = {
  trace: Trace;
  /** Items with a step after this one are not drawn yet. */
  upToStep: number;
  layout: TimelineLayout;
  title: string;
  className?: string;
};

/**
 * Lanes over time: one row per node or client, events as dots, chosen
 * timestamps as diamonds, stretches of time as bars, and messages as arrows
 * between lanes. It only draws the trace a model produced.
 */
export function TimelineView({ trace, upToStep, layout, title, className }: TimelineViewProps) {
  const titleId = useId();
  const descId = useId();
  const g = timelineGeometry(trace, layout);
  const visible = itemsUpTo(trace, upToStep);

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={cn("h-auto w-full", className)}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{describe(trace, visible)}</desc>

      {trace.lanes.map((lane) => (
        <g key={lane.id}>
          <line x1={g.plotLeft} x2={g.plotRight} y1={g.laneY(lane.id)} y2={g.laneY(lane.id)} className={NEUTRAL.line} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          {g.gutter > 0 ? (
            <>
              <text x={8} y={g.laneY(lane.id) - 2} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{lane.label}</text>
              {lane.sublabel ? <text x={8} y={g.laneY(lane.id) + 13} className={cn(NEUTRAL.mutedText, "text-[10.5px]")}>{lane.sublabel}</text> : null}
            </>
          ) : (
            <text x={g.plotLeft} y={g.laneBandTop(lane.id) + 16} className={cn(NEUTRAL.text, halo, "text-[12px] font-semibold")}>
              {lane.label}
              {lane.sublabel ? <tspan className={cn(NEUTRAL.mutedText, "font-normal")}>{`  ${lane.sublabel}`}</tspan> : null}
            </text>
          )}
        </g>
      ))}

      <Axis g={g} unit={trace.unit} />

      {/* Spans first, then messages, then points, so dots sit on top. */}
      {visible.filter((item) => item.kind === "span").map((item, i) => <Span key={`s${i}`} item={item} g={g} current={item.step === upToStep} />)}
      {visible.filter((item) => item.kind === "message").map((item, i) => <Message key={`m${i}`} item={item} g={g} current={item.step === upToStep} />)}
      {visible.filter((item) => item.kind === "point").map((item, i) => <Point key={`p${i}`} item={item} g={g} current={item.step === upToStep} />)}
    </svg>
  );
}

const appear = "animate-in fade-in duration-200 motion-reduce:animate-none";
const halo = LABEL_HALO;

function Axis({ g, unit }: { g: TimelineGeometry; unit: string }) {
  return (
    <g aria-hidden>
      <line x1={g.plotLeft} x2={g.plotRight} y1={g.axisY} y2={g.axisY} className={NEUTRAL.faintStroke} vectorEffect="non-scaling-stroke" />
      {g.ticks.map((tick) => (
        <g key={tick}>
          <line x1={g.x(tick)} x2={g.x(tick)} y1={g.axisY} y2={g.axisY + 5} className={NEUTRAL.faintStroke} vectorEffect="non-scaling-stroke" />
          <text x={g.x(tick)} y={g.axisY + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[10.5px] tabular-nums")}>
            {tick} {unit}
          </text>
        </g>
      ))}
    </g>
  );
}

function Span({ item, g, current }: { item: Extract<TraceItem, { kind: "span" }>; g: TimelineGeometry; current: boolean }) {
  const t = TONES[item.tone ?? "accent"];
  const x1 = g.x(Math.min(item.from, item.to));
  const x2 = g.x(Math.max(item.from, item.to));
  const label = g.labelBox(item);
  return (
    <g className={appear}>
      <rect x={x1} y={g.spanTop(item)} width={Math.max(2, x2 - x1)} height={g.spanHeight(item)} rx={4} className={cn(t.softFill, t.stroke, SHAPE_TRANSITION)} strokeWidth={current ? 2 : 1} vectorEffect="non-scaling-stroke" />
      {label ? (
        <text x={label.x} y={label.y} textAnchor="middle" className={cn(t.text, halo, "text-[11px] font-medium")}>
          {label.text}
        </text>
      ) : null}
    </g>
  );
}

function Point({ item, g, current }: { item: Extract<TraceItem, { kind: "point" }>; g: TimelineGeometry; current: boolean }) {
  const t = TONES[item.tone ?? "accent"];
  const cx = g.x(item.at);
  const cy = g.laneY(item.lane);
  const label = g.labelBox(item);
  return (
    <g className={appear}>
      {current ? <circle cx={cx} cy={cy} r={10} className={cn(t.stroke, "fill-none")} strokeWidth={1.5} vectorEffect="non-scaling-stroke" /> : null}
      {item.shape === "diamond" ? (
        <polygon points={`${cx},${cy - 7} ${cx + 7},${cy} ${cx},${cy + 7} ${cx - 7},${cy}`} className={t.solidFill} />
      ) : (
        <circle cx={cx} cy={cy} r={5} className={t.solidFill} />
      )}
      {label ? (
        <text x={label.x} y={label.y} textAnchor="middle" className={cn(NEUTRAL.text, halo, "text-[11px] font-semibold tabular-nums")}>
          {label.text}
        </text>
      ) : null}
    </g>
  );
}

function Message({ item, g, current }: { item: Extract<TraceItem, { kind: "message" }>; g: TimelineGeometry; current: boolean }) {
  const t = TONES[item.tone ?? "accent"];
  const x1 = g.x(item.sentAt);
  const y1 = g.laneY(item.from);
  const x2 = g.x(item.receivedAt);
  const y2 = g.laneY(item.to);
  // A small arrowhead drawn by hand: no <marker>, so nothing references ids.
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 7;
  const tip = `${x2},${y2}`;
  const left = `${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)}`;
  const right = `${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)}`;
  const label = g.labelBox(item);
  return (
    <g className={appear}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={cn(t.stroke, SHAPE_TRANSITION)} strokeWidth={current ? 2.25 : 1.5} strokeDasharray={current ? undefined : "5 4"} vectorEffect="non-scaling-stroke" />
      <polygon points={`${tip} ${left} ${right}`} className={t.solidFill} />
      {label ? (
        <text x={label.x} y={label.y} textAnchor="middle" className={cn(t.text, halo, "text-[10.5px] font-medium")}>
          {label.text}
        </text>
      ) : null}
    </g>
  );
}

/** A plain-text summary of what is drawn, for screen readers. */
function describe(trace: Trace, visible: TraceItem[]): string {
  const lane = (id: string) => trace.lanes.find((l) => l.id === id)?.label ?? id;
  const parts = visible.map((item) => {
    if (item.kind === "point") return `${lane(item.lane)} at ${round(item.at)} ${trace.unit}: ${item.label}`;
    if (item.kind === "span") return `${lane(item.lane)} from ${round(item.from)} to ${round(item.to)} ${trace.unit}: ${item.label}`;
    return `${item.label || "Message"}, from ${lane(item.from)} at ${round(item.sentAt)} to ${lane(item.to)} at ${round(item.receivedAt)} ${trace.unit}`;
  });
  return parts.length > 0 ? parts.join(". ") + "." : "Nothing has happened yet.";
}

const round = (n: number) => Math.round(n * 10) / 10;
