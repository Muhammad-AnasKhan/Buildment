import type { HelpThreadStatus, Role } from "../domain/enums.js";

// Wire contract for /api/v1/help. Dates travel as ISO strings.

export type HelpMessageView = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
};

export type HelpThreadView = {
  id: string;
  status: HelpThreadStatus;
  messages: HelpMessageView[];
};

/** One row of the learner's "my questions" list. */
export type HelpThreadSummary = {
  id: string;
  status: HelpThreadStatus;
  createdAt: string;
  updatedAt: string;
  course: { slug: string; title: string };
  chapter: { slug: string; title: string } | null;
  question: string | null;
  preview: { body: string; createdAt: string; fromMentor: boolean } | null;
  /** The mentor replied after the learner last opened the thread. */
  unread: boolean;
};

export type HelpThreadDetail = HelpThreadView & {
  courseId: string;
  chapterId: string | null;
  menteeId: string;
  mentee: { id: string; name: string | null; email: string };
  course: { slug: string; title: string };
  chapter: { slug: string; title: string } | null;
};

export const HELP_ERROR_CODES = {
  THREAD_CLOSED: "THREAD_CLOSED",
  CHAPTER_LOCKED: "CHAPTER_LOCKED",
} as const;
