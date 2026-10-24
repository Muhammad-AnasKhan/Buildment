// 19.2 beat 2: more zones raise uptime only until the shared parts dominate.
// Made-up course numbers: a zone is up 99.9% of the time, the shared layer
// (load balancer rules, deploy tool) 99.95%, and zone faults never happen
// together. A year has 525,600 minutes.

export const ZONE_AVAILABILITY = 0.999;
export const SHARED_AVAILABILITY = 0.9995;
export const MINUTES_A_YEAR = 525_600;
export const ZONE_COUNTS = [1, 2, 3, 4] as const;
export const DEFAULT_ZONES = 3;

/** Availability of the app with n zones: shared x (1 - (1 - zone)^n). */
export function availability(n: number): number {
  return SHARED_AVAILABILITY * (1 - Math.pow(1 - ZONE_AVAILABILITY, n));
}

/** Minutes down in a year with n zones. */
export function downtimeMinutes(n: number): number {
  return (1 - availability(n)) * MINUTES_A_YEAR;
}

/** Minutes down in a year caused by the shared layer alone: the floor no zone count can pass. */
export const SHARED_DOWNTIME_MINUTES = (1 - SHARED_AVAILABILITY) * MINUTES_A_YEAR;

/** Capacity to buy, as a multiple of the peak, so that the app survives the loss of any one zone. */
export function capacityMultiple(n: number): number {
  return n <= 1 ? 1 : n / (n - 1);
}

/**
 * How full a live zone is when `failed` zones are down, as a share of that zone's
 * capacity (1 is 100%). Null when no zone is live. One zone has capacity for the
 * whole peak and nothing to fall back on.
 */
export function loadShare(n: number, failed: number): number | null {
  if (failed >= n) return null;
  if (n <= 1) return 1;
  return (n - 1) / (n - failed);
}

/** The app is down when no zone is live, or the live ones would be asked for more than 100%. */
export function appDown(n: number, failed: number, badRelease: boolean): boolean {
  if (badRelease) return true;
  const load = loadShare(n, failed);
  return load === null || load > 1 + 1e-9;
}

/** The failed zones that count: only the zones that exist (the first n). */
export function failedCount(n: number, failed: readonly boolean[]): number {
  return failed.slice(0, n).filter(Boolean).length;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(n: number, failed: number, badRelease: boolean): Verdict {
  if (badRelease) return { text: "Same bug everywhere: all zones down", tone: "bad" };
  if (failed > 0) {
    if (appDown(n, failed, false)) {
      if (n === 1) return { text: "Zone down: the app is down", tone: "bad" };
      if (failed >= n) return { text: "All zones down: the app is down", tone: "bad" };
      return { text: "Zones down: the rest are overloaded", tone: "bad" };
    }
    return { text: "Zone down: the others carry the load", tone: "warn" };
  }
  switch (n) {
    case 1:
      return { text: "One zone: any zone fault is an outage", tone: "bad" };
    case 2:
      return { text: "Survives a zone; costs 2.00 x capacity", tone: "warn" };
    case 3:
      return { text: "Survives a zone for 1.50 x capacity", tone: "good" };
    default:
      return { text: "A 4th zone adds cost, not uptime", tone: "warn" };
  }
}

export const formatAvailability = (a: number) => `${(a * 100).toFixed(3)}%`;
export const formatMultiple = (m: number) => `${m.toFixed(2)} x peak`;
export const formatMinutes = (m: number) => `${Math.round(m).toLocaleString("en-US")} min`;
export const formatHours = (m: number) => `${(m / 60).toFixed(1)} h`;
export const zoneName = (i: number) => `Zone ${String.fromCharCode(65 + i)}`;
