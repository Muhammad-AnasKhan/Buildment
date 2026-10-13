import Link from "next/link";
import { CourseCover } from "@/components/learn/course-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPriceCents } from "@/lib/format-price";

export type CatalogCourseCardProps = {
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  difficulty: string | null;
  estimatedHours: number | null;
  pricingType: string;
  priceCents: number | null;
  currency: string | null;
  instructorName?: string | null;
  enrolledLabel?: string | null;
};

export function CatalogCourseCard({
  slug,
  title,
  description,
  coverUrl,
  difficulty,
  estimatedHours,
  pricingType,
  priceCents,
  currency,
  instructorName,
  enrolledLabel,
}: CatalogCourseCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md">
      <CourseCover coverUrl={coverUrl} title={title} aspect="video" className="rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {difficulty ? <span className="font-medium uppercase tracking-wide">{difficulty}</span> : null}
          {estimatedHours ? <span>~{estimatedHours}h</span> : null}
          {enrolledLabel ? (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
              {enrolledLabel}
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight">{title}</h2>
        {instructorName ? (
          <p className="mt-1 text-xs text-muted-foreground">Instructor · {instructorName}</p>
        ) : null}
        {description ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : (
          <div className="flex-1" />
        )}
        <p className="mt-4 text-sm font-semibold tabular-nums">
          {pricingType === "PAID"
            ? formatPriceCents(priceCents ?? 0, currency ?? "USD")
            : "Free"}
        </p>
        <Link
          href={`/catalog/${slug}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
