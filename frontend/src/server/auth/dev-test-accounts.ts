import "server-only";
import { SEED_USERS, type SeedUserRole } from "@/shared/lib/seed-data";
import { SEED_DEV_PASSWORD } from "@/shared/lib/seed-test-users";

// Dev-only one-click sign-in for the seeded accounts (`pnpm db:seed`). The login
// page reads this on the server and passes it to the picker, so a production
// build never renders the list or sends seed credentials to the browser.

export type DevTestAccount = { email: string; roleLabel: string };

export type DevTestAccounts = { password: string; accounts: DevTestAccount[] };

const ROLE_LABELS: Record<SeedUserRole, string> = {
  ADMIN: "Admin",
  MENTOR: "Mentor",
  MENTEE: "Mentee",
};

export function testAccountsEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** The seeded accounts the login page offers, or null in production. */
export function devTestAccounts(): DevTestAccounts | null {
  if (!testAccountsEnabled()) return null;
  return {
    password: SEED_DEV_PASSWORD,
    accounts: SEED_USERS.map((user) => ({ email: user.email, roleLabel: ROLE_LABELS[user.role] })),
  };
}
