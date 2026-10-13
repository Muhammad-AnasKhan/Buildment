import Link from "next/link";
import { prisma } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export default async function AdminOrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { courseAllocations: true, enrollments: true } },
      apiCredentials: { where: { active: true }, take: 1, select: { accessKey: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Tenants"
        title="Organizations"
        description="External platforms (e.g. Pathment) authenticate with org-scoped API credentials."
        actions={
          <Link href="/admin/organizations/new" className={cn(buttonVariants())}>
            New organization
          </Link>
        }
      />

      {organizations.length === 0 ? (
        <AdminEmptyState
          title="No organizations yet"
          description="Create a tenant to issue API keys and allocate courses for integration enrollments."
          action={
            <Link href="/admin/organizations/new" className={cn(buttonVariants())}>
              Create organization
            </Link>
          }
        />
      ) : (
        <AdminTable minWidth="640px">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Name</AdminTableHeaderCell>
              <AdminTableHeaderCell>Slug</AdminTableHeaderCell>
              <AdminTableHeaderCell>Access key</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Allocations</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Enrollments</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {organizations.map((org) => (
              <AdminTableRow key={org.id}>
                <AdminTableCell>
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {org.name}
                  </Link>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono text-xs text-muted-foreground">{org.slug}</span>
                </AdminTableCell>
                <AdminTableCell className="max-w-[12rem]">
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {org.apiCredentials[0]?.accessKey ?? "—"}
                  </span>
                </AdminTableCell>
                <AdminTableCell align="right" className="tabular-nums">
                  {org._count.courseAllocations}
                </AdminTableCell>
                <AdminTableCell align="right" className="tabular-nums">
                  {org._count.enrollments}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
