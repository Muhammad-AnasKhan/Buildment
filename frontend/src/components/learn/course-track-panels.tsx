import Link from "next/link";
import { ArrowRight, Check, GraduationCap, Lock, Sparkles, Target } from "lucide-react";
import type { CourseTrack } from "@/shared/lib/course-tracks";
import { findCourseFamily, resolveVariant, specialisationsFor } from "@/shared/lib/course-tracks";
import { chooseCourseSpecialisationAction } from "@/server/actions/course-track";
import { VariantIcon } from "@/components/learn/variant-icon";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

// Course home panels for a course in a family: the learner's variant, and the
// specialisation choice that opens once the course is complete.

const sectionLabel = "text-[10px] font-semibold uppercase tracking-[0.14em]";

export function VariantBanner({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = findCourseFamily(track.familySlug);
  if (!family) return null;
  const variant = resolveVariant(family, track.variantSlug);
  const changeHref = `/courses/${courseSlug}/variant`;
  // Finished learners keep whatever they built, including the default.
  const settled = track.variantChosen || track.specialisationOpen;

  return (
    <section aria-label="Your variant" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div aria-hidden className="h-1.5 bg-primary" />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex gap-4 bg-primary/[0.05] p-6 sm:p-7">
          <VariantIcon slug={variant.slug} className="size-12 rounded-2xl" />
          <div className="min-w-0">
            <p className={cn(sectionLabel, "text-primary")}>
              {settled ? `Your variant · ${variant.label}` : "Choose your variant"}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
              {settled ? `You are building ${variant.productName}` : `You are on the general course, ${variant.productName}`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {settled
                ? variant.summary
                : `Pick one of ${family.variants.length} products to build. The whole course takes on its look.`}
            </p>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 border-t border-border bg-muted/15 p-6 lg:border-l lg:border-t-0">
          {settled ? (
            <div>
              <p className={cn(sectionLabel, "flex items-center gap-1.5 text-muted-foreground")}>
                <Target className="size-3" aria-hidden /> The hard part
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/85">{variant.hardestConstraint}</p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Six products, one set of skills. Choose the one you would be proud to demo.
            </p>
          )}
          {track.specialisationOpen ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden /> Fixed now that you have finished
            </p>
          ) : (
            <Link
              href={changeHref}
              className={cn(buttonVariants({ variant: settled ? "outline" : "default" }), "h-10 w-full gap-2")}
            >
              {settled ? "Change variant" : "Choose variant"} <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </aside>
      </div>
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
      <section
        id="specialisation"
        aria-label="Specialisation"
        className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-muted/15 p-6 sm:flex-row sm:items-center"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn(sectionLabel, "text-muted-foreground")}>After the course</p>
          <p className="mt-1 text-sm font-semibold">Choose a specialisation</p>
          <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
            Finish every chapter to unlock it. You pick the area you want to go deeper in.
          </p>
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 sm:max-w-64">
          <p className={cn(sectionLabel, "flex items-center gap-1.5 text-primary")}>
            <Sparkles className="size-3" aria-hidden /> Suggested for {variant.productName}
          </p>
          <p className="mt-1 text-sm font-medium">{next.label}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="specialisation"
      aria-labelledby="specialisation-heading"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-start gap-4 border-b border-border p-6 sm:p-7">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className={cn(sectionLabel, "text-primary")}>Course complete</p>
          <h2 id="specialisation-heading" className="mt-1.5 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            {track.specialisationSlug ? "Your specialisation" : "Choose your specialisation"}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            You finished {variant.productName}. Pick the area you want to go deeper in next; your mentor sees your choice
            and you can change it here.
          </p>
        </div>
      </div>
      <ul className="grid gap-4 bg-muted/15 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
        {options.map((option) => {
          const chosen = track.specialisationSlug === option.slug;
          return (
            <li key={option.slug}>
              <form
                action={chooseCourseSpecialisationAction}
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-card p-5 transition-all",
                  chosen
                    ? "border-primary ring-2 ring-primary/25"
                    : option.recommended
                      ? "border-primary/40 hover:shadow-md"
                      : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                )}
              >
                <input type="hidden" name="courseSlug" value={courseSlug} />
                <input type="hidden" name="specialisationSlug" value={option.slug} />
                {option.recommended ? (
                  <p className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    <Sparkles className="size-3" aria-hidden /> Suggested
                  </p>
                ) : null}
                <h3 className="font-semibold tracking-[-0.01em]">{option.label}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{option.summary}</p>
                <div className="mt-auto pt-4">
                  {chosen ? (
                    <p className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      <Check className="size-4" aria-hidden /> Your specialisation
                    </p>
                  ) : (
                    <PendingSubmitButton
                      pendingLabel="Saving"
                      size="sm"
                      variant={option.recommended ? "default" : "outline"}
                      className="h-9 w-full"
                    >
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
