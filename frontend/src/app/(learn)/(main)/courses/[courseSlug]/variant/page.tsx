import { redirect } from "next/navigation";
import { ArrowRight, Check, GraduationCap, Palette, Target } from "lucide-react";
import type { CourseOverview } from "@/shared/api/catalog";
import { findCourseFamily } from "@/shared/lib/course-tracks";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { VariantIcon } from "@/components/learn/variant-icon";
import { VariantThemeScope } from "@/components/learn/variant-theme";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

const JOURNEY = [
  { icon: Palette, title: "Pick a variant", body: "The product you build, and the look of the whole course." },
  { icon: Target, title: "Build it chapter by chapter", body: "Same skills and checkpoints for every variant." },
  { icon: GraduationCap, title: "Choose a specialisation", body: "When you finish, pick the area to go deeper in." },
];

export default async function CourseVariantPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, track } = overview;
  const family = findCourseFamily(track?.familySlug);
  if (overview.access !== "active" || !track || !family || track.specialisationOpen) redirect(`/courses/${course.slug}`);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} chapterTitle="Choose your variant" />

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-6 sm:p-8">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {family.label}
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] lg:text-[2rem]">
            Choose what you build
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-[15px]">
            Every variant teaches the same marketplace engineering through a different product. Your pick themes the whole
            course and shows on your mentor&apos;s roster. You can switch any time before you finish.
          </p>
        </div>
        <ol className="grid border-t border-border bg-muted/15 sm:grid-cols-3">
          {JOURNEY.map((step, index) => (
            <li
              key={step.title}
              className={cn("flex gap-3 p-5 sm:p-6", index > 0 && "border-t border-border sm:border-l sm:border-t-0")}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg border",
                  index === 0 ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground"
                )}
              >
                <step.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tabular-nums text-muted-foreground">STEP {index + 1}</p>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {family.variants.map((variant) => {
          const current = track.variantChosen && track.variantSlug === variant.slug;
          const general = variant.slug === family.defaultVariantSlug;
          return (
            <li key={variant.slug}>
              <VariantThemeScope variant={variant}>
                <form
                  action={chooseCourseVariantAction}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
                    current
                      ? "border-primary ring-2 ring-primary/25"
                      : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <input type="hidden" name="variantSlug" value={variant.slug} />

                  <div aria-hidden className="h-1.5 bg-primary" />
                  <div className="flex items-start justify-between gap-3 bg-primary/[0.06] px-5 pb-4 pt-5">
                    <VariantIcon slug={variant.slug} />
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {general ? (
                        <span className="rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          General course
                        </span>
                      ) : null}
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                        {variant.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em]">{variant.productName}</h2>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{variant.summary}</p>

                    <div className="mt-4 rounded-xl border border-border bg-muted/25 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        <Target className="size-3" aria-hidden /> The hard part
                      </p>
                      <p className="mt-1.5 text-xs leading-5 text-foreground/80">{variant.hardestConstraint}</p>
                    </div>

                    <div className="mt-auto pt-5">
                      {current ? (
                        <p className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          <Check className="size-4" aria-hidden /> Your variant
                        </p>
                      ) : (
                        <PendingSubmitButton pendingLabel="Saving" className="h-10 w-full gap-2">
                          Build {variant.productName}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </PendingSubmitButton>
                      )}
                    </div>
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
