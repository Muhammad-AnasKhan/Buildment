// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Wire contract for learner chapter actions under /api/v1/chapters/:chapterId.

export type LearningLogSaveResult = { savedAt: string };

export const CHAPTER_ERROR_CODES = {
  CHAPTER_LOCKED: "CHAPTER_LOCKED",
  CHECKPOINTS_INCOMPLETE: "CHECKPOINTS_INCOMPLETE",
  REFLECTION_INCOMPLETE: "REFLECTION_INCOMPLETE",
} as const;
