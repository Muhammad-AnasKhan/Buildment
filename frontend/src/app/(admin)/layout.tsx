import type { AdminOverview } from "@/shared/api/admin";
import { requireRole } from "@/server/auth/guards";
import { signOutAction } from "@/server/auth/actions";
import { serverApiFetch } from "@/lib/api-server";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { AccountSetupPrompt } from "@/components/auth/account-setup-prompt";

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
      <NotificationCenter />
      <AccountSetupPrompt user={user} />
      {children}
    </AdminWorkspaceShell>
  );
}
