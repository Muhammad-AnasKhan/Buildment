import type { LearnerWorkspace } from "../../shared/api/learner.js";
import { prisma } from "../../db/prisma.js";
import type { SessionUser } from "../../types/auth.js";
import { loadInstructorAccessState } from "../instructor-access/status.js";

/** Sidebar counts for the learner workspace shell. */
export async function loadLearnerWorkspace(user: SessionUser): Promise<LearnerWorkspace> {
  const [instructorAccess, enrollmentSummary, openHelpRequests] = await Promise.all([
    loadInstructorAccessState(user),
    prisma.enrollment.aggregate({
      where: { userId: user.id, status: { not: "DROPPED" } },
      _count: { _all: true },
      _sum: { pendingReviews: true },
    }),
    prisma.helpThread.count({ where: { menteeId: user.id, status: "OPEN" } }),
  ]);

  return {
    instructorAccess,
    assignedCourses: enrollmentSummary._count._all,
    pendingReviews: enrollmentSummary._sum.pendingReviews ?? 0,
    openHelpRequests,
  };
}
