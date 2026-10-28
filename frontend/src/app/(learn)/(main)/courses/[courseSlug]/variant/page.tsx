import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import type { CourseOverview } from "@/shared/api/catalog";
import { findCourseFamily } from "@/shared/lib/course-tracks";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
import { VariantDetails, VariantDot } from "@/components/learn/course-track-panels";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { VariantThemeScope } from "@/components/learn/variant-theme";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

export default async function CourseVariantPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, track } = overview;
  const family = track?.family ?? findCourseFamily(track?.familySlug);
  if (overview.access !== "active" || !track || !family || track.variantLocked) redirect(`/courses/${course.slug}`);
  const available = family.variants.filter((variant) => !track.availableVariantSlugs?.length || track.availableVariantSlugs.includes(variant.slug));
  const choices = family.variants.filter((variant) => available.includes(variant) || track.variantChosen && track.variantSlug === variant.slug);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} chapterTitle="Choose your variant" />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{available.length === 1 ? "Your available product" : "Choose what you build"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {available.length === 1
            ? `${available[0]!.productName} is the product with lessons available now.`
            : "Each available variant teaches the course through its own product."}{" "}
          Each card shows how people reach the product and the hard problem you will solve. Your pick sets the product
          name and colour in the chapters and shows on your mentor&apos;s roster. Your choice is fixed when you start a chapter.
        </p>
        {track.variantChosen && !available.some((variant) => variant.slug === track.variantSlug) && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your previous product choice is still recorded, but its own lessons are being prepared. Choose an available product before you start.
          </p>
        )}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {choices.map((variant) => {
          const current = track.variantChosen && track.variantSlug === variant.slug;
          return (
            <li key={variant.slug} className="flex">
              <VariantThemeScope variant={variant}>
                <form
                  action={chooseCourseVariantAction}
                  className={cn(
                    "flex w-full flex-col gap-4 rounded-lg border border-border bg-card px-4 py-4 sm:px-5",
                    current && "border-primary ring-1 ring-primary"
                  )}
                >
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <input type="hidden" name="variantSlug" value={variant.slug} />
                  <div className="min-w-0 space-y-3">
                    <h2 className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <VariantDot />
                        {variant.productName}
                      </span>{" "}
                      <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                        {variant.label}
                      </span>
                    </h2>
                    <VariantDetails variant={variant} />
                  </div>
                  <div className="mt-auto">
                    {current ? (
                      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Check className="size-4" aria-hidden /> {available.includes(variant) ? "Your pick" : "Previous choice"}
                      </p>
                    ) : (
                      <PendingSubmitButton pendingLabel="Saving" size="sm" variant="outline" className="w-full sm:w-auto">
                        Choose {variant.productName}
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
