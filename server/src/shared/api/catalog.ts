import type { CourseCategory, CoursePricingType, CourseStatus, EnrollmentLifecycle } from "../domain/enums.js";
import type { SyllabusModule } from "./syllabus.js";

// Wire contract for the public catalog, course overview, checkout and self-enrolment.

export type CatalogCourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  difficulty: string | null;
  estimatedHours: number | null;
  /** Catalog grouping shown as tiles: technical courses and soft-skills courses. */
  category: CourseCategory;
  pricingType: CoursePricingType;
  priceCents: number;
  currency: string;
  projectGoal: string | null;
  instructorName: string | null;
  moduleCount: number;
  chapterCount: number;
  /** The caller's enrollment lifecycle in this course; null for anonymous visitors. */
  enrollmentLifecycle: EnrollmentLifecycle | null;
};

export type CatalogCourseDetail = CatalogCourseSummary & {
  modules: Array<{
    id: string;
    title: string;
    order: number;
    chapters: Array<{ id: string; title: string; order: number; estimatedMinutes: number | null }>;
  }>;
  /** What the caller can do next with this course. */
  access: "active" | "payment_required" | "none";
};

export type CourseOverview = {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    projectGoal: string | null;
    coverUrl: string | null;
    difficulty: string | null;
    estimatedHours: number | null;
    status: CourseStatus;
    instructorName: string | null;
  };
  access: "active" | "payment_required" | "none";
  enrollment: { percentComplete: number; chaptersCompleted: number; pendingReviews: number } | null;
  /** Present only when access is active. */
  syllabus: {
    modules: SyllabusModule[];
    chapterCount: number;
    continueHref: string | null;
    defaultOpenModuleId: string | null;
  } | null;
};

export type Checkout = {
  course: { id: string; slug: string; title: string; pricingType: CoursePricingType; priceCents: number; currency: string };
  enrollment: { id: string; lifecycle: EnrollmentLifecycle } | null;
  state: "no_enrollment" | "payment_required" | "already_paid";
};

export type SelfEnrollResult = {
  enrollmentId: string;
  courseSlug: string;
  lifecycle: EnrollmentLifecycle;
  created: boolean;
};

export const ENROLLMENT_ERROR_CODES = {
  ALREADY_ENROLLED: "ALREADY_ENROLLED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  NOT_PUBLISHED: "NOT_PUBLISHED",
} as const;
