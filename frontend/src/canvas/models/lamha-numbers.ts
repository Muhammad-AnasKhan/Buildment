// Course numbers for Lamha (the made-up video platform of module 27), in one
// place so the five playables and the watch-only scenes agree. Defined in
// chapters 27.1 to 27.5. Plain data, no React.

export const SECONDS_PER_DAY = 86_400;
export const MINUTES_PER_DAY = 1_440;
/** The busiest second is this many times the average. */
export const PEAK_FACTOR = 3;
/** Average video sent to a viewer, in Mbit/s. */
export const SENT_MBIT = 2;
/** Source plus a ladder of five versions, in MB, for a 5 minute video. */
export const STORED_MB_PER_VIDEO = 739;
/** Making the whole ladder costs this many worker-minutes for a 5 minute video. */
export const WORKER_MINUTES_PER_VIDEO = 15;
export const WORKER_SECONDS_PER_VIDEO = WORKER_MINUTES_PER_VIDEO * 60;

export const DEFAULT_VIEWS = 1_000_000_000;
export const DEFAULT_MINUTES = 3;
export const DEFAULT_UPLOADS = 500_000;

/** A sending machine pushes 100 Gbit/s and is planned at half. */
export const SEND_PLAN_GBIT = 50;
/** Storage should send at most this much at peak, in Tbit/s. */
export const ORIGIN_BUDGET_TBIT = 1;
/** Peak video sent with the default inputs, in Tbit/s. */
export const PEAK_SENT_TBIT = 12.5;
/** Busy transcoding machines at peak with the default inputs. */
export const PEAK_MACHINES = 15_625;

/** A viral video's views a second (chapter 27.5). */
export const VIRAL_VIEWS = 5_000;
/** A shard row takes this many writes a second [S40], and is planned at half. */
export const ROW_LIMIT = 1_000;
export const ROW_PLAN = 500;

/** Uploads a second: 500,000 a day on average, and in the busy hour. */
export const AVERAGE_UPLOADS = 5.8;
