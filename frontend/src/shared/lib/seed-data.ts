// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Shared between prisma/seed.ts and the dev-login shortcut on the login page
// (src/app/(auth)/login/page.tsx) so the two can never drift apart.

export const SEED_USERS = [
  { email: "admin@buildment.dev", name: "Alex Admin", role: "ADMIN" as const },
  { email: "mentor@buildment.dev", name: "Morgan Mentor", role: "MENTOR" as const },
  { email: "mentee1@buildment.dev", name: "Ada Mentee", role: "MENTEE" as const },
  { email: "mentee2@buildment.dev", name: "Ben Mentee", role: "MENTEE" as const },
  { email: "mentee3@buildment.dev", name: "Cy Mentee", role: "MENTEE" as const },
] as const;

export type SeedUserRole = (typeof SEED_USERS)[number]["role"];

const SEED_TEST_EMAILS: Set<string> = new Set(SEED_USERS.map((user) => user.email));

/** Dev-login seed accounts (`pnpm db:seed`). */
export function isSeedTestEmail(email: string): boolean {
  return SEED_TEST_EMAILS.has(email);
}

// Mirrors courses/multi-vendor-marketplace/COURSE-OUTLINE.md — the
// actual chapters/lessons/quizzes are populated by scripts/import-course.ts;
// this is just the course-level record both that script and prisma/seed.ts
// upsert against.
export const SEED_COURSE = {
  slug: "multi-vendor-marketplace",
  title: "Multi-vendor Marketplace",
  description:
    "Build and deploy a multi-vendor marketplace through a product-specific track. " +
    "Your assigned or selected track determines the data model, build steps, assessments, and capstone you see.",
  projectGoal:
    "Ship a live marketplace with independent sellers or providers, a safe customer journey, " +
    "and reliability evidence for the chosen product track.",
  difficulty: "Medium",
  estimatedHours: 240,
  coverUrl:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  // FreshMarket is the initial product track; see shared/lib/course-tracks.ts.
  family: "multi-vendor-marketplace",
  availableVariantSlugs: ["grocery"],
};
