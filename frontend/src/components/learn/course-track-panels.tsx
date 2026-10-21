import Link from "next/link";
import { ArrowRight, Check, GraduationCap } from "lucide-react";
import type { CourseTrack } from "@/shared/lib/course-tracks";
import { findCourseFamily, resolveVariant, specialisationsFor } from "@/shared/lib/course-tracks";
import { chooseCourseSpecialisationAction } from "@/server/actions/course-track";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

// Course home panels for a course in a family: the learner's variant, and the
// specialisation choice that opens once the course is complete.

export function VariantBanner({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = findCourseFamily(track.familySlug);
  if (!family) return null;
  const variant = resolveVariant(family, track.variantSlug);
  const changeHref = `/courses/${courseSlug}/variant`;

  return (
    <section
      aria-label="Your variant"
      className="flex flex-col gap-4 rounded-2xl border border-l-4 border-l-primary bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {track.variantChosen ? `Your variant · ${variant.label}` : "Choose your variant"}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          {track.variantChosen ? `You are building ${variant.productName}` : `You are on the general course, ${variant.productName}`}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {track.variantChosen
            ? variant.summary
            : `Pick one of ${family.variants.length} products to build. The whole course takes on its look.`}
        </p>
      </div>
      {track.specialisationOpen ? null : (
        <Link
          href={changeHref}
          className={cn(buttonVariants({ variant: track.variantChosen ? "outline" : "default" }), "shrink-0 gap-1.5")}
        >
          {track.variantChosen ? "Change variant" : "Choose variant"} <ArrowRight className="size-4" />
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
    const next = options[0]!;
    return (
      <section id="specialisation" className="flex items-start gap-3 rounded-2xl border border-dashed p-5 text-sm">
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <p className="leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">After the course: choose a specialisation.</span> When you finish
          every chapter you pick an area to go deeper in. For {variant.productName} we suggest {next.label.toLowerCase()}.
        </p>
      </section>
    );
  }

  return (
    <section id="specialisation" aria-labelledby="specialisation-heading" className="space-y-4">
      <div>
        <h2 id="specialisation-heading" className="text-xl font-semibold tracking-tight">
          {track.specialisationSlug ? "Your specialisation" : "Choose your specialisation"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You finished the course. Pick the area you want to go deeper in next; your mentor sees your choice.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const chosen = track.specialisationSlug === option.slug;
          return (
            <li key={option.slug}>
              <form
                action={chooseCourseSpecialisationAction}
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-card p-4",
                  chosen ? "border-primary ring-2 ring-primary/30" : null
                )}
              >
                <input type="hidden" name="courseSlug" value={courseSlug} />
                <input type="hidden" name="specialisationSlug" value={option.slug} />
                {option.recommended ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">Suggested for {variant.productName}</p>
                ) : null}
                <h3 className="mt-1 font-semibold">{option.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{option.summary}</p>
                <div className="mt-auto pt-4">
                  {chosen ? (
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      <Check className="size-4" aria-hidden /> Your specialisation
                    </p>
                  ) : (
                    <PendingSubmitButton pendingLabel="Saving" size="sm" variant={option.recommended ? "default" : "outline"}>
                      Choose this
                    </PendingSubmitButton>
                  )}
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
