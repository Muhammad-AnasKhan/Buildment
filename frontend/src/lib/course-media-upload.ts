import { parseApiResponse } from "@/lib/api-client";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export async function uploadCourseImage(courseId: string, purpose: "cover" | "content", file: File): Promise<string> {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Choose a JPEG, PNG, WebP, GIF, or AVIF image.");
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image smaller than 8 MB.");
  const response = await fetch(`/api/v1/teach/courses/${encodeURIComponent(courseId)}/media/${purpose}`, {
    method: "POST",
    headers: { "Content-Type": file.type, Accept: "application/json" },
    body: file,
    credentials: "same-origin",
  });
  const result = await parseApiResponse<{ url: string }>(response);
  return result.url;
}
