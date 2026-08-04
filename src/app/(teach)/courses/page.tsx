import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";
import { createCourse } from "@/server/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Your courses
          </h1>
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
            className="w-64 rounded-full bg-white"
          />
          <Button type="submit" className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500">
            Create course
          </Button>
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          No courses yet — create your first one above.
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-neutral-950">{course.title}</h2>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {course.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant={course.status === "PUBLISHED" ? "default" : "secondary"}
                  className={
                    course.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600"
                  }
                >
                  {course.status.toLowerCase()}
                </Badge>
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                {course._count.chapters} chapters · {course._count.enrollments} enrolled
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/courses/${course.slug}/edit`}
                  className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  Edit chapters
                </Link>
                <Link
                  href={`/courses/${course.slug}/reports`}
                  className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
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
