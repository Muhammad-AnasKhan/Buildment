import type { AdminAuditView } from "@/shared/api/admin";
import { serverApiFetch } from "@/lib/api-server";
import { cn } from "@/lib/utils";
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
import { AdminPagination } from "@/components/admin/admin-pagination";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { entries, page: pagination } = await serverApiFetch<AdminAuditView>(
    `/api/v1/admin/audit${page > 1 ? `?page=${page}` : ""}`
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Accountability"
        title="Audit log"
        description="Recent platform-admin actions. Records are append-only and survive account changes."
        actions={
          <a
            href="/api/v1/admin/audit/export"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Export CSV
          </a>
        }
      />

      <div className="mt-8">
        {entries.length === 0 ? (
          <AdminEmptyState
            title="No admin actions yet"
            description="Organization, course-request, access, and allocation changes will appear here."
          />
        ) : (
          <AdminTable minWidth="760px">
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>When</AdminTableHeaderCell>
                <AdminTableHeaderCell>Action</AdminTableHeaderCell>
                <AdminTableHeaderCell>Detail</AdminTableHeaderCell>
                <AdminTableHeaderCell>Target</AdminTableHeaderCell>
                <AdminTableHeaderCell>Actor</AdminTableHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {entries.map((entry) => (
                <AdminTableRow key={entry.id}>
                  <AdminTableCell className="whitespace-nowrap text-muted-foreground">
                    <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="font-mono text-xs">{entry.action}</span>
                  </AdminTableCell>
                  <AdminTableCell>{entry.summary}</AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    <span className="font-mono text-xs">
                      {entry.targetType}
                      {entry.targetId ? `:${entry.targetId}` : ""}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="font-mono text-xs text-muted-foreground">
                    {entry.actorEmail}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </div>

      <AdminPagination
        page={pagination}
        hrefFor={(next) => (next > 1 ? `/admin/audit?page=${next}` : "/admin/audit")}
      />
    </div>
  );
}
