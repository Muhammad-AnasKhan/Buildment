import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { createChapter, moveChapter } from "@/server/actions/chapters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const looseChapters = await prisma.chapter.findMany({
    where: { courseId: course.id, moduleId: null },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/courses" className="text-xs text-neutral-500 transition-colors hover:text-neutral-950">
        ← All courses
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-1 max-w-xl text-sm text-neutral-500">{course.description}</p>
          )}
        </div>
        <Badge
          className={
            course.status === "PUBLISHED"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-neutral-100 text-neutral-600"
          }
        >
          {course.status.toLowerCase()}
        </Badge>
      </div>

      <form
        className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
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
          className="w-72 rounded-full bg-white"
        />
        <select
          name="moduleId"
          defaultValue={course.modules[0]?.id ?? ""}
          className="h-9 rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-700"
        >
          {course.modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.title}
            </option>
          ))}
        </select>
        <Button type="submit" className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500">
          Add chapter
        </Button>
      </form>

      <div className="mt-8 space-y-8">
        {course.modules.map((mod) => (
          <section key={mod.id}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              {mod.title}
            </h2>
            <ChapterRows
              courseSlug={course.slug}
              chapters={mod.chapters}
            />
          </section>
        ))}
        {looseChapters.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              Unsectioned
            </h2>
            <ChapterRows courseSlug={course.slug} chapters={looseChapters} />
          </section>
        )}
        {course.modules.every((m) => m.chapters.length === 0) && looseChapters.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            No chapters yet — add the first one above.
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
    <ul className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
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
            <Badge className="bg-emerald-100 text-emerald-700">published</Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700">draft</Badge>
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
                className="rounded-md px-1.5 py-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent"
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
                className="rounded-md px-1.5 py-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↓
              </button>
            </form>
            <Link
              href={`/courses/${courseSlug}/chapters/${chapter.id}/edit`}
              className="ml-2 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Edit
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
