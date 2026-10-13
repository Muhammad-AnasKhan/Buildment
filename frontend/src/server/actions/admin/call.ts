import "server-only";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch, type ServerApiRequestInit } from "@/lib/api-server";

// Admin Server Actions are form handlers that throw on failure (the pages have
// no inline error state), so an API error becomes a plain Error with its message.
export async function adminCall<T>(path: string, init: ServerApiRequestInit = {}): Promise<T> {
  try {
    return await serverApiFetch<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
}
