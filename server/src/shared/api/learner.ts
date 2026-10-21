import type { EnrollStatus, HelpThreadStatus, ProgressStatus, BlockType } from "../domain/enums.js";
import type { InstructorAccessView } from "../lib/instructor-access.js";
import type { LearnerHabit, StreakMilestone } from "../lib/streak.js";

// Wire contract for /api/v1/learner. Dates travel as ISO strings.

export type { LearnerHabit, StreakMilestone, InstructorAccessView };

/** Counts the learner workspace shell shows in its sidebar. */
export type LearnerWorkspace = {
  instructorAccess: InstructorAccessView;
  assignedCourses: number;
  pendingReviews: number;
  openHelpRequests: number;
};

export type DashboardDay = { day: string; seconds: number };

export type DashboardAction = {
  id: string;
  kind: "REVISION" | "CONTINUE" | "HELP" | "START" | "FEEDBACK" | "PENDING_REVIEW" | "REVIEW";
  title: string;
  context: string;
  reason: string;
  statusLabel: string;
  href: string;
  occurredAt: string | null;
  unread?: boolean;
};

export type DashboardCourse = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  enrollmentStatus: EnrollStatus;
  state:
    | "PAYMENT_REQUIRED"
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "NEEDS_REVISION"
    | "AWAITING_REVIEW"
    | "COMPLETED"
    | "DROPPED";
  percentComplete: number;
  chaptersCompleted: number;
  chaptersTotal: number;
  pendingReviews: number;
  totalScore: number;
  maxScore: number;
  totalStudySeconds: number;
  lastActiveAt: string | null;
  currentModule: string | null;
  targetChapter: { title: string; slug: string; status: ProgressStatus; blocksCompleted: number; blocksTotal: number } | null;
  href: string;
  overviewHref: string;
  actionLabel: string;
  actionReason: string;
  priority: number;
};

export type DashboardEvent = {
  id: string;
  type: "CHAPTER_STARTED" | "CHAPTER_COMPLETED" | "SUBMISSION" | "REVIEW" | "REVISION" | "HELP_CREATED" | "HELP_RESOLVED" | "STUDY_SESSION";
  title: string;
  context: string;
  occurredAt: string;
  href: string;
};

export type MenteeDashboardViewModel = {
  learner: { name: string };
  primaryCourse: DashboardCourse | null;
  actions: DashboardAction[];
  courses: DashboardCourse[];
  overview: {
    assignedCourses: number;
    inProgressCourses: number;
    completedCourses: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    todaySeconds: number;
    weekSeconds: number;
    totalSeconds: number;
    pendingReviews: number;
    openHelpRequests: number;
  };
  activity: {
    week: DashboardDay[];
    activeDays: number;
    maxDaySeconds: number;
    lastActiveAt: string | null;
    recentChapter: { title: string; courseTitle: string; href: string } | null;
    runningSession: { chapterTitle: string; courseTitle: string; href: string; startedAt: string } | null;
  };
  latestFeedback: DashboardAction | null;
  help: {
    openCount: number;
    latest: { title: string; courseTitle: string; status: HelpThreadStatus; href: string; updatedAt: string } | null;
  };
  recentEvents: DashboardEvent[];
  habit: LearnerHabit;
};

export type LearnerProgressModule = {
  id: string;
  order: number;
  title: string;
  completed: number;
  total: number;
  score: number;
  maxScore: number;
};

export type LearnerProgressCourse = {
  course: { id: string; slug: string; title: string };
  percentComplete: number;
  chaptersCompleted: number;
  totalChapters: number;
  totalScore: number;
  maxScore: number;
  pendingReviews: number;
  lastActiveAt: string | null;
  activeDays: number;
  weekSeconds: number;
  totalStudySeconds: number;
  dailyActivity: DashboardDay[];
  continueHref: string | null;
  modules: LearnerProgressModule[];
};

/** A scored checkpoint that counted on a wrong answer because retry was off. */
export type ClosedWrongCheckpoint = {
  blockId: string;
  type: BlockType;
  chapter: { slug: string; title: string };
  course: { slug: string; title: string };
};

export type LearnerProgressView = {
  courses: LearnerProgressCourse[];
  closedWrong: ClosedWrongCheckpoint[];
  overall: {
    chaptersCompleted: number;
    totalChapters: number;
    score: number;
    maxScore: number;
    weekSeconds: number;
    pendingReviews: number;
  };
};

export type WeeklyGoalInput = { kind: "SESSIONS" | "CHAPTERS"; target: number; note?: string; dailyReminder?: boolean };

export type LearnerProfile = {
  name: string | null;
  email: string;
  image: string | null;
  timezone: string;
  skills: string[];
  /** Most recently active course, used as the settings page cover. */
  featuredCourse: { title: string; coverUrl: string | null } | null;
};

export type ProfileUpdateInput = { name: string; timezone: string; skills: string[] };

export const INSTRUCTOR_ACCESS_ERROR_CODES = {
  ALREADY_INSTRUCTOR: "ALREADY_INSTRUCTOR",
  REQUEST_PENDING: "REQUEST_PENDING",
} as const;
