import type { RequestHandler } from "express";
import { AUTH_ERROR_CODES } from "../shared/api/auth.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { isEmailVerified } from "../services/auth/email-verification.js";
import { resolveVerificationState } from "../services/auth/login.js";

/** Learner and instructor product surfaces need a verified email; admins are exempt. */
export const requireVerified: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) throw new UnauthorizedError("Not signed in");
    req.user = await resolveVerificationState(req.user);
    if (req.user.role !== "ADMIN" && !isEmailVerified(req.user.emailVerified)) {
      throw new ForbiddenError("Verify your email to continue.", AUTH_ERROR_CODES.EMAIL_UNVERIFIED);
    }
    next();
  } catch (error) {
    next(error);
  }
};
