// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Course families: one course that learners take as one of several product
// variants, then finish by choosing a specialisation. The catalogue lives here
// rather than in the database so the API (validation), the reader (theme) and
// the mentor pages (labels) all read the same list.
//
// A course opts in through Course.familySlug. Courses without a family behave
// exactly as before.

export type VariantTheme = {
  /** Accent used for buttons, links and the banner on the light reader. */
  accentLight: string;
  /** Label colour on an accent fill in light mode. */
  onAccentLight: string;
  /** Accent on the dark reader; lighter so it still reads on the dark surface. */
  accentDark: string;
  onAccentDark: string;
  /** Heading font stack. System fonts only, so a theme never downloads a font. */
  headingFont: "sans" | "serif";
};

export type CourseVariant = {
  slug: string;
  /** Short label for chips and pickers, e.g. "Books". */
  label: string;
  /** The reference product the variant builds, e.g. "Hamesh". */
  productName: string;
  /** One line on what the learner builds. */
  summary: string;
  /** The problem that makes this variant hard. */
  hardestConstraint: string;
  /** The specialisation that follows naturally from this variant. */
  specialisationSlug: string;
  theme: VariantTheme;
};

export type CourseSpecialisation = {
  slug: string;
  label: string;
  summary: string;
};

export type CourseFamily = {
  slug: string;
  label: string;
  /** Variant used when the learner has not picked one yet. */
  defaultVariantSlug: string;
  variants: CourseVariant[];
  specialisations: CourseSpecialisation[];
};

/** What the reader and the course home need to know about the learner's track. */
export type CourseTrack = {
  familySlug: string;
  /** The learner's variant, or the family default while they have not picked. */
  variantSlug: string;
  variantChosen: boolean;
  specialisationSlug: string | null;
  /** The specialisation choice opens once the course is complete. */
  specialisationOpen: boolean;
};

/** Mentor-facing summary of one learner's choices. */
export type LearnerTrackSummary = {
  variant: { slug: string; label: string; productName: string } | null;
  specialisation: { slug: string; label: string } | null;
};

// Variants and follow-ups come from agent-ip/work/multi-vendor-marketplace/variant-diff.md.
// Accents follow each variant's identity notes in its roadmap.
const MARKETPLACE: CourseFamily = {
  slug: "multi-vendor-marketplace",
  label: "Multi-vendor marketplace",
  defaultVariantSlug: "grocery",
  variants: [
    {
      slug: "grocery",
      label: "Grocery",
      productName: "FreshMarket",
      summary: "Local shops list groceries and buyers fill one cart across stores.",
      hardestConstraint: "Never oversell: stock is reserved safely while many buyers check out at once.",
      specialisationSlug: "inventory-at-scale",
      theme: { accentLight: "#1B6E3A", onAccentLight: "#FFFFFF", accentDark: "#4ADE80", onAccentDark: "#052E16", headingFont: "sans" },
    },
    {
      slug: "services",
      label: "Services",
      productName: "SkillSlot",
      summary: "Clients book tutors, designers and electricians by the hour.",
      hardestConstraint: "No double bookings on one provider's calendar, across two time zones and daylight saving.",
      specialisationSlug: "scheduling-systems",
      theme: { accentLight: "#0F766E", onAccentLight: "#FFFFFF", accentDark: "#2DD4BF", onAccentDark: "#042F2E", headingFont: "sans" },
    },
    {
      slug: "handmade",
      label: "Handmade",
      productName: "Ghurza",
      summary: "Buyers commission embroidery, olive wood and ceramics from makers.",
      hardestConstraint: "Made to order: sold before it exists, through a weeks-long quote, deposit and approval flow.",
      specialisationSlug: "long-running-orders",
      theme: { accentLight: "#9B2226", onAccentLight: "#FFFFFF", accentDark: "#F87171", onAccentDark: "#2A0A0B", headingFont: "serif" },
    },
    {
      slug: "home-kitchens",
      label: "Home kitchens",
      productName: "Sufra",
      summary: "Diners order cooked dishes from home kitchens for a delivery window.",
      hardestConstraint: "Each kitchen can cook only so much per window, with cutoffs in the kitchen's own time zone.",
      specialisationSlug: "real-time-delivery",
      theme: { accentLight: "#B45309", onAccentLight: "#FFFFFF", accentDark: "#FBBF24", onAccentDark: "#2A1700", headingFont: "sans" },
    },
    {
      slug: "digital-goods",
      label: "Digital goods",
      productName: "Midad",
      summary: "Creators sell fonts, templates and ebooks under clear licences.",
      hardestConstraint: "Grant access exactly once from a verified payment, limit it by licence and withdraw it on refund.",
      specialisationSlug: "entitlements",
      theme: { accentLight: "#6D28D9", onAccentLight: "#FFFFFF", accentDark: "#A78BFA", onAccentDark: "#1E1033", headingFont: "sans" },
    },
    {
      slug: "books",
      label: "Books",
      productName: "Hamesh",
      summary: "Students and small bookshops trade used copies of the exact edition a course needs.",
      hardestConstraint: "One edition, many separately graded copies, matched to reading lists by ISBN.",
      specialisationSlug: "catalogue-identity",
      theme: { accentLight: "#1E40AF", onAccentLight: "#FFFFFF", accentDark: "#93C5FD", onAccentDark: "#0B1B3A", headingFont: "serif" },
    },
  ],
  specialisations: [
    {
      slug: "inventory-at-scale",
      label: "Inventory and reservations at scale",
      summary: "Stock that stays correct under heavy concurrent checkout, across warehouses and caches.",
    },
    {
      slug: "scheduling-systems",
      label: "Scheduling systems in depth",
      summary: "Recurring bookings, exceptions and calendar sync.",
    },
    {
      slug: "long-running-orders",
      label: "Long-running orders",
      summary: "State machines, sagas and money that moves over weeks.",
    },
    {
      slug: "real-time-delivery",
      label: "Real-time scheduling and delivery",
      summary: "Capacity planning, live tracking and delivery systems that survive weak connections.",
    },
    {
      slug: "entitlements",
      label: "Entitlements engineering",
      summary: "Who may use what, for how long, and how access is granted and withdrawn.",
    },
    {
      slug: "catalogue-identity",
      label: "Catalogue identity and matching",
      summary: "Deciding when two records are the same thing, and keeping standing matches fresh at scale.",
    },
  ],
};

