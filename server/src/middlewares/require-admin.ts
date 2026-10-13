import type { RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

/** Platform administration: ADMIN role only. Runs after `authenticate`. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError("Not signed in"));
  if (req.user.role !== "ADMIN") return next(new ForbiddenError("Administrator access is required.", "ADMIN_REQUIRED"));
  next();
};
