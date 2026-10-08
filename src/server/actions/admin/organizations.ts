"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";
import { slugify } from "@/lib/utils";
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
  await requireAdmin();
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
  if (!course) throw new Error("Course not found.");

  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new Error("Invalid expiry date.");
  }

  await prisma.organizationCourse.upsert({
    where: {
      organizationId_courseId: {
        organizationId: parsed.data.organizationId,
        courseId: parsed.data.courseId,
      },
    },
    create: {
      organizationId: parsed.data.organizationId,
      courseId: parsed.data.courseId,
      maxEnrollments: parsed.data.maxEnrollments,
      isAllowed: parsed.data.isAllowed,
      expiresAt,
    },
    update: {
      maxEnrollments: parsed.data.maxEnrollments,
      isAllowed: parsed.data.isAllowed,
      expiresAt,
    },
  });

  revalidatePath(`/admin/organizations/${parsed.data.organizationId}`);
  revalidatePath("/admin/organizations");
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
