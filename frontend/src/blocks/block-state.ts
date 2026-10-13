import "server-only";
import type { BlockState } from "@/shared/api/blocks";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

/**
 * Block server components render inside compiled MDX and fetch their own
 * client-safe config plus the visitor's latest answer from the API. Returns null
 * when the block is unknown, archived or of another type so the caller can show
 * its pending card — the same behaviour the old direct database lookup had.
 */
export async function fetchBlockState<K extends BlockState["type"]>(
  blockId: string,
  type: K
): Promise<Extract<BlockState, { type: K }> | null> {
  try {
    const state = await serverApiFetch<BlockState>(`/api/v1/blocks/${encodeURIComponent(blockId)}/state`);
    return state.type === type ? (state as Extract<BlockState, { type: K }>) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) return null;
    throw error;
  }
}
