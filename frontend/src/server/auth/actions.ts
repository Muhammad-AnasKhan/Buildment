"use server";

import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api-server";
import { clearSessionCookie } from "@/server/auth/session-cookie";

export async function signOutAction() {
  // Best effort: the cookie is cleared even if the API session is already gone.
  await serverApiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => undefined);
  await clearSessionCookie();
  redirect("/");
}
