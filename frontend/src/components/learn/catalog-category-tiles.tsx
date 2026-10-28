import Link from "next/link";
import type { CourseCategory } from "@/shared/domain/enums";
import { COURSE_CATEGORY_INFO } from "@/lib/course-categories";
import { cn } from "@/lib/utils";

/** Category filters above the catalog grid. Each one is a link, so filtering works without JavaScript. */
export function CatalogCategoryTiles({
  counts,
  total,
  active,
}: {
  counts: Record<CourseCategory, number>;
  total: number;
  active: CourseCategory | null;
}) {
  const chips = [
    { href: "/catalog", label: "All", count: total, active: active === null },
    ...COURSE_CATEGORY_INFO.map((category) => ({
      href: `/catalog?category=${category.param}`,
      label: category.label,
      count: counts[category.value],
      active: active === category.value,
    })),
  ];

  return (
    <nav aria-label="Course categories" className="mt-5">
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.href}>
            <Link
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-md border-2 px-4 text-[15px] font-bold outline-none transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow",
                chip.active ? "border-foreground bg-foreground text-background" : "border-input bg-card text-foreground hover:border-foreground"
              )}
            >
              {chip.label}
              <span className="tabular-nums opacity-70">{chip.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
