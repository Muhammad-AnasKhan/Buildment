import Link from "next/link";
import {
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/server/db";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

function OverviewTile({
  href,
  icon: Icon,
  title,
  description,
  stat,
  highlight,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-foreground/15 hover:shadow-md",
          highlight && "border-amber-500/40 ring-1 ring-amber-500/20"
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <h2 className="mt-4 text-base font-semibold tracking-tight group-hover:text-primary">{title}</h2>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <p className="mt-4 text-xs font-semibold tabular-nums text-muted-foreground">{stat}</p>
      </Link>
    </li>
  );
}

export default async function AdminHomePage() {
  const [orgCount, pendingRequests, publishedCourses, instructors] = await Promise.all([
    prisma.organization.count(),
    prisma.organizationCourseRequest.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { canInstruct: true } }),
  ]);

  const tiles = [
    {
      href: "/admin/organizations",
      icon: Building2,
      title: "Organizations",
      description: "Create tenants, rotate API keys, and manage course allocations for integrations.",
      stat: `${orgCount} org${orgCount === 1 ? "" : "s"}`,
    },
    {
      href: "/admin/requests",
      icon: ClipboardList,
      title: "Course requests",
      description: "Review when an organization asks for access to a published course.",
      stat: pendingRequests > 0 ? `${pendingRequests} pending` : "Queue clear",
      highlight: pendingRequests > 0,
    },
    {
      href: "/admin/courses",
      icon: BookOpen,
      title: "Courses",
      description: "Browse the platform catalog to support allocations and troubleshooting.",
      stat: `${publishedCourses} published`,
    },
    {
      href: "/admin/users",
      icon: Users,
      title: "Users",
      description: "Grant instructor access and inspect learner accounts.",
      stat: `${instructors} can instruct`,
    },
  ] as const;

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Manage organizations, integration access, and instructor accounts from one place."
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <OverviewTile key={tile.href} {...tile} />
        ))}
      </ul>

      <AdminPanel className="mt-10">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-10 place-items-center rounded-xl bg-muted">
            <GraduationCap className="size-5 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Learner & instructor apps</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Platform admin is separate from day-to-day teaching. Open the learner catalog or instructor
              workspace when you need to preview the product experience.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/catalog"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Learner catalog
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Instructor workspace
              </Link>
              <Link
                href="/integrations"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Integration docs
              </Link>
            </div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
