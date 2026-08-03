import type { NextAuthConfig } from "next-auth";

// Edge-safe half of the Auth.js config — no Prisma adapter here (Prisma needs the
// Node.js runtime, not Edge). See docs/07-architecture.mdx §"Auth.js v5 status" and
// .cursor/rules/typescript-nextjs.mdc. Kept mostly empty for v1 since role-gating
// happens in Server Component layouts (Node runtime), not Edge middleware — this
// split exists so it's a non-event to add middleware later without breaking Prisma.
export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  providers: [],
} satisfies NextAuthConfig;
