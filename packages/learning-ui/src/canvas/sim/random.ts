// A small seeded random source. Same seed, same sequence, so a learner, a
// mentor and a test all see the same run. Canvases that use randomness show
// the seed and offer "New run" instead of calling Math.random.

export type Random = {
  /** A number in [0, 1). */
  next: () => number;
  /** An integer in [min, max], both included. */
  int: (min: number, max: number) => number;
  /** A number in [min, max). */
  between: (min: number, max: number) => number;
};

/** mulberry32: tiny, fast and good enough for teaching models. */
export function seededRandom(seed: number): Random {
  let state = Math.trunc(seed) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    between: (min, max) => min + next() * (max - min),
  };
}
