import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireHelpThreadAccess } from "@/server/auth/guards";
import { mapHelpMessages } from "@/lib/help-serialize";
import { HelpThreadDetail } from "@/components/help/help-thread-detail";

export default async function MenteeHelpThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const { user, thread } = await requireHelpThreadAccess(threadId);

  const full = await prisma.helpThread.findUnique({
    where: { id: thread.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, role: true } } },
      },
    },
  });
  if (!full) notFound();

  const course = await prisma.course.findUnique({
    where: { id: full.courseId },
    select: { slug: true, title: true },
  });
  if (!course) notFound();

  const chapter =
    full.chapterId != null
      ? await prisma.chapter.findUnique({
          where: { id: full.chapterId },
          select: { slug: true, title: true },
        })
      : null;

  const messages = mapHelpMessages(full.messages);
  const title = chapter?.title ?? course.title;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/my-questions"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← My help notes
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{course.title}</p>
        </div>
        {chapter && full.chapterId && (
          <Link
            href={`/courses/${course.slug}/${chapter.slug}`}
            className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            Open lesson
          </Link>
        )}
      </div>
      <div className="mt-8">
        <HelpThreadDetail
          variant="mentee"
          layout="page"
          threadId={full.id}
          status={full.status}
          messages={messages}
          viewerId={user.id}
          courseId={full.courseId}
          chapterId={full.chapterId ?? ""}
        />
      </div>
    </div>
  );
}
