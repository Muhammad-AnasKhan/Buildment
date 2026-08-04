/**
 * Curated, presentation-only content for the course overview page — tech
 * stack chips, "what you'll build" preview tabs, and skills grid. This is
 * marketing/orientation copy the mentor would maintain alongside the course,
 * not part of the graded MDX content, so it lives here keyed by slug rather
 * than in the schema. Falls back to nothing (sections are skipped) for any
 * course without an entry.
 */

export type ShowcaseTab = {
  id: string;
  label: string;
  moduleHint: string;
  items: { title: string; meta: string; badge?: string }[];
};

export type CourseShowcaseContent = {
  techStack: string[];
  skills: { title: string; description: string }[];
  showcase: ShowcaseTab[];
};

export const COURSE_SHOWCASE: Record<string, CourseShowcaseContent> = {
  "multi-vendor-marketplace": {
    techStack: [
      "MongoDB",
      "Express",
      "React",
      "Node.js",
      "Redis",
      "BullMQ",
      "Cloudinary",
      "Stripe",
    ],
    skills: [
      {
        title: "Vendor-isolated data model",
        description:
          "Design MongoDB schemas that keep every vendor's stores, products, and orders correctly scoped to them.",
      },
      {
        title: "JWT auth & authorization",
        description:
          "Hash passwords, issue access/refresh tokens, and enforce role checks across customer, vendor, and admin routes.",
      },
      {
        title: "Photo uploads with Cloudinary",
        description: "Let vendors upload real product photos and serve optimized images.",
      },
      {
        title: "Multi-vendor cart & checkout",
        description:
          "Split a single cart into per-vendor orders at checkout with price snapshots.",
      },
      {
        title: "Stripe test-mode payments",
        description: "Take real payment flows from intent creation through webhook confirmation.",
      },
      {
        title: "Redis caching & BullMQ jobs",
        description:
          "Cache hot catalogue reads and move order side-effects into background workers.",
      },
    ],
    showcase: [
      {
        id: "storefront",
        label: "Customer storefront",
        moduleHint: "Modules 14–17 — Browse catalogue, shop, cart",
        items: [
          { title: "Organic avocados", meta: "Green Valley Farms · $4.99 / bag", badge: "In stock" },
          { title: "Sourdough loaf", meta: "Riverside Bakery · $6.50 / loaf", badge: "In stock" },
          { title: "Wildflower honey", meta: "Apiary Collective · $12.00 / jar", badge: "Low stock" },
        ],
      },
      {
        id: "vendor",
        label: "Vendor dashboard",
        moduleHint: "Modules 10–13 — Open your shop, manage products",
        items: [
          { title: "Active listings", meta: "18 products across 3 categories" },
          { title: "Pending orders", meta: "4 orders awaiting fulfillment" },
          { title: "This week's revenue", meta: "$842.10 across 26 orders" },
        ],
      },
      {
        id: "checkout",
        label: "Checkout & orders",
        moduleHint: "Modules 18–20 — Checkout, payments, tracking",
        items: [
          { title: "Order #ORD-1042", meta: "2 vendors · Stripe payment confirmed", badge: "Paid" },
          { title: "Order #ORD-1041", meta: "1 vendor · Preparing", badge: "In progress" },
          { title: "Order #ORD-1039", meta: "3 vendors · Delivered", badge: "Complete" },
        ],
      },
    ],
  },
};
