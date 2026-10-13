import "server-only";

import { prisma } from "@/server/db";
import { userCanInstruct } from "@/server/auth/access-rules";
import type { InstructorAccessView } from "@/lib/instructor-access";
import type { Role } from "@/generated/prisma/client";

export async function loadInstructorAccessState(user: {
  id: string;
  role: Role;
  canInstruct: boolean;
}): Promise<InstructorAccessView> {
  const canInstruct = userCanInstruct(user);
  if (canInstruct) {
    return {
      canInstruct: true,
      requestStatus: "none",
      canRequestAccess: false,
    };
  }

  if (user.role === "ADMIN") {
    return {
      canInstruct: true,
      requestStatus: "none",
      canRequestAccess: false,
    };
  }

  const request = await prisma.instructorAccessRequest.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });

  const requestStatus =
    request?.status === "PENDING"
      ? "pending"
      : request?.status === "REJECTED"
        ? "rejected"
        : "none";

  const canRequestAccess =
    user.role === "MENTEE" && requestStatus !== "pending";

  return {
    canInstruct: false,
    requestStatus,
    canRequestAccess,
  };
}
