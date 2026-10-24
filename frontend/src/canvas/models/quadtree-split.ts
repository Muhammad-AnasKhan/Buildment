// 24.2 beat 5 "Crowded places need smaller boxes". A quadtree cuts only a
// crowded box into four, again and again, until no box holds too many
// drivers. Pure functions, no React.
//
// The city is the unit square with 40 drivers spread evenly. The stadium crowd
// is spread evenly inside one square that is 1/16 of the city: the first
// quadrant at level 1 and again at level 2 (the north-west corner).

export const CROWD_STOPS = [0, 100, 500, 1_000, 3_000, 6_000] as const;
export const LIMIT_STEPS = [100, 500] as const;
export const DEFAULT_CROWD = 3_000;
export const DEFAULT_LIMIT = 500;
export const BACKGROUND = 40;
export const MAX_LEVEL = 12;
/** The hot square: x and y from 0 to HOT. */
export const HOT = 0.25;

export type Leaf = {
  level: number;
  /** Column and row of the box at its level (0 is the north-west). */
  ix: number;
  iy: number;
  count: number;
};

export type Quadtree = {
  leaves: Leaf[];
  boxes: number;
  /** The most drivers in one box, rounded. */
  fullest: number;
  fullestLeaf: Leaf;
  /** The deepest level of any box; 0 is the whole city. */
  levels: number;
};

/** Drivers in the box: the evenly spread city plus the share of the crowd that falls inside it. */
export function countIn(level: number, ix: number, iy: number, crowd: number): number {
  const size = 1 / 2 ** level;
  const x0 = ix * size;
  const y0 = iy * size;
  const overlapX = Math.max(0, Math.min(x0 + size, HOT) - Math.max(x0, 0));
  const overlapY = Math.max(0, Math.min(y0 + size, HOT) - Math.max(y0, 0));
  const share = (overlapX * overlapY) / (HOT * HOT);
  return BACKGROUND * size * size + crowd * share;
}

export function quadtree(crowd: number, limit: number): Quadtree {
  const leaves: Leaf[] = [];
  const cut = (level: number, ix: number, iy: number) => {
    const count = countIn(level, ix, iy, crowd);
    if (count > limit && level < MAX_LEVEL) {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) cut(level + 1, ix * 2 + dx, iy * 2 + dy);
    } else {
      leaves.push({ level, ix, iy, count });
    }
  };
  cut(0, 0, 0);
  let fullestLeaf = leaves[0];
  for (const l of leaves) if (l.count > fullestLeaf.count) fullestLeaf = l;
  return {
    leaves,
    boxes: leaves.length,
    fullest: Math.round(fullestLeaf.count),
    fullestLeaf,
    levels: Math.max(...leaves.map((l) => l.level)),
  };
}

/** Drivers in the one box a fixed grid puts over the stadium: the crowd and the city's share. */
export const fixedGridFullest = (crowd: number) => crowd + BACKGROUND;

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function quadVerdict(crowd: number, q: Quadtree): Verdict {
  if (crowd === 0) return { text: "Quiet city: one box is enough", tone: "good" };
  if (q.boxes === 1) return { text: "Below the limit: still one box", tone: "good" };
  return { text: "Dense places split deeper", tone: "good" };
}

/** True when the fixed grid chip should carry the warning "a fixed grid would hold it all". */
export const fixedGridWarns = (crowd: number) => crowd >= 1_000;

export const FIXED_GRID_WARNING = "A fixed grid would hold it all";

const withCommas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function valueText(crowd: number, q: Quadtree): string {
  return `${withCommas(crowd)} drivers in the stadium, ${q.boxes} ${q.boxes === 1 ? "box" : "boxes"}, fullest ${withCommas(q.fullest)}`;
}

/** Deterministic points in the unit square (the R2 sequence), so a crowd draws the same every time. */
export function scatter(n: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 1; i <= n; i++) out.push({ x: (i * 0.7548776662466927) % 1, y: (i * 0.5698402909980532) % 1 });
  return out;
}

/** How many dots stand for a crowd in the picture. */
export const crowdDots = (crowd: number) => (crowd <= 0 ? 0 : Math.round(Math.sqrt(crowd) * 1.6));
