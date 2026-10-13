import type { CourseStatus } from "../domain/enums.js";

// Wire contract for /api/v1/invites — the learner side of mentor invites.

export type InviteState = "valid" | "revoked" | "accepted" | "expired" | "course-unavailable";

export type InvitePublicView = {
  state: InviteState;
  /** Set when the invite is bound to one address. */
  email: string | null;
  expiresAt: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    status: CourseStatus;
    estimatedHours: number | null;
    mentorName: string | null;
  };
};

export type AcceptInviteResult = { courseSlug: string; checkoutRequired: boolean };

export const INVITE_ERROR_CODES = {
  INVITE_REVOKED: "INVITE_REVOKED",
  INVITE_ACCEPTED: "INVITE_ACCEPTED",
  INVITE_EXPIRED: "INVITE_EXPIRED",
  WRONG_ACCOUNT: "WRONG_ACCOUNT",
  COURSE_UNAVAILABLE: "COURSE_UNAVAILABLE",
} as const;
