// Shared between prisma/seed.ts and the dev-login shortcut on the login page
// (src/app/(auth)/login/page.tsx) so the two can never drift apart.

export const SEED_USERS = [
  { email: "mentor@buildment.dev", name: "Morgan Mentor", role: "MENTOR" as const },
  { email: "mentee1@buildment.dev", name: "Ada Mentee", role: "MENTEE" as const },
  { email: "mentee2@buildment.dev", name: "Ben Mentee", role: "MENTEE" as const },
  { email: "mentee3@buildment.dev", name: "Cy Mentee", role: "MENTEE" as const },
];

// Mirrors content/import/multi-vendor-marketplace/COURSE-OUTLINE.md — the
// actual chapters/lessons/quizzes are populated by scripts/import-course.ts;
// this is just the course-level record both that script and prisma/seed.ts
// upsert against.
export const SEED_COURSE = {
  slug: "multi-vendor-marketplace",
  title: "FreshMarket — Multi-Vendor Grocery Marketplace",
  description:
    "Build a local grocery marketplace where multiple vendors sell through one shared platform: " +
    "vendor onboarding with photo uploads, a searchable customer catalogue, a cart that splits " +
    "into per-vendor orders at checkout, Stripe test-mode payments, Redis-backed caching, " +
    "background jobs, and a live HTTPS deploy. MERN stack (MongoDB, Express, React, Node) plus " +
    "Redis, BullMQ, Cloudinary, and Stripe.",
  projectGoal:
    "Ship a live, deployed multi-vendor marketplace with vendor onboarding, a multi-vendor cart, " +
    "split checkout with price snapshots, and Stripe test-mode payments.",
  difficulty: "Medium",
  estimatedHours: 240,
  coverUrl:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
};
