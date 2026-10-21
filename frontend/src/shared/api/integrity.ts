// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Quiz integrity signals: what the browser may report, what mentors see, and the
// limits both apps agree on. Signals are flags for a mentor to judge. Nothing here
// fails, locks or submits a quiz on its own.

export const INTEGRITY_EVENT_TYPES = [
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "COPY_BLOCKED",
  "PASTE_BLOCKED",
  "CONTEXT_MENU_BLOCKED",
  "SCREENSHOT_KEY",
  "MOUSE_LEFT",
  "SECOND_SCREEN",
  "FAST_ANSWER",
  "CAMERA_OFF",
  "CAMERA_ON",
] as const;
export type IntegrityEventType = (typeof INTEGRITY_EVENT_TYPES)[number];

export type IntegrityCameraStatus = "NOT_REQUESTED" | "ON" | "DECLINED" | "UNAVAILABLE";

/** Camera events describe the device, not the learner, so they never add to the flag count. */
export const INTEGRITY_INFO_EVENTS: ReadonlySet<IntegrityEventType> = new Set(["CAMERA_OFF", "CAMERA_ON"]);

export function isIntegrityFlag(type: IntegrityEventType): boolean {
  return !INTEGRITY_INFO_EVENTS.has(type);
}

export const INTEGRITY_LIMITS = {
  /** Events stored per attempt. Later ones are counted as dropped, not stored. */
  eventsPerAttempt: 500,
  eventsPerBatch: 50,
  /** About one still a minute: 4 hours of quiz at most. */
  snapshotsPerAttempt: 240,
  snapshotIntervalSeconds: 60,
  /** The server refuses stills that arrive faster than this. */
  snapshotMinGapSeconds: 40,
  snapshotWidth: 320,
  snapshotHeight: 240,
  snapshotMaxBytes: 48 * 1024,
  retentionDays: 30,
} as const;

/** Mentor-facing names. Short, plain English for ESL readers. */
export const INTEGRITY_EVENT_LABELS: Record<IntegrityEventType, string> = {
  TAB_HIDDEN: "Left the tab",
  WINDOW_BLUR: "Switched window",
  FULLSCREEN_EXIT: "Left full screen",
  COPY_BLOCKED: "Tried to copy",
  PASTE_BLOCKED: "Tried to paste",
  CONTEXT_MENU_BLOCKED: "Right-click",
  SCREENSHOT_KEY: "Screenshot keys",
  MOUSE_LEFT: "Mouse left the page",
  SECOND_SCREEN: "Second screen",
  FAST_ANSWER: "Very fast answers",
  CAMERA_OFF: "Camera off",
  CAMERA_ON: "Camera on",
};

export const INTEGRITY_CAMERA_LABELS: Record<IntegrityCameraStatus, string> = {
  NOT_REQUESTED: "Camera not used",
  ON: "Camera on",
  DECLINED: "Camera off (learner chose no camera)",
  UNAVAILABLE: "Camera off (no camera or it stopped)",
};

export type IntegrityEventInput = {
  /** Random id from the browser so a retried batch is stored once. */
  id: string;
  type: IntegrityEventType;
  /** When it happened in the browser (events are buffered while offline). */
  at: string;
  blockId?: string | null;
  meta?: Record<string, string | number | boolean>;
};

/** What the learner's browser gets when a proctored quiz opens. */
export type IntegrityAttemptSession = {
  attemptId: string;
  attempt: number;
  /** Flags already stored for this attempt, so the badge survives a reload. */
  flagCount: number;
  camera: {
    /** The course has camera snapshots turned on. */
    enabled: boolean;
    status: IntegrityCameraStatus;
    intervalSeconds: number;
    width: number;
    height: number;
    retentionDays: number;
  };
};

export type IntegrityEventsResult = { accepted: number; flagCount: number };

export type IntegrityAttemptSummary = {
  id: string;
  chapterId: string;
  chapterTitle: string;
  attempt: number;
  startedAt: string;
  lastSeenAt: string;
  cameraStatus: IntegrityCameraStatus;
  flagCount: number;
  droppedEvents: number;
  counts: Partial<Record<IntegrityEventType, number>>;
  snapshotCount: number;
};

export type IntegrityAttemptDetail = IntegrityAttemptSummary & {
  events: Array<{ id: string; type: IntegrityEventType; at: string; blockId: string | null; meta: Record<string, unknown> | null }>;
  /** `url` is a short-lived signed link, or null once the image was deleted. */
  snapshots: Array<{ id: string; takenAt: string; url: string | null }>;
  snapshotUrlExpiresAt: string | null;
};

export type CourseIntegritySettings = { integritySnapshots: boolean };
