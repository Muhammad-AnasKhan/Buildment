import { CourseCard, type CourseCardData } from "@/components/marketing/course-card";

export type CatalogCourse = CourseCardData & { id: string };

/** All courses stay in reading order, with no timers or hidden pages. */
export function CourseCatalog({ courses }: { courses: CatalogCourse[] }) {
  return (
    <ul aria-label="Course catalog" className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <li key={course.id} className="min-w-0">
          <CourseCard course={course} coverIndex={index} />
        </li>
      ))}
    </ul>
  );
}

