import { notFound } from "next/navigation";
import type { ChapterEditorView } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { ChapterEditor } from "@/components/teach/chapter-editor";

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterId: string }>;
}) {
  const { courseSlug, chapterId } = await params;
  await requireTeachSurface();

  const chapter = await serverApiFetchOrNotFound<ChapterEditorView>(
    `/api/v1/teach/chapters/${encodeURIComponent(chapterId)}/editor`
  );
  // The chapter id is global; make sure the URL names its own course.
  if (chapter.courseSlug !== courseSlug) notFound();

  // The API already restored escaped block placeholders to real JSX
  // (docs/02-content-authoring.mdx); autosave writes that form back.
  return (
    <ChapterEditor
      chapterId={chapter.chapterId}
      courseId={chapter.courseId}
      courseSlug={chapter.courseSlug}
      chapterTitle={chapter.title}
      chapterSummary={chapter.summary}
      estimatedMinutes={chapter.estimatedMinutes}
      readerMode={chapter.readerMode}
      isMilestone={chapter.isMilestone}
      initialPublishedAt={chapter.publishedAt}
      initialHasUnpublishedChanges={chapter.hasUnpublishedChanges}
      initialSource={chapter.source}
      lastPublishedSource={chapter.lastPublishedSource}
      blockConfigs={chapter.blockConfigs}
    />
  );
}
