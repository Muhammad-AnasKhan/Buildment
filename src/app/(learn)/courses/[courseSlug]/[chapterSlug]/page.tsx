import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { ChapterMdx } from "@/mdx/compile";
import { ChapterNav } from "@/components/learn/chapter-nav";
import { cn } from "@/lib/utils";
import { extractHeadings } from "@/lib/mdx-headings";
import { learningLogToAnswers, parseLearningLog } from "@/lib/learning-log";
import { ChapterReaderShell } from "@/components/learn/chapter-reader-shell";
import type { Heading } from "@/lib/mdx-headings";
import type { SyllabusModule } from "@/components/learn/course-syllabus";

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterSlug: string }>;
}) {
  const { courseSlug, chapterSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  const { enrollment } = await requireEnrolledMentee(course.id);

  const flatChapters = course.modules.flatMap((mod) =>
    mod.chapters.map((ch) => ({
      ...ch,
      moduleTitle: mod.title,
      moduleOrder: mod.order,
    }))
  );
  const index = flatChapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) notFound();

  const chapter = flatChapters[index]!;
  const prev = flatChapters[index - 1];
  const next = flatChapters[index + 1];
  const lessonLabel = `${String(chapter.moduleOrder).padStart(2, "0")}.${String(chapter.order).padStart(2, "0")}`;

  // Extract headings for TOC
  const source = chapter.compiled ?? chapter.source;
  const headings = extractHeadings(source);

  // Get progress for sidebar
  const progress = await prisma.chapterProgress.findMany({
    where: { enrollmentId: enrollment.id },
  });
  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p]));
  const chapterProgress = progressByChapter.get(chapter.id);
  const learningLogAnswers = learningLogToAnswers(parseLearningLog(chapterProgress?.learningLog));

  const modules = course.modules.map((mod) => {
    const chapters = mod.chapters.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      title: ch.title,
      status: progressByChapter.get(ch.id)?.status ?? ("NOT_STARTED" as const),
      blockCount: 0,
    }));
    return {
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters,
      completedCount: chapters.filter((c) => c.status === "COMPLETED").length,
    };
  });

  return (
    <ChapterReaderShell
      courseSlug={course.slug}
      courseTitle={course.title}
      lessonLabel={lessonLabel}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
      chapterId={chapter.id}
      learningLogAnswers={learningLogAnswers}
      modules={modules}
      headings={headings}
      prev={prev ? { slug: prev.slug, title: prev.title, moduleOrder: prev.moduleOrder, order: prev.order } : undefined}
      next={next ? { slug: next.slug, title: next.title, moduleOrder: next.moduleOrder, order: next.order } : undefined}
    >
      <ChapterMdx source={source} />
    </ChapterReaderShell>
  );
}
