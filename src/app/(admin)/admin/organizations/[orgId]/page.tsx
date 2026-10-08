import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { CredentialReveal } from "@/components/admin/credential-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  rotateOrganizationCredentialFormAction,
  upsertOrganizationCourseAllocationAction,
} from "@/server/actions/admin/organizations";
import {
  adminSelectClassName,
  AdminBackLink,
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

export default async function AdminOrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ accessKey?: string; secret?: string }>;
}) {
  const { orgId } = await params;
  const query = await searchParams;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      apiCredentials: { orderBy: { createdAt: "desc" } },
      courseAllocations: {
        orderBy: { updatedAt: "desc" },
        include: { course: { select: { id: true, title: true, slug: true, status: true } } },
      },
      courseRequests: {
        where: { status: "PENDING" },
        include: { course: { select: { title: true, slug: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!org) notFound();

  const publishedCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });

  const allocatedIds = new Set(org.courseAllocations.map((a) => a.courseId));

  return (
    <div>
      <AdminBackLink href="/admin/organizations">← Back to organizations</AdminBackLink>

      <div className="mt-4">
        <AdminPageHeader
          eyebrow="Organization"
          title={org.name}
          description={
            <>
              <span className="font-mono text-xs">{org.slug}</span>
              <span className="mt-1 block">
                {org._count.enrollments} integration enrollment
                {org._count.enrollments === 1 ? "" : "s"}
              </span>
            </>
          }
          actions={
            <form action={rotateOrganizationCredentialFormAction}>
              <input type="hidden" name="organizationId" value={org.id} />
              <Button type="submit" variant="outline">
                Rotate API credentials
              </Button>
            </form>
          }
        />
      </div>

      {query.accessKey && query.secret ? (
        <div className="mt-6">
          <CredentialReveal accessKey={query.accessKey} secret={query.secret} />
        </div>
      ) : null}

      {org.courseRequests.length > 0 ? (
        <AdminPanel className="mt-6 border-primary/20 bg-primary/5">
          <h2 className="text-sm font-semibold">Pending course requests</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {org.courseRequests.map((r) => (
              <li key={r.id}>
                {r.course.title}{" "}
                <Link href="/admin/requests" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Review in queue →
                </Link>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      <AdminSection title="API credentials">
        <AdminTable minWidth="560px">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Access key</AdminTableHeaderCell>
              <AdminTableHeaderCell>Label</AdminTableHeaderCell>
              <AdminTableHeaderCell>Active</AdminTableHeaderCell>
              <AdminTableHeaderCell>Last used</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {org.apiCredentials.map((cred) => (
              <AdminTableRow key={cred.id}>
                <AdminTableCell>
                  <span className="font-mono text-xs">{cred.accessKey}</span>
                </AdminTableCell>
                <AdminTableCell>{cred.label}</AdminTableCell>
                <AdminTableCell>
                  {cred.active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </AdminTableCell>
                <AdminTableCell className="text-muted-foreground">
                  {cred.lastUsedAt ? cred.lastUsedAt.toLocaleDateString() : "—"}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminSection>

      <AdminSection
        title="Course allocations"
        description="Caps and expiry are enforced on integration enrollments. Organizations cannot edit these themselves."
      >
        <AdminTable minWidth="720px">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Course</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Used / max</AdminTableHeaderCell>
              <AdminTableHeaderCell>Expires</AdminTableHeaderCell>
              <AdminTableHeaderCell>Allowed</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {org.courseAllocations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No allocations yet.
                </td>
              </tr>
            ) : (
              org.courseAllocations.map((row) => (
                <AdminTableRow key={row.id}>
                  <AdminTableCell>
                    <span className="font-medium">{row.course.title}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{row.course.slug}</span>
                  </AdminTableCell>
                  <AdminTableCell align="right" className="tabular-nums">
                    {row.currentEnrollments} / {row.maxEnrollments}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {row.expiresAt ? row.expiresAt.toLocaleDateString() : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {row.isAllowed ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>

        <AdminPanel className="mt-6 max-w-xl">
          <h3 className="text-sm font-semibold">Add or update allocation</h3>
          <form action={upsertOrganizationCourseAllocationAction} className="mt-4 space-y-4">
            <input type="hidden" name="organizationId" value={org.id} />
            <div className="space-y-1.5">
              <Label htmlFor="courseId">Published course</Label>
              <select id="courseId" name="courseId" required className={adminSelectClassName}>
                <option value="">Select course…</option>
                {publishedCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} {allocatedIds.has(c.id) ? "(update)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxEnrollments">Max enrollments</Label>
              <Input id="maxEnrollments" name="maxEnrollments" type="number" min={1} defaultValue={100} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expires (optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isAllowed" defaultChecked className="size-4 rounded border-input" />
              Allowed for new enrollments
            </label>
            <Button type="submit">Save allocation</Button>
          </form>
        </AdminPanel>
      </AdminSection>
    </div>
  );
}
