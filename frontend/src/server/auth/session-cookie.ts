import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/shared/api/auth";

// Server Actions call the API from the Next.js server, so the API's Set-Cookie
// never reaches the browser; the action stores the returned token itself.
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setSessionCookie(session: { token: string; expiresAt: string }) {
  (await cookies()).set(SESSION_COOKIE_NAME, session.token, { ...COOKIE_OPTIONS, expires: new Date(session.expiresAt) });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}
