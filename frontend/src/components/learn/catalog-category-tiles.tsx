import Link from "next/link";
import { Code2, LayoutGrid, Users } from "lucide-react";
import type { CourseCategory } from "@/shared/domain/enums";
import { COURSE_CATEGORY_INFO } from "@/lib/course-categories";
import { cn } from "@/lib/utils";

const ICONS: Record<CourseCategory, typeof Code2> = { TECH: Code2, SOFT_SKILLS: Users };

type Tile = { href: string; label: string; description: string; count: number; icon: typeof Code2; active: boolean };

/** Category tiles above the catalog grid. Each tile is a link, so filtering works without JavaScript. */
export function CatalogCategoryTiles({
  counts,
  total,
  active,
}: {
  counts: Record<CourseCategory, number>;
  total: number;
  active: CourseCategory | null;
}) {
  const tiles: Tile[] = [
    { href: "/catalog", label: "All courses", description: "Everything in the catalog.", count: total, icon: LayoutGrid, active: active === null },
    ...COURSE_CATEGORY_INFO.map((category) => ({
      href: `/catalog?category=${category.param}`,
      label: category.label,
      description: category.description,
      count: counts[category.value],
      icon: ICONS[category.value],
      active: active === category.value,
    })),
  ];

  return (
    <nav aria-label="Course categories" className="mt-7">
      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href}
              aria-current={tile.active ? "page" : undefined}
              className={cn(
                "flex h-full flex-col rounded-2xl border bg-card p-3 text-card-foreground transition-colors hover:border-foreground/30 sm:p-5",
                tile.active && "border-foreground bg-muted/40 ring-1 ring-foreground/20",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <tile.icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{tile.count}</span>
              </span>
              <span className="mt-3 text-sm font-semibold leading-5 sm:text-base">{tile.label}</span>
              <span className="mt-1 hidden text-sm leading-5 text-muted-foreground sm:block">{tile.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
