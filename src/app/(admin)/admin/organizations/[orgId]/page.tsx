import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { CredentialReveal } from "@/components/admin/credential-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  rotateOrganizationCredentialFormAction,
  upsertOrganizationCourseAllocationAction,
} from "@/server/actions/admin/organizations";

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
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/organizations" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Organizations
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{org.name}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-500">{org.slug}</p>
          <p className="mt-2 text-sm text-neutral-600">
            {org._count.enrollments} integration enrollment{org._count.enrollments === 1 ? "" : "s"}
          </p>
        </div>
        <form action={rotateOrganizationCredentialFormAction}>
          <input type="hidden" name="organizationId" value={org.id} />
          <Button type="submit" variant="outline">
            Rotate API credentials
          </Button>
        </form>
      </div>

      {query.accessKey && query.secret ? (
        <div className="mt-6">
          <CredentialReveal accessKey={query.accessKey} secret={query.secret} />
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-900">API credentials</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Access key</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Last used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {org.apiCredentials.map((cred) => (
                <tr key={cred.id}>
                  <td className="px-4 py-3 font-mono text-xs">{cred.accessKey}</td>
                  <td className="px-4 py-3">{cred.label}</td>
                  <td className="px-4 py-3">{cred.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {cred.lastUsedAt ? cred.lastUsedAt.toISOString().slice(0, 10) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {org.courseRequests.length > 0 ? (
        <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <h2 className="text-sm font-semibold text-blue-950">Pending course requests</h2>
          <ul className="mt-2 space-y-1 text-sm text-blue-900">
            {org.courseRequests.map((r) => (
              <li key={r.id}>
                {r.course.title}{" "}
                <Link href="/admin/requests" className="underline">
                  Review in queue →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-900">Course allocations</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Caps and expiry are enforced on integration enrollments. Organizations cannot edit these
          themselves.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3 text-right">Used / max</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Allowed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {org.courseAllocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                    No allocations yet.
                  </td>
                </tr>
              ) : (
                org.courseAllocations.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium">{row.course.title}</span>
                      <span className="ml-2 font-mono text-xs text-neutral-500">{row.course.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.currentEnrollments} / {row.maxEnrollments}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {row.expiresAt ? row.expiresAt.toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3">{row.isAllowed ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form
          action={upsertOrganizationCourseAllocationAction}
          className="mt-6 grid max-w-xl gap-4 rounded-xl border border-neutral-200 bg-white p-4"
        >
          <input type="hidden" name="organizationId" value={org.id} />
          <h3 className="text-sm font-semibold text-neutral-900">Add or update allocation</h3>
          <div className="space-y-2">
            <Label htmlFor="courseId">Published course</Label>
            <select
              id="courseId"
              name="courseId"
              required
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm"
            >
              <option value="">Select course…</option>
              {publishedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {allocatedIds.has(c.id) ? "(update)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxEnrollments">Max enrollments</Label>
            <Input id="maxEnrollments" name="maxEnrollments" type="number" min={1} defaultValue={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires (optional)</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isAllowed" defaultChecked className="size-4 rounded border" />
            Allowed for new enrollments
          </label>
          <Button type="submit">Save allocation</Button>
        </form>
      </section>
    </div>
  );
}
