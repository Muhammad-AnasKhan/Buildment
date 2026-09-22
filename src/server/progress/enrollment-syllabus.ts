import "server-only";
import type { ProgressStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import type { SyllabusChapter, SyllabusModule } from "@/components/learn/course-syllabus";
import { decorateSyllabus } from "./syllabus";
import { isCompletableBlock } from "./rules";

const courseModulesSelect = {
  sequential: true,
  modules: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      order: true,
      title: true,
      chapters: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          slug: true,
          title: true,
          order: true,
          blocks: {
            where: { archivedAt: null },
            select: { type: true, required: true, archivedAt: true },
          },
        },
      },
    },
  },
};

export function pickContinueTarget(
  flatChapters: Pick<SyllabusChapter, "slug" | "title" | "status" | "locked">[]
) {
  const inProgress = flatChapters.find((c) => !c.locked && c.status === "IN_PROGRESS");
  if (inProgress) return inProgress;

  const notStarted = flatChapters.find((c) => !c.locked && c.status === "NOT_STARTED");
  if (notStarted) return notStarted;

  const unlocked = flatChapters.find((c) => !c.locked);
  return unlocked ?? flatChapters[0] ?? null;
}

export function pickDefaultOpenModule(modules: SyllabusModule[]) {
  const withProgress = modules.find((mod) =>
    mod.chapters.some((c) => c.status === "IN_PROGRESS" || c.status === "NOT_STARTED")
  );
  return withProgress?.id ?? modules[0]?.id ?? null;
}

export function resolveContinueChapterPath(
  courseSlug: string,
  flatChapters: Pick<SyllabusChapter, "slug" | "title" | "status" | "locked">[]
) {
  const target = pickContinueTarget(flatChapters);
  return target ? `/courses/${courseSlug}/${target.slug}` : null;
}

export async function syllabusForEnrollment(
  course: {
    sequential: boolean;
    modules: Array<{
      id: string;
      order: number;
      title: string;
      chapters: Array<{
        id: string;
        slug: string;
        title: string;
        order: number;
        blocks: Parameters<typeof isCompletableBlock>[0][];
      }>;
    }>;
  },
  enrollmentId: string,
  bypassLocking?: boolean
): Promise<{ modules: SyllabusModule[]; flatChapters: SyllabusChapter[] }> {
  const progress = await prisma.chapterProgress.findMany({
    where: { enrollmentId },
    select: { chapterId: true, status: true, blocksCompleted: true, blocksTotal: true },
  });
  const progressByChapter = new Map<string, ProgressStatus>(
    progress.map((p) => [p.chapterId, p.status])
  );
  const progressCountByChapter = new Map(
    progress.map((p) => [p.chapterId, { completed: p.blocksCompleted, total: p.blocksTotal }])
  );

  const modules = decorateSyllabus({
    sequential: course.sequential,
    bypassLocking,
    progressByChapter,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters: mod.chapters.map((chapter) => {
        const counts = progressCountByChapter.get(chapter.id);
        const blockCount = chapter.blocks.filter((block) => isCompletableBlock(block)).length;
        return {
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          order: chapter.order,
          blockCount,
          blocksCompleted: counts?.completed ?? 0,
        };
      }),
    })),
  });

  return { modules, flatChapters: modules.flatMap((mod) => mod.chapters) };
}

export async function loadEnrollmentSyllabus(args: {
  courseId: string;
  enrollmentId: string;
  bypassLocking?: boolean;
}) {
  const course = await prisma.course.findUnique({
    where: { id: args.courseId },
    select: courseModulesSelect,
  });
  if (!course) return null;
  return syllabusForEnrollment(course, args.enrollmentId, args.bypassLocking);
}
