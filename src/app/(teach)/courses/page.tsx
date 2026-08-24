import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";
import { createCourse } from "@/server/actions/courses";
import { Input } from "@/components/ui/input";

export default async function MentorCourseListPage() {
  const user = await requireRole("MENTOR", "ADMIN");

  const courses = await prisma.course.findMany({
    where: user.role === "ADMIN" ? undefined : { mentorId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { chapters: true, enrollments: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Courses</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create a course, write its chapters, then assign it to mentees.
          </p>
        </div>

        <form
          className="flex items-center gap-2"
          action={async (formData) => {
            "use server";
            const title = String(formData.get("title") ?? "").trim();
            const result = await createCourse({ title });
            if (result.ok) redirect(`/courses/${result.courseSlug}/edit`);
          }}
        >
          <Input
            name="title"
            required
            minLength={3}
            placeholder="New course title…"
            className="h-10 w-64 rounded-lg border-neutral-200 bg-white"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Create course
          </button>
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <BookOpen className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-700">No courses yet</p>
          <p className="text-sm text-neutral-400">
            Create your first course with the form above.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-neutral-900">{course.title}</h2>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {course.description}
                    </p>
                  )}
                </div>
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

              <p className="mt-3 text-xs text-neutral-400">
                {course._count.chapters} chapter{course._count.chapters === 1 ? "" : "s"} ·{" "}
                {course._count.enrollments} enrolled
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/courses/${course.slug}/edit`}
                  className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                >
                  Edit chapters
                </Link>
                <Link
                  href={`/courses/${course.slug}/mentees`}
                  className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Mentees
                </Link>
                <Link
                  href={`/courses/${course.slug}/reports`}
                  className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Reports
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
