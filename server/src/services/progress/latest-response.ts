import { prisma } from "../../db/prisma.js";

export async function getLatestBlockResponse(blockId: string, userId: string) {
  return prisma.response.findFirst({
    where: { blockId, userId, status: { not: "DRAFT" } },
    orderBy: { attempt: "desc" },
  });
}
