"use server";

import type { AssignByEmailsResult as AssignByEmailsData, InviteLinkResult } from "@/shared/api/teach";
import { teachCall } from "./teach-call";

// Mentor side of assignment and invites; acceptance moved to the API with the
// learner domain (/api/v1/invites). Result shapes match what the panels expect.

export type InviteActionResult = { ok: true } | { ok: false; errors: string[] };

export type AssignByEmailsResult = ({ ok: true } & AssignByEmailsData) | { ok: false; errors: string[] };

export async function assignByEmails(input: { courseId: string; emailsRaw: string }): Promise<AssignByEmailsResult> {
  const result = await teachCall<AssignByEmailsData>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/invites/assign`, {
    method: "POST",
    json: { emails: input.emailsRaw },
  });
  return result.ok ? { ok: true, ...result.data } : result;
}

export type CreateInviteLinkResult = ({ ok: true } & InviteLinkResult) | { ok: false; errors: string[] };

/** Course-scoped open invite link — any signed-in account can self-enroll. */
export async function createInviteLink(input: { courseId: string }): Promise<CreateInviteLinkResult> {
  const result = await teachCall<InviteLinkResult>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/invites/link`, { method: "POST" });
  return result.ok ? { ok: true, ...result.data } : result;
}

export async function revokeInvite(input: { inviteId: string; courseId: string }): Promise<InviteActionResult> {
  const result = await teachCall<void>(
    `/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/invites/${encodeURIComponent(input.inviteId)}`,
    { method: "DELETE" }
  );
  return result.ok ? { ok: true } : result;
}
