import { requireRole } from "@/server/auth/guards";
import { MenteeWorkspaceShell } from "@/components/learn/mentee-workspace-shell";
import { signOutAction } from "@/server/auth/actions";
import { prisma } from "@/server/db";

export default async function LearnMainLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTEE");
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
      assignedCourses={enrollmentSummary._count._all}
      pendingReviews={enrollmentSummary._sum.pendingReviews ?? 0}
      openHelpRequests={openHelpRequests}
      signOutAction={signOutAction}
    >
      {children}
    </MenteeWorkspaceShell>
  );
}
