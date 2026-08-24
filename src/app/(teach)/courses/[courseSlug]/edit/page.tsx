import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Layers } from "lucide-react";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { createChapter, moveChapter } from "@/server/actions/chapters";
import { publishCourse, unpublishCourse } from "@/server/actions/courses";
import { Input } from "@/components/ui/input";

export default async function CourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ publishError?: string }>;
}) {
  const { courseSlug } = await params;
  const query = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      _count: { select: { enrollments: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          chapters: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true, publishedAt: true },
          },
        },
      },
    },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const looseChapters = await prisma.chapter.findMany({
    where: { courseId: course.id, moduleId: null },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true, publishedAt: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/courses"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← All courses
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-1 max-w-xl text-sm text-neutral-500">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.slug}/mentees`}
            className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Mentees
          </Link>
          <span
            className={
              course.status === "PUBLISHED"
                ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                : "rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
            }
          >
            {course.status.toLowerCase()}
          </span>
        </div>
      </div>

      {course.status === "DRAFT" ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-600">
            This course is a draft — publish it to assign mentees and share invite links.
          </p>
          <form
            action={async () => {
              "use server";
              await publishCourse({ courseId: course.id });
            }}
          >
            <button
              type="submit"
              className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Publish course
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4">
          {course._count.enrollments > 0 && (
            <p className="flex items-start gap-1.5 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                {course._count.enrollments} mentee{course._count.enrollments === 1 ? "" : "s"}{" "}
                enrolled — re-publishing a chapter makes your edits visible to them immediately.
              </span>
            </p>
          )}
          <details className={course._count.enrollments > 0 ? "mt-2" : undefined}>
            <summary className="cursor-pointer text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600">
              Unpublish course…
            </summary>
            <form
              className="mt-2 flex flex-col gap-2"
              action={async (formData) => {
                "use server";
                const confirmed = formData.get("confirm") === "on";
                const result = await unpublishCourse({
                  courseId: course.id,
                  confirmedWithEnrollments: confirmed,
                });
                if (!result.ok) {
                  redirect(
                    `/courses/${course.slug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`
                  );
                }
              }}
            >
              {course._count.enrollments > 0 && (
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input type="checkbox" name="confirm" className="size-3.5" />
                  I understand enrolled mentees will lose access until it is published again.
                </label>
              )}
              <button
                type="submit"
                className="h-9 w-fit rounded-lg border border-neutral-200 px-3 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                Unpublish
              </button>
            </form>
          </details>
        </div>
      )}

      {query.publishError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {query.publishError}
        </p>
      )}

      <form
        className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4"
        action={async (formData) => {
          "use server";
          const title = String(formData.get("title") ?? "").trim();
          const moduleId = String(formData.get("moduleId") ?? "") || undefined;
          if (title) await createChapter({ courseId: course.id, moduleId, title });
        }}
      >
        <Input
          name="title"
          required
          placeholder="New chapter title…"
          className="h-9 min-w-[200px] flex-1 rounded-lg border-neutral-200 bg-white"
        />
        <select
          name="moduleId"
          defaultValue={course.modules[0]?.id ?? ""}
          className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-indigo-300"
        >
          {course.modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Add chapter
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {course.modules.map((mod) => (
          <section key={mod.id}>
            <h2 className="text-sm font-semibold text-neutral-900">{mod.title}</h2>
            <ChapterRows courseSlug={course.slug} chapters={mod.chapters} />
          </section>
        ))}
        {looseChapters.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-neutral-900">Unsectioned</h2>
            <ChapterRows courseSlug={course.slug} chapters={looseChapters} />
          </section>
        )}
        {course.modules.every((m) => m.chapters.length === 0) && looseChapters.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Layers className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-700">No chapters yet</p>
            <p className="text-sm text-neutral-400">Add the first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterRows({
  courseSlug,
  chapters,
}: {
  courseSlug: string;
  chapters: Array<{
    id: string;
    title: string;
    order: number;
    publishedAt: Date | null;
  }>;
}) {
  if (chapters.length === 0) {
    return <p className="mt-2 text-sm text-neutral-400">No chapters in this module.</p>;
  }
  return (
    <ul className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {chapters.map((chapter, index) => (
        <li
          key={chapter.id}
          className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
        >
          <span className="w-8 shrink-0 text-right font-mono text-xs text-neutral-400">
            {String(chapter.order).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
            {chapter.title}
          </span>
          {chapter.publishedAt ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              published
            </span>
          ) : (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              draft
            </span>
          )}

          <div className="flex shrink-0 items-center gap-1">
            <form
              action={async () => {
                "use server";
                await moveChapter({ chapterId: chapter.id, direction: "up" });
              }}
            >
              <button
                type="submit"
                disabled={index === 0}
                aria-label={`Move ${chapter.title} up`}
                className="rounded-md px-1.5 py-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↑
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await moveChapter({ chapterId: chapter.id, direction: "down" });
              }}
            >
              <button
                type="submit"
                disabled={index === chapters.length - 1}
                aria-label={`Move ${chapter.title} down`}
                className="rounded-md px-1.5 py-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↓
              </button>
            </form>
            <Link
              href={`/courses/${courseSlug}/chapters/${chapter.id}/edit`}
              className="ml-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Edit
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
