import type {
  CatalogCourseSummary,
  CatalogCourseDetail,
} from '../../server/src/shared/api/catalog';

export type Course = CatalogCourseSummary;
export type CourseDetail = CatalogCourseDetail;
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code: string };
export type CatalogResult =
  | { ok: true; courses: Course[] }
  | { ok: false; message: string };
export interface DesktopAPI {
  listCourses(): Promise<CatalogResult>;
  courseDetail(slug: string): Promise<Result<CourseDetail>>;
  signIn(): Promise<Result<{ signedIn: true }>>;
  cancelSignIn(): Promise<void>;
  signOut(): Promise<Result<{ signedIn: false }>>;
}
declare global {
  interface Window {
    buildment: DesktopAPI;
  }
}

export function filterCourses(
  courses: Course[],
  query: string,
  category: string,
): Course[] {
  const search = query.trim().toLowerCase();
  return courses.filter(
    (course) =>
      (category === 'all' || course.category === category) &&
      [course.title, course.description, course.instructorName].some((value) =>
        value?.toLowerCase().includes(search),
      ),
  );
}

export function coursePrice(course: Course): string {
  if (course.pricingType === 'FREE') return 'Free';
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: course.currency,
      maximumFractionDigits: 2,
    }).format(course.priceCents / 100);
  } catch {
    return `${course.currency} ${(course.priceCents / 100).toFixed(2)}`;
  }
}
