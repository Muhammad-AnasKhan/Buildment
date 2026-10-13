import type { AdminOverview } from "@buildment/shared/api/admin";
import { requireRole } from "@/server/auth/guards";
import { signOutAction } from "@/server/auth/actions";
import { serverApiFetch } from "@/lib/api-server";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const overview = await serverApiFetch<AdminOverview>("/api/v1/admin/overview");

  return (
    <AdminWorkspaceShell
      user={user}
      pendingRequests={overview.pendingCourseRequests}
      organizationCount={overview.organizations}
      signOutAction={signOutAction}
    >
      {children}
    </AdminWorkspaceShell>
  );
}