export const COURSE_FAMILIES: readonly CourseFamily[] = [MARKETPLACE];

export function findCourseFamily(familySlug: string | null | undefined): CourseFamily | null {
  if (!familySlug) return null;
  return COURSE_FAMILIES.find((family) => family.slug === familySlug) ?? null;
}

export function findVariant(family: CourseFamily, variantSlug: string | null | undefined): CourseVariant | null {
  if (!variantSlug) return null;
  return family.variants.find((variant) => variant.slug === variantSlug) ?? null;
}

export function findSpecialisation(family: CourseFamily, specialisationSlug: string | null | undefined): CourseSpecialisation | null {
  if (!specialisationSlug) return null;
  return family.specialisations.find((item) => item.slug === specialisationSlug) ?? null;
}

/** The learner's variant, falling back to the family default for a missing or retired slug. */
export function resolveVariant(family: CourseFamily, variantSlug: string | null | undefined): CourseVariant {
  return findVariant(family, variantSlug) ?? findVariant(family, family.defaultVariantSlug) ?? family.variants[0]!;
}

/** Specialisations with the variant's own follow-up first. */
export function specialisationsFor(family: CourseFamily, variant: CourseVariant): Array<CourseSpecialisation & { recommended: boolean }> {
  const recommended = family.specialisations.filter((item) => item.slug === variant.specialisationSlug);
  const rest = family.specialisations.filter((item) => item.slug !== variant.specialisationSlug);
  return [...recommended, ...rest].map((item) => ({ ...item, recommended: item.slug === variant.specialisationSlug }));
}

/** A course counts as finished for track purposes once every chapter is complete. */
export function courseFinished(enrollment: { status: string; percentComplete: number }): boolean {
  return enrollment.status === "COMPLETED" || enrollment.percentComplete >= 100;
}

export function buildCourseTrack(
  familySlug: string | null | undefined,
  enrollment: { variantSlug: string | null; specialisationSlug: string | null; status: string; percentComplete: number }
): CourseTrack | null {
  const family = findCourseFamily(familySlug);
  if (!family) return null;
  const chosen = findVariant(family, enrollment.variantSlug);
  return {
    familySlug: family.slug,
    variantSlug: resolveVariant(family, enrollment.variantSlug).slug,
    variantChosen: chosen !== null,
    specialisationSlug: findSpecialisation(family, enrollment.specialisationSlug)?.slug ?? null,
    specialisationOpen: courseFinished(enrollment),
  };
}

export function summarizeLearnerTrack(
  familySlug: string | null | undefined,
  enrollment: { variantSlug: string | null; specialisationSlug: string | null }
): LearnerTrackSummary | null {
  const family = findCourseFamily(familySlug);
  if (!family) return null;
  const variant = findVariant(family, enrollment.variantSlug);
  const specialisation = findSpecialisation(family, enrollment.specialisationSlug);
  return {
    variant: variant ? { slug: variant.slug, label: variant.label, productName: variant.productName } : null,
    specialisation: specialisation ? { slug: specialisation.slug, label: specialisation.label } : null,
  };
}

/** WCAG 2.x contrast ratio between two #RRGGBB colours. */
export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const value = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((offset) => {
      const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
}
