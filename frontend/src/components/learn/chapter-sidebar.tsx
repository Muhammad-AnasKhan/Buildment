"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChapterSidebar as SharedChapterSidebar,
  type ChapterSidebarProps,
} from "@buildment/learning-ui/components/learn/chapter-sidebar";
import { CourseNavigationProvider } from "@buildment/learning-ui/components/learn/course-navigation";
export { SidebarToggle } from "@buildment/learning-ui/components/learn/chapter-sidebar";
export function ChapterSidebar(props: ChapterSidebarProps) {
  const pathname = usePathname();
  const prefix = `/courses/${props.courseSlug}/`;
  const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
  const active = rest && !rest.includes("/") ? decodeURIComponent(rest) : props.currentChapterSlug;
  return (
    <CourseNavigationProvider Link={Link}>
      <SharedChapterSidebar {...props} currentChapterSlug={active} />
    </CourseNavigationProvider>
  );
}
