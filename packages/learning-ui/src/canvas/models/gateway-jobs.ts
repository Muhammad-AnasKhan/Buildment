// 6.6 "Switch gateway jobs on and off": six jobs the gateway can do, each on
// or off. Three callers send a request: Huda (GET /orders/512, a valid
// token), a scraper (a valid token, many requests) and a stranger (no token,
// POST /payments). A request passes every job that is on, top to bottom; the
// hop as a whole costs about 50 microseconds, so no per-job time is shown.
// If routing is off the gateway does not forward, so callers go straight to
// each service and none of the gateway's checks stand in the way. Pure.

export type JobId = "tls" | "token" | "limit" | "id" | "order" | "routing";
export type Jobs = Readonly<Record<JobId, boolean>>;

export type Job = { id: JobId; label: string; lines: [string, string]; full: string };

/** Top to bottom: the order a request meets them. */
export const JOBS: readonly Job[] = [
  { id: "tls", label: "TLS", lines: ["TLS", "locks traffic"], full: "TLS, which locks the traffic" },
  { id: "token", label: "Token check", lines: ["Token check", "who is calling"], full: "Token check, which finds out who is calling" },
  { id: "limit", label: "Rate limit", lines: ["Rate limit", "how often"], full: "Rate limit, which counts requests per client" },
  { id: "id", label: "Request id", lines: ["Request id", "label to trace"], full: "Request id, a label to trace each request" },
  { id: "order", label: "Order rules", lines: ["Order rules", "needs order data"], full: "Order rules, a business rule that needs every order" },
  { id: "routing", label: "Routing", lines: ["Routing", "pick the service"], full: "Routing, which picks the service from the path" },
];

export const DEFAULT_JOBS: Jobs = { tls: true, token: true, limit: true, id: true, order: false, routing: true };

export function toggleJob(jobs: Jobs, id: JobId): Jobs {
  return { ...jobs, [id]: !jobs[id] };
}

export type Caller = "huda" | "scraper" | "stranger";

export type GatewayOutcome = {
  /** The stranger (no token) gets to Payments. */
  strangerGetsIn: boolean;
  /** The scraper's requests all reach Search. */
  scraperFloods: boolean;
  readableOnWire: boolean;
  clientsKnowServices: boolean;
  noRequestId: boolean;
  gatewayCopiesOrders: boolean;
  /** Jobs a request passes, in order. Empty when the gateway is bypassed. */
  path: JobId[];
  /** The job where each caller's request is stopped, or null if it gets through. */
  stoppedAt: Record<Caller, JobId | null>;
};

export function gatewayOutcome(jobs: Jobs): GatewayOutcome {
  const bypass = !jobs.routing;
  const path = bypass ? [] : JOBS.filter((j) => jobs[j.id]).map((j) => j.id);
  return {
    strangerGetsIn: bypass || !jobs.token,
    scraperFloods: bypass || !jobs.limit,
    readableOnWire: !jobs.tls,
    clientsKnowServices: bypass,
    noRequestId: !jobs.id,
    gatewayCopiesOrders: jobs.order,
    path,
    stoppedAt: {
      huda: null,
      scraper: bypass || !jobs.limit ? null : "limit",
      stranger: bypass || !jobs.token ? null : "token",
    },
  };
}

export type GatewayVerdict = { text: string; tone: "good" | "warn" | "bad" };

/** First matching, in this order. */
export function gatewayVerdict(jobs: Jobs): GatewayVerdict {
  if (!jobs.token) return { text: "Anyone can call payments", tone: "bad" };
  if (!jobs.limit) return { text: "Scraper floods search", tone: "bad" };
  if (!jobs.tls) return { text: "Traffic readable on the wire", tone: "bad" };
  if (!jobs.routing) return { text: "Client must know every service", tone: "warn" };
  if (!jobs.id) return { text: "No id to trace this request", tone: "warn" };
  if (jobs.order) return { text: "Gateway now needs every order", tone: "warn" };
  return { text: "Thin gateway: checks, then routes", tone: "good" };
}

/** How many of the scraper's burst of requests reach Search when the limit is on. */
export const SCRAPER_BURST = 6;
export const SCRAPER_ALLOWED = 2;
