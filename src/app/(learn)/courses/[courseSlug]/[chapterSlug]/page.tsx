import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { ForbiddenError, requireEnrolledMentee } from "@/server/auth/guards";
import {
  LearnAccessDenied,
  forbiddenToLearnReason,
} from "@/components/learn/learn-access-denied";
import { ChapterMdx } from "@/mdx/compile";
import { QuizChapterWizard } from "@/components/learn/quiz-chapter-wizard";
import { stripInteractiveBlockTags } from "@/lib/strip-interactive-block-tags";
import { extractHeadings } from "@/lib/mdx-headings";
import { learningLogToAnswers, learningLogToChecklist, parseLearningLog } from "@/lib/learning-log";
import { milestoneReflectionBlocked } from "@/server/progress/reflection";
import { chapterChecksLine, chapterNextLine, chapterOpenLine, latestChapterResponses } from "@/server/progress/chapter-recap";
import { loadLearnerHabit } from "@/server/progress/learner-habit";
import { ChapterReaderShell } from "@/components/learn/chapter-reader-shell";
import { LockedChapterView } from "@/components/learn/locked-chapter";
import { signOutAction } from "@/server/auth/actions";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { loadCourseGate } from "@/server/progress/gate";
import { isCompletableBlock, previousChapterId } from "@/server/progress/rules";
import { ensureChapterStarted } from "@/server/progress/compute";
import { syllabusForEnrollment } from "@/server/progress/enrollment-syllabus";
import { serializeHelpThread } from "@/lib/help-serialize";
import { loadChapterHelpThread } from "@/server/help/load-chapter-thread";

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
      projectGoal: true,
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
              isMilestone: true,
              estimatedMinutes: true,
              readerMode: true,
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

  let enrollment;
  let user;
  try {
    ({ enrollment, user } = await requireEnrolledMentee(course.id));
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <LearnAccessDenied
          courseSlug={courseSlug}
          reason={forbiddenToLearnReason(error.message)}
        />
      );
    }
    throw error;
  }
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

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

  const [content, currentProgress, gate, helpThreadRow, syllabus, habit, chapterResponses, predictBlocks, headingNotes] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id: chapter.id },
      select: { compiled: true, source: true },
    }),
    prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
      select: { learningLog: true, status: true, blocksCompleted: true, blocksTotal: true },
    }),
    loadCourseGate(course.id, enrollment.id, { bypassLocking }),
    loadChapterHelpThread(user.id, chapter.id),
    syllabusForEnrollment(course, enrollment.id, bypassLocking),
    loadLearnerHabit(user.id),
    prisma.response.findMany({
      where: {
        userId: user.id,
        enrollmentId: enrollment.id,
        status: { not: "DRAFT" },
        block: { chapterId: chapter.id },
      },
      orderBy: { attempt: "desc" },
      select: { blockId: true, status: true, isCorrect: true },
    }),
    prisma.block.findMany({
      where: { chapterId: chapter.id, archivedAt: null, type: "PREDICT", required: true },
      select: { id: true },
    }),
    prisma.headingNote.findMany({
      where: { userId: user.id, chapterId: chapter.id },
      select: { headingId: true, body: true },
    }),
  ]);
  if (!content) notFound();

  const { modules } = syllabus;

  const locked = !bypassLocking && (gate?.lockedIds.has(chapter.id) ?? false);
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
        checkpointsCompleted={0}
        checkpointsTotal={chapter.blockCount}
        chapterComplete={false}
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

  const rawSource = content.compiled ?? content.source;
  const source =
    chapter.readerMode === "QUIZ" ? stripInteractiveBlockTags(rawSource) : rawSource;
  const headings = extractHeadings(source);
  const log = parseLearningLog(currentProgress?.learningLog);
  const learningLogAnswers = learningLogToAnswers(log);
  const checklistState = learningLogToChecklist(log);

  const chapterStatus = currentProgress?.status ?? "NOT_STARTED";
  const chapterComplete = chapterStatus === "COMPLETED";
  const checkpointsCompleted = currentProgress?.blocksCompleted ?? 0;
  const checkpointsTotal = chapter.blockCount;
  const remaining = checkpointsTotal - checkpointsCompleted;
  const reflectionPending =
    chapter.isMilestone &&
    !chapterComplete &&
    remaining <= 0 &&
    milestoneReflectionBlocked(content.compiled ?? content.source, currentProgress?.learningLog);
  const canMarkComplete = !chapterComplete && remaining <= 0 && !reflectionPending;
  const helpThread = serializeHelpThread(helpThreadRow);
  const answeredIds = new Set(latestChapterResponses(chapterResponses).map((response) => response.blockId));
  const predictGate = predictBlocks.length > 0;
  const predictRevealed = !predictGate || predictBlocks.every((block) => answeredIds.has(block.id));
  const notesByHeading = Object.fromEntries(headingNotes.map((note) => [note.headingId, note.body]));
  await prisma.review.updateMany({
    where: { seenAt: null, response: { userId: user.id, block: { chapterId: chapter.id } } },
    data: { seenAt: new Date() },
  });
  const recap = {
    checks: chapterChecksLine(checkpointsCompleted, checkpointsTotal),
    open: chapterOpenLine(latestChapterResponses(chapterResponses)),
    next: chapterNextLine(next?.title),
  };

  return (
    <ChapterReaderShell
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      projectGoal={course.projectGoal}
      lessonLabel={lessonLabel}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
      chapterId={chapter.id}
      estimatedMinutes={chapter.estimatedMinutes}
      readerMode={chapter.readerMode}
      learningLogAnswers={learningLogAnswers}
      checklistState={checklistState}
      chapterComplete={chapterComplete}
      canMarkComplete={canMarkComplete}
      checkpointsCompleted={checkpointsCompleted}
      checkpointsTotal={checkpointsTotal}
      isGateChapter={chapter.isMilestone}
      nextLocked={!bypassLocking && !chapterComplete && Boolean(next)}
      reflectionPending={reflectionPending}
      recap={recap}
      streakMilestone={habit.streakMilestone}
      headingNotes={notesByHeading}
      predictGate={predictGate}
      predictRevealed={predictRevealed}
      helpThread={helpThread}
      user={user}
      signOutAction={signOutAction}
      modules={modules}
      headings={headings}
      prev={prev ? { slug: prev.slug, title: prev.title, moduleOrder: prev.moduleOrder, order: prev.order } : undefined}
      next={next ? { slug: next.slug, title: next.title, moduleOrder: next.moduleOrder, order: next.order } : undefined}
    >
      {chapter.readerMode === "QUIZ" ? <QuizChapterWizard chapterId={chapter.id} /> : null}
      <ChapterMdx source={source} />
    </ChapterReaderShell>
  );
}
