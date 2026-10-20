import type { CoursePricingType, CourseStatus, RequestStatus, Role } from "../domain/enums.js";

// Wire contract for /api/v1/admin — platform administration. Dates are ISO strings.

export type AdminOverview = {
  organizations: number;
  pendingCourseRequests: number;
  publishedCourses: number;
  instructors: number;
};

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  status: CourseStatus;
  pricingType: CoursePricingType;
  priceCents: number;
  currency: string;
  updatedAt: string;
  instructorLabel: string;
  enrollmentCount: number;
  allocationCount: number;
};

export type AdminOrganizationRow = {
  id: string;
  slug: string;
  name: string;
  /** Access key of the active credential, when one exists. */
  accessKey: string | null;
  allocationCount: number;
  enrollmentCount: number;
};

export type AdminCredentialRow = {
  id: string;
  accessKey: string;
  label: string;
  active: boolean;
  lastUsedAt: string | null;
};

export type AdminAllocationRow = {
  id: string;
  course: { id: string; slug: string; title: string; status: CourseStatus };
  isAllowed: boolean;
  maxEnrollments: number;
  currentEnrollments: number;
  expiresAt: string | null;
};

export type AdminOrganizationDetail = {
  organization: { id: string; slug: string; name: string; enrollmentCount: number };
  credentials: AdminCredentialRow[];
  allocations: AdminAllocationRow[];
  pendingRequests: Array<{ id: string; courseId: string; courseTitle: string; courseSlug: string }>;
  /** Every published course, so the admin can allocate new ones. */
  publishedCourses: Array<{ id: string; slug: string; title: string }>;
};

/** The secret is shown exactly once, right after it is issued. */
export type IssuedCredential = { accessKey: string; secret: string };

export type CreatedOrganization = {
  organization: { id: string; slug: string; name: string };
  credential: IssuedCredential;
};

export type AdminCourseRequestsView = {
  pending: Array<{
    id: string;
    requestedAt: string;
    organization: { id: string; slug: string; name: string };
    course: { slug: string; title: string; status: CourseStatus };
  }>;
  recent: Array<{
    id: string;
    status: RequestStatus;
    reviewedAt: string | null;
    reviewerEmail: string | null;
    organizationName: string;
    courseTitle: string;
  }>;
};

export type AdminUserRow = {
  zipImportEnabled: boolean;
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  enrollmentCount: number;
  courseCount: number;
};

export type AdminUsersView = {
  pendingInstructorRequests: Array<{
    id: string;
    message: string | null;
    user: { id: string; email: string; name: string | null; role: Role };
  }>;
  users: AdminUserRow[];
};

export const ADMIN_ERROR_CODES = {
  REQUEST_ALREADY_REVIEWED: "REQUEST_ALREADY_REVIEWED",
  COURSE_NOT_PUBLISHED: "COURSE_NOT_PUBLISHED",
  INVALID_EXPIRY: "INVALID_EXPIRY",
} as const;
