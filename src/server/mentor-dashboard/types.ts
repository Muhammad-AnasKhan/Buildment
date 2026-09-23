export type MentorCourseCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  chapterCount: number;
  learnerCount: number;
  averageProgress: number;
  completedLearners: number;
  pendingReviews: number;
  openHelpRequests: number;
  inactiveLearners: number;
  updatedAt: string;
};

export type MentorCoursesView = {
  courses: MentorCourseCard[];
  summary: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalLearners: number;
    pendingReviews: number;
    openHelpRequests: number;
  };
};

export type MenteeAttentionKind = "review" | "help" | "inactive" | "revision" | "stalled";

export type MenteeRosterItem = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  image: string | null;
  status: string;
  progressState: "not-started" | "in-progress" | "completed";
  percentComplete: number;
  chaptersCompleted: number;
  chapterCount: number;
  score: number;
  maxScore: number;
  pendingReviews: number;
  openHelpRequests: number;
  currentChapter: string | null;
  studySeconds: number;
  lastActiveAt: string | null;
  lastActiveLabel: string;
  activityState: "recent" | "inactive" | "never";
  attention: Array<{ kind: MenteeAttentionKind; label: string }>;
  evaluationHref: string;
};

export type PendingInviteView = { id: string; email: string; createdAt: string };

export type CourseMenteesView = {
  course: { id: string; slug: string; title: string; status: string; chapterCount: number };
  linkInvite: { id: string; token: string } | null;
  pendingEmailInvites: PendingInviteView[];
  mentees: MenteeRosterItem[];
  attentionMentees: MenteeRosterItem[];
  summary: {
    total: number;
    active: number;
    averageCompletion: number;
    completed: number;
    pendingReviews: number;
    openHelpRequests: number;
    inactive: number;
  };
};
