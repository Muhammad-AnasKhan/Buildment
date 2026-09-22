import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { ChapterMdx } from "@/mdx/compile";
import { extractHeadings } from "@/lib/mdx-headings";
import { learningLogToAnswers, learningLogToChecklist, parseLearningLog } from "@/lib/learning-log";
import { ChapterReaderShell } from "@/components/learn/chapter-reader-shell";
import { LockedChapterView } from "@/components/learn/locked-chapter";
import { signOutAction } from "@/server/auth/actions";
import { loadCourseGate } from "@/server/progress/gate";
import { decorateSyllabus } from "@/server/progress/syllabus";
import { isCompletableBlock, previousChapterId } from "@/server/progress/rules";
import { ensureChapterStarted } from "@/server/progress/compute";

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
      sequential: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            orderBy: { order: "asc" },
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
    },
  });
  if (!course) notFound();

  const { enrollment, user } = await requireEnrolledMentee(course.id);

  const flatChapters = course.modules.flatMap((mod) =>
    mod.chapters.map((ch) => ({
      ...ch,
      moduleTitle: mod.title,
      moduleOrder: mod.order,
      blockCount: ch.blocks.filter((block) => isCompletableBlock(block)).length,
    }))
  );
  const index = flatChapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) notFound();

  const chapter = flatChapters[index]!;
  const prev = flatChapters[index - 1];
  const next = flatChapters[index + 1];
  const lessonLabel = `${String(chapter.moduleOrder).padStart(2, "0")}.${String(chapter.order).padStart(2, "0")}`;

  const [progress, content, currentProgress, gate] = await Promise.all([
    prisma.chapterProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: { chapterId: true, status: true, blocksCompleted: true, blocksTotal: true },
    }),
    prisma.chapter.findUnique({
      where: { id: chapter.id },
      select: { compiled: true, source: true },
    }),
    prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
      select: { learningLog: true, status: true, blocksCompleted: true, blocksTotal: true },
    }),
    loadCourseGate(course.id, enrollment.id),
  ]);
  if (!content) notFound();

  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p.status]));
  const progressCountByChapter = new Map(
    progress.map((p) => [p.chapterId, { completed: p.blocksCompleted, total: p.blocksTotal }])
  );

  const modules = decorateSyllabus({
    sequential: course.sequential,
    progressByChapter,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters: mod.chapters.map((ch) => {
        const counts = progressCountByChapter.get(ch.id);
        const blockCount = ch.blocks.filter((block) => isCompletableBlock(block)).length;
        return {
          id: ch.id,
          slug: ch.slug,
          title: ch.title,
          order: ch.order,
          blockCount,
          blocksCompleted: counts?.completed ?? 0,
        };
      }),
    })),
  });

  const locked = gate?.lockedIds.has(chapter.id) ?? false;
  if (locked) {
    const prevId = previousChapterId(gate?.orderedIds ?? [], chapter.id);
    const previous = prevId ? flatChapters.find((c) => c.id === prevId) : prev;
    return (
      <LockedChapterView
        courseSlug={course.slug}
        courseTitle={course.title}
        lessonLabel={lessonLabel}
        chapterTitle={chapter.title}
        currentChapterSlug={chapter.slug}
        previous={previous ? { slug: previous.slug, title: previous.title } : null}
        modules={modules}
        user={user}
        signOutAction={signOutAction}
      />
    );
  }

  await prisma.$transaction(async (tx) => {
    await ensureChapterStarted(tx, enrollment.id, chapter.id);
  });

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      if (ch.id === chapter.id && ch.status === "NOT_STARTED") {
        ch.status = "IN_PROGRESS";
      }
    }
  }

  const source = content.compiled ?? content.source;
  const headings = extractHeadings(source);
  const log = parseLearningLog(currentProgress?.learningLog);
  const learningLogAnswers = learningLogToAnswers(log);
  const checklistState = learningLogToChecklist(log);

  const chapterStatus = currentProgress?.status ?? progressByChapter.get(chapter.id) ?? "NOT_STARTED";
  const chapterComplete = chapterStatus === "COMPLETED";
  const remaining =
    chapter.blockCount - (currentProgress?.blocksCompleted ?? 0);
  const canMarkComplete = !chapterComplete && remaining <= 0;

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
      checklistState={checklistState}
      chapterComplete={chapterComplete}
      canMarkComplete={canMarkComplete}
      nextLocked={!chapterComplete && Boolean(next)}
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
