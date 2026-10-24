// 24.2 beat 2 "A short code for every box". A geohash names a box; each added
// letter picks one of 32 sub-boxes. Pure functions, no React.
//
// A letter is 5 bits. Bits alternate longitude, latitude, longitude, and so on,
// starting with longitude, across the whole code. So an odd letter (1, 3, 5, 7)
// spends 3 bits on longitude and 2 on latitude (8 columns by 4 rows), and an
// even letter (2, 4, 6) spends 2 on longitude and 3 on latitude (4 columns by
// 8 rows). North is at the top and west at the left.

export const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
export const MAX_LETTERS = 7;
/** Metres in one degree at the equator, as the module uses. */
export const METRES_PER_DEGREE = 111_195;

export type Grid = {
  cols: number;
  rows: number;
  /** letters[row][col], rows north to south, columns west to east. */
  letters: string[][];
};

/** The grid of sub-boxes that the letter at 1-based `position` chooses from. */
export function gridFor(position: number): Grid {
  const lonFirst = (5 * (position - 1)) % 2 === 0;
  const cols = lonFirst ? 8 : 4;
  const rows = lonFirst ? 4 : 8;
  const letters: string[][] = Array.from({ length: rows }, () => Array<string>(cols).fill(""));
  for (let v = 0; v < 32; v++) {
    let lon = 0;
    let lat = 0;
    for (let j = 0; j < 5; j++) {
      const bit = (v >> (4 - j)) & 1;
      const isLon = (5 * (position - 1) + j) % 2 === 0;
      if (isLon) lon = lon * 2 + bit;
      else lat = lat * 2 + bit;
    }
    letters[rows - 1 - lat][lon] = BASE32[v];
  }
  return { cols, rows, letters };
}

/** Where a letter sits in the grid for its position, or null if it is not a geohash letter. */
export function cellOf(position: number, letter: string): { col: number; row: number; cols: number; rows: number } | null {
  const g = gridFor(position);
  for (let row = 0; row < g.rows; row++) {
    const col = g.letters[row].indexOf(letter);
    if (col >= 0) return { col, row, cols: g.cols, rows: g.rows };
  }
  return null;
}

/** Width and height in metres of a box named by `letters` letters, at the equator. */
export function boxMetres(letters: number): { width: number; height: number } {
  const bits = 5 * letters;
  const lonBits = Math.ceil(bits / 2);
  const latBits = Math.floor(bits / 2);
  return {
    width: (360 / Math.pow(2, lonBits)) * METRES_PER_DEGREE,
    height: (180 / Math.pow(2, latBits)) * METRES_PER_DEGREE,
  };
}

const withCommas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** One side of a box in plain words: "5,004 km", "39.1 km", "1.2 km", "0.6 km", "153 m". */
export function lengthText(metres: number): string {
  const km = metres / 1000;
  if (km >= 100) return `${withCommas(km)} km`;
  if (km >= 10) return `${km.toFixed(1)} km`;
  if (km >= 0.5) return `${km.toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

/** "1.2 km by 0.6 km", or "the whole world" for no letters. */
export function boxSizeText(letters: number): string {
  if (letters === 0) return "the whole world";
  const { width, height } = boxMetres(letters);
  return `${lengthText(width)} by ${lengthText(height)}`;
}

export type PickKind = "start" | "zoom" | "branch";

/**
 * What the last tap was. `popped` is the letter the learner just went Back
 * from, with the position it had; picking a different letter at that position
 * is the lesson "same start, same neighbourhood".
 */
export function pickKind(popped: { position: number; letter: string } | null, position: number, letter: string): PickKind {
  return popped && popped.position === position && popped.letter !== letter ? "branch" : "zoom";
}

export type Verdict = { text: string; tone: "good" | "accent" };

/** At most 38 characters. */
export function zoomVerdict(kind: PickKind): Verdict {
  if (kind === "branch") return { text: "Same start, same neighbourhood", tone: "accent" };
  if (kind === "zoom") return { text: "Longer code, smaller box", tone: "good" };
  return { text: "Tap a box to add a letter", tone: "accent" };
}

export type NestedRect = { x: number; y: number; w: number; h: number };

/**
 * The chain of boxes for the small inset: each box is drawn inside the one
 * before it, toward the corner of the sub-box that was tapped. Sizes shrink by
 * a fixed factor so seven nested boxes stay visible (the true shrink is 8 or 4
 * times a letter). Rectangles are in a frame of the given size.
 */
export function nestedBoxes(path: readonly string[], frameW: number, frameH: number, shrink = 0.7): NestedRect[] {
  const out: NestedRect[] = [{ x: 0, y: 0, w: frameW, h: frameH }];
  let cur = out[0];
  path.forEach((letter, i) => {
    const cell = cellOf(i + 1, letter);
    const fx = cell && cell.cols > 1 ? cell.col / (cell.cols - 1) : 0.5;
    const fy = cell && cell.rows > 1 ? cell.row / (cell.rows - 1) : 0.5;
    const w = cur.w * shrink;
    const h = cur.h * shrink;
    cur = { x: cur.x + (cur.w - w) * fx, y: cur.y + (cur.h - h) * fy, w, h };
    out.push(cur);
  });
  return out;
}

// ---------- Drawing: where a sub-box sits, and how the camera moves ----------

export type Rect = { x: number; y: number; w: number; h: number };

/** The rectangle of the sub-box at (col, row) in a grid of cols by rows laid over `area`. */
export function cellRect(area: Rect, cols: number, rows: number, col: number, row: number): Rect {
  const w = area.w / cols;
  const h = area.h / rows;
  return { x: area.x + col * w, y: area.y + row * h, w, h };
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** A CSS transform that carries the rectangle `from` onto the rectangle `to` (origin at the picture's 0, 0). */
export function mapTransform(from: Rect, to: Rect): string {
  const sx = to.w / from.w;
  const sy = to.h / from.h;
  return `translate(${r3(to.x - from.x * sx)}px, ${r3(to.y - from.y * sy)}px) scale(${r3(sx)}, ${r3(sy)})`;
}

/** Index (row * cols + col) of the sub-box under a point, or null outside the area. */
export function cellIndexAt(area: Rect, cols: number, rows: number, px: number, py: number): number | null {
  if (px < area.x || py < area.y || px > area.x + area.w || py > area.y + area.h) return null;
  const col = Math.min(cols - 1, Math.floor(((px - area.x) / area.w) * cols));
  const row = Math.min(rows - 1, Math.floor(((py - area.y) / area.h) * rows));
  return row * cols + col;
}

/** The next index for an arrow key inside a grid, or null if the key does nothing. */
export function moveInGrid(index: number, cols: number, rows: number, key: string): number | null {
  const col = index % cols;
  const row = Math.floor(index / cols);
  switch (key) {
    case "ArrowRight": return row * cols + Math.min(cols - 1, col + 1);
    case "ArrowLeft": return row * cols + Math.max(0, col - 1);
    case "ArrowDown": return Math.min(rows - 1, row + 1) * cols + col;
    case "ArrowUp": return Math.max(0, row - 1) * cols + col;
    case "Home": return 0;
    case "End": return cols * rows - 1;
    default: return null;
  }
}
