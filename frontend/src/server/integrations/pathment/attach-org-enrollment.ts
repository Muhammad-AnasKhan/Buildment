/** Link Pathment assignment metadata onto an existing user enrollment (no slot consumed). */
export function pathmentEnrollmentPatch(input: {
  organizationId: string;
  mentorId?: string | null;
  assignmentId: string;
}) {
  return {
    organizationId: input.organizationId,
    externalMentorId: input.mentorId?.trim() || null,
    externalAssignmentId: input.assignmentId,
  };
}

export function shouldAttachPathmentOrg(
  existingOrganizationId: string | null,
  organizationId: string
): boolean {
  return !existingOrganizationId || existingOrganizationId === organizationId;
}
