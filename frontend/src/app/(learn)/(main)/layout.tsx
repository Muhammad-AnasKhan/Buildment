import type { LearnerWorkspace } from "@buildment/shared/api/learner";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { MenteeWorkspaceShell } from "@/components/learn/mentee-workspace-shell";
import { signOutAction } from "@/server/auth/actions";

export default async function LearnMainLayout({ children }: { children: React.ReactNode }) {
  const user = await requireLearnSurface();
  const workspace = await serverApiFetch<LearnerWorkspace>("/api/v1/learner/workspace");

  return (
    <MenteeWorkspaceShell
      user={user}
      instructorAccess={workspace.instructorAccess}
      assignedCourses={workspace.assignedCourses}
      pendingReviews={workspace.pendingReviews}
      openHelpRequests={workspace.openHelpRequests}
      signOutAction={signOutAction}
    >
      {children}
    </MenteeWorkspaceShell>
  );
}
