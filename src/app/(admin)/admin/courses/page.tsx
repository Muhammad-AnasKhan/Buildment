import Link from "next/link";
import { prisma } from "@/server/db";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      pricingType: true,
      priceCents: true,
      currency: true,
      updatedAt: true,
      mentor: { select: { email: true, name: true } },
      _count: { select: { enrollments: true, organizationCourses: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Courses</h1>
      <p className="mt-1 text-sm text-neutral-500">Read-only catalog for support and allocation decisions.</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pricing</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3 text-right">Enrollments</th>
              <th className="px-4 py-3 text-right">Org allocations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-neutral-50/80">
                <td className="px-4 py-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {course.title}
                  </Link>
                  <p className="font-mono text-xs text-neutral-500">{course.slug}</p>
                </td>
                <td className="px-4 py-3">{course.status}</td>
                <td className="px-4 py-3">
                  {course.pricingType === "PAID"
                    ? `${(course.priceCents ?? 0) / 100} ${course.currency ?? "USD"}`
                    : course.pricingType}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {course.mentor.name ?? course.mentor.email}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{course._count.enrollments}</td>
                <td className="px-4 py-3 text-right tabular-nums">{course._count.organizationCourses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
