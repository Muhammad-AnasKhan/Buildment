import type { ProgressStatus } from "@/generated/prisma/client";
import { flattenChapterIds, lockedChapterIds } from "./rules";
import type { SyllabusChapter, SyllabusModule } from "@/components/learn/course-syllabus";

type ModuleInput = {
  id: string;
  order: number;
  title: string;
  chapters: Array<{
    id: string;
    slug: string;
    title: string;
    order: number;
    blockCount: number;
    blocksCompleted?: number;
  }>;
};

export function decorateSyllabus(args: {
  modules: ModuleInput[];
  progressByChapter: Map<string, ProgressStatus>;
  sequential: boolean;
}): SyllabusModule[] {
  const orderedIds = flattenChapterIds(args.modules);
  const lockedIds = lockedChapterIds(orderedIds, args.progressByChapter, args.sequential);

  return args.modules.map((mod) => {
    const chapters: SyllabusChapter[] = mod.chapters.map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      status: args.progressByChapter.get(chapter.id) ?? "NOT_STARTED",
      blockCount: chapter.blockCount,
      blocksCompleted: chapter.blocksCompleted ?? 0,
      locked: lockedIds.has(chapter.id),
    }));
    return {
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters,
      completedCount: chapters.filter((chapter) => chapter.status === "COMPLETED").length,
    };
  });
}
