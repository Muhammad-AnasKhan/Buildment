// The geometry of a net-step picture. Pure: the same spec always gives the same
// boxes, and the picture keeps one height for every step, so nothing jumps when
// the learner presses Next. Everything is measured in picture units on a 420
// wide viewBox; text is 13 units, estimated at CHAR_W (8) units a character, a
// safe upper bound, so a label never runs past the shape it sits in.
//
// From top to bottom: the step line and caption, the devices and links, the
// packet tray (the header chips of the packet on the highlighted link), the
// tables, and the verdict banner.

import { wrapWords } from "../models/net-address";
import {
  CARD_W,
  CHAR_W,
  MARGIN,
  TABLE_COLUMNS_W,
  TABLE_GAP,
  TAG_W,
  VIEW_W,
  cardHeight,
  maxRows,
  tablesAfter,
  type DeviceKind,
  type NetPacket,
  type NetStepSpec,
} from "../models/net-step";

export const LINE_H = 19;
export const CHIP_H = 24;
export const CHIP_PITCH = 30;
export const CHIP_GAP = 8;
export const CHIP_PAD = 18;
export const ROW_H = 24;
export const TABLE_HEAD = 26;
export const CONTENT_W = VIEW_W - 2 * MARGIN;
/** Prose is narrower than addresses: 7 units a character for a caption (addresses use CHAR_W). */
export const CAPTION_CHAR_W = 7;
export const CAPTION_CHARS = Math.floor(CONTENT_W / CAPTION_CHAR_W);
export const PICK_PLACEHOLDER = "Your turn: pick below, then this step plays.";
export const BANNER_H = 30;

export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

export type DeviceBox = Box & { id: string; kind: DeviceKind; label: string; addresses: string[]; cx: number; cy: number };

export type LinkGeom = {
  index: number;
  /** Start and end of the visible line, from the link's first device to its second, clear of both cards. */
  p1: Pt;
  p2: Pt;
  label: { text: string; box: Box } | null;
};

export type ChipBox = Box & { index: number };

export type TableGeom = {
  id: string;
  box: Box;
  titleY: number;
  headY: number;
  colX: number[];
  colW: number[];
  rowsMax: number;
  /** The top of row r. */
  rowY: (r: number) => number;
  tagRight: number;
};

export type NetStepLayout = {
  width: number;
  height: number;
  stepLineY: number;
  captionY: number;
  captionChars: number;
  captionLines: number;
  devices: DeviceBox[];
  links: LinkGeom[];
  tray: { box: Box; titleY: number; chipsY: number; rows: number } | null;
  tables: TableGeom[];
  bannerY: number | null;
};

/** The text of a chip is `label value` plus ` changed` for a changed field. */
export const chipChars = (f: NetPacket["fields"][number]): number => f.label.length + 1 + f.value.length + (f.changed ? " changed".length : 0);
export const chipWidth = (f: NetPacket["fields"][number]): number => chipChars(f) * CHAR_W + CHIP_PAD;

/** Lay chips out left to right in order, wrapping to a new row when the next one does not fit. */
export function flowChips(fields: NetPacket["fields"], x0: number, y0: number, width: number): { chips: ChipBox[]; rows: number } {
  const chips: ChipBox[] = [];
  let x = x0;
  let row = 0;
  fields.forEach((f, index) => {
    const w = chipWidth(f);
    if (x > x0 && x + w > x0 + width) {
      row += 1;
      x = x0;
    }
    chips.push({ index, x, y: y0 + row * CHIP_PITCH, w, h: CHIP_H });
    x += w + CHIP_GAP;
  });
  return { chips, rows: fields.length === 0 ? 0 : row + 1 };
}

/** Where a line from the centre of one card toward another leaves the first card, `gap` units clear of its edge. */
function edgePoint(from: DeviceBox, toward: DeviceBox, gap: number): Pt {
  const dx = toward.cx - from.cx;
  const dy = toward.cy - from.cy;
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : (from.w / 2 + gap) / Math.abs(dx);
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : (from.h / 2 + gap) / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: from.cx + dx * t, y: from.cy + dy * t };
}

