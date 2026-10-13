import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge } from "@/components/ui/badge";
import { formatPriceCents } from "@/lib/format-price";
import {
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-ui";

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
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Courses"
        description="Read-only view for support, allocation decisions, and integration troubleshooting."
      />

      <AdminTable minWidth="900px">
        <AdminTableHead>
          <tr>
            <AdminTableHeaderCell>Title</AdminTableHeaderCell>
            <AdminTableHeaderCell>Status</AdminTableHeaderCell>
            <AdminTableHeaderCell>Pricing</AdminTableHeaderCell>
            <AdminTableHeaderCell>Instructor</AdminTableHeaderCell>
            <AdminTableHeaderCell align="right">Enrollments</AdminTableHeaderCell>
            <AdminTableHeaderCell align="right">Org allocations</AdminTableHeaderCell>
          </tr>
        </AdminTableHead>
        <AdminTableBody>
          {courses.map((course) => (
            <AdminTableRow key={course.id}>
              <AdminTableCell>
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {course.title}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{course.slug}</p>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={course.status === "PUBLISHED" ? "secondary" : "outline"}>
                  {course.status}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                {course.pricingType === "PAID"
                  ? formatPriceCents(course.priceCents ?? 0, course.currency ?? "USD")
                  : "Free"}
              </AdminTableCell>
              <AdminTableCell className="text-muted-foreground">
                {course.mentor.name ?? course.mentor.email}
              </AdminTableCell>
              <AdminTableCell align="right" className="tabular-nums">
                {course._count.enrollments}
              </AdminTableCell>
              <AdminTableCell align="right" className="tabular-nums">
                {course._count.organizationCourses}
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
