import "server-only";

import { ApiError } from "@/lib/api-client";

// Admin mutation Server Actions return this instead of throwing, so the client
// components can show an inline error and a toast without a full-page error.
export type AdminActionState = { ok: boolean; message: string };

export const initialAdminActionState: AdminActionState = { ok: false, message: "" };

/**
 * Converts a thrown value into readable state. Exported so actions that must call
 * `redirect()` (which throws Next.js control-flow) can catch only the API call.
 */
export function toAdminActionState(error: unknown): AdminActionState {
  if (error instanceof ApiError) {
    const fieldMessages = error.errors.map((issue) => issue.message).join(" ");
    return { ok: false, message: fieldMessages || error.message };
  }
  if (error instanceof Error) return { ok: false, message: error.message };
  return { ok: false, message: "Something went wrong. Please try again." };
}

/**
 * Wraps an admin API call so a failure becomes a readable state rather than a
 * thrown Error. `redirect()` must be called *outside* this helper: it throws a
 * Next.js control-flow signal that must not be caught here.
 */
export async function runAdminAction(work: () => Promise<string | void>): Promise<AdminActionState> {
  try {
    const message = await work();
    return { ok: true, message: typeof message === "string" ? message : "Done." };
  } catch (error) {
    return toAdminActionState(error);
  }
}
