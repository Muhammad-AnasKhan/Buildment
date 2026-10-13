import Link from "next/link";
import { cn } from "@/lib/utils";
import { QueryFilterSelect } from "./query-filter-select";

export function HelpInboxFilters({
  status,
  openCount,
  courseId,
  courses,
}: {
  status: string;
  openCount: number;
  courseId?: string;
  courses: { id: string; title: string }[];
}) {
  const current = status || "open";

  const tabs = [
    { value: "open", label: `Open (${openCount})` },
    { value: "resolved", label: "Resolved" },
    { value: "all", label: "All" },
  ] as const;

  function hrefFor(nextStatus: string) {
    const params = new URLSearchParams();
    params.set("status", nextStatus);
    if (courseId) params.set("courseId", courseId);
    return `/help?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav className="flex rounded-lg border border-neutral-200 bg-white p-0.5" aria-label="Filter by status">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={hrefFor(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              current === tab.value
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {courses.length > 1 && (
        <form className="flex items-center gap-2" action="/help" method="GET">
          <input type="hidden" name="status" value={current} />
          <QueryFilterSelect
            name="courseId"
            defaultValue={courseId ?? ""}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-400"
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </QueryFilterSelect>
        </form>
      )}
    </div>
  );
}
