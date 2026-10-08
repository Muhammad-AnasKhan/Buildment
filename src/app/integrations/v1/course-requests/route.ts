import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticateOrganizationFromRequest } from "@/server/integrations/authenticate-organization";
import { integrationErrorResponse } from "@/server/integrations/respond";
import { listOrganizationCourseRequests } from "@/server/integrations/course-request-list";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const rows = await listOrganizationCourseRequests(org, status);
    return NextResponse.json({
      requests: rows.map((row) => ({
        request_id: row.id,
        course_id: row.courseId,
        course_title: row.course.title,
        course_status: row.course.status,
        status: row.status,
        requested_at: row.requestedAt.toISOString(),
        reviewed_at: row.reviewedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}

const bodySchema = z.object({
  course_id: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: parsed.data.course_id },
      select: { id: true, status: true, title: true },
    });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Course not found or not published" }, { status: 404 });
    }

    const existingAllocation = await prisma.organizationCourse.findUnique({
      where: {
        organizationId_courseId: {
          organizationId: org.id,
          courseId: course.id,
        },
      },
    });
    if (existingAllocation?.isAllowed) {
      return NextResponse.json(
        { error: "Course is already allocated to this organization", code: "ALREADY_ALLOCATED" },
        { status: 409 }
      );
    }

    const pending = await prisma.organizationCourseRequest.findFirst({
      where: {
        organizationId: org.id,
        courseId: course.id,
        status: "PENDING",
      },
    });
    if (pending) {
      return NextResponse.json({
        request_id: pending.id,
        status: "PENDING",
        created: false,
      });
    }

    const created = await prisma.organizationCourseRequest.create({
      data: {
        organizationId: org.id,
        courseId: course.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        request_id: created.id,
        course_id: course.id,
        status: "PENDING",
        created: true,
      },
      { status: 201 }
    );
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
