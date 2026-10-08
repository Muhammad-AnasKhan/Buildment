import Link from "next/link";
import { prisma } from "@/server/db";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      title: "Organizations",
      description: "Create orgs, API keys, and course allocations for Pathment-style integrations.",
      stat: `${orgCount} org${orgCount === 1 ? "" : "s"}`,
    },
    {
      href: "/admin/requests",
      title: "Course requests",
      description: "Review organization requests for published courses.",
      stat: pendingRequests > 0 ? `${pendingRequests} pending` : "None pending",
    },
    {
      href: "/admin/courses",
      title: "Courses",
      description: "Inspect published and draft courses across the platform.",
      stat: `${publishedCourses} published`,
    },
    {
      href: "/admin/users",
      title: "Users",
      description: "List accounts and grant instructor access.",
      stat: `${instructors} can instruct`,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Platform admin</h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        Manage organizations, integrations, allocations, and instructor access.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} className="block h-full transition-opacity hover:opacity-90">
              <Card className="h-full px-4 py-4 ring-neutral-200">
                <CardHeader className="p-0">
                  <CardTitle className="text-base">{tile.title}</CardTitle>
                  <CardDescription>{tile.description}</CardDescription>
                  <p className="pt-2 text-xs font-medium tabular-nums text-neutral-600">{tile.stat}</p>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
