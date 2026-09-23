export type EvaluationAttention = {
  id: string;
  kind: "review" | "revision" | "help" | "incorrect" | "stalled" | "inactive";
  title: string;
  detail: string;
  href: string;
  action: string;
};

export type ProjectEvidence = {
  id: string;
  type: "Repository" | "Demo video" | "Deployed application" | "Architecture / ERD" | "Article / document" | "Other evidence";
  chapterTitle: string;
  prompt: string;
  label: string;
  url: string;
  hostname: string;
  displayPath: string;
  explanation: string | null;
  attempt: number;
  submittedAt: string;
  status: string;
  feedback: string | null;
  reviewHref: string;
};

export type EvaluationSubmission = {
  id: string;
  blockId: string;
  type: string;
  moduleTitle: string;
  chapterTitle: string;
  prompt: string | null;
  answer: string;
  status: string;
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  attempt: number;
  submittedAt: string;
  feedback: string | null;
  reviewHref: string | null;
  historyCount: number;
};

export type EvaluationChapter = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  locked: boolean;
  blocksCompleted: number;
  blocksTotal: number;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
  requiresReview: boolean;
  pendingReviews: number;
};

export type EvaluationModule = {
  id: string;
  order: number;
  title: string;
  completedCount: number;
  openByDefault: boolean;
  chapters: EvaluationChapter[];
};

export type FeedbackEvent = {
  id: string;
  occurredAt: string;
  chapterTitle: string;
  attempt: number;
  kind: "submission" | "review";
  title: string;
  detail: string | null;
  verdict: string | null;
  score: string | null;
  href: string;
};

export type HelpRequest = {
  id: string;
  chapterTitle: string;
  preview: string;
  updatedAt: string;
  status: string;
  href: string;
};

export type StudySessionItem = {
  id: string;
  chapterTitle: string;
  status: string;
  activeSeconds: number;
  startedAt: string;
};

export type MenteeEvaluation = {
  course: { id: string; slug: string; title: string };
  mentee: { id: string; name: string; email: string | null };
  enrollment: {
    id: string;
    status: string;
    percentComplete: number;
    chaptersCompleted: number;
    chapterCount: number;
    totalScore: number;
    maxScore: number;
    pendingReviews: number;
    lastActiveAt: string | null;
    lastActiveLabel: string;
    currentChapter: string | null;
    currentChapterDetail: string | null;
    studyWeekSeconds: number;
    studyTotalSeconds: number;
    openHelpCount: number;
  };
  reviewNextHref: string | null;
  attention: EvaluationAttention[];
  evidence: ProjectEvidence[];
  modules: EvaluationModule[];
  submissions: EvaluationSubmission[];
  timeline: FeedbackEvent[];
  help: HelpRequest[];
  sessions: StudySessionItem[];
};
