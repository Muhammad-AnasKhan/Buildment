import Link from "next/link";
import type { HelpThreadDetail as HelpThreadDetailModel } from "@buildment/shared/api/help";
import { requireUser } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { HelpThreadDetail } from "@/components/help/help-thread-detail";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { helpUiCopy as copy } from "@buildment/shared/lib/help-ui-copy";

export default async function MenteeHelpThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const user = await requireUser();
  const full = await serverApiFetchOrNotFound<HelpThreadDetailModel>(`/api/v1/help/threads/${encodeURIComponent(threadId)}`);
  const { course, chapter, messages } = full;
  const title = chapter?.title ?? course.title;

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <LearnerBreadcrumb />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
        <div>
          <Link href="/my-questions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {copy.learnerNav}
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
