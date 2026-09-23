import { notFound } from "next/navigation";
import { CourseHeader } from "@/components/teach/course-cms/course-header";
import { CourseSettings } from "@/components/teach/course-cms/course-settings";
import { CurriculumBuilder } from "@/components/teach/course-cms/curriculum-builder";
import type {
  CourseBuilderChapter,
  CourseBuilderCourse,
} from "@/components/teach/course-cms/types";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { prisma } from "@/server/db";

export default async function CourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ publishError?: string }>;
}) {
  const { courseSlug } = await params;
  const query = await searchParams;

  const courseRow = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      projectGoal: true,
      difficulty: true,
      estimatedHours: true,
      sequential: true,
      status: true,
      _count: { select: { enrollments: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          chapters: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              order: true,
              publishedAt: true,
              estimatedMinutes: true,
              isMilestone: true,
              readerMode: true,
              blocks: {
                where: { archivedAt: null },
                orderBy: { order: "asc" },
                select: { type: true },
              },
            },
          },
        },
      },
    },
  });
  if (!courseRow) notFound();
  await requireMentorOfCourse(courseRow.id);

  const looseChapters: CourseBuilderChapter[] = await prisma.chapter.findMany({
    where: { courseId: courseRow.id, moduleId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      publishedAt: true,
      estimatedMinutes: true,
      isMilestone: true,
      readerMode: true,
      blocks: {
        where: { archivedAt: null },
        orderBy: { order: "asc" },
        select: { type: true },
      },
    },
  });

  const course: CourseBuilderCourse = {
    id: courseRow.id,
    slug: courseRow.slug,
    title: courseRow.title,
    description: courseRow.description,
    projectGoal: courseRow.projectGoal,
    difficulty: courseRow.difficulty,
    estimatedHours: courseRow.estimatedHours,
    sequential: courseRow.sequential,
    status: courseRow.status,
    enrollmentCount: courseRow._count.enrollments,
    modules: courseRow.modules,
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-1 pb-16 sm:px-2">
      <CourseHeader
        course={course}
        publishError={query.publishError}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <CurriculumBuilder course={course} looseChapters={looseChapters} />
        <CourseSettings course={course} />
      </div>
    </div>
  );
}
