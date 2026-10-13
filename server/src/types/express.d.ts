import type { AuthenticatedOrganization, SessionUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` / `optionalAuth`. */
      user?: SessionUser;
      /** Raw session token the request authenticated with (cookie or bearer). */
      sessionToken?: string;
      /** Set by `authenticateOrganization` on the integrations API. */
      organization?: AuthenticatedOrganization;
    }
  }
}

export {};
