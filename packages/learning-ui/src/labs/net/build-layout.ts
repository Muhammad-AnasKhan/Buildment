// Where the address labels on a cable's two ends go. A label sits just
// outside its own device's card, beside the cable rather than on it, and never
// over any card or over the other label, so every address can be read. When a
// cable is too short for the whole label it drops the address and keeps the
// interface name.

import type { BuildDevice, BuildState } from "./build-model";
import { CANVAS_H, CANVAS_W, NODE_H, NODE_W, deviceById, endpointDevice, endpointIface } from "./build-model";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LabelBox extends Rect {
  // The cable end it belongs to: "laptop.eth0".
  end: string;
  iface: string;
  // Absent when the cable is too short to show it.
  addr?: string;
}

const MAX_ADDR_CHARS = 20;
const PAD = 4;
const LIFT_STEP = 6;
const LIFT_MAX = NODE_H;

// A card's rectangle on the canvas (x and y are its top left corner).
export function cardRect(d: BuildDevice): Rect {
  return { x: d.x - NODE_W / 2, y: d.y - NODE_H / 2, w: NODE_W, h: NODE_H };
}

export function overlaps(a: Rect, b: Rect, gap = 0): boolean {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

const shown = (text: string) => (text.length > MAX_ADDR_CHARS ? `${text.slice(0, MAX_ADDR_CHARS - 1)}…` : text);

function sizeOf(iface: string, addr?: string): { w: number; h: number } {
  const w = Math.max(iface.length * 6, (addr?.length ?? 0) * 6.6) + 8;
  return { w: Math.ceil(w), h: addr ? 24 : 14 };
}

export function cableLabels(state: BuildState): LabelBox[] {
  const cards = state.devices.map(cardRect);
  const placed: LabelBox[] = [];
  for (const cable of state.cables) {
    const ends = [cable.a, cable.b];
    ends.forEach((end, side) => {
      const self = deviceById(state, endpointDevice(end));
      const other = deviceById(state, endpointDevice(ends[1 - side]));
      if (!self || !other) return;
      const iface = endpointIface(end);
      const text = self.kind === "switch" ? "" : (self.addrs[iface] ?? "").trim();
      const dx = other.x - self.x;
      const dy = other.y - self.y;
      const len = Math.hypot(dx, dy) || 1;
      // Seen from its own device, the left of the cable: the two ends of one
      // cable therefore land on opposite sides of it.
      const px = dy / len;
      const py = -dx / len;
      for (const addr of text ? [shown(text), undefined] : [undefined]) {
        const { w, h } = sizeOf(iface, addr);
        const off = (w / 2) * Math.abs(px) + (h / 2) * Math.abs(py) + 3;
        // First hug the cable; if the cards leave no room beside it, stand the
        // label further off the cable, clear of the card's edge.
        for (let lift = 0; lift <= LIFT_MAX; lift += LIFT_STEP) {
          for (const sign of [1, -1]) {
            for (let along = 0; along <= len; along += 4) {
              const cx = self.x + (dx / len) * along + px * (off + lift) * sign;
              const cy = self.y + (dy / len) * along + py * (off + lift) * sign;
              const box: LabelBox = { end, iface, addr, x: cx - w / 2, y: cy - h / 2, w, h };
              const inside = box.x >= 0 && box.y >= 0 && box.x + box.w <= CANVAS_W && box.y + box.h <= CANVAS_H;
              if (inside && !cards.some((c) => overlaps(box, c, PAD)) && !placed.some((p) => overlaps(box, p, 2))) {
                placed.push(box);
                return;
              }
            }
          }
        }
      }
      // No clear spot at all: sit at the middle of the cable, interface name only.
      const { w, h } = sizeOf(iface);
      placed.push({ end, iface, x: (self.x + other.x) / 2 - w / 2, y: (self.y + other.y) / 2 - h / 2 - 12 * (side === 0 ? 1 : -1), w, h });
    });
  }
  return placed;
}
