import Link from "next/link";
import { Check } from "lucide-react";
import type { CourseTrack } from "@/shared/lib/course-tracks";
import { findCourseFamily, resolveVariant, specialisationsFor } from "@/shared/lib/course-tracks";
import { chooseCourseSpecialisationAction } from "@/server/actions/course-track";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

// Course home panels for a course in a family: the learner's variant, and the
// specialisation choice that opens once the course is complete.

/** Small dot in the variant's accent. Must sit inside a VariantThemeScope to take its colour. */
export function VariantDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full bg-primary", className)} />;
}

export function VariantBanner({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = findCourseFamily(track.familySlug);
  if (!family) return null;
  const variant = resolveVariant(family, track.variantSlug);
  // Finished learners keep whatever they built, including the default.
  const settled = track.variantChosen || track.specialisationOpen;

  return (
    <section
      aria-label="Your variant"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-baseline gap-2.5 text-sm leading-6">
        <VariantDot className="translate-y-px" />
        <span>
          {settled ? (
            <>
              You are building <strong className="font-semibold">{variant.productName}</strong>, the{" "}
              {variant.label.toLowerCase()} variant.
            </>
          ) : (
            <>
              You are on the general course, building <strong className="font-semibold">{variant.productName}</strong>.{" "}
              <span className="text-muted-foreground">You can pick a different product to build.</span>
            </>
          )}
        </span>
      </p>
      {track.specialisationOpen ? (
        <p className="text-xs text-muted-foreground">Fixed now that you have finished</p>
      ) : (
        <Link
          href={`/courses/${courseSlug}/variant`}
          className={cn(buttonVariants({ variant: settled ? "outline" : "default", size: "sm" }), "shrink-0")}
        >
          {settled ? "Change" : "Choose a variant"}
        </Link>
      )}
    </section>
  );
}

export function SpecialisationPanel({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = findCourseFamily(track.familySlug);
  if (!family) return null;
  const variant = resolveVariant(family, track.variantSlug);
  const options = specialisationsFor(family, variant);

  if (!track.specialisationOpen) {
    return (
      <section id="specialisation" aria-labelledby="specialisation-heading" className="border-t border-border pt-6">
        <h2 id="specialisation-heading" className="text-base font-semibold">
          After the course
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          When you finish every chapter, you choose a specialisation to go deeper in. For {variant.productName} we suggest{" "}
          <span className="font-medium text-foreground">{options[0]!.label.toLowerCase()}</span>.
        </p>
      </section>
    );
  }

  return (
    <section id="specialisation" aria-labelledby="specialisation-heading" className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 id="specialisation-heading" className="text-lg font-semibold">
          {track.specialisationSlug ? "Your specialisation" : "Choose your specialisation"}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          You finished {variant.productName}. Pick what to go deeper in next. Your mentor sees your choice, and you can
          change it here.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {options.map((option) => {
          const chosen = track.specialisationSlug === option.slug;
          return (
            <li key={option.slug}>
              <form
                action={chooseCourseSpecialisationAction}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <input type="hidden" name="courseSlug" value={courseSlug} />
                <input type="hidden" name="specialisationSlug" value={option.slug} />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">
                    {option.label}
                    {option.recommended ? (
                      <span className="ml-2 font-normal text-muted-foreground">Suggested for {variant.productName}</span>
                    ) : null}
                  </h3>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{option.summary}</p>
                </div>
                {chosen ? (
                  <p className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="size-4" aria-hidden /> Chosen
                  </p>
                ) : (
                  <PendingSubmitButton pendingLabel="Saving" size="sm" variant="outline" className="shrink-0 self-start sm:self-auto">
                    Choose<span className="sr-only"> {option.label}</span>
                  </PendingSubmitButton>
                )}
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
