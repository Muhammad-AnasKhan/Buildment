import { createOrganizationAction } from "@/server/actions/admin/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminBackLink, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export default function NewOrganizationPage() {
  return (
    <div>
      <AdminBackLink href="/admin/organizations">← Back to organizations</AdminBackLink>

      <div className="mt-4">
      <AdminPageHeader
        eyebrow="Tenants"
        title="New organization"
        description="A default API credential pair is created automatically. You will see the secret once after creation."
      />
      </div>

      <AdminPanel className="mt-8 max-w-lg">
        <form action={createOrganizationAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" required minLength={2} placeholder="Acme Learning" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input id="slug" name="slug" placeholder="acme-learning" />
            <p className="text-xs text-muted-foreground">
              Used in URLs and logs; generated from the name if empty.
            </p>
          </div>
          <Button type="submit">Create organization</Button>
        </form>
      </AdminPanel>
    </div>
  );
}
