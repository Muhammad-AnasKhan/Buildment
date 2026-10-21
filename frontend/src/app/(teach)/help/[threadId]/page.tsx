import Link from "next/link";
import type { HelpThreadDetail } from "@/shared/api/help";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { HelpThreadDetail as HelpThreadDetailPanel } from "@/components/help/help-thread-detail";
import { MentorMeetAside } from "@/components/help/mentor-meet-aside";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";

export default async function MentorHelpThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const user = await requireTeachSurface();
  // The shared thread endpoint answers 403 unless the caller mentors the course.
  const thread = await serverApiFetchOrNotFound<HelpThreadDetail>(`/api/v1/help/threads/${encodeURIComponent(threadId)}`);
  const menteeName = thread.mentee.name ?? thread.mentee.email ?? "Learner";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/help"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {copy.mentorNav}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {thread.chapter?.title ?? thread.course.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {menteeName} · {thread.course.title}
          </p>
        </div>
        <span
          className={
            thread.status === "OPEN"
              ? "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
              : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {thread.status === "OPEN" ? "Needs response" : "Resolved"}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <HelpThreadDetailPanel
          variant="mentor"
          layout="page"
          threadId={thread.id}
          status={thread.status}
          messages={thread.messages}
          viewerId={user.id}
        />
        <MentorMeetAside menteeName={menteeName} />
      </div>
    </div>
  );
}
