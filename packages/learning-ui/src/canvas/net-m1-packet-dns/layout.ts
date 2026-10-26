import type { CaptureSegment, Packet, PacketLayer } from "../models/net-packet";

// Where the packet bands, chips and capture words sit. Pure, shared by the
// canvas and its tests, so a test that says "no two chips overlap and every
// chip is inside its band" checks what is drawn.
//
// The picture is nested boxes, outermost first: each header is a box with a
// title row and its field chips, and the next header (or the message) sits
// inside it. Boxes are inset by NEST on both sides at every level, so adding a
// header grows the packet outward.

export const VIEW_W = 420;
export const MARGIN = 8;
/** Width of the outermost box. */
export const OUTER_W = VIEW_W - 2 * MARGIN;
/** How far each inner box is inset, on each side, and the padding inside a box. */
export const NEST = 8;
export const HEAD_TOP = 6;
export const TITLE_H = 22;
export const CHIP_GAP = 6;
export const HEAD_BOTTOM = 6;
export const CHIP_H = 44;
/** Width of one character of a note, which sits on the label row at the right of the chip. */
export const NOTE_CHAR_W = 7.4;
export const CHIP_PAD_X = 10;

/**
 * The width of a chip: label at 13 units, value at 14 bold, both over-estimated
 * so text never leaves the chip. A chip that may carry a note of `noteChars`
 * characters ("changed", "new", "was 64") reserves room for it beside the label.
 */
export function chipWidth(label: string, value: string, noteChars = 0): number {
  const labelRow = label.length * 7.2 + (noteChars > 0 ? 6 + noteChars * NOTE_CHAR_W : 0);
  return Math.max(54, Math.ceil(Math.max(labelRow, value.length * 8.4)) + 2 * CHIP_PAD_X);
}

export type ChipBox = { id: string; label: string; value: string; absent?: boolean; x: number; y: number; w: number; h: number };

export type BandBox = {
  layer: PacketLayer;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Height of the title row plus the chip rows: the part of the box above the next box. */
  headerH: number;
  chips: ChipBox[];
};

export type PacketLayout = {
  bands: BandBox[];
  /** The message, drawn as one wide chip; null when hidden. */
  payload: ChipBox | null;
  top: number;
  bottom: number;
  height: number;
};

export type LayoutOptions = {
  /** Depth of the outermost layer (0). Wrap mode passes the missing layers so a growing packet keeps its middle. */
  baseDepth?: number;
  /** Top edge of the outermost box. Ignored when `payloadBottom` is set. */
  top?: number;
  /** Bottom edge of the message (or of the innermost header when the message is hidden). */
  payloadBottom?: number;
  /** Fields that may carry a note, and how many characters it can have, so their chips keep one width. */
  noteChars?: Record<string, number>;
  hidePayload?: boolean;
};

const boxX = (depth: number) => MARGIN + NEST * depth;
const boxW = (depth: number) => OUTER_W - 2 * NEST * depth;

/** Lay the chips of one layer out in rows inside the box width; y is relative to the box top. */
function flowChips(layer: PacketLayer, w: number, x0: number, noteChars: Record<string, number>): { chips: ChipBox[]; rows: number } {
  const room = w - 2 * NEST;
  const chips: ChipBox[] = [];
  let x = 0;
  let row = 0;
  for (const f of layer.fields) {
    const cw = Math.min(room, chipWidth(f.label, f.value, noteChars[f.id] ?? 0));
    if (x > 0 && x + cw > room) {
      x = 0;
      row += 1;
    }
    chips.push({ id: f.id, label: f.label, value: f.value, absent: f.absent, x: x0 + NEST + x, y: HEAD_TOP + TITLE_H + row * (CHIP_H + CHIP_GAP), w: cw, h: CHIP_H });
    x += cw + CHIP_GAP;
  }
  return { chips, rows: row + 1 };
}

export function layoutPacket(p: Packet, o: LayoutOptions = {}): PacketLayout {
  const base = o.baseDepth ?? 0;
  const noteChars = o.noteChars ?? {};
  const n = p.layers.length;

  const bands: BandBox[] = p.layers.map((layer, i) => {
    const depth = base + i;
    const x = boxX(depth);
    const w = boxW(depth);
    const { chips, rows } = flowChips(layer, w, x, noteChars);
    const headerH = HEAD_TOP + TITLE_H + rows * CHIP_H + (rows - 1) * CHIP_GAP + HEAD_BOTTOM;
    return { layer, depth, x, y: 0, w, h: headerH, headerH, chips };
  });

  const payloadH = o.hidePayload ? 0 : CHIP_H;
  // Heights, inside out: a box is its header plus the box (or message) inside it plus a bottom pad.
  let inner = payloadH;
  for (let i = n - 1; i >= 0; i--) {
    bands[i].h = bands[i].headerH + inner + (inner > 0 ? NEST : 0);
    inner = bands[i].h;
  }
  // Positions, outside in, with the outermost top at 0.
  let y = 0;
  for (const b of bands) {
    b.y = y;
    y += b.headerH;
  }
  const payloadDepth = base + n;
  const payloadRel = y;
  const shift = o.payloadBottom !== undefined ? o.payloadBottom - (payloadRel + payloadH) : (o.top ?? 0);

  for (const b of bands) {
    b.y += shift;
    for (const c of b.chips) c.y += b.y;
  }
  const payload: ChipBox | null = o.hidePayload
    ? null
    : { id: p.payload.id, label: p.payload.label, value: p.payload.value, x: boxX(payloadDepth), y: payloadRel + shift, w: boxW(payloadDepth), h: CHIP_H };

  const top = bands.length ? bands[0].y : payloadRel + shift;
  const bottom = bands.length ? bands[0].y + bands[0].h : payloadRel + shift + payloadH;
  return { bands, payload, top, bottom, height: bottom - top };
}

// ---------------------------------------------------------------- capture words

/** A conservative width of one monospace character at 13 units. */
export const WORD_CHAR_W = 8;
export const WORD_PAD_X = 4;
export const WORD_GAP = 4;
export const WORD_ROW_H = 22;

export type WordBox = { text: string; field?: string; x: number; y: number; w: number; h: number };

/** Flow the segments of a line into rows of word boxes inside [x0, x0 + width]; y is relative to the first row's top. */
export function flowWords(segments: readonly CaptureSegment[], x0: number, width: number): { words: WordBox[]; rows: number } {
  const words: WordBox[] = [];
  let x = 0;
  let row = 0;
  for (const s of segments) {
    const w = Math.min(width, s.text.length * WORD_CHAR_W + 2 * WORD_PAD_X);
    if (x > 0 && x + w > width) {
      x = 0;
      row += 1;
    }
    words.push({ text: s.text, field: s.field, x: x0 + x, y: row * WORD_ROW_H, w, h: WORD_ROW_H - 2 });
    x += w + WORD_GAP;
  }
  return { words, rows: row + 1 };
}
