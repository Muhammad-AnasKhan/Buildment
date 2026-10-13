"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";
import { slugify } from "@/lib/utils";
import {
  approvePendingCourseRequestsForAllocation,
  parseAllocationExpiresAt,
  upsertOrganizationCourseAllocation,
} from "@/server/admin/organization-course-allocation";
import {
  generateAccessKey,
  generateSecretKey,
  hashSecret,
} from "@/server/admin/credentials";

async function requireAdmin() {
  return requireRole("ADMIN");
}

const createOrgSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(64).optional(),
});

export async function createOrganizationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });
  if (!parsed.success) {
    throw new Error("Organization name is required (2+ characters).");
  }

  const baseSlug = slugify(parsed.data.slug || parsed.data.name) || "org";
  let slug = baseSlug;
  for (let n = 2; ; n++) {
    const taken = await prisma.organization.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) break;
    slug = `${baseSlug}-${n}`;
  }

  const org = await prisma.organization.create({
    data: { name: parsed.data.name, slug },
  });

  const accessKey = generateAccessKey();
  const secret = generateSecretKey();
  await prisma.organizationApiCredential.create({
    data: {
      organizationId: org.id,
      accessKey,
      secretHash: hashSecret(secret),
      label: "default",
    },
  });

  revalidatePath("/admin/organizations");
  redirect(
    `/admin/organizations/${org.id}?accessKey=${encodeURIComponent(accessKey)}&secret=${encodeURIComponent(secret)}`
  );
}

const allocateSchema = z.object({
  organizationId: z.string().min(1),
  courseId: z.string().min(1),
  maxEnrollments: z.coerce.number().int().min(1).max(1_000_000),
  expiresAt: z.string().optional(),
  isAllowed: z.boolean(),
});

export async function upsertOrganizationCourseAllocationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = allocateSchema.safeParse({
    organizationId: formData.get("organizationId"),
    courseId: formData.get("courseId"),
    maxEnrollments: formData.get("maxEnrollments"),
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || undefined,
    isAllowed: formData.get("isAllowed") === "on" || formData.get("isAllowed") === "true",
  });
  if (!parsed.success) {
    throw new Error("Check course, max enrollments, and expiry.");
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { id: true, status: true },
  });
  if (!course || course.status !== "PUBLISHED") {
    throw new Error("Course not found or not published.");
  }

  const expiresAt = parseAllocationExpiresAt(parsed.data.expiresAt);

  await prisma.$transaction(async (tx) => {
    await upsertOrganizationCourseAllocation(
      {
        organizationId: parsed.data.organizationId,
        courseId: parsed.data.courseId,
        maxEnrollments: parsed.data.maxEnrollments,
        isAllowed: parsed.data.isAllowed,
        expiresAt,
      },
      tx
    );
    await approvePendingCourseRequestsForAllocation(
      parsed.data.organizationId,
      parsed.data.courseId,
      admin.id,
      tx
    );
  });

  revalidatePath(`/admin/organizations/${parsed.data.organizationId}`);
  revalidatePath("/admin/organizations");
  revalidatePath("/admin/requests");
}

const maxEnrollmentsField = z.coerce.number().int().min(1).max(1_000_000);

function parsePerCourseAllocation(formData: FormData, courseId: string) {
  const maxRaw = formData.get(`maxEnrollments_${courseId}`);
  const maxParsed = maxEnrollmentsField.safeParse(maxRaw);
  if (!maxParsed.success) {
    throw new Error(`Invalid max enrollments for course ${courseId}.`);
  }
  const expiresRaw = String(formData.get(`expiresAt_${courseId}`) ?? "").trim() || undefined;
  return {
    maxEnrollments: maxParsed.data,
    expiresAt: parseAllocationExpiresAt(expiresRaw),
  };
}

/** Allocate many published courses to an org catalog in one step (platform admin). */
export async function bulkUpsertOrganizationCourseAllocationsAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) throw new Error("Missing organization.");

  const courseIds = [...new Set(formData.getAll("courseIds").map(String).filter(Boolean))];
  if (courseIds.length === 0) {
    throw new Error("Select at least one course.");
  }

  const isAllowed = formData.get("isAllowed") === "on" || formData.get("isAllowed") === "true";

  const published = await prisma.course.findMany({
    where: { id: { in: courseIds }, status: "PUBLISHED" },
    select: { id: true },
  });
  if (published.length !== courseIds.length) {
    throw new Error("One or more selected courses are missing or not published.");
  }

  const allocations = courseIds.map((courseId) => ({
    courseId,
    ...parsePerCourseAllocation(formData, courseId),
  }));

  await prisma.$transaction(async (tx) => {
    for (const row of allocations) {
      await upsertOrganizationCourseAllocation(
        {
          organizationId,
          courseId: row.courseId,
          maxEnrollments: row.maxEnrollments,
          isAllowed,
          expiresAt: row.expiresAt,
        },
        tx
      );
      await approvePendingCourseRequestsForAllocation(organizationId, row.courseId, admin.id, tx);
    }
  });

  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/organizations");
  revalidatePath("/admin/requests");
}

export async function rotateOrganizationCredentialFormAction(formData: FormData): Promise<void> {
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) throw new Error("Missing organization.");
  await rotateOrganizationCredentialAction(organizationId);
}

export async function rotateOrganizationCredentialAction(organizationId: string): Promise<void> {
  await requireAdmin();
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new Error("Organization not found.");

  await prisma.organizationApiCredential.updateMany({
    where: { organizationId, active: true },
    data: { active: false },
  });

  const accessKey = generateAccessKey();
  const secret = generateSecretKey();
  await prisma.organizationApiCredential.create({
    data: {
      organizationId,
      accessKey,
      secretHash: hashSecret(secret),
      label: "default",
    },
  });

  revalidatePath(`/admin/organizations/${organizationId}`);
  redirect(
    `/admin/organizations/${organizationId}?accessKey=${encodeURIComponent(accessKey)}&secret=${encodeURIComponent(secret)}`
  );
}
