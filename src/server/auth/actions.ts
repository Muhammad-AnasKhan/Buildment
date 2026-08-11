"use server";

import { signOut } from "@/server/auth/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
