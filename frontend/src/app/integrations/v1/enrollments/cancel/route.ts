import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticateOrganizationFromRequest } from "@/server/integrations/authenticate-organization";
import { integrationErrorResponse } from "@/server/integrations/respond";
import { cancelPathmentEnrollment } from "@/server/integrations/pathment/cancel-pathment-enrollment";
import { serializeIntegrationEnrollment } from "@/server/integrations/enrollment-lookup";

const bodySchema = z.object({
  org_slug: z.string().min(1),
  email: z.string().email(),
  course_id: z.string().min(1),
  user_id: z.string().min(1).optional(),
  mentor_id: z.string().min(1).optional(),
  external_assignment_id: z.string().min(1).optional(),
});

/**
 * Cancel an organization integration enrollment.
 *
 * Auth: `x-buildment-access-key` (public id) + `x-buildment-secret-key` (private secret).
 * Pre-signup enrollments are keyed by LearnerProfile email — no User row required.
 */
export async function POST(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = await cancelPathmentEnrollment(
      prisma,
      { organizationId: org.id, slug: org.slug },
      {
        organizationId: org.id,
        orgSlug: parsed.data.org_slug.trim(),
        courseId: parsed.data.course_id,
        email: parsed.data.email,
        userId: parsed.data.user_id ?? null,
        mentorId: parsed.data.mentor_id ?? null,
        externalAssignmentId: parsed.data.external_assignment_id ?? null,
      }
    );

    return NextResponse.json({
      cancelled: result.cancelled,
      already_cancelled: result.alreadyCancelled,
      enrollment: serializeIntegrationEnrollment(result.enrollment),
    });
  } catch (error) {
    const response = integrationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
