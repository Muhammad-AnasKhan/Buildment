import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import type { CourseOverview } from "@/shared/api/catalog";
import { findCourseFamily } from "@/shared/lib/course-tracks";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { VariantThemeScope } from "@/components/learn/variant-theme";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

export default async function CourseVariantPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, track } = overview;
  const family = findCourseFamily(track?.familySlug);
  if (overview.access !== "active" || !track || !family || track.specialisationOpen) redirect(`/courses/${course.slug}`);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} chapterTitle="Choose your variant" />

      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Choose what you build</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Every variant teaches the same marketplace skills through a different product. Your pick sets the look of the
          whole course, and your mentor sees it. You can change it until you finish the course.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {family.variants.map((variant) => {
          const current = track.variantChosen && track.variantSlug === variant.slug;
          return (
            <li key={variant.slug}>
              <VariantThemeScope variant={variant}>
                <form
                  action={chooseCourseVariantAction}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border bg-card p-5 transition-colors",
                    current ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
                  )}
                >
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <input type="hidden" name="variantSlug" value={variant.slug} />
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="size-3 rounded-full bg-primary" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{variant.label}</span>
                    {variant.slug === family.defaultVariantSlug ? (
                      <span className="text-xs text-muted-foreground">· general course</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">{variant.productName}</h2>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">{variant.summary}</p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    <span className="font-medium text-foreground/80">The hard part: </span>
                    {variant.hardestConstraint}
                  </p>
                  <div className="mt-auto pt-5">
                    {current ? (
                      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Check className="size-4" aria-hidden /> Your variant
                      </p>
                    ) : (
                      <PendingSubmitButton pendingLabel="Saving" className="w-full">
                        Build {variant.productName}
                      </PendingSubmitButton>
                    )}
                  </div>
                </form>
              </VariantThemeScope>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
