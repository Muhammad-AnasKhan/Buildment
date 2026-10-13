import "server-only";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch, type ServerApiRequestInit } from "@/lib/api-server";

// Instructor Server Actions are thin wrappers over /api/v1/teach. The components
// that call them predate the API split and branch on `{ ok, errors }`, so the
// API's error envelope is folded back into that shape here.

export type TeachActionFailure = { ok: false; errors: string[] };

export async function teachCall<T>(
  path: string,
  init: ServerApiRequestInit = {}
): Promise<{ ok: true; data: T } | TeachActionFailure> {
  try {
    return { ok: true, data: await serverApiFetch<T>(path, init) };
  } catch (error) {
    if (error instanceof ApiError) {
      const reasons = error.errors.map((item) => item.message);
      return { ok: false, errors: reasons.length ? reasons : [error.message] };
    }
    throw error;
  }
}
