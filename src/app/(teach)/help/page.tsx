import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { prisma } from "@/server/db";
import { nowMs } from "@/server/time";
import { requireRole } from "@/server/auth/guards";
import { AutoSubmitSelect } from "@/components/teach/auto-submit-select";
import { countOpenHelpRequests } from "@/server/help/count-open";

const AGING_HOURS = 48;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function MentorHelpInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; status?: string }>;
}) {
  const user = await requireRole("MENTOR", "ADMIN");
  const { courseId: courseFilter, status: statusFilter } = await searchParams;
  const openHelpCount = await countOpenHelpRequests(user);

  const courses = await prisma.course.findMany({
    where: user.role === "ADMIN" ? undefined : { mentorId: user.id },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
  const courseIds = courses.map((course) => course.id);

  const threads =
    courseIds.length === 0
      ? []
      : await prisma.helpThread.findMany({
          where: {
            courseId:
              courseFilter && courseIds.includes(courseFilter)
                ? courseFilter
                : { in: courseIds },
            ...(statusFilter === "resolved"
              ? { status: "RESOLVED" }
              : statusFilter === "all"
                ? {}
                : { status: "OPEN" }),
          },
          orderBy:
            statusFilter === "resolved"
              ? { updatedAt: "desc" }
              : { updatedAt: "asc" },
          include: {
            mentee: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, slug: true, title: true } },
            chapter: { select: { slug: true, title: true } },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { body: true, createdAt: true },
            },
          },
        });

  const now = nowMs();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Mentee requests
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Help notes from your learners — reply in writing today; live meetups come next.
          </p>
          {openHelpCount > 0 && (statusFilter ?? "open") !== "resolved" && (
            <p className="mt-2 text-sm font-medium text-neutral-800">
              {openHelpCount} open {openHelpCount === 1 ? "request" : "requests"} need a response
            </p>
          )}
        </div>

        <form className="flex flex-wrap items-center gap-2" action="/help" method="GET">
          <AutoSubmitSelect
            name="status"
            defaultValue={statusFilter ?? "open"}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-400"
          >
            <option value="open">Open ({openHelpCount})</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </AutoSubmitSelect>
          {courses.length > 1 && (
            <AutoSubmitSelect
              name="courseId"
              defaultValue={courseFilter ?? ""}
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-400"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </AutoSubmitSelect>
          )}
        </form>
      </div>

      {threads.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <Inbox className="size-8 text-neutral-300" aria-hidden />
          <p className="text-sm font-medium text-neutral-700">
            {statusFilter === "resolved" ? "No resolved requests" : "No open requests"}
          </p>
          <p className="max-w-md text-sm text-neutral-400">
            When a mentee sends a help note from a chapter, it appears here for you to review.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {threads.map((thread) => {
            const preview = thread.messages[0];
            const ageHours = preview
              ? (now - preview.createdAt.getTime()) / (1000 * 60 * 60)
              : 0;
            const isAging = thread.status === "OPEN" && ageHours >= AGING_HOURS;
            const menteeLabel = thread.mentee.name ?? thread.mentee.email;

            return (
              <li key={thread.id}>
                <Link
                  href={`/help/${thread.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50/80 sm:px-5"
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600"
                    aria-hidden
                  >
                    {initials(menteeLabel)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-neutral-900">{menteeLabel}</p>
                      {isAging && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          {Math.floor(ageHours)}h waiting
                        </span>
                      )}
                      {thread.status === "RESOLVED" && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {thread.chapter?.title ?? thread.course.title}
                    </p>
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
