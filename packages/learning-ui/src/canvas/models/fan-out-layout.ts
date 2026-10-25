import { clampBackends } from "./fan-out";

// Where the backends of the fan-out picture sit. Pure geometry, so a test can
// say "100 backends never overlap and stay inside the panel". The tiles scale
// with n: a few get big cards with a reading each, many become a grid of
// small tiles.

/** The panel the backends sit in, in viewBox units. */
export const PANEL = { x: 12, y: 48, w: 396, h: 132 } as const;
/** The area for tiles inside the panel (the heading sits above it). */
export const AREA = { x0: 24, x1: 396, y0: 78, y1: 172 } as const;
/** The most backends that still get a card with text inside. */
export const CARD_MAX = 6;
const MAX_CELL = 60;
/** Share of a grid cell the tile fills; the rest is the gap. */
const FILL = 0.82;

/** The centre of one backend's tile; frac is 0 at the left edge of the area and 1 at the right. */
export type BackendTile = { x: number; y: number; frac: number };
export type BackendGrid = { cols: number; rows: number; cell: number; w: number; h: number; card: boolean; tiles: BackendTile[] };

export function backendGrid(n: number): BackendGrid {
  const count = clampBackends(n);
  const aw = AREA.x1 - AREA.x0;
  const ah = AREA.y1 - AREA.y0;
  let cols = 1;
  let best = 0;
  for (let c = 1; c <= count; c++) {
    const size = Math.min(aw / c, ah / Math.ceil(count / c));
    if (size > best + 1e-9) {
      best = size;
      cols = c;
    }
  }
  const rows = Math.ceil(count / cols);
  const cell = Math.min(best, MAX_CELL);
  const size = Math.round(cell * FILL);
  const card = count <= CARD_MAX;
  const top = AREA.y0 + (ah - rows * cell) / 2 + cell / 2;
  const mid = (AREA.x0 + AREA.x1) / 2;
  const tiles: BackendTile[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, count - r * cols);
    const x = mid + ((i % cols) - (inRow - 1) / 2) * cell;
    tiles.push({ x, y: top + r * cell, frac: (x - AREA.x0) / aw });
  }
  return { cols, rows, cell, w: size, h: card ? Math.min(size, 48) : size, card, tiles };
}
