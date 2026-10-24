import { scaleLinear } from "d3-scale";
import type { Trace, TraceItem } from "../../sim";

// Where everything sits in the timeline SVG. Pure, so the layout rules are
// unit tested: lanes stack top to bottom, time runs left to right, every
// label stays inside the drawing, and labels on one lane do not collide.

export type TimelineLayout = "narrow" | "wide";

const LAYOUTS = {
  // Narrow: lane names sit above each lane so the plot keeps the full width.
  narrow: { width: 320, gutter: 0, laneHeight: 92, laneTop: 40, padX: 14, axisHeight: 34, charW: 6.2 },
  // Wide: lane names sit in a left gutter.
  wide: { width: 680, gutter: 132, laneHeight: 72, laneTop: 14, padX: 20, axisHeight: 34, charW: 6.6 },
} as const;

/** Extra height per lane when a trace draws a second row of spans. */
const SECOND_ROW = 38;
/** Label text is about this tall, for collision checks. */
const LABEL_H = 14;

export type LabelBox = { item: TraceItem; text: string; x: number; y: number; left: number; right: number };

export function timelineGeometry(trace: Trace, layout: TimelineLayout) {
  const L = LAYOUTS[layout];
  const twoRows = trace.items.some((item) => item.kind === "span" && item.row === 1);
  const laneHeight = L.laneHeight + (twoRows ? SECOND_ROW : 0);
  const plotLeft = L.gutter + L.padX;
  const plotRight = L.width - L.padX;
  const [from, to] = trace.range;
  const x = scaleLinear().domain([from, to > from ? to : from + 1]).range([plotLeft, plotRight]).clamp(true);
  const lanesHeight = trace.lanes.length * laneHeight;
  const height = lanesHeight + L.axisHeight + 8;
  const laneIndex = new Map(trace.lanes.map((lane, i) => [lane.id, i]));
  // The lane line sits in the upper part of its band, leaving room below for span rows.
  const lineOffset = L.laneTop + (L.laneHeight - L.laneTop) / 2;

  /** The y of a lane's line. */
  const laneY = (id: string) => (laneIndex.get(id) ?? 0) * laneHeight + lineOffset;

  /** The x for a middle-anchored label centred near `cx`, kept inside the plot. */
  const labelX = (cx: number, text: string) => {
    const half = (text.length * L.charW) / 2;
    return Math.max(plotLeft + half, Math.min(plotRight - half, cx));
  };

  /** The top y of a span's bar. Row 1 sits under the lane line. */
  const spanTop = (item: Extract<TraceItem, { kind: "span" }>) => laneY(item.lane) + (item.row === 1 ? 30 : -8);
  const spanHeight = (item: Extract<TraceItem, { kind: "span" }>) => (item.row === 1 ? 10 : 16);

  /** Where an item's label is drawn, or null for an unlabelled message. */
  const labelBox = (item: TraceItem): LabelBox | null => {
    const text = item.label;
    if (!text) return null;
    let cx: number;
    let y: number;
    if (item.kind === "point") {
      cx = x(item.at);
      y = laneY(item.lane) - 14 - (item.labelRow ?? 0) * 14;
    } else if (item.kind === "span") {
      cx = (x(Math.min(item.from, item.to)) + x(Math.max(item.from, item.to))) / 2;
      y = spanTop(item) + spanHeight(item) + 15;
    } else {
      cx = (x(item.sentAt) + x(item.receivedAt)) / 2 + 6;
      y = (laneY(item.from) + laneY(item.to)) / 2 - 4;
    }
    const lx = labelX(cx, text);
    const half = (text.length * L.charW) / 2;
    return { item, text, x: lx, y, left: lx - half, right: lx + half };
  };

  return {
    width: L.width,
    height,
    charW: L.charW,
    labelHeight: LABEL_H,
    gutter: L.gutter,
    laneHeight,
    laneTop: L.laneTop,
    plotLeft,
    plotRight,
    axisY: lanesHeight + 6,
    ticks: x.ticks(layout === "narrow" ? 4 : 6),
    x,
    laneY,
    labelX,
    spanTop,
    spanHeight,
    labelBox,
    /** The top of a lane's band, for the narrow layout's lane name. */
    laneBandTop: (id: string) => (laneIndex.get(id) ?? 0) * laneHeight,
  };
}

export type TimelineGeometry = ReturnType<typeof timelineGeometry>;

/** Pairs of visible labels that would print over each other. Used by tests. */
export function overlappingLabels(trace: Trace, layout: TimelineLayout): [string, string][] {
  const g = timelineGeometry(trace, layout);
  const boxes = trace.items.map(g.labelBox).filter((box): box is LabelBox => box !== null);
  // On a phone the lane names sit inside the plot, above each lane, so they can collide too.
  if (layout === "narrow") {
    for (const lane of trace.lanes) {
      const text = lane.sublabel ? `${lane.label}  ${lane.sublabel}` : lane.label;
      const y = g.laneBandTop(lane.id) + 16;
      boxes.push({ item: { kind: "point", lane: lane.id, at: 0, label: text, step: -1 }, text, x: g.plotLeft, y, left: g.plotLeft, right: g.plotLeft + text.length * g.charW });
    }
  }
  const clashes: [string, string][] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const sameBand = Math.abs(a.y - b.y) < g.labelHeight;
      const sideBySide = a.left < b.right && b.left < a.right;
      if (sameBand && sideBySide) clashes.push([a.text, b.text]);
    }
  }
  return clashes;
}
