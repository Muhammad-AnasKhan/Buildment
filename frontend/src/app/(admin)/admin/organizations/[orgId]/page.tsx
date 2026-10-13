import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { CredentialReveal } from "@/components/admin/credential-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BulkCourseAllocationForm } from "@/components/admin/bulk-course-allocation-form";
import { rotateOrganizationCredentialFormAction } from "@/server/actions/admin/organizations";
import {
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

  const allocationByCourseId = new Map(org.courseAllocations.map((row) => [row.courseId, row]));
  const pendingRequestCourseIds = new Set(org.courseRequests.map((r) => r.courseId));
  const mapCourseForBulk = (course: (typeof publishedCourses)[number]) => {
    const allocation = allocationByCourseId.get(course.id);
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      allocated: Boolean(allocation),
      pendingRequest: pendingRequestCourseIds.has(course.id),
      maxEnrollments: allocation?.maxEnrollments ?? 100,
      expiresAt: allocation?.expiresAt
        ? allocation.expiresAt.toLocaleDateString("en-CA")
        : "",
    };
  };

  const allPublishedCourses = publishedCourses.map(mapCourseForBulk);
  const coursesInCatalog = publishedCourses
    .filter((course) => allocationByCourseId.has(course.id))
    .map(mapCourseForBulk);

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
        title="Courses in catalog"
        description="Published courses currently allocated to this organization. Caps and expiry are enforced on integration enrollments."
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.course.title}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        In catalog
                      </Badge>
                    </div>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{row.course.slug}</span>
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
      </AdminSection>

      <AdminSection
        title="Add courses to catalog"
        description="Browse published courses. Rows marked Added to catalog are already allocated — select Not in catalog courses to add. Pending requests show a Requested badge."
        className="mt-10"
      >
        <AdminPanel className="max-w-4xl">
          <BulkCourseAllocationForm
            organizationId={org.id}
            courses={allPublishedCourses}
            intent="add"
            emptyMessage="No published courses on the platform yet."
          />
        </AdminPanel>
      </AdminSection>

      {coursesInCatalog.length > 0 ? (
        <AdminSection
          title="Update catalog courses"
          description="Change max enrollments or expiry for courses already in this organization's catalog."
          className="mt-10"
        >
          <AdminPanel className="max-w-4xl">
            <BulkCourseAllocationForm
              organizationId={org.id}
              courses={coursesInCatalog}
              intent="update"
            />
          </AdminPanel>
        </AdminSection>
      ) : null}
    </div>
  );
}
