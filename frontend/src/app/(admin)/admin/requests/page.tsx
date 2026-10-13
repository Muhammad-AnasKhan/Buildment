import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveOrganizationCourseRequestAction,
  rejectOrganizationCourseRequestAction,
} from "@/server/actions/admin/requests";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-ui";

export default async function AdminCourseRequestsPage() {
  const pending = await prisma.organizationCourseRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      course: { select: { title: true, slug: true, status: true } },
    },
  });

  const recent = await prisma.organizationCourseRequest.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { reviewedAt: "desc" },
    take: 20,
    include: {
      organization: { select: { name: true } },
      course: { select: { title: true } },
      reviewedBy: { select: { email: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Access queue"
        title="Course requests"
        description={
          <>
            Organizations request courses via{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              POST /integrations/v1/course-requests
            </code>
            . Approving creates or updates an allocation.
          </>
        }
      />

      <AdminSection title="Pending review" className="mt-8">
        {pending.length === 0 ? (
          <AdminEmptyState title="No pending requests" description="New organization requests will appear here." />
        ) : (
          <ul className="space-y-4">
            {pending.map((req) => (
              <li key={req.id}>
                <AdminPanel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{req.course.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Requested by{" "}
                        <Link
                          href={`/admin/organizations/${req.organization.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {req.organization.name}
                        </Link>{" "}
                        · {req.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{req.course.status}</Badge>
                  </div>

                  <form action={approveOrganizationCourseRequestAction} className="mt-5 grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="requestId" value={req.id} />
                    <div className="space-y-1.5">
                      <Label htmlFor={`max-${req.id}`}>Max enrollments</Label>
                      <Input
                        id={`max-${req.id}`}
                        name="maxEnrollments"
                        type="number"
                        min={1}
                        defaultValue={100}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`exp-${req.id}`}>Expires (optional)</Label>
                      <Input id={`exp-${req.id}`} name="expiresAt" type="date" />
                    </div>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <Button type="submit">Approve</Button>
                    </div>
                  </form>
                  <form action={rejectOrganizationCourseRequestAction} className="mt-2">
                    <input type="hidden" name="requestId" value={req.id} />
                    <Button type="submit" variant="outline">
                      Reject
                    </Button>
                  </form>
                </AdminPanel>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      {recent.length > 0 ? (
        <AdminSection title="Recently reviewed">
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>Course</AdminTableHeaderCell>
                <AdminTableHeaderCell>Organization</AdminTableHeaderCell>
                <AdminTableHeaderCell>Status</AdminTableHeaderCell>
                <AdminTableHeaderCell>Reviewed</AdminTableHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {recent.map((row) => (
                <AdminTableRow key={row.id}>
                  <AdminTableCell>{row.course.title}</AdminTableCell>
                  <AdminTableCell>{row.organization.name}</AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={row.status === "APPROVED" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {row.reviewedAt?.toLocaleDateString() ?? "—"}
                    {row.reviewedBy ? ` · ${row.reviewedBy.email}` : ""}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </AdminSection>
      ) : null}
    </div>
  );
}
