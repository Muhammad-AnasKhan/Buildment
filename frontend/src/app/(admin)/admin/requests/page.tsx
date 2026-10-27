import Link from "next/link";
import type { AdminCourseRequestsView } from "@/shared/api/admin";
import { serverApiFetch } from "@/lib/api-server";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminBulkBar } from "@/components/admin/admin-bulk-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  bulkApproveCourseRequestsAction,
  bulkRejectCourseRequestsAction,
} from "@/server/actions/admin/bulk";
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

export default async function AdminCourseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; recentPage?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const recentPage = Number(sp.recentPage) || 1;
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (recentPage > 1) query.set("recentPage", String(recentPage));
  const qs = query.toString();

  const { pending, pendingPage, recent, recentPage: recentPagination } = await serverApiFetch<AdminCourseRequestsView>(
    `/api/v1/admin/course-requests${qs ? `?${qs}` : ""}`
  );

  // Each list pages independently, so one pager must preserve the other's page.
  const pendingHref = (next: number) => {
    const params = new URLSearchParams();
    if (next > 1) params.set("page", String(next));
    if (recentPage > 1) params.set("recentPage", String(recentPage));
    const search = params.toString();
    return `/admin/requests${search ? `?${search}` : ""}`;
  };
  const recentHref = (next: number) => {
    const params = new URLSearchParams();
    if (next > 1) params.set("recentPage", String(next));
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return `/admin/requests${search ? `?${search}` : ""}`;
  };

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
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <AdminBulkBar
            action={bulkApproveCourseRequestsAction}
            submitLabel="Approve selected"
            pendingLabel="Approving…"
            variant="default"
            confirm={{
              question: "Approve the selected requests?",
              description: "One cap and expiry are applied to every selected request, creating their allocations.",
              confirmLabel: "Approve selected",
            }}
            approveFields={{ maxEnrollments: 100, expiresAt: "" }}
          />
          <AdminBulkBar
            action={bulkRejectCourseRequestsAction}
            submitLabel="Reject selected"
            pendingLabel="Rejecting…"
            variant="outline"
            confirm={{
              question: "Reject the selected requests?",
              description: "They are closed. The organizations can request the courses again later.",
              confirmLabel: "Reject selected",
            }}
          />
        </div>
        {pending.length === 0 ? (
          <AdminEmptyState title="No pending requests" description="New organization requests will appear here." />
        ) : (
          <ul className="space-y-4">
            {pending.map((req) => (
              <li key={req.id}>
                <AdminPanel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        data-bulk-id
                        value={req.id}
                        aria-label={`Select the request for ${req.course.title}`}
                        className="mt-0.5 size-4 rounded border-input"
                      />
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
                        · {new Date(req.requestedAt).toLocaleDateString()}
                      </p>
                      </div>
                    </div>
                    <Badge variant="outline">{req.course.status}</Badge>
                  </div>

                  <AdminActionForm
                    action={approveOrganizationCourseRequestAction}
                    submitLabel="Approve"
                    pendingLabel="Approving…"
                    className="mt-5 space-y-4"
                  >
                    <input type="hidden" name="requestId" value={req.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>
                  </AdminActionForm>

                  <AdminActionForm
                    action={rejectOrganizationCourseRequestAction}
                    submitLabel="Reject"
                    pendingLabel="Rejecting…"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    confirm={{
                      question: `Reject ${req.organization.name}'s request for ${req.course.title}?`,
                      description: "The request is closed. The organization can request the course again later.",
                      confirmLabel: "Reject request",
                    }}
                  >
                    <input type="hidden" name="requestId" value={req.id} />
                  </AdminActionForm>
                </AdminPanel>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      <AdminPagination page={pendingPage} hrefFor={pendingHref} />

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
                  <AdminTableCell>{row.courseTitle}</AdminTableCell>
                  <AdminTableCell>{row.organizationName}</AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={row.status === "APPROVED" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString() : "—"}
                    {row.reviewerEmail ? ` · ${row.reviewerEmail}` : ""}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
          <AdminPagination page={recentPagination} hrefFor={recentHref} />
        </AdminSection>
      ) : null}
    </div>
  );
}
