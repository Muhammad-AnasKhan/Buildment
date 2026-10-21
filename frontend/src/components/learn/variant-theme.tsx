import type { CSSProperties, ReactNode } from "react";
import { findCourseFamily, resolveVariant, type CourseTrack, type CourseVariant } from "@/shared/lib/course-tracks";

// The learner's variant themes everything inside the scope: globals.css maps
// these custom properties onto --primary and --ring for light and dark mode,
// so buttons, links, progress and focus rings take the variant's accent.

/** The learner's variant for a course in a family, or null for an ordinary course. */
export function variantForTrack(track: CourseTrack | null | undefined): CourseVariant | null {
  if (!track) return null;
  const family = findCourseFamily(track.familySlug);
  return family ? resolveVariant(family, track.variantSlug) : null;
}

export function variantThemeStyle(variant: CourseVariant): CSSProperties {
  const { theme } = variant;
  return {
    "--variant-accent-light": theme.accentLight,
    "--variant-on-accent-light": theme.onAccentLight,
    "--variant-accent-dark": theme.accentDark,
    "--variant-on-accent-dark": theme.onAccentDark,
  } as CSSProperties;
}

export function VariantThemeScope({ variant, children }: { variant: CourseVariant | null; children: ReactNode }) {
  if (!variant) return <>{children}</>;
  return (
    <div
      data-variant={variant.slug}
      data-variant-heading={variant.theme.headingFont}
      style={variantThemeStyle(variant)}
      className="contents"
    >
      {children}
    </div>
  );
}
