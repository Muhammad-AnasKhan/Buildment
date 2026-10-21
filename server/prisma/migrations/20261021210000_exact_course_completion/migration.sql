-- A rounded 100% used to mark enrollments complete with a chapter still open.
-- Recalculate affected rows from chapter progress so variant choices and
-- specialisations follow actual course completion.
WITH actual AS (
  SELECT
    e."id",
    (SELECT COUNT(*) FROM "Chapter" c WHERE c."courseId" = e."courseId") AS total,
    (SELECT COUNT(*) FROM "ChapterProgress" cp
     WHERE cp."enrollmentId" = e."id" AND cp."status" = 'COMPLETED') AS completed
  FROM "Enrollment" e
  WHERE (e."status" = 'COMPLETED' OR e."percentComplete" >= 100)
    AND e."status" <> 'DROPPED'
)
UPDATE "Enrollment" e
SET
  "chaptersCompleted" = actual.completed::integer,
  "percentComplete" = LEAST(99, ROUND(100.0 * actual.completed / actual.total)::integer),
  "status" = 'IN_PROGRESS',
  "completedAt" = NULL
FROM actual
WHERE e."id" = actual."id"
  AND actual.total > 0
  AND actual.completed < actual.total;
