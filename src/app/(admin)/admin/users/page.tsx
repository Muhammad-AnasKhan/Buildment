import { prisma } from "@/server/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  grantInstructorByEmailAction,
  setUserInstructorAccessAction,
} from "@/server/actions/admin/users";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      canInstruct: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { enrollments: true, coursesOwned: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Users</h1>
      <p className="mt-1 text-sm text-neutral-500">Inspect accounts and grant instructor capability.</p>

      <form
        action={grantInstructorByEmailAction}
        className="mt-8 grid max-w-md gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <h2 className="text-sm font-semibold text-neutral-900">Grant instructor by email</h2>
        <p className="text-xs text-neutral-500">
          Creates a verified stub account if the email is new; existing users gain instructor access.
        </p>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="instructor@example.com" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="name">Display name (optional)</Label>
          <Input id="name" name="name" placeholder="Alex Instructor" />
        </div>
        <Button type="submit">Grant instructor access</Button>
      </form>

      <div className="mt-10 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3 text-right">Enrollments</th>
              <th className="px-4 py-3 text-right">Courses</th>
              <th className="px-4 py-3">Instructor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{user.name ?? "—"}</p>
                  <p className="font-mono text-xs text-neutral-600">{user.email}</p>
                </td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.emailVerified ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{user._count.enrollments}</td>
                <td className="px-4 py-3 text-right tabular-nums">{user._count.coursesOwned}</td>
                <td className="px-4 py-3">
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-neutral-500">Admin</span>
                  ) : (
                    <form action={setUserInstructorAccessAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="hidden"
                        name="canInstruct"
                        value={user.canInstruct ? "false" : "true"}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        {user.canInstruct ? "Revoke" : "Grant"}
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
