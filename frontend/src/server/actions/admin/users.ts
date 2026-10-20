"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";

export async function setUserZipImportAccessAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing user.");
  await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/zip-import`, {
    method: "PATCH", json: { enabled: formData.get("enabled") === "true" },
  });
  revalidatePath("/admin/users");
  revalidatePath("/courses");
}

export async function setUserInstructorAccessAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing user.");
  await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/instructor-access`, {
    method: "PATCH",
    json: { enabled: formData.get("enabled") === "true" },
  });
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

/** Grant instructor tools by email; the API creates a verified account when the address is new. */
export async function grantInstructorByEmailAction(formData: FormData): Promise<void> {
  await adminCall<void>("/api/v1/admin/instructors", {
    method: "POST",
    json: { email: String(formData.get("email") ?? ""), name: String(formData.get("name") ?? "").trim() || undefined },
  });
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

/** Add a platform admin by email; the API creates a verified account when the address is new. */
export async function grantAdminByEmailAction(formData: FormData): Promise<void> {
  await adminCall<void>("/api/v1/admin/admins", {
    method: "POST",
    json: { email: String(formData.get("email") ?? ""), name: String(formData.get("name") ?? "").trim() || undefined },
  });
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}
