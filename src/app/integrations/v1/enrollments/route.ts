import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticateOrganizationFromRequest } from "@/server/integrations/authenticate-organization";
import { integrationErrorResponse } from "@/server/integrations/respond";
import { createPathmentEnrollment } from "@/server/integrations/pathment/create-pathment-enrollment";
import {
  findOrganizationEnrollment,
  missingEnrollmentLookupParams,
  serializeIntegrationEnrollment,
} from "@/server/integrations/enrollment-lookup";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const url = new URL(request.url);
    if (missingEnrollmentLookupParams(url.searchParams)) {
      return NextResponse.json(
        {
          error:
            "Provide external_assignment_id or both course_id and learner_email query parameters",
        },
        { status: 400 }
      );
    }
    const enrollment = await findOrganizationEnrollment(org, url.searchParams);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    return NextResponse.json({ enrollment: serializeIntegrationEnrollment(enrollment) });
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}

const bodySchema = z.object({
  student_email: z.string().email(),
  course_id: z.string().min(1),
  mentor_id: z.string().optional(),
  external_assignment_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = await createPathmentEnrollment(prisma, {
      organizationId: org.id,
      courseId: parsed.data.course_id,
      studentEmail: parsed.data.student_email,
      mentorId: parsed.data.mentor_id ?? null,
      externalAssignmentId: parsed.data.external_assignment_id ?? null,
    });

    const { enrollment, created } = result;
    return NextResponse.json(
      {
        enrollment_id: enrollment.id,
        course_id: enrollment.courseId,
        learner_email: parsed.data.student_email,
        lifecycle: enrollment.lifecycle,
        created,
        external_mentor_id: enrollment.externalMentorId,
        external_assignment_id: enrollment.externalAssignmentId,
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
