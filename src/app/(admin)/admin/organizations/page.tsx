import Link from "next/link";
import { prisma } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Organizations</h1>
          <p className="mt-1 text-sm text-neutral-500">
            External platforms (e.g. Pathment) authenticate with org API credentials.
          </p>
        </div>
        <Link href="/admin/organizations/new" className={cn(buttonVariants())}>
          New organization
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Access key</th>
              <th className="px-4 py-3 text-right">Allocations</th>
              <th className="px-4 py-3 text-right">Enrollments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                  No organizations yet.{" "}
                  <Link href="/admin/organizations/new" className="font-medium text-neutral-900 underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id} className="hover:bg-neutral-50/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{org.slug}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-neutral-600">
                    {org.apiCredentials[0]?.accessKey ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{org._count.courseAllocations}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{org._count.enrollments}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
