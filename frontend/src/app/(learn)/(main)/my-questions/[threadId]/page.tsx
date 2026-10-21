import { redirect } from "next/navigation";
import type { HelpThreadDetail } from "@/shared/api/help";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";

export default async function MenteeHelpThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  await requireLearnSurface();
  await serverApiFetchOrNotFound<HelpThreadDetail>(`/api/v1/help/threads/${encodeURIComponent(threadId)}`);
  redirect(`/my-questions?question=${encodeURIComponent(threadId)}`);
}
