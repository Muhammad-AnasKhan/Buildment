"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";
import { runAdminAction, type AdminActionState } from "./action-result";

export async function setUserZipImportAccessAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/zip-import`, {
      method: "PATCH",
      json: { enabled },
    });
    revalidatePath("/admin/users");
    revalidatePath("/courses");
    return enabled ? "ZIP import enabled." : "ZIP import disabled.";
  });
}

export async function setUserInstructorAccessAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/instructor-access`, {
      method: "PATCH",
      json: { enabled },
    });
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return enabled ? "Instructor access granted." : "Instructor access revoked.";
  });
}

/** Grant instructor tools by email; the API creates a verified account when the address is new. */
export async function grantInstructorByEmailAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  return runAdminAction(async () => {
    await adminCall<void>("/api/v1/admin/instructors", {
      method: "POST",
      json: { email, name: String(formData.get("name") ?? "").trim() || undefined },
    });
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return `Instructor access granted to ${email}.`;
  });
}

/** Add a platform admin by email; the API creates a verified account when the address is new. */
export async function grantAdminByEmailAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  return runAdminAction(async () => {
    await adminCall<void>("/api/v1/admin/admins", {
      method: "POST",
      json: { email, name: String(formData.get("name") ?? "").trim() || undefined },
    });
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return `Platform admin added: ${email}.`;
  });
}

/** Invite a person to Edorax with the selected platform role. */
export async function inviteUserByEmailAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "MENTOR");
  const name = String(formData.get("name") ?? "").trim() || undefined;
  if (role !== "MENTOR" && role !== "ADMIN") return { ok: false, message: "Choose a valid role." };
  return runAdminAction(async () => {
    const endpoint = role === "ADMIN" ? "/api/v1/admin/admins" : "/api/v1/admin/instructors";
    await adminCall<void>(endpoint, { method: "POST", json: { email, ...(name ? { name } : {}) } });
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return `Invitation email sent to ${email} with ${role === "ADMIN" ? "platform admin" : "instructor"} access.`;
  });
}

/** Remove the platform-admin role; the API rejects self-action and the last admin. */
export async function revokeAdminAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  const email = String(formData.get("email") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/revoke-admin`, {
      method: "POST",
    });
    revalidatePath("/admin/users");
    return `Revoked platform admin from ${email}.`;
  });
}

/** Marks the account's email verified (e.g. the learner never received the link). */
export async function forceVerifyEmailAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/verify-email`, { method: "POST" });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return "Email verified.";
  });
}

/** Signs the account out of every device by deleting its sessions. */
export async function revokeUserSessionsAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/revoke-sessions`, { method: "POST" });
    revalidatePath(`/admin/users/${userId}`);
    return "Signed out of all devices.";
  });
}

/** Blocks sign-in for the account and signs it out everywhere. */
export async function suspendUserAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  const note = String(formData.get("note") ?? "").trim() || undefined;
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/suspend`, {
      method: "POST",
      json: { note },
    });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return "Account suspended.";
  });
}

/** Lifts a suspension so the account can sign in again. */
export async function reinstateUserAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/reinstate`, { method: "POST" });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return "Account reinstated.";
  });
}
