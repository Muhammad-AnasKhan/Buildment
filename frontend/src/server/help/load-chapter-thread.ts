import "server-only";
import { prisma } from "@/server/db";

/** Latest help thread for this mentee + chapter (open or resolved). */
export async function loadChapterHelpThread(menteeId: string, chapterId: string) {
  if (!("helpThread" in prisma) || typeof prisma.helpThread?.findFirst !== "function") {
    return null;
  }

  return prisma.helpThread.findFirst({
    where: { menteeId, chapterId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, role: true } } },
      },
    },
  });
}
