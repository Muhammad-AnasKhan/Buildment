import type { CourseOverview } from '../../shared/api/catalog';
import { findCourseFamily } from '../../shared/lib/course-tracks';
import { LearnerBreadcrumb } from './learner-breadcrumb';
import { VariantPicker, type VariantChoice } from './variant-picker';
export function CourseVariantContent({ overview, onChoose }: { overview: CourseOverview; onChoose: (data: FormData) => Promise<void> }) {
  const { course, track } = overview;
  const family = track?.family ?? findCourseFamily(track?.familySlug);
  if (!track || !family) return null;
  const isAvailable = (slug: string) => !track.availableVariantSlugs?.length || track.availableVariantSlugs.includes(slug);
  const available = family.variants.filter((variant) => isAvailable(variant.slug));
  const previous = track.variantChosen ? track.variantSlug : null;
  const previousUnavailable = previous !== null && !isAvailable(previous);
  const choices: VariantChoice[] = family.variants
    .filter((variant) => isAvailable(variant.slug) || variant.slug === previous)
    .map((variant) => ({
      slug: variant.slug,
      productName: variant.productName,
      label: variant.label,
      summary: variant.summary,
      hardestConstraint: variant.hardestConstraint,
      channels: (variant.channels ?? []).map((channel) => ({ label: channel.label, optional: channel.optional })),
      accentLight: variant.theme.accentLight,
      onAccentLight: variant.theme.onAccentLight,
      accentDark: variant.theme.accentDark,
      onAccentDark: variant.theme.onAccentDark,
      unavailable: !isAvailable(variant.slug),
    }));
  // One available product is already the pick. Otherwise the learner's earlier choice stays selected.
  const initialSlug = available.length === 1 ? available[0]!.slug : previous && !previousUnavailable ? previous : null;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} chapterTitle="Choose what you build" />

      <header className="mt-6">
        <h1 className="text-[28px] leading-[1.15] tracking-[-0.035em] sm:text-[36px]">
          {available.length === 1 ? "Your product" : "Choose what you build"}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {available.length === 1
            ? `${available[0]!.productName} is the product with lessons ready now. `
            : "Pick the product you will build. It shows up in every chapter. "}
          You can change it until you start the first chapter.
        </p>
        {previousUnavailable ? (
          <p className="mt-3 max-w-2xl border border-border bg-secondary px-4 py-3 text-base">
            Your earlier pick has no lessons yet. Choose a product that does.
          </p>
        ) : null}
      </header>

      <div className="mt-6 pb-0">
        <VariantPicker courseSlug={course.slug} choices={choices} initialSlug={initialSlug} onChoose={onChoose} />
      </div>
    </div>
  );
}