/** The widest cell of each column, ever (starting rows and every later update), in units. */
export function columnWidths(spec: NetStepSpec, tableId: string): number[] {
  const table = spec.tables?.find((t) => t.id === tableId);
  if (!table) return [];
  const widths = table.columns.map((c) => c.length);
  for (let n = 0; n <= spec.steps.length; n += 1) {
    for (const row of tablesAfter(spec, n)[tableId] ?? []) row.forEach((cell, c) => (widths[c] = Math.max(widths[c] ?? 0, cell.length)));
  }
  return widths.map((chars) => chars * CHAR_W);
}

/** The caption of a step wrapped to the picture, as lines. */
export const captionLinesOf = (caption: string): string[] => wrapWords(caption, CAPTION_CHARS);

/** Where the packet marker is, `t` (0 to 1) of the way along the visible line, kept off both cards. */
export function markerAt(link: LinkGeom, reverse: boolean, t: number): Pt {
  const a = reverse ? link.p2 : link.p1;
  const b = reverse ? link.p1 : link.p2;
  const k = 0.12 + 0.76 * Math.min(1, Math.max(0, t));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

export function layoutNetStep(spec: NetStepSpec): NetStepLayout {
  const lines = Math.max(0, ...spec.devices.map((d) => d.addresses?.length ?? 0));
  const cardH = cardHeight(lines);

  // Header: one muted step line, then the caption, sized for the longest caption.
  const captionLines = Math.max(1, wrapWords(PICK_PLACEHOLDER, CAPTION_CHARS).length, ...spec.steps.map((s) => captionLinesOf(s.caption).length));
  const stepLineY = 22;
  const captionY = stepLineY + LINE_H;
  const headerH = 8 + LINE_H * (1 + captionLines) + 8;

  // Devices: the author's y is relative; the topmost card sits just under the header.
  const minTop = Math.min(...spec.devices.map((d) => d.y - cardH / 2));
  const shift = headerH + 8 - minTop;
  const devices: DeviceBox[] = spec.devices.map((d) => ({
    id: d.id,
    kind: d.kind,
    label: d.label,
    addresses: d.addresses ?? [],
    cx: d.x,
    cy: d.y + shift,
    x: d.x - CARD_W / 2,
    y: d.y + shift - cardH / 2,
    w: CARD_W,
    h: cardH,
  }));
  const byId = new Map(devices.map((d) => [d.id, d]));
  const topoBottom = Math.max(...devices.map((d) => d.y + d.h)) + 10;

  const links: LinkGeom[] = spec.links.map((l, index) => {
    const a = byId.get(l.from)!;
    const b = byId.get(l.to)!;
    const p1 = edgePoint(a, b, 3);
    const p2 = edgePoint(b, a, 3);
    const label = l.label ? { text: l.label, box: { x: (p1.x + p2.x) / 2 - (l.label.length * CHAR_W + 14) / 2, y: (p1.y + p2.y) / 2 - 11, w: l.label.length * CHAR_W + 14, h: 22 } } : null;
    return { index, p1, p2, label };
  });

  // Tray: tall enough for the step that needs the most chip rows.
  const packetSteps = spec.steps.filter((s) => s.packet);
  let y = topoBottom;
  let tray: NetStepLayout["tray"] = null;
  if (packetSteps.length > 0) {
    const rows = Math.max(...packetSteps.map((s) => flowChips(s.packet!.fields, MARGIN + 8, 0, CONTENT_W - 16).rows));
    const box: Box = { x: MARGIN, y: y + 2, w: CONTENT_W, h: 30 + rows * CHIP_PITCH + 2 };
    tray = { box, titleY: box.y + 20, chipsY: box.y + 30, rows };
    y = box.y + box.h;
  }

  // Tables: stacked full width, each tall enough for the most rows it ever holds.
  const tables: TableGeom[] = [];
  for (const t of spec.tables ?? []) {
    const rowsMax = maxRows(spec, t.id);
    const box: Box = { x: MARGIN, y: y + 10, w: CONTENT_W, h: TABLE_HEAD + ROW_H + rowsMax * ROW_H + 8 };
    const colW = columnWidths(spec, t.id);
    const colX: number[] = [];
    let x = MARGIN + 10;
    for (const w of colW) {
      colX.push(x);
      x += w + TABLE_GAP;
    }
    tables.push({
      id: t.id,
      box,
      titleY: box.y + 18,
      headY: box.y + TABLE_HEAD,
      colX,
      colW,
      rowsMax,
      rowY: (r: number) => box.y + TABLE_HEAD + ROW_H + r * ROW_H,
      tagRight: MARGIN + CONTENT_W - 10,
    });
    y = box.y + box.h;
  }

  const hasVerdict = spec.steps.some((s) => s.verdict);
  const bannerY = hasVerdict ? y + 10 : null;
  const height = (bannerY === null ? y : bannerY + BANNER_H) + 12;

  return { width: VIEW_W, height, stepLineY, captionY, captionChars: CAPTION_CHARS, captionLines, devices, links, tray, tables, bannerY };
}

// ---------------------------------------------------------------- authoring checks

const overlaps = (a: Box, b: Box, pad = 0) => a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h;
const inside = (b: Box, w: number, h: number) => b.x >= 0 && b.y >= 0 && b.x + b.w <= w && b.y + b.h <= h;

/** Problems with the picture the data would draw. An empty list means no label can touch a shape or another label. */
export function layoutProblems(spec: NetStepSpec): string[] {
  const layout = layoutNetStep(spec);
  const out: string[] = [];
  const { devices, links, tray, tables } = layout;

  for (const d of devices) {
    if (!inside({ x: d.x - 6, y: d.y - 6, w: d.w + 12, h: d.h + 12 }, layout.width, layout.height)) out.push(`device ${d.id} (with its ring) leaves the picture`);
    // Label after a 30 unit icon gutter, addresses under it with 6 units each side.
    if (d.label.length * CHAR_W + 30 > d.w - 4) out.push(`device ${d.id}: the label does not fit the card`);
    for (const a of d.addresses) if (a.length * CHAR_W > d.w - 12) out.push(`device ${d.id}: the address ${a} does not fit the card`);
  }
  for (let a = 0; a < devices.length; a += 1) {
    for (let b = a + 1; b < devices.length; b += 1) if (overlaps(devices[a], devices[b], 4)) out.push(`devices ${devices[a].id} and ${devices[b].id} overlap`);
  }
  links.forEach((l, i) => {
    if (!l.label) return;
    if (!inside(l.label.box, layout.width, layout.height)) out.push(`link ${i}: the label leaves the picture`);
    for (const d of devices) if (overlaps(l.label.box, d, 4)) out.push(`link ${i}: the label touches ${d.id}`);
    links.forEach((m, j) => {
      if (j > i && m.label && overlaps(l.label!.box, m.label.box, 4)) out.push(`links ${i} and ${j}: the labels touch`);
    });
  });
  // A link must have room to ride a packet: its visible line is at least 24 units.
  links.forEach((l, i) => {
    if (Math.hypot(l.p2.x - l.p1.x, l.p2.y - l.p1.y) < 24) out.push(`link ${i} is shorter than 24 units`);
  });

  spec.steps.forEach((s, n) => {
    for (const line of captionLinesOf(s.caption)) if (line.length * CAPTION_CHAR_W > CONTENT_W) out.push(`step ${n + 1}: a caption line is too wide`);
    if (!s.packet || !tray) return;
    const { chips } = flowChips(s.packet.fields, tray.box.x + 8, tray.chipsY, tray.box.w - 16);
    chips.forEach((c, i) => {
      if (c.x + c.w > tray.box.x + tray.box.w - 8) out.push(`step ${n + 1}: chip ${i} is wider than the tray`);
      if (c.y + c.h > tray.box.y + tray.box.h) out.push(`step ${n + 1}: chip ${i} leaves the tray`);
      for (let j = i + 1; j < chips.length; j += 1) if (overlaps(c, chips[j])) out.push(`step ${n + 1}: chips ${i} and ${j} overlap`);
    });
  });

  for (const t of tables) {
    const total = t.colW.reduce((sum, w) => sum + w, 0) + TABLE_GAP * Math.max(0, t.colW.length - 1);
    if (total > TABLE_COLUMNS_W) out.push(`table ${t.id}: the columns are ${total} units, the room is ${TABLE_COLUMNS_W}`);
    if ("changed".length * CHAR_W + 10 > TAG_W) out.push("the changed tag does not fit its slot");
    if (!inside(t.box, layout.width, layout.height)) out.push(`table ${t.id} leaves the picture`);
  }
  for (let a = 0; a < tables.length; a += 1) {
    for (let b = a + 1; b < tables.length; b += 1) if (overlaps(tables[a].box, tables[b].box)) out.push(`tables ${tables[a].id} and ${tables[b].id} overlap`);
  }
  if (tray && tables[0] && overlaps(tray.box, tables[0].box)) out.push("the tray and the first table overlap");
  return out;
}
