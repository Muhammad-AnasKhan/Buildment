"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LearnerProgressCourse } from "@/shared/api/learner";

export function ProgressCourseSelector({ courses, selectedSlug }: { courses: LearnerProgressCourse[]; selectedSlug: string | null }) {
  const router = useRouter();
  const selectedCourse = courses.find((course) => course.course.slug === selectedSlug);

  function choose(slug: string | null) {
    router.push(slug ? `/progress?course=${encodeURIComponent(slug)}` : "/progress");
  }

  return (
    <div className="w-full sm:w-80 lg:w-96">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">View progress for</p>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<button type="button" className="flex h-12 w-full items-center gap-3 rounded-xl border bg-card px-3 text-left shadow-sm outline-none transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Choose a course to view progress" />}
        >
          <BookOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{selectedCourse?.course.title ?? "All courses"}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border p-1.5 shadow-xl">
          <DropdownMenuItem onClick={() => choose(null)} className="min-h-10 gap-2.5 px-3 py-2">
            <span className="min-w-0 flex-1 font-medium">All courses</span>
            {!selectedCourse ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {courses.map((course) => (
            <DropdownMenuItem key={course.course.id} onClick={() => choose(course.course.slug)} className="min-h-11 items-start gap-2.5 px-3 py-2.5">
              <span className="min-w-0 flex-1 whitespace-normal break-words text-sm leading-snug">{course.course.title}</span>
              {course.course.slug === selectedSlug ? <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
