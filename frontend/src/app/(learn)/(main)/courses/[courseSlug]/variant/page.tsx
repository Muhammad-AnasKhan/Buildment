import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import type { CourseOverview } from "@/shared/api/catalog";
import { findCourseFamily } from "@/shared/lib/course-tracks";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
import { VariantDot } from "@/components/learn/course-track-panels";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { VariantThemeScope } from "@/components/learn/variant-theme";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

export default async function CourseVariantPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, track } = overview;
  const family = findCourseFamily(track?.familySlug);
  if (overview.access !== "active" || !track || !family || track.specialisationOpen) redirect(`/courses/${course.slug}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:px-6 sm:py-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} chapterTitle="Choose your variant" />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Choose what you build</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Every variant teaches the same skills through a different product. Your pick sets the product name and colour
          in the chapters and shows on your mentor&apos;s roster. You can change it until you finish the course.
        </p>
      </header>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {family.variants.map((variant) => {
          const current = track.variantChosen && track.variantSlug === variant.slug;
          const general = variant.slug === family.defaultVariantSlug;
          return (
            <li key={variant.slug}>
              <VariantThemeScope variant={variant}>
                <form
                  action={chooseCourseVariantAction}
                  className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <input type="hidden" name="variantSlug" value={variant.slug} />
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold">
                      <VariantDot className="translate-y-px" />
                      {variant.productName}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {variant.label}
                        {general ? ", the general course" : ""}
                      </span>
                    </h2>
                    <p className="mt-1 text-sm leading-6">{variant.summary}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      <span className="font-medium text-foreground">Hard part:</span> {variant.hardestConstraint}
                    </p>
                  </div>
                  {current ? (
                    <p className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary sm:pt-0.5">
                      <Check className="size-4" aria-hidden /> Your pick
                    </p>
                  ) : (
                    <PendingSubmitButton pendingLabel="Saving" size="sm" variant="outline" className="shrink-0 self-start sm:self-auto">
                      Choose<span className="sr-only"> {variant.productName}</span>
                    </PendingSubmitButton>
                  )}
                </form>
              </VariantThemeScope>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
