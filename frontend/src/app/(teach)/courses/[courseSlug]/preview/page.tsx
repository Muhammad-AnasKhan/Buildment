import type { CourseDraftPreview } from "@/shared/api/teach";
import { ChapterMdx } from "@/mdx/compile";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { extractHeadings } from "@/shared/lib/mdx-headings";
import {
  CoursePreviewShell,
  type PreviewChapterSummary,
  type PreviewModuleSummary,
} from "@/components/teach/course-preview-shell";

export const dynamic = "force-dynamic";

export default async function CourseDraftPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ chapter?: string; view?: string }>;
}) {
  const { courseSlug } = await params;
  const query = await searchParams;
  await requireTeachSurface();

  const preview = await serverApiFetchOrNotFound<CourseDraftPreview>(
    `/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/preview`
  );
  const { course, modules } = preview;

  const summaryModules: PreviewModuleSummary[] = modules.map((mod, mIdx) => {
    const moduleOrder = mIdx + 1;
    return {
      id: mod.id,
      title: mod.title,
      order: moduleOrder,
      chapters: mod.chapters.map((ch, cIdx) => {
        const chapterOrder = cIdx + 1;
        const lessonNumber = `${moduleOrder}.${chapterOrder}`;
        return {
          id: ch.id,
          slug: ch.slug,
          title: ch.title,
          lessonNumber,
          lessonLabel: `Module ${moduleOrder}: ${mod.title} — Lesson ${lessonNumber}`,
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleOrder,
          chapterOrder,
          readerMode: ch.readerMode,
          publishedAt: ch.publishedAt,
          hasDraft: ch.hasDraft,
          estimatedMinutes: ch.estimatedMinutes ?? null,
          isMilestone: ch.isMilestone ?? false,
          summary: ch.summary ?? null,
        };
      }),
    };
  });

  const flatSummaries: PreviewChapterSummary[] = summaryModules.flatMap((m) => m.chapters);
  const flatRawChapters = modules.flatMap((m) => m.chapters);

  const requestedKey = query.chapter?.trim();
  let activeIndex = 0;
  if (requestedKey) {
    const foundIdx = flatSummaries.findIndex(
      (c) => c.slug === requestedKey || c.id === requestedKey
    );
    if (foundIdx >= 0) activeIndex = foundIdx;
  }

  const activeChapter = flatSummaries[activeIndex] ?? null;
  const activeRaw = flatRawChapters[activeIndex] ?? null;
  const prevChapter = activeIndex > 0 ? flatSummaries[activeIndex - 1] ?? null : null;
  const nextChapter =
    activeIndex < flatSummaries.length - 1 ? flatSummaries[activeIndex + 1] ?? null : null;

  const headings = activeRaw ? extractHeadings(activeRaw.source) : [];
  const initialView = query.view === "overview" ? "overview" : "reader";

  return (
    <CoursePreviewShell
      course={{
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        projectGoal: course.projectGoal,
        coverUrl: course.coverUrl,
        status: course.status,
        difficulty: course.difficulty ?? null,
        estimatedHours: course.estimatedHours ?? null,
      }}
      modules={summaryModules}
      activeChapter={activeChapter}
      headings={headings}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      initialView={initialView}
    >
      {activeRaw ? <ChapterMdx source={activeRaw.source} preview /> : null}
    </CoursePreviewShell>
  );
}
