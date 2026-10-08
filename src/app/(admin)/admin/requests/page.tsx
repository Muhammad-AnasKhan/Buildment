import Link from "next/link";
import { prisma } from "@/server/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveOrganizationCourseRequestAction,
  rejectOrganizationCourseRequestAction,
} from "@/server/actions/admin/requests";

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
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Course access requests</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Organizations submit requests via{" "}
        <code className="rounded bg-neutral-100 px-1 text-xs">POST /integrations/v1/course-requests</code>.
        Approving creates or updates an allocation.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Pending</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {pending.map((req) => (
              <li
                key={req.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-neutral-900">{req.course.title}</p>
                    <p className="text-sm text-neutral-600">
                      Requested by{" "}
                      <Link
                        href={`/admin/organizations/${req.organization.id}`}
                        className="font-medium text-neutral-900 underline"
                      >
                        {req.organization.name}
                      </Link>{" "}
                      · {req.requestedAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    {req.course.status}
                  </span>
                </div>

                <form action={approveOrganizationCourseRequestAction} className="mt-4 grid max-w-md gap-3">
                  <input type="hidden" name="requestId" value={req.id} />
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <Label htmlFor={`exp-${req.id}`}>Expires (optional)</Label>
                    <Input id={`exp-${req.id}`} name="expiresAt" type="date" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">Approve</Button>
                  </div>
                </form>
                <form action={rejectOrganizationCourseRequestAction} className="mt-2">
                  <input type="hidden" name="requestId" value={req.id} />
                  <Button type="submit" variant="outline">
                    Reject
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Recently reviewed
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.course.title}</td>
                    <td className="px-4 py-3">{row.organization.name}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {row.reviewedAt?.toISOString().slice(0, 10) ?? "—"}
                      {row.reviewedBy ? ` · ${row.reviewedBy.email}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
