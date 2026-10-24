import { withCommas } from "./picture-controls";
import { CODES_PER_SECOND, SMS_RATE } from "./dardasha-numbers";
import type { Tone } from "../primitives/tones";

// 22.5 "Drag the outage, drop the stale". While the SMS provider is down login
// codes pile up in a first-in, first-out queue. After it returns the queue
// shrinks only by the spare capacity. A code that has waited longer than the
// limit when it reaches the front is dropped, and costs no sending time.
// A one-second simulation, no random numbers. Pure functions, no React.
//
//   codes arrive at 100 a second; nothing is sent during the outage; 150 a second after
//   waiting at the end of the outage = 100 x 60 x L
//   catch-up time without a limit    = L x 100 / (150 - 100) = 2 x L

export const OUTAGE_STEPS = [1, 2, 5, 10] as const;
export const OUTAGE_DEFAULT = 5;
/** Minutes a code may wait before it is dropped; 0 stands for never. */
export const LIMIT_STEPS = [0, 10, 5, 2] as const;
export const LIMIT_DEFAULT = 0;
/** The chart covers this many minutes: the longest outage plus its longest catch-up. */
export const HORIZON_MINUTES = 30;
/** The tallest queue the chart holds: a 10 minute outage. */
export const CHART_MAX = CODES_PER_SECOND * 60 * 10;

export type Outage = {
  outage: number;
  limit: number;
  /** Queue length at the end of each second, from second 0 to HORIZON_MINUTES x 60. */
  series: number[];
  /** Codes waiting when the provider comes back, before anything is dropped or sent. */
  waiting: number;
  /** Codes waiting once the stale ones are dropped (the same as waiting when nothing is dropped). */
  afterDrop: number;
  dropped: number;
  /** Longest a sent code waited, in seconds. */
  longestWait: number;
  /** Seconds after the outage until the queue is empty again. */
  backSeconds: number;
};

export function outageRun(outageMinutes: number, limitMinutes: number): Outage {
  const end = outageMinutes * 60;
  const limit = limitMinutes > 0 ? limitMinutes * 60 : Infinity;
  const horizon = HORIZON_MINUTES * 60;
  // Each batch is the codes that arrived in one second: [arrival second, how many].
  const queue: [number, number][] = [];
  const series: number[] = [];
  let length = 0;
  let dropped = 0;
  let longestWait = 0;
  let waiting = 0;
  let afterDrop = 0;
  let backSeconds = -1;
  for (let t = 0; t <= horizon; t++) {
    if (t === end) waiting = length;
    if (t < end) {
      queue.push([t, CODES_PER_SECOND]);
      length += CODES_PER_SECOND;
    } else {
      queue.push([t, CODES_PER_SECOND]);
      length += CODES_PER_SECOND;
      // Drop what has waited too long, then send up to the provider's rate.
      while (queue.length > 0 && t - queue[0][0] > limit) {
        dropped += queue[0][1];
        length -= queue[0][1];
        queue.shift();
      }
      if (t === end) afterDrop = length - CODES_PER_SECOND;
      let room = SMS_RATE;
      while (room > 0 && queue.length > 0) {
        const take = Math.min(room, queue[0][1]);
        longestWait = Math.max(longestWait, t - queue[0][0]);
        queue[0][1] -= take;
        length -= take;
        room -= take;
        if (queue[0][1] === 0) queue.shift();
      }
      if (length === 0 && backSeconds < 0) backSeconds = t - end + 1;
    }
    series.push(length);
  }
  if (afterDrop === 0 && dropped === 0) afterDrop = waiting;
  return { outage: outageMinutes, limit: limitMinutes, series, waiting, afterDrop, dropped, longestWait, backSeconds: backSeconds < 0 ? horizon - end : backSeconds };
}

export const minutesText = (seconds: number) => {
  const m = Math.round((seconds / 60) * 10) / 10;
  return `${m} min`;
};

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function outageVerdict(r: Outage): Verdict {
  const back = Math.round(r.backSeconds / 60);
  if (r.dropped > 0) return { text: `${withCommas(r.dropped)} stale dropped; clear in ${back} min`, tone: "good" };
  if (r.longestWait >= 120) return { text: `Old codes sent late: clear in ${back} min`, tone: "warn" };
  return { text: `Short outage: clear in ${back} min`, tone: "good" };
}

export const limitText = (limit: number) => (limit === 0 ? "never" : `${limit} min`);

/** The state in one sentence, for a control's value text. */
export function outageValueText(r: Outage): string {
  const rule = r.limit === 0 ? "never drop codes" : `drop codes older than ${r.limit} minutes`;
  return `${r.outage} minute outage, ${rule}, ${withCommas(r.waiting)} waiting at the end, ${withCommas(r.dropped)} dropped, back to normal in ${Math.round(r.backSeconds / 60)} minutes`;
}

/** The queue length where the oldest code is as old as the limit (codes arrive at 100 a second). */
export const limitLine = (limit: number) => limit * 60 * CODES_PER_SECOND;
