"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CreatedOrganization, IssuedCredential } from "@buildment/shared/api/admin";
import { adminCall } from "./call";

// Tenants and their integration access. The API returns a credential secret
// exactly once; the page shows it through the redirect query, as before.

function credentialRevealUrl(organizationId: string, credential: IssuedCredential) {
  return `/admin/organizations/${organizationId}?accessKey=${encodeURIComponent(credential.accessKey)}&secret=${encodeURIComponent(credential.secret)}`;
}

export async function createOrganizationAction(formData: FormData): Promise<void> {
  const { organization, credential } = await adminCall<CreatedOrganization>("/api/v1/admin/organizations", {
    method: "POST",
    json: { name: String(formData.get("name") ?? ""), slug: String(formData.get("slug") ?? "") || undefined },
  });
  revalidatePath("/admin/organizations");
  redirect(credentialRevealUrl(organization.id, credential));
}

export async function rotateOrganizationCredentialFormAction(formData: FormData): Promise<void> {
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) throw new Error("Missing organization.");
  const credential = await adminCall<IssuedCredential>(
    `/api/v1/admin/organizations/${encodeURIComponent(organizationId)}/credentials/rotate`,
    { method: "POST" }
  );
  revalidatePath(`/admin/organizations/${organizationId}`);
  redirect(credentialRevealUrl(organizationId, credential));
}

/** Allocate many published courses to an org catalog in one step (platform admin). */
export async function bulkUpsertOrganizationCourseAllocationsAction(formData: FormData): Promise<void> {
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) throw new Error("Missing organization.");

  const courseIds = [...new Set(formData.getAll("courseIds").map(String).filter(Boolean))];
  if (courseIds.length === 0) throw new Error("Select at least one course.");

  await adminCall<void>(`/api/v1/admin/organizations/${encodeURIComponent(organizationId)}/allocations`, {
    method: "PUT",
    json: {
      isAllowed: formData.get("isAllowed") === "on" || formData.get("isAllowed") === "true",
      courses: courseIds.map((courseId) => ({
        courseId,
        maxEnrollments: Number(formData.get(`maxEnrollments_${courseId}`) ?? 0),
        expiresAt: String(formData.get(`expiresAt_${courseId}`) ?? "").trim(),
      })),
    },
  });

  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/organizations");
  revalidatePath("/admin/requests");
}
