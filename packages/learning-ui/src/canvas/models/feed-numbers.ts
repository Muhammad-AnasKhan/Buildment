// Course numbers for Hikaya (the made-up social app of module 21), in one
// place so the four playables of the module and the watch-only scenes agree.
// Defined in chapters 21.1 to 21.3. Plain data, no React.

/** A day is 86,400 seconds. */
export const SECONDS_PER_DAY = 86_400;
/** The busiest second is this many times the average. */
export const PEAK_FACTOR = 3;
/** Course defaults for chapter 21.1. */
export const DEFAULT_DAILY_USERS = 50_000_000;
export const DEFAULT_OPENS = 10;
export const DEFAULT_FOLLOWS = 150;
/** Posts per daily user per day. */
export const POSTS_PER_USER = 0.2;
/** A timeline holds this many post ids of this many bytes. */
export const IDS_PER_TIMELINE = 800;
export const BYTES_PER_ID = 8;
/** Chapter 21.2: more course assumptions for the action map. */
export const PROFILE_VIEWS_PER_USER = 5;
export const FOLLOWS_PER_USER = 0.1;
/** Chapter 21.3: the fan-out fleet is planned at half its 300,000 maximum. */
export const FANOUT_PLAN = 150_000;
/** A lookup is slow this often, independently ("The Tail at Scale", chapter 2.4). */
export const SLOW_LOOKUP = 0.01;
/** At most this share of feed opens may meet a slow lookup. */
export const SLOW_SHARE_LIMIT = 0.2;
/** Accounts in the course (chapter 21.1). */
export const ACCOUNTS = 100_000_000;
