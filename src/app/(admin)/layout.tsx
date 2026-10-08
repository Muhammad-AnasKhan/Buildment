import { requireRole } from "@/server/auth/guards";
import { signOutAction } from "@/server/auth/actions";
import { prisma } from "@/server/db";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const [pendingRequests, organizationCount] = await Promise.all([
    prisma.organizationCourseRequest.count({ where: { status: "PENDING" } }),
    prisma.organization.count(),
  ]);

  return (
    <AdminWorkspaceShell
      user={user}
      pendingRequests={pendingRequests}
      organizationCount={organizationCount}
      signOutAction={signOutAction}
    >
      {children}
    </AdminWorkspaceShell>
  );
}
