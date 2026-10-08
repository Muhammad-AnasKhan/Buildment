import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import {
  IntegrationAuthError,
  authenticateOrganizationFromRequest,
} from "@/server/integrations/authenticate-organization";
import { availableEnrollmentCount } from "@/server/integrations/allocation";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const now = new Date();
    const rows = await prisma.organizationCourse.findMany({
      where: {
        organizationId: org.id,
        isAllowed: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        course: { status: "PUBLISHED" },
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            pricingType: true,
            priceCents: true,
            currency: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      courses: rows.map((row) => ({
        course_id: row.course.id,
        course_slug: row.course.slug,
        title: row.course.title,
        description: row.course.description,
        price: row.course.priceCents,
        currency: row.course.currency,
        pricing_type: row.course.pricingType,
        status: row.course.status,
        expires_at: row.expiresAt?.toISOString() ?? null,
        available_enrollment_count: availableEnrollmentCount(row),
      })),
    });
  } catch (error) {
    if (error instanceof IntegrationAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
