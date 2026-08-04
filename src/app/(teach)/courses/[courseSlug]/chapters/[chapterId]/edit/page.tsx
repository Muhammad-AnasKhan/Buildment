import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { ChapterEditor } from "@/components/teach/chapter-editor";
import { restoreInteractiveBlockTags } from "@/mdx/restore-block-tags";

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterId: string }>;
}) {
  const { courseSlug, chapterId } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, courseId: course.id },
  });
  if (!chapter) notFound();

  // The editor works with real JSX block nodes, so the escaped placeholders
  // the import pipeline stores are normalized on the way in; autosave writes
  // the normalized form back (docs/02-content-authoring.mdx).
  return (
    <ChapterEditor
      chapterId={chapter.id}
      courseSlug={course.slug}
      chapterTitle={chapter.title}
      initialSource={restoreInteractiveBlockTags(chapter.source)}
      lastPublishedSource={chapter.compiled}
    />
  );
}
