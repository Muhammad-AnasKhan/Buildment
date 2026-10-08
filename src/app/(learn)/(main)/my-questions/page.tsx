import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/server/db";
import { requireLearnSurface } from "@/server/auth/guards";
import { cn } from "@/lib/utils";
import { mentorReplyUnread } from "@/server/progress/attention";

export default async function MenteeHelpListPage() {
  const user = await requireLearnSurface();

  const threads = await prisma.helpThread.findMany({
    where: { menteeId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      course: { select: { slug: true, title: true } },
      chapter: { select: { slug: true, title: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, authorId: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-muted-foreground">Support</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">My help notes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Notes you sent from lessons. Your mentor replies here.
        </p>
      </header>

      {threads.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden />
          <p className="mt-4 text-lg font-semibold">No help notes yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you are stuck, use <strong className="font-medium text-foreground">Ask for help</strong> in the header of any chapter.
          </p>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
            Back to dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {threads.map((thread) => {
            const preview = thread.messages[0];
            const unread = mentorReplyUnread({
              menteeId: user.id,
              menteeLastReadAt: thread.menteeLastReadAt,
              latestMessage: preview ? { authorId: preview.authorId, createdAt: preview.createdAt } : null,
            });
            const lessonHref = thread.chapter
              ? `/courses/${thread.course.slug}/${thread.chapter.slug}`
              : null;

            return (
              <li key={thread.id} className="flex items-stretch">
                <Link
                  href={`/my-questions/${thread.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {thread.chapter?.title ?? thread.course.title}
                      </p>
                      <Badge variant={thread.status === "OPEN" ? "secondary" : "outline"}>
                        {thread.status === "OPEN" ? "Waiting" : "Resolved"}
                      </Badge>
                      {unread ? <Badge>Unread</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{thread.course.title}</p>
                    {preview ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {preview.body}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
                {lessonHref ? (
                  <Link
                    href={lessonHref}
                    className="hidden shrink-0 items-center border-l border-border px-4 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:inline-flex"
                  >
                    Open lesson
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
