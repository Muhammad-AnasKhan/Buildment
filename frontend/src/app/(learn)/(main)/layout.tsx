import { requireLearnSurface } from "@/server/auth/guards";
import { loadInstructorAccessState } from "@/server/instructor-access/load-status";
import { MenteeWorkspaceShell } from "@/components/learn/mentee-workspace-shell";
import { signOutAction } from "@/server/auth/actions";
import { prisma } from "@/server/db";

export default async function LearnMainLayout({ children }: { children: React.ReactNode }) {
  const user = await requireLearnSurface();
  const instructorAccess = await loadInstructorAccessState(user);
  const [enrollmentSummary, openHelpRequests] = await Promise.all([
    prisma.enrollment.aggregate({
      where: { userId: user.id, status: { not: "DROPPED" } },
      _count: { _all: true },
      _sum: { pendingReviews: true },
    }),
    prisma.helpThread.count({ where: { menteeId: user.id, status: "OPEN" } }),
  ]);

  return (
    <MenteeWorkspaceShell
      user={user}
      instructorAccess={instructorAccess}
      assignedCourses={enrollmentSummary._count._all}
      pendingReviews={enrollmentSummary._sum.pendingReviews ?? 0}
      openHelpRequests={openHelpRequests}
      signOutAction={signOutAction}
    >
      {children}
    </MenteeWorkspaceShell>
  );
}
