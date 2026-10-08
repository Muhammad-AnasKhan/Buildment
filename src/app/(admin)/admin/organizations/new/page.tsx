import Link from "next/link";
import { createOrganizationAction } from "@/server/actions/admin/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/organizations" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Organizations
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">New organization</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A default API credential pair is created automatically. You will see the secret once.
      </p>

      <form action={createOrganizationAction} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" name="name" required minLength={2} placeholder="Acme Learning" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input id="slug" name="slug" placeholder="acme-learning" />
          <p className="text-xs text-neutral-500">Used in URLs and logs; generated from the name if empty.</p>
        </div>
        <Button type="submit">Create organization</Button>
      </form>
    </div>
  );
}
