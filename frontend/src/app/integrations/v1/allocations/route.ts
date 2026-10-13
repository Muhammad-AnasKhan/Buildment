import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import {
  authenticateOrganizationFromRequest,
} from "@/server/integrations/authenticate-organization";
import { integrationErrorResponse } from "@/server/integrations/respond";
import { availableEnrollmentCount } from "@/server/integrations/allocation";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const rows = await prisma.organizationCourse.findMany({
      where: { organizationId: org.id },
      include: {
        course: { select: { id: true, title: true, status: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      allocations: rows.map((row) => ({
        course_id: row.courseId,
        title: row.course.title,
        course_status: row.course.status,
        is_allowed: row.isAllowed,
        max_enrollments: row.maxEnrollments,
        current_enrollments: row.currentEnrollments,
        available_enrollment_count: availableEnrollmentCount(row),
        expires_at: row.expiresAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
