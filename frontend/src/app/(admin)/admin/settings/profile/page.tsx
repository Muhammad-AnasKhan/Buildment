import { requireRole } from "@/server/auth/guards";
import { AdminProfileForms } from "@/components/admin/admin-profile-forms";

export default async function AdminProfilePage() {
  const user = await requireRole("ADMIN");
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your admin account and sign-in details.</p>
      </header>
      <AdminProfileForms name={user.name ?? ""} email={user.email} />
    </div>
  );
}
