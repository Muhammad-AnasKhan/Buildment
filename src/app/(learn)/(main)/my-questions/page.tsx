import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";

export default async function MenteeHelpListPage() {
  const user = await requireRole("MENTEE");

  const threads = await prisma.helpThread.findMany({
    where: { menteeId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      course: { select: { slug: true, title: true } },
      chapter: { select: { slug: true, title: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My help notes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Notes you sent from lessons — your mentor replies here, not in email.
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <Inbox className="size-8 text-neutral-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-neutral-800">No help notes yet</p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            When you&apos;re stuck, use <strong className="font-medium text-neutral-700">Ask for help</strong>{" "}
            in the header of any chapter.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 text-sm font-medium text-neutral-700 underline-offset-2 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {threads.map((thread) => {
            const preview = thread.messages[0];
            const href = thread.chapter
              ? `/my-questions/${thread.id}`
              : `/my-questions/${thread.id}`;

            return (
              <li key={thread.id}>
                <Link
                  href={href}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50/80 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {thread.chapter?.title ?? thread.course.title}
                      </p>
                      <span
                        className={
                          thread.status === "OPEN"
                            ? "rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-700"
                            : "text-[10px] font-semibold uppercase tracking-wide text-neutral-400"
                        }
                      >
                        {thread.status === "OPEN" ? "Waiting" : "Resolved"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">{thread.course.title}</p>
                    {preview && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                        {preview.body}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
