import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/guards";

export default async function MenteeDashboardPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Your courses</h1>
      <p className="mt-2 text-[15px] text-neutral-500">
        Pick up where you left off — work through chapters in order and complete the checkpoints.
      </p>

      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          No courses assigned yet.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {enrollments.map(({ course, percentComplete, status }) => (
            <li key={course.id}>
              <Link
                href={`/courses/${course.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-950">{course.title}</p>
                  {course.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {course.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-500">
                      {percentComplete}%
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-500">
                      {status.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
