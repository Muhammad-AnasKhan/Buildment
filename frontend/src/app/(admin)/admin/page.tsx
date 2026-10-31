import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Building2,
  ClipboardList,
  History,
  Plus,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type {
  AdminAuditView,
  AdminCourseRequestsView,
  AdminMetricPoint,
  AdminMetricsView,
  AdminOverview,
  AdminUsersView,
} from "@/shared/api/admin";
import { serverApiFetch } from "@/lib/api-server";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "12 weeks" },
] as const;

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  note,
  accent = "primary",
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
  accent?: "primary" | "blue" | "green" | "amber";
}) {
  const iconTone = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  }[accent];

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-10 place-items-center rounded-xl", iconTone)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowRight className="mt-1 size-4 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{note}</p>
    </Link>
  );
}

function GrowthChart({ points, range }: { points: AdminMetricPoint[]; range: string }) {
  const max = Math.max(1, ...points.map((point) => point.activeLearners));
  const total = points.reduce((sum, point) => sum + point.activeLearners, 0);
  const width = 100 / Math.max(points.length, 1);
  const selectedRange = RANGES.find((item) => item.value === range)?.value ?? "30";

  return (
    <AdminPanel padding="none" className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold">Platform growth</h2>
          <p className="mt-1 text-sm text-muted-foreground">Daily active learners across the platform</p>
          <p className="mt-4 text-2xl font-semibold tabular-nums">{total.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">learner-days</span></p>
        </div>
        <div className="flex rounded-xl bg-muted p-1" aria-label="Chart time range">
          {RANGES.map((item) => (
            <Link
              key={item.value}
              href={`/admin?range=${item.value}`}
              scroll={false}
              aria-current={selectedRange === item.value ? "true" : undefined}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                selectedRange === item.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          Active learners per day <span className="ml-auto tabular-nums">Peak {max}</span>
        </div>
        <svg
          viewBox="0 0 100 38"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Daily active learners over ${range} days. ${total} learner-days, peak ${max} in one day.`}
          className="h-52 w-full overflow-visible text-primary sm:h-64"
        >
          {[8, 18, 28, 37].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="stroke-border" strokeWidth="0.25" />)}
          {points.map((point, index) => {
            const barHeight = (point.activeLearners / max) * 28;
            const x = index * width + width * 0.16;
            return (
              <g key={point.date}>
                <rect
                  x={x}
                  y={36 - barHeight}
                  width={Math.max(width * 0.68, 0.15)}
                  height={Math.max(barHeight, point.activeLearners > 0 ? 0.45 : 0)}
                  rx={Math.min(width * 0.18, 0.6)}
                  className="fill-current opacity-75 transition-opacity hover:opacity-100"
                >
                  <title>{`${point.date}: ${point.activeLearners} active learners`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{points[0]?.date ?? "No data"}</span>
          <span>{points.at(-1)?.date ?? ""} · UTC</span>
        </div>
      </div>
    </AdminPanel>
  );
}

function timeAgo(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = RANGES.some((item) => item.value === params.range) ? params.range! : "30";
  const [overview, metrics, requests, audit, users] = await Promise.all([
    serverApiFetch<AdminOverview>("/api/v1/admin/overview"),
    serverApiFetch<AdminMetricsView>(`/api/v1/admin/metrics?range=${range}`),
    serverApiFetch<AdminCourseRequestsView>("/api/v1/admin/course-requests?pageSize=5"),
    serverApiFetch<AdminAuditView>("/api/v1/admin/audit?pageSize=5"),
    serverApiFetch<AdminUsersView>("/api/v1/admin/users?pageSize=5"),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Platform management"
        title="Overview"
        description="A current snapshot of learners, courses, organizations, and admin work."
        actions={
          <>
            <a href="/api/v1/admin/courses/export" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <ArrowDownToLine className="size-4" aria-hidden /> Export courses
            </a>
            <Link href="/admin/organizations/new" className={cn(buttonVariants({ size: "sm" }))}>
              <Plus className="size-4" aria-hidden /> New organization
            </Link>
          </>
        }
      />

      <section aria-label="Platform totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/admin/users" icon={Users} label="Total users" value={users.page.total} note={`${metrics.totals.newUsers.toLocaleString()} joined in the last ${range} days`} />
        <StatCard href="/admin/courses" icon={BookOpen} label="Published courses" value={overview.publishedCourses} note={`${metrics.totals.newEnrollments.toLocaleString()} new enrollments in ${range} days`} accent="blue" />
        <StatCard href="/admin/organizations" icon={Building2} label="Organizations" value={overview.organizations} note="Manage allocations and integration access" accent="green" />
        <StatCard href="/admin/requests" icon={ClipboardList} label="Pending requests" value={overview.pendingCourseRequests} note={overview.pendingCourseRequests ? "Needs review" : "The review queue is clear"} accent="amber" />
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]" aria-label="Growth and course requests">
        <GrowthChart points={metrics.series} range={range} />
        <AdminPanel padding="none">
          <div className="flex items-start justify-between gap-3 border-b border-border p-5 sm:p-6">
            <div>
              <h2 className="text-base font-semibold">Course requests</h2>
              <p className="mt-1 text-sm text-muted-foreground">{overview.pendingCourseRequests} {overview.pendingCourseRequests === 1 ? "request" : "requests"} need review</p>
            </div>
            <Link href="/admin/requests" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {requests.pending.length ? (
            <ul className="divide-y divide-border">
              {requests.pending.slice(0, 5).map((request) => (
                <li key={request.id} className="flex items-center gap-3 p-4 sm:px-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden>
                    {request.organization.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{request.organization.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{request.course.title}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{timeAgo(request.requestedAt)}</p>
                    <Link href="/admin/requests" className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">Review</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No requests are waiting for review.</div>
          )}
        </AdminPanel>
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]" aria-label="Recent activity and quick actions">
        <AdminPanel padding="none">
          <div className="flex items-start justify-between gap-3 border-b border-border p-5 sm:p-6">
            <div>
              <h2 className="text-base font-semibold">Recent admin activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">Security-sensitive changes are recorded in the audit log.</p>
            </div>
            <Link href="/admin/audit" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              Audit log <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {audit.entries.length ? (
            <ul className="divide-y divide-border">
              {audit.entries.slice(0, 5).map((entry) => (
                <li key={entry.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(120px,0.8fr)_minmax(160px,1.6fr)_minmax(120px,1fr)_auto] sm:items-center sm:px-5">
                  <span className="truncate text-sm font-medium">{entry.actorEmail}</span>
                  <span className="text-sm text-muted-foreground">{entry.summary}</span>
                  <span className="truncate text-xs text-muted-foreground">{entry.targetType}{entry.targetId ? ` · ${entry.targetId}` : ""}</span>
                  <time dateTime={entry.createdAt} className="text-xs text-muted-foreground sm:text-right">{timeAgo(entry.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Admin actions will appear here as they happen.</div>
          )}
        </AdminPanel>

        <AdminPanel padding="none">
          <div className="border-b border-border p-5 sm:p-6">
            <h2 className="text-base font-semibold">Quick actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Common platform tasks</p>
          </div>
          <div className="divide-y divide-border">
            <QuickAction href="/admin/organizations/new" icon={Building2} label="Create organization" />
            <QuickAction href="/admin/users" icon={Users} label="Manage users and admins" />
            <QuickAction href="/admin/courses" icon={BookOpen} label="Manage course access" />
            <QuickAction href="/admin/settings/profile" icon={ShieldCheck} label="Review admin security" />
          </div>
          <Link href="/admin/audit" className="m-4 flex items-center gap-3 rounded-xl bg-primary/10 p-4 text-primary transition-colors hover:bg-primary/15">
            <History className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Security and audit center</span>
              <span className="mt-0.5 block text-xs text-primary/80">Review recent admin changes</span>
            </span>
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </AdminPanel>
      </section>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5">
      <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" aria-hidden /></span>
      <span className="flex-1">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}
