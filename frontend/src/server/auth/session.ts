import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, type SessionUser } from "@/shared/api/auth";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export type { SessionUser };

// The API owns sessions. The web app only holds the httpOnly cookie and asks
// /auth/me who the visitor is — once per request thanks to React's cache().
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { user } = await serverApiFetch<{ user: SessionUser }>("/api/v1/auth/me", { token });
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
