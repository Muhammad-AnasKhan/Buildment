import "server-only";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export async function countOpenHelpRequests(user: { id: string; role: Role }) {
  if (!("helpThread" in prisma) || typeof prisma.helpThread?.count !== "function") {
    return 0;
  }

  return prisma.helpThread.count({
    where: {
      status: "OPEN",
      ...(user.role === "ADMIN" ? {} : { course: { mentorId: user.id } }),
    },
  });
}
