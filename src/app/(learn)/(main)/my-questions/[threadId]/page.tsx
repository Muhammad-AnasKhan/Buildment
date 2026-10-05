import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireHelpThreadAccess } from "@/server/auth/guards";
import { mapHelpMessages } from "@/lib/help-serialize";
import { HelpThreadDetail } from "@/components/help/help-thread-detail";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { buttonVariants } from "@/components/ui/button";

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

  if (user.id === full.menteeId) {
    await prisma.helpThread.update({
      where: { id: full.id },
      data: { menteeLastReadAt: new Date() },
    });
  }

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
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <LearnerBreadcrumb />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
        <div>
          <Link href="/my-questions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            My help notes
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
        </div>
        {chapter && full.chapterId ? (
          <Link href={`/courses/${course.slug}/${chapter.slug}`} className={buttonVariants({ variant: "outline" })}>
            Open lesson
          </Link>
        ) : null}
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
