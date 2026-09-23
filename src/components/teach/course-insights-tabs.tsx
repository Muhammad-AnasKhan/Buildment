import Link from "next/link";
import { Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CourseInsightsTabs({
  courseSlug,
  active,
}: {
  courseSlug: string;
  active: "reports" | "activity";
}) {
  const items = [
    { key: "reports" as const, label: "Overview", href: `/courses/${courseSlug}/reports`, icon: BarChart3 },
    { key: "activity" as const, label: "Daily activity", href: `/courses/${courseSlug}/activity`, icon: Activity },
  ];

  return (
    <nav aria-label="Report views" className="flex gap-1 border-b">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Icon className="size-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
