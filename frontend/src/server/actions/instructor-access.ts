"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export async function requestInstructorAccessAction(formData: FormData): Promise<void> {
  const message = String(formData.get("message") ?? "").trim();
  try {
    await serverApiFetch("/api/v1/learner/instructor-access-requests", {
      method: "POST",
      json: message ? { message } : {},
    });
  } catch (error) {
    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
  revalidatePath("/", "layout");
}
