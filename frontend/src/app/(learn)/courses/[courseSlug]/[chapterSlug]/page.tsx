import { notFound } from "next/navigation";
import type { ChapterReaderView } from "@/shared/api/reader";
import { requireVerifiedUser } from "@/server/auth/guards";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import { LearnAccessDenied, forbiddenToLearnReason } from "@/components/learn/learn-access-denied";
import { ChapterMdx } from "@/mdx/compile";
import { QuizChapterWizard } from "@/components/learn/quiz-chapter-wizard";
import { stripInteractiveBlockTags } from "@/lib/strip-interactive-block-tags";
import { extractHeadings } from "@/shared/lib/mdx-headings";
import { ChapterReaderShell } from "@/components/learn/chapter-reader-shell";
import { LockedChapterView } from "@/components/learn/locked-chapter";
import { signOutAction } from "@/server/auth/actions";

export const dynamic = "force-dynamic";

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterSlug: string }>;
}) {
  const { courseSlug, chapterSlug } = await params;
  const user = await requireVerifiedUser();

  let view: ChapterReaderView;
  try {
    view = await serverApiFetch<ChapterReaderView>(
      `/api/v1/courses/${encodeURIComponent(courseSlug)}/chapters/${encodeURIComponent(chapterSlug)}`
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <LearnAccessDenied courseSlug={courseSlug} reason={forbiddenToLearnReason(error.code)} />;
    }
    throw error;
  }

  const { course, chapter, prev, next, modules } = view;

  if (view.locked || !view.content) {
    return (
      <LockedChapterView
        courseSlug={course.slug}
        courseTitle={course.title}
        lessonLabel={chapter.lessonLabel}
        chapterTitle={chapter.title}
        currentChapterSlug={chapter.slug}
        previous={view.previous}
        modules={modules}
        user={user}
        signOutAction={signOutAction}
        checkpointsCompleted={0}
        checkpointsTotal={chapter.blockCount}
        chapterComplete={false}
      />
    );
  }

  const { content } = view;
  const source = chapter.readerMode === "QUIZ" ? stripInteractiveBlockTags(content.source) : content.source;
  const headings = extractHeadings(source);

  return (
    <ChapterReaderShell
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      projectGoal={course.projectGoal}
      lessonLabel={chapter.lessonLabel}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
      chapterId={chapter.id}
      estimatedMinutes={chapter.estimatedMinutes}
      readerMode={chapter.readerMode}
      learningLogAnswers={content.learningLogAnswers}
      checklistState={content.checklistState}
      chapterComplete={content.chapterComplete}
      canMarkComplete={content.canMarkComplete}
      checkpointsCompleted={content.checkpointsCompleted}
      checkpointsTotal={content.checkpointsTotal}
      isGateChapter={chapter.isMilestone}
      nextLocked={content.nextLocked}
      reflectionPending={content.reflectionPending}
      recap={content.recap}
      streakMilestone={content.streakMilestone}
      headingNotes={content.headingNotes}
      predictGate={content.predictGate}
      predictRevealed={content.predictRevealed}
      helpThread={content.helpThread}
      user={user}
      signOutAction={signOutAction}
      modules={modules}
      headings={headings}
      prev={prev ?? undefined}
      next={next ?? undefined}
    >
      {chapter.readerMode === "QUIZ" ? (
        <QuizChapterWizard
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          nextHref={next ? `/courses/${course.slug}/${next.slug}` : undefined}
          canMarkComplete={content.canMarkComplete}
          chapterComplete={content.chapterComplete}
        />
      ) : (
        <ChapterMdx source={source} />
      )}
    </ChapterReaderShell>
  );
}
