import type { Request, RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { rateLimitsEnabled } from "../config/env.js";
import { TooManyRequestsError } from "../utils/errors.js";
import { errorBody } from "../utils/responses.js";

const limited = errorBody("Too many requests, please try again later", "RATE_LIMITED");

/** Backstop for the whole API — per client IP, generous. Per-action limits live on routes. */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limited,
  skip: () => !rateLimitsEnabled,
});

type Options = {
  /** Distinguishes limiters that share a user, e.g. "respond" vs "quiz-submit". */
  scope: string;
  max: number;
  windowMs?: number;
  message?: string;
  /** Extra key material from the request, e.g. the block id, so limits are per resource. */
  keyFrom?: (req: Request) => string;
};

const buckets = new Map<string, number[]>();

/**
 * Sliding-window limiter keyed by the signed-in user (falls back to IP). In-memory,
 * so it is per instance — fine for a single API process; swap the store before
 * scaling out horizontally.
 */
export function userRateLimit({ scope, max, windowMs = 60_000, message, keyFrom }: Options): RequestHandler {
  return (req, _res, next) => {
    if (!rateLimitsEnabled) return next();
    const subject = req.user?.id ?? req.ip ?? "anonymous";
    const key = `${scope}:${subject}${keyFrom ? `:${keyFrom(req)}` : ""}`;
    const now = Date.now();
    const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
    if (hits.length >= max) {
      buckets.set(key, hits);
      return next(new TooManyRequestsError(message));
    }
    hits.push(now);
    buckets.set(key, hits);
    next();
  };
}
