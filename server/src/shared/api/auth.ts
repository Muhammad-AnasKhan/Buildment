import type { Role } from "../domain/enums.js";

// Wire contract for /api/v1/auth. Dates travel as ISO strings.

/** Name of the session cookie the web app and the API agree on. */
export const SESSION_COOKIE_NAME = "authjs.session-token";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  emailVerified: string | null;
};

export type AuthSession = {
  user: SessionUser;
  session: { token: string; expiresAt: string };
};

export type SignupResult = {
  email: string;
  /** `verified` when email delivery is off and the account was activated immediately. */
  status: "verified" | "verification_sent";
};

/** Stable error codes the auth endpoints use beyond the generic ones. */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_UNVERIFIED: "EMAIL_UNVERIFIED",
  EMAIL_TAKEN: "EMAIL_TAKEN",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
} as const;
