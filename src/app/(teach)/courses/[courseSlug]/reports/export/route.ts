import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { toCsv } from "@/lib/csv";

// CSV export of the course report mentee table (docs/06-reports.mdx "Export").
// Reads only the denormalized Enrollment rollups.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, title: true },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = [
    "name",
    "email",
    "status",
    "percent_complete",
    "chapters_completed",
    "score",
    "max_score",
    "pending_reviews",
    "last_active_at",
    "started_at",
    "completed_at",
  ];

  const rows = enrollments.map((e) => [
    e.user.name ?? "",
    e.user.email ?? "",
    e.status,
    String(e.percentComplete),
    String(e.chaptersCompleted),
    String(e.totalScore),
    String(e.maxScore),
    String(e.pendingReviews),
    e.lastActiveAt?.toISOString() ?? "",
    e.startedAt?.toISOString() ?? "",
    e.completedAt?.toISOString() ?? "",
  ]);

  const csv = toCsv([header, ...rows]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${courseSlug}-report.csv"`,
    },
  });
}
