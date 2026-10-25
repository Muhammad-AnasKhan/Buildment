// Beat 1 of 10.6 in slow motion: 5 ms of clock time per second. Both writes
// land 1.2 s into the loop, when A's clock reads .000 and B's (1 ms ahead)
// reads .001. Past the end of the loop (reduced motion) shows the stamped frame.

export const TWO_CLOCKS_LOOP = 5;
const LAND = 1.2;

export type TwoClocksFrame = { clockA: string; clockB: string; stamped: boolean; dropY: number };

export function twoClocksFrame(seconds: number): TwoClocksFrame {
  const final = !Number.isFinite(seconds) || seconds >= 1e5;
  const t = final ? TWO_CLOCKS_LOOP - 0.01 : ((seconds % TWO_CLOCKS_LOOP) + TWO_CLOCKS_LOOP) % TWO_CLOCKS_LOOP;
  const ms = (994 + Math.floor(t * 5)) % 1000;
  const fmt = (v: number) => (v >= 994 ? "11:59:59." : "12:00:00.") + String(v).padStart(3, "0");
  const p = Math.min(1, t / LAND);
  const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return { clockA: fmt(ms), clockB: fmt((ms + 1) % 1000), stamped: t >= LAND, dropY: 46 + (110 - 46) * eased };
}
