import type { RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { canAccessTeachSurface } from "../services/auth/access-rules.js";

/** Instructor tools: MENTOR and ADMIN roles. Runs after `authenticate`. */
export const requireInstructor: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError("Not signed in"));
  if (!canAccessTeachSurface(req.user)) {
    return next(new ForbiddenError("Instructor access is required.", "INSTRUCTOR_REQUIRED"));
  }
  next();
};
