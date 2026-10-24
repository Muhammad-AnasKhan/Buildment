// Course numbers for Dardasha (the made-up chat app of module 22), in one place
// so the six playables of the module and the watch-only scenes agree. Defined
// in chapters 22.1 to 22.5. Plain data, no React.

export const SECONDS_PER_DAY = 86_400;
export const DAYS_PER_YEAR = 365;
/** Course default: daily users, messages each, devices per user, share online at the busiest time. */
export const DAILY_USERS = 10_000_000;
export const MESSAGES_PER_USER = 40;
export const DEVICES_PER_USER = 1.5;
export const ONLINE_SHARE = 0.2;
/** The busiest second is this many times the average. */
export const PEAK_FACTOR = 3;
/** Average phones that receive each message (a one-to-one chat has 1, a group more). */
export const RECIPIENTS = 3;
/** Bytes stored for one message with its details. */
export const BYTES_PER_MESSAGE = 300;

/** A gateway holds 50,000 lines in the plan and 100,000 at most; it accepts 500 new connections a second. */
export const GATEWAY_PLAN = 50_000;
export const GATEWAY_MAX = 100_000;
export const GATEWAY_ACCEPT = 500;
/** A chat server finishes 4,000 messages a second and is planned at 2,000. */
export const CHAT_PLAN = 2_000;
/** A store node finishes 5,000 writes a second and is planned at 2,500. */
export const STORE_PLAN = 2_500;
/** A registry node finishes 100,000 operations a second and is planned at 50,000. */
export const REGISTRY_PLAN = 50_000;

/** 15 million devices, about 6 status changes a day each, a peak of 3 times the average. */
export const PRESENCE_CHANGES = 3_125;
/** Share of deliveries that find a phone off and need a push. */
export const OFFLINE_SHARE = 0.1;
/** A heartbeat every 30 seconds; the key lives for two beats. */
export const PING_GAP = 30;

/** Codes arrive at 100 a second; the SMS provider accepts 150 a second. */
export const CODES_PER_SECOND = 100;
export const SMS_RATE = 150;

// The default load, worked out from the numbers above and rounded as the chapters do.
export const PEAK_MESSAGES = Math.round(((DAILY_USERS * MESSAGES_PER_USER) / SECONDS_PER_DAY) * PEAK_FACTOR);
export const PEAK_DELIVERIES = Math.round(((DAILY_USERS * MESSAGES_PER_USER) / SECONDS_PER_DAY) * PEAK_FACTOR * RECIPIENTS);
export const OPEN_LINES = Math.round(DAILY_USERS * DEVICES_PER_USER * ONLINE_SHARE);
export const GATEWAYS = Math.ceil(OPEN_LINES / GATEWAY_PLAN);
export const CHAT_SERVERS = Math.ceil(PEAK_MESSAGES / CHAT_PLAN);
