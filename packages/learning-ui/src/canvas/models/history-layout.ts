import type { HistoryOp } from "./history";

// Geometry and text fitting for the history picture (lanes of bars over a
// time axis). Pure functions, so tests can prove that no two labels share a
// place. Units are viewBox units of a picture 420 wide.

export const VIEW_W = 420;
/** Left and right ends of the time axis. The lane names sit to the left of it. */
export const PLOT_X0 = 46;
export const PLOT_X1 = 408;
/** A bar starts this far below the top of its lane, and is this tall. */
export const BAR_TOP = 6;
export const BAR_H = 26;
/** Height of a caption chip and of plain text in the band under a bar. */
export const CHIP_H = 20;
/** Padding kept inside a bar around its text, and the gap kept between texts in a band. */
const INSIDE_PAD = 6;
const BAND_GAP = 6;
const MIN_BAR_W = 6;

export type HistoryAxis = { min: number; max: number; step: number; caption: string };

export type HistoryLayout = {
  clients: string[];
  axis: HistoryAxis;
  laneH: number;
  x: (t: number) => number;
  /** The time under an x position, not clamped. */
  time: (x: number) => number;
  laneTop: (lane: number) => number;
  barY: (lane: number) => number;
  /** Top of the band under a bar, where captions and outside labels sit. */
  bandY: (lane: number) => number;
  lanesTop: number;
  lanesBottom: number;
  axisY: number;
  ticks: { t: number; x: number; text: string }[];
  /** Bottom of the axis block, including tick labels and the axis caption. */
  bottom: number;
};

export function historyLayout(input: { clients: readonly string[]; axis: HistoryAxis; top: number; laneH?: number }): HistoryLayout {
  const { clients, axis, top } = input;
  const laneH = input.laneH ?? 54;
  const span = axis.max - axis.min;
  const x = (t: number) => PLOT_X0 + ((t - axis.min) / span) * (PLOT_X1 - PLOT_X0);
  const time = (px: number) => axis.min + ((px - PLOT_X0) / (PLOT_X1 - PLOT_X0)) * span;
  const lanesBottom = top + clients.length * laneH;
  const ticks: HistoryLayout["ticks"] = [];
  for (let t = axis.min; t <= axis.max + 1e-9; t += axis.step) ticks.push({ t, x: x(t), text: String(Math.round(t * 100) / 100) });
  return {
    clients: [...clients],
    axis,
    laneH,
    x,
    time,
    laneTop: (lane) => top + lane * laneH,
    barY: (lane) => top + lane * laneH + BAR_TOP,
    bandY: (lane) => top + lane * laneH + BAR_TOP + BAR_H + 3,
    lanesTop: top,
    lanesBottom,
    axisY: lanesBottom + 8,
    ticks,
    bottom: lanesBottom + 8 + 44,
  };
}

const NARROW = "il.,:;'|!";
const THIN = "tfr()";
const WIDE = "mwMW";

/** A cautious width, in viewBox units, of text set at `size` (11.5 by default). */
export function textWidth(text: string, size = 11.5, bold = false): number {
  let em = 0;
  for (const c of text) {
    if (c === " ") em += 0.29;
    else if (NARROW.includes(c)) em += 0.27;
    else if (THIN.includes(c)) em += 0.38;
    else if (WIDE.includes(c)) em += 0.86;
    else if (c >= "0" && c <= "9") em += 0.6;
    else if (c === "=") em += 0.64;
    else if (c === "→") em += 0.95;
    else if (c === "-") em += 0.4;
    else if (c >= "A" && c <= "Z") em += 0.66;
    else em += 0.57;
  }
  return em * size * (bold ? 1.04 : 1) * 1.03;
}

/** The words for one bar, from the longest form to the shortest. */
export type OpWords = { id: string; aria: string; cands: string[] };

export type ValueFormat = (key: string, value: number) => string;

const plain: ValueFormat = (_k, v) => String(v);

/** "write x = 1", "read x -> 0" with an arrow, or "read x" when the read has no value yet. */
export function opWords(op: HistoryOp, options: { format?: ValueFormat; hideReadValue?: boolean } = {}): OpWords {
  const format = options.format ?? plain;
  const v = format(op.key, op.value);
  const blank = op.kind === "read" && options.hideReadValue;
  const sign = op.kind === "write" ? "=" : "→";
  const full = blank ? `read ${op.key}` : op.kind === "write" ? `write ${op.key} = ${v}` : `read ${op.key} → ${v}`;
  const cands = blank ? [full, op.key] : [full, `${op.key} ${sign} ${v}`, v];
  const said = blank ? "read" : op.kind === "write" ? `writes ${op.key} = ${v}` : `reads ${op.key} and gets ${v}`;
  const aria = `${op.client} ${blank ? `reads ${op.key}` : said}, from ${op.start} to ${op.end}`;
  return { id: op.id, aria, cands };
}

export type PlacedText = { text: string; x: number; anchor: "start" | "middle" | "end"; w: number };

