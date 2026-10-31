"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import type { HelpMessageView } from "@/shared/api/help";

export type HelpActionResult =
  | { ok: true; threadId: string; message: HelpMessageView | null }
  | { ok: false; error: string };

// The thread's pages re-render on the next request; revalidate the ones that
// show help state so the reply or status change appears immediately.
function revalidateHelpPaths(threadId: string) {
  revalidatePath("/help");
  revalidatePath(`/help/${threadId}`);
  revalidatePath("/my-questions");
  revalidatePath(`/my-questions/${threadId}`);
  revalidatePath("/courses/[courseSlug]", "layout");
}

async function helpCall(
  path: string,
  json: unknown,
): Promise<HelpActionResult> {
  try {
    const result = await serverApiFetch<{
      threadId: string;
      message?: HelpMessageView;
    }>(path, {
      method: "POST",
      json,
    });
    revalidateHelpPaths(result.threadId);
    return {
      ok: true,
      threadId: result.threadId,
      message: result.message ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
}

/** Mentee asks from a chapter — creates a thread or adds to the open one for this chapter. */
export async function askMentorFromChapter(input: {
  courseId: string;
  chapterId: string;
  body: string;
}) {
  return helpCall("/api/v1/help/threads", input);
}

export async function replyToHelpThread(input: {
  threadId: string;
  body: string;
  replyToId?: string;
}) {
  return helpCall(
    `/api/v1/help/threads/${encodeURIComponent(input.threadId)}/messages`,
    {
      body: input.body,
      replyToId: input.replyToId,
    },
  );
}

export async function resolveHelpThread(input: { threadId: string }) {
  return helpCall(
    `/api/v1/help/threads/${encodeURIComponent(input.threadId)}/resolve`,
    {},
  );
}
