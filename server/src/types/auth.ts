import type { Role } from "../generated/prisma/index.js";

/** The signed-in user as every guard and controller sees it. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  emailVerified: Date | null;
};

/** Organisation authenticated through integration credentials on /integrations/v1. */
export type AuthenticatedOrganization = {
  id: string;
  slug: string;
  name: string;
  credentialId: string;
};
