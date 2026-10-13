import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

/** Job endpoints are for schedulers only: `Authorization: Bearer <CRON_SECRET>`. */
export const requireCronSecret: RequestHandler = (req, _res, next) => {
  if (!env.CRON_SECRET) {
    return next(new UnauthorizedError("CRON_SECRET is not configured", "JOBS_DISABLED"));
  }
  if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return next(new UnauthorizedError("Invalid job credentials"));
  }
  next();
};
