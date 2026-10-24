// 24.2 beat 3 "Close drivers can have different codes". A rider, five drivers
// and a grid of geohash boxes. How many rings of boxes must be read to find
// every driver inside the search circle? Pure functions, no React.
//
// World in metres. The equator and the 0 degree meridian run through the
// origin, so x = 0 and y = 0 are box edges at every letter count. North is +y.

export const LETTER_STEPS = [5, 6, 7] as const;
export const RADIUS_STEPS = [500, 1000, 2000] as const;
export const DEFAULT_LETTERS = 6;
export const DEFAULT_RADIUS = 1000;
export const DEFAULT_MODE: Mode = "nine";

export type Mode = "own" | "nine" | "reach";
export const MODES: readonly { id: Mode; text: string; label: string }[] = [
  { id: "own", text: "Own box only", label: "Read only the rider's own box" },
  { id: "nine", text: "Nine boxes", label: "Read the rider's box and its eight neighbours" },
  { id: "reach", text: "Rings to reach", label: "Read as many rings of boxes as the radius needs" },
];

export type Point = { x: number; y: number };
export const RIDER_START: Point = { x: -15, y: 10 };

export const DRIVERS: readonly { id: string; at: Point }[] = [
  { id: "D1", at: { x: 15, y: 10 } },
  { id: "D2", at: { x: -15, y: 410 } },
  { id: "D3", at: { x: -15, y: 1590 } },
  { id: "D4", at: { x: 700, y: 10 } },
  { id: "D5", at: { x: -15, y: 2610 } },
];

/** Box width and height in metres, as chapter 24.2 states them. */
export const BOX: Record<number, { w: number; h: number }> = {
  5: { w: 4887, h: 4887 },
  6: { w: 1222, h: 611 },
  7: { w: 153, h: 153 },
};

/** Drivers in each square kilometre (a busy centre; a course number). */
export const DRIVERS_PER_KM2 = 100;
/** More than this many drivers to measure is called a very big box. */
export const BIG_SCAN = 5_000;

export type Box = { col: number; row: number };

export const boxOf = (p: Point, letters: number): Box => ({ col: Math.floor(p.x / BOX[letters].w), row: Math.floor(p.y / BOX[letters].h) });

/** Rings of boxes needed so every direction reaches the radius, wherever the rider stands in the middle box. */
export function ringsToReach(letters: number, radius: number): number {
  return Math.max(Math.ceil(radius / BOX[letters].w), Math.ceil(radius / BOX[letters].h));
}

export function ringsFor(mode: Mode, letters: number, radius: number): number {
  return mode === "own" ? 0 : mode === "nine" ? 1 : ringsToReach(letters, radius);
}

export type DriverStatus = "found" | "missed" | "outside";

export type DriverResult = { id: string; at: Point; metres: number; inCircle: boolean; read: boolean; status: DriverStatus };

export type CellEdgeResult = {
  rider: Box;
  rings: number;
  boxesRead: number;
  areaKm2: number;
  /** Drivers to measure: the area as shown (215, 18.7, 5.3 km2) times 100. */
  driversToMeasure: number;
  exactDrivers: number;
  drivers: DriverResult[];
};

/** The area as the picture writes it: whole km2 from 100, one decimal from 1, else two. */
export function areaShown(km2: number): number {
  const dp = km2 >= 100 ? 0 : km2 >= 1 ? 1 : 2;
  return Number(km2.toFixed(dp));
}

export function cellEdge(rider: Point, letters: number, radius: number, mode: Mode): CellEdgeResult {
  const { w, h } = BOX[letters];
  const rb = boxOf(rider, letters);
  const rings = ringsFor(mode, letters, radius);
  const boxesRead = (2 * rings + 1) ** 2;
  const areaKm2 = (boxesRead * w * h) / 1e6;
  const exactDrivers = areaKm2 * DRIVERS_PER_KM2;
  const drivers = DRIVERS.map((d) => {
    const metres = Math.hypot(d.at.x - rider.x, d.at.y - rider.y);
    const b = boxOf(d.at, letters);
    const read = Math.abs(b.col - rb.col) <= rings && Math.abs(b.row - rb.row) <= rings;
    const inCircle = metres <= radius;
    const status: DriverStatus = !inCircle ? "outside" : read ? "found" : "missed";
    return { id: d.id, at: d.at, metres, inCircle, read, status };
  });
  return { rider: rb, rings, boxesRead, areaKm2, driversToMeasure: Math.round(areaShown(areaKm2) * DRIVERS_PER_KM2), exactDrivers, drivers };
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function edgeVerdict(r: CellEdgeResult): Verdict {
  if (r.drivers.some((d) => d.status === "missed")) return { text: "Missed a driver across the edge", tone: "bad" };
  if (r.exactDrivers > BIG_SCAN) return { text: "Found, but a very big box to scan", tone: "warn" };
  return { text: "All drivers in range were found", tone: "good" };
}

const withCommas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** "9 boxes read, 21,500 drivers to measure". */
export function costText(r: CellEdgeResult): string {
  return `${withCommas(r.boxesRead)} ${r.boxesRead === 1 ? "box" : "boxes"} read, ${withCommas(r.driversToMeasure)} drivers to measure`;
}

export function distanceText(metres: number): string {
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.round(metres)} m`;
}

export const radiusText = (radius: number) => `${radius / 1000} km`;

/** "D1 found, 30 m". */
export function driverLabel(d: DriverResult): string {
  const word = d.status === "found" ? "found" : d.status === "missed" ? "missed" : "outside the circle";
  return `${d.id} ${word}, ${distanceText(d.metres)}`;
}

export type View = {
  /** World rectangle shown, in metres. */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Pixels (viewBox units) per metre. */
  scale: number;
};

/**
 * The part of the world the picture shows: the rider's starting box and the
 * search circle all round it, fitted into a rectangle of the given size.
 */
export function viewFor(letters: number, radius: number, width: number, height: number): View {
  const { w, h } = BOX[letters];
  const start = boxOf(RIDER_START, letters);
  const margin = 1.1 * radius;
  const bx0 = start.col * w - margin;
  const bx1 = (start.col + 1) * w + margin;
  const by0 = start.row * h - margin;
  const by1 = (start.row + 1) * h + margin;
  const scale = Math.min(width / (bx1 - bx0), height / (by1 - by0));
  const wx = width / scale;
  const wy = height / scale;
  const cx = (bx0 + bx1) / 2;
  const cy = (by0 + by1) / 2;
  return { x0: cx - wx / 2, x1: cx + wx / 2, y0: cy - wy / 2, y1: cy + wy / 2, scale };
}

export const clampPoint = (p: Point, v: View): Point => ({
  x: Math.max(v.x0, Math.min(v.x1, p.x)),
  y: Math.max(v.y0, Math.min(v.y1, p.y)),
});

/** Arrow-key step for the rider, in metres. */
export const STEP_METRES = 50;
