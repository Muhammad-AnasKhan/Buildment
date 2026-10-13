"use server";

import { teachCall } from "./teach-call";

export async function nudgeMenteeAction(input: { enrollmentId: string }) {
  const result = await teachCall<void>(`/api/v1/teach/enrollments/${encodeURIComponent(input.enrollmentId)}/nudge`, { method: "POST" });
  if (!result.ok) return { ok: false as const, error: result.errors.join(" ") };
  return { ok: true as const };
}
