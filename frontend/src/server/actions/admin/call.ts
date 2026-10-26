import "server-only";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch, type ServerApiRequestInit } from "@/lib/api-server";

// Admin Server Actions call the API through this helper. Wrap the call in
// `runAdminAction` (./action-result) so failures become an inline error state
// the form can show, instead of a thrown Error that blanks the page.
export async function adminCall<T>(path: string, init: ServerApiRequestInit = {}): Promise<T> {
  try {
    return await serverApiFetch<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
}
