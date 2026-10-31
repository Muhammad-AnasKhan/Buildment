import { Router } from "express";
import * as auth from "../../controllers/auth.js";
import { authenticate, optionalAuth } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validateBody, validateQuery } from "../../middlewares/validate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import * as desktop from "../../controllers/desktop-auth.js";
import { z } from "zod";
import {
  changePasswordBody,
  accountSetupBody,
  confirmEmailQuery,
  devLoginQuery,
  loginBody,
  magicLinkBody,
  magicLinkVerifyQuery,
  resendVerificationBody,
  signupBody,
} from "../../validations/auth.js";

const router = Router();
const proof = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
router.post("/desktop/authorize", authenticate, requireVerified,
  userRateLimit({ scope: "desktop-authorize", max: 10 }),
  validateBody(z.object({ challenge: proof })), desktop.authorize);
router.post("/desktop/exchange", userRateLimit({ scope: "desktop-exchange", max: 20 }),
  validateBody(z.object({ code: proof, verifier: proof })), desktop.exchange);

// Credential endpoints are limited per client IP (there is no user yet).
const emailFromBody = (req: { body: { email?: string } }) => req.body?.email ?? "";

router.post("/signup", userRateLimit({ scope: "signup", max: 5, windowMs: 10 * 60_000 }), validateBody(signupBody), auth.signup);
router.post(
  "/login",
  validateBody(loginBody),
  userRateLimit({ scope: "login", max: 10, keyFrom: emailFromBody, message: "Too many sign-in attempts. Try again in a minute." }),
  auth.login
);
router.post("/logout", optionalAuth, auth.logout);
router.get("/me", authenticate, auth.me);
router.patch("/password", authenticate, userRateLimit({ scope: "change-password", max: 10, windowMs: 15 * 60_000 }), validateBody(changePasswordBody), auth.updatePassword);
router.patch("/account-setup", authenticate, userRateLimit({ scope: "account-setup", max: 5, windowMs: 15 * 60_000 }), validateBody(accountSetupBody), auth.completeAccountSetup);

router.post("/resend-verification", optionalAuth, userRateLimit({ scope: "resend", max: 5 }), validateBody(resendVerificationBody), auth.resend);

router.post("/magic-link", userRateLimit({ scope: "magic-link", max: 5 }), validateBody(magicLinkBody), auth.requestMagicLink);
router.get("/magic-link/verify", validateQuery(magicLinkVerifyQuery), auth.verifyMagicLink);

router.get("/confirm-email", validateQuery(confirmEmailQuery), auth.confirmEmail);
router.get("/dev-login", validateQuery(devLoginQuery), auth.devLogin);

export default router;
