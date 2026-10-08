import { prisma } from "@/server/db";
import type { AuthenticatedOrganization } from "@/server/integrations/authenticate-organization";

export async function listOrganizationCourseRequests(
  org: AuthenticatedOrganization,
  statusFilter?: string | null
) {
  const status =
    statusFilter === "PENDING" ||
    statusFilter === "APPROVED" ||
    statusFilter === "REJECTED"
      ? statusFilter
      : undefined;

  return prisma.organizationCourseRequest.findMany({
    where: {
      organizationId: org.id,
      ...(status ? { status } : {}),
    },
    orderBy: { requestedAt: "desc" },
    include: {
      course: { select: { id: true, title: true, slug: true, status: true } },
    },
  });
}
