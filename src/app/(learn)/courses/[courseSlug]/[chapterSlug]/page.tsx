import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { ChapterMdx } from "@/mdx/compile";
import { extractHeadings } from "@/lib/mdx-headings";
import { learningLogToAnswers, parseLearningLog } from "@/lib/learning-log";
import { ChapterReaderShell } from "@/components/learn/chapter-reader-shell";
import { signOutAction } from "@/server/auth/actions";

export const dynamic = "force-dynamic";

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterSlug: string }>;
}) {
  const { courseSlug, chapterSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, order: true },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const { enrollment, user } = await requireEnrolledMentee(course.id);

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

  const [progress, content, currentProgress] = await Promise.all([
    prisma.chapterProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: { chapterId: true, status: true },
    }),
    prisma.chapter.findUnique({
      where: { id: chapter.id },
      select: { compiled: true, source: true },
    }),
    prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
      select: { learningLog: true },
    }),
  ]);
  if (!content) notFound();

  const source = content.compiled ?? content.source;
  const headings = extractHeadings(source);

  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p.status]));
  const learningLogAnswers = learningLogToAnswers(parseLearningLog(currentProgress?.learningLog));

  const modules = course.modules.map((mod) => {
    const chapters = mod.chapters.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      title: ch.title,
      status: progressByChapter.get(ch.id) ?? ("NOT_STARTED" as const),
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
      key={chapter.slug}
      courseSlug={course.slug}
      courseTitle={course.title}
      lessonLabel={lessonLabel}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
      chapterId={chapter.id}
      learningLogAnswers={learningLogAnswers}
      user={user}
      signOutAction={signOutAction}
      modules={modules}
      headings={headings}
      prev={prev ? { slug: prev.slug, title: prev.title, moduleOrder: prev.moduleOrder, order: prev.order } : undefined}
      next={next ? { slug: next.slug, title: next.title, moduleOrder: next.moduleOrder, order: next.order } : undefined}
    >
      <ChapterMdx source={source} />
    </ChapterReaderShell>
  );
}
