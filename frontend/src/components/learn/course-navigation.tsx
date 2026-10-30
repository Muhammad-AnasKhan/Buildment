"use client";
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CourseNavigationProvider } from '@buildment/learning-ui/components/learn/course-navigation';
export function WebCourseNavigation({ children }: { children: ReactNode }) {
  return <CourseNavigationProvider Link={Link}><div className="course-overview-surface">{children}</div></CourseNavigationProvider>;
}
