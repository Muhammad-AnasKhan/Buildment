import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  KeyRound,
  Layers3,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AdminOrganizationDetail } from "@/shared/api/admin";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { cn } from "@/lib/utils";
import { CredentialReveal } from "@/components/admin/credential-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { OrganizationCourseDrawer } from "@/components/admin/organization-course-drawer";
import { rotateOrganizationCredentialFormAction, setAllocationLeaderboardAction } from "@/server/actions/admin/organizations";
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

  const { organization: org, credentials, allocations, pendingRequests, publishedCourses } =
    await serverApiFetchOrNotFound<AdminOrganizationDetail>(`/api/v1/admin/organizations/${encodeURIComponent(orgId)}`);

  const allocationByCourseId = new Map(allocations.map((row) => [row.course.id, row]));
  const pendingRequestCourseIds = new Set(pendingRequests.map((r) => r.courseId));
  const mapCourseForBulk = (course: (typeof publishedCourses)[number]) => {
    const allocation = allocationByCourseId.get(course.id);
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      allocated: Boolean(allocation),
      pendingRequest: pendingRequestCourseIds.has(course.id),
      maxEnrollments: allocation?.maxEnrollments ?? 100,
      expiresAt: allocation?.expiresAt ? allocation.expiresAt.slice(0, 10) : "",
    };
  };

  const allPublishedCourses = publishedCourses.map(mapCourseForBulk);
  return (
    <div className="space-y-8 pb-12">
      <AdminBackLink href="/admin/organizations">← Back to organizations</AdminBackLink>

      <AdminPageHeader
        eyebrow="Organization"
        title={org.name}
        description={
          <>
            <span className="font-mono text-xs">{org.slug}</span>
            <span className="mt-1 block">
              {org.enrollmentCount} integration enrollment
              {org.enrollmentCount === 1 ? "" : "s"}
            </span>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OrganizationCourseDrawer
              organizationId={org.id}
              courses={allPublishedCourses}
            />
            <AdminActionForm
              action={rotateOrganizationCredentialFormAction}
              submitLabel="Rotate API credentials"
              pendingLabel="Rotating…"
              variant="outline"
              confirm={{
                question: `Rotate API credentials for ${org.name}?`,
                description:
                  "The current key stops working immediately. Any integration using it must switch to the new credentials.",
                confirmLabel: "Rotate credentials",
              }}
            >
              <input type="hidden" name="organizationId" value={org.id} />
            </AdminActionForm>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Integration enrollments" value={org.enrollmentCount.toLocaleString()} detail="Learners connected" />
        <MetricCard icon={BookOpen} label="Catalog courses" value={allocations.length.toLocaleString()} detail="Allocated to this org" />
        <MetricCard icon={KeyRound} label="API credentials" value={credentials.filter((credential) => credential.active).length.toLocaleString()} detail="Active access keys" />
        <MetricCard icon={Layers3} label="Pending requests" value={pendingRequests.length.toLocaleString()} detail={pendingRequests.length ? "Needs review" : "Everything is up to date"} highlight={pendingRequests.length > 0} />
      </div>

      {query.accessKey && query.secret ? (
        <CredentialReveal accessKey={query.accessKey} secret={query.secret} />
      ) : null}

      {pendingRequests.length > 0 ? (
        <AdminPanel className="border-primary/20 bg-primary/[0.04] p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <AlertCircle className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Pending course requests</h2>
                <p className="mt-1 text-sm text-muted-foreground">This organization is waiting for access to the following courses.</p>
              </div>
            </div>
            <Link href="/admin/requests" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              Open request queue <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {pendingRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm sm:px-6">
                <span className="font-medium">{r.courseTitle}</span>
                <span className="text-xs text-muted-foreground">Awaiting review</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      <AdminSection title="Access & credentials" description="Manage the keys used by this organization’s integration." className="mt-0">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
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
            {credentials.map((cred) => (
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
                  {cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleDateString() : "—"}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
        <AdminPanel className="flex flex-col justify-between bg-muted/25">
          <div>
            <span className="grid size-10 place-items-center rounded-xl bg-background text-primary shadow-sm">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-sm font-semibold">Credential hygiene</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Keep keys private, rotate them after a team change, and update the external integration immediately.</p>
          </div>
          <Link href="/integrations" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View integration docs <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </AdminPanel>
        </div>
      </AdminSection>

      <AdminSection
        title="Courses in catalog"
        description="Published courses currently allocated to this organization. Caps and expiry are enforced on integration enrollments."
        className="mt-12"
      >
        <AdminTable minWidth="860px">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Course</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Used / max</AdminTableHeaderCell>
              <AdminTableHeaderCell>Expires</AdminTableHeaderCell>
              <AdminTableHeaderCell>Allowed</AdminTableHeaderCell>
              <AdminTableHeaderCell>Leaderboards</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No allocations yet.
                </td>
              </tr>
            ) : (
              allocations.map((row) => (
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
                    {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {row.isAllowed ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <form action={setAllocationLeaderboardAction} className="flex items-center gap-2">
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="courseId" value={row.course.id} />
                      <input type="hidden" name="enabled" value={row.leaderboardEnabled ? "false" : "true"} />
                      {row.leaderboardEnabled ? <Badge variant="secondary">On</Badge> : <Badge variant="outline">Off</Badge>}
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        aria-label={`${row.leaderboardEnabled ? "Turn off" : "Turn on"} leaderboards for ${row.course.title}`}
                      >
                        {row.leaderboardEnabled ? "Turn off" : "Turn on"}
                      </Button>
                    </form>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminSection>

      <AdminPanel className="border-dashed bg-muted/15">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Need to change access?</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the catalog controls above to add courses or update caps and expiry dates.</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">{publishedCourses.length.toLocaleString()} published courses available</p>
        </div>
      </AdminPanel>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  highlight = false,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", highlight && "border-primary/30 bg-primary/[0.04]")}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground", highlight && "bg-primary/10 text-primary")}>
          <Icon className="size-4" aria-hidden />
        </span>
        {highlight ? <span className="size-2 rounded-full bg-primary" aria-label="Needs attention" /> : null}
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
