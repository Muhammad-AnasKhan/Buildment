import { createHash } from "node:crypto";

export function pathmentAssignmentId(input: {
  organizationId: string;
  courseId: string;
  studentEmail: string;
  mentorId?: string | null;
  externalAssignmentId?: string | null;
}): string {
  if (input.externalAssignmentId?.trim()) {
    return input.externalAssignmentId.trim();
  }
  const material = [
    input.organizationId,
    input.courseId,
    input.studentEmail.trim().toLowerCase(),
    input.mentorId?.trim() ?? "",
  ].join("\0");
  return createHash("sha256").update(material, "utf8").digest("hex");
}
