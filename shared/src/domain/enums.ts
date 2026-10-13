// String unions mirroring the Prisma enums in server/prisma/schema.prisma.
// The server pins them against the generated client in a type test, so a schema
// change that forgets this file fails `tsc` instead of drifting silently.

export const ROLES = ["MENTEE", "MENTOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const BLOCK_TYPES = [
  "QUIZ",
  "TEST",
  "MUST_READ",
  "OPEN_QUESTION",
  "CODE",
  "STEPS",
  "PROJECT_PREVIEW",
  "LEARNING_OBJECTIVES",
  "CHAPTER_RECAP",
  "PREDICT",
  "VIDEO",
  "VISUAL_WALKTHROUGH",
  "VISUAL_DIAGRAM",
  "ROADMAP",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const RESPONSE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "AUTO_GRADED",
  "PENDING_REVIEW",
  "REVIEWED",
  "NEEDS_REVISION",
] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

export const PROGRESS_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const ENROLLMENT_LIFECYCLES = [
  "PENDING_ACCOUNT",
  "PAYMENT_REQUIRED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type EnrollmentLifecycle = (typeof ENROLLMENT_LIFECYCLES)[number];

export const STUDY_SESSION_STATUSES = ["RUNNING", "PAUSED", "ENDED"] as const;
export type StudySessionStatus = (typeof STUDY_SESSION_STATUSES)[number];
