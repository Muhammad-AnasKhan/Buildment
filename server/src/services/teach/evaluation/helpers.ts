export function latestByBlock<T extends { blockId: string; attempt: number }>(rows: T[]): T[] {
  const latest = new Map<string, T>();
  for (const row of rows) {
    const current = latest.get(row.blockId);
    if (!current || row.attempt > current.attempt) latest.set(row.blockId, row);
  }
  return [...latest.values()];
}

export function isEnrollmentScopedToCourse(
  enrollment: { courseId: string } | null,
  courseId: string
): boolean {
  return enrollment?.courseId === courseId;
}