export type PlacedBar = {
  id: string;
  lane: number;
  x0: number;
  x1: number;
  /** Text centred inside the bar, when it fits. */
  inside: PlacedText | null;
  /** Text in the band under the bar, when it does not fit inside. */
  below: PlacedText | null;
  /** A caption chip in the band under the bar. */
  caption: (PlacedText & { chipW: number }) | null;
};

export type CaptionWords = { id: string; cands: string[] };

/**
 * Place every bar's words. A label goes inside its bar when the longest form
 * fits. Otherwise it goes under the bar, left-aligned at the bar's start (or
 * right-aligned at its end near the right edge), in the longest form that
 * keeps clear of the other texts in that lane's band. Captions (the "may
 * return" chips) take what space is left in the same way.
 */
export function placeBars(layout: HistoryLayout, ops: readonly HistoryOp[], words: readonly OpWords[], captions: readonly CaptionWords[] = []): PlacedBar[] {
  const wordsById = new Map(words.map((w) => [w.id, w]));
  const captionById = new Map(captions.map((c) => [c.id, c]));
  const placed = new Map<string, PlacedBar>();
  const lanes = layout.clients.map((c, i) => ({ lane: i, ops: ops.filter((o) => o.client === c).sort((a, b) => a.start - b.start) }));
  for (const { lane, ops: laneOps } of lanes) {
    const taken: [number, number][] = [];
    const free = (a: number, b: number) => taken.every(([p, q]) => b + BAND_GAP <= p || a >= q + BAND_GAP) && a >= PLOT_X0 - 4 && b <= PLOT_X1 + 8;
    const bars = laneOps.map((op) => {
      const x0 = layout.x(op.start);
      const x1 = Math.max(x0 + MIN_BAR_W, layout.x(op.end));
      const w = wordsById.get(op.id);
      // The longest form goes inside when it fits; shorter forms are a last resort (see below).
      const fit = w && textWidth(w.cands[0], 11.5, true) + INSIDE_PAD <= x1 - x0 ? w.cands[0] : undefined;
      const bar: PlacedBar = {
        id: op.id,
        lane,
        x0,
        x1,
        inside: fit ? { text: fit, x: (x0 + x1) / 2, anchor: "middle", w: textWidth(fit, 11.5, true) } : null,
        below: null,
        caption: null,
      };
      placed.set(op.id, bar);
      return { op, bar, w };
    });
    // Labels that did not fit inside, then captions: each takes the longest form with room.
    for (const { bar, w } of bars) {
      if (bar.inside || !w) continue;
      for (const cand of w.cands) {
        const width = textWidth(cand, 11.5, true);
        const left: [number, number] = [bar.x0, bar.x0 + width];
        const right: [number, number] = [bar.x1 - width, bar.x1];
        const spot = [left, right].find(([a, b]) => free(a, b));
        if (!spot) continue;
        bar.below = { text: cand, x: spot === left ? spot[0] : spot[1], anchor: spot === left ? "start" : "end", w: width };
        taken.push(spot);
        break;
      }
      // The value alone goes inside a narrow bar whose words sit under it.
      if (bar.below && w.cands.length > 2) {
        const value = w.cands[w.cands.length - 1];
        if (textWidth(value, 11.5, true) + INSIDE_PAD <= bar.x1 - bar.x0) bar.inside = { text: value, x: (bar.x0 + bar.x1) / 2, anchor: "middle", w: textWidth(value, 11.5, true) };
      }
      // No room under the bar: the shortest form that fits inside it.
      if (!bar.below) {
        const inner = w.cands.find((c) => textWidth(c, 11.5, true) + INSIDE_PAD <= bar.x1 - bar.x0);
        if (inner) bar.inside = { text: inner, x: (bar.x0 + bar.x1) / 2, anchor: "middle", w: textWidth(inner, 11.5, true) };
      }
    }
    for (const { op, bar } of bars) {
      const cap = captionById.get(op.id);
      if (!cap) continue;
      for (const cand of cap.cands) {
        const chipW = Math.ceil(textWidth(cand, 11.5, true) + 14);
        const left: [number, number] = [bar.x0, bar.x0 + chipW];
        const right: [number, number] = [bar.x1 - chipW, bar.x1];
        const spot = [left, right].find(([a, b]) => free(a, b));
        if (!spot) continue;
        bar.caption = { text: cand, x: spot[0], anchor: "start", w: textWidth(cand, 11.5, true), chipW };
        taken.push(spot);
        break;
      }
    }
  }
  return ops.map((o) => placed.get(o.id)).filter((b): b is PlacedBar => !!b);
}

/** Words for the "may return" chip: "may return 0 or 1", then shorter forms. */
export function mayReturnWords(values: readonly number[], name: (v: number) => string = String): string[] {
  const names = values.map(name);
  const list = names.length <= 1 ? names[0] ?? "" : `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
  return [`may return ${list}`, `may be ${list}`, list];
}

/** Nearest multiple of `step`, clipped to a range. */
export function snap(value: number, step: number, min: number, max: number): number {
  const s = Math.round(value / step) * step;
  return Math.max(min, Math.min(max, s));
}
