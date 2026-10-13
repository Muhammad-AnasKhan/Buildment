
import { prisma } from "../../db/prisma.js";
import { userCanInstruct } from "../auth/access-rules.js";
import type { InstructorAccessView } from "../../shared/lib/instructor-access.js";
import type { Role } from "../../generated/prisma/index.js";

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
