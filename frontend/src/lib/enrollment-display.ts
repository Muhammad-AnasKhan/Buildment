/** Display label for an enrollment row when user may be null (pending Pathment account). */
export function enrollmentLearnerLabel(enrollment: {
  user: { name?: string | null; email?: string | null } | null;
  learnerProfile?: { email: string } | null;
}): string {
  return (
    enrollment.user?.name ??
    enrollment.user?.email ??
    enrollment.learnerProfile?.email ??
    "Pending learner"
  );
}

export function enrollmentLearnerEmail(enrollment: {
  user: { email?: string | null } | null;
  learnerProfile?: { email: string } | null;
}): string | null {
  return enrollment.user?.email ?? enrollment.learnerProfile?.email ?? null;
}
