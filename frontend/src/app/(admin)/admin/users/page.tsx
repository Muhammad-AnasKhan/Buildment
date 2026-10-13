import { prisma } from "@/server/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  grantInstructorByEmailAction,
  setUserInstructorAccessAction,
} from "@/server/actions/admin/users";
import {
  approveInstructorAccessRequestAction,
  rejectInstructorAccessRequestAction,
} from "@/server/actions/admin/instructor-access-requests";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-ui";

export default async function AdminUsersPage() {
  const pendingInstructorRequests = await prisma.instructorAccessRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

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
    <div>
      <AdminPageHeader
        eyebrow="Accounts"
        title="Users"
        description="Inspect accounts and grant or revoke instructor capability."
      />

      {pendingInstructorRequests.length > 0 ? (
        <AdminPanel className="mt-8">
          <h2 className="text-sm font-semibold">Pending instructor access requests</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Learners asked to create and teach courses. Approve to enable the instructor workspace switch.
          </p>
          <ul className="mt-4 space-y-3">
            {pendingInstructorRequests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium">{request.user.name ?? "Learner"}</p>
                  <p className="font-mono text-xs text-muted-foreground">{request.user.email}</p>
                  {request.message ? (
                    <p className="mt-1 text-xs text-muted-foreground">{request.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={approveInstructorAccessRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectInstructorAccessRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <AdminTable minWidth="720px">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>User</AdminTableHeaderCell>
              <AdminTableHeaderCell>Role</AdminTableHeaderCell>
              <AdminTableHeaderCell>Verified</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Enrollments</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Courses</AdminTableHeaderCell>
              <AdminTableHeaderCell>Instructor</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {users.map((user) => (
              <AdminTableRow key={user.id}>
                <AdminTableCell>
                  <p className="font-medium">{user.name ?? "—"}</p>
                  <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </AdminTableCell>
                <AdminTableCell>
                  {user.emailVerified ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </AdminTableCell>
                <AdminTableCell align="right" className="tabular-nums">
                  {user._count.enrollments}
                </AdminTableCell>
                <AdminTableCell align="right" className="tabular-nums">
                  {user._count.coursesOwned}
                </AdminTableCell>
                <AdminTableCell>
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-muted-foreground">Platform admin</span>
                  ) : (
                    <form action={setUserInstructorAccessAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="hidden"
                        name="canInstruct"
                        value={user.canInstruct ? "false" : "true"}
                      />
                      <Button type="submit" size="sm" variant={user.canInstruct ? "outline" : "default"}>
                        {user.canInstruct ? "Revoke" : "Grant"}
                      </Button>
                    </form>
                  )}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>

        <AdminPanel>
          <h2 className="text-sm font-semibold">Grant instructor by email</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Creates a verified account if the email is new. Existing users gain instructor access.
          </p>
          <form action={grantInstructorByEmailAction} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="instructor@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name (optional)</Label>
              <Input id="name" name="name" placeholder="Alex Instructor" />
            </div>
            <Button type="submit" className="w-full">
              Grant instructor access
            </Button>
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
