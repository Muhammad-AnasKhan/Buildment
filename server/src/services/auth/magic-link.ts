import { renderEmailTemplate } from "../email/render.js";
import { randomBytes } from "node:crypto";
import { safeRedirectTo } from "../../shared/lib/safe-redirect.js";
import { prisma } from "../../db/prisma.js";
import { logger } from "../../utils/logger.js";
import { appBaseUrl, sendEmail } from "../email/send.js";
import { homeRouteForRole } from "./access-rules.js";
import { startSession } from "./login.js";
import { toSessionUser } from "./session.js";

// One-time sign-in links, replacing the Auth.js email provider. Tokens live in
// the VerificationToken table under a distinct identifier prefix so they can
// never be confused with email-confirmation tokens. Like Auth.js, an unknown
// address gets an account on first use — the link proves ownership of the inbox.

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const IDENTIFIER_PREFIX = "magic-link:";

export async function requestMagicLink(input: { email: string; redirectTo?: string }) {
  const token = randomBytes(32).toString("hex");
  const identifier = `${IDENTIFIER_PREFIX}${input.email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + MAGIC_LINK_TTL_MS) },
  });

  const url = new URL(`${appBaseUrl()}/api/v1/auth/magic-link/verify`);
  url.searchParams.set("token", token);
  const redirectTo = safeRedirectTo(input.redirectTo);
  if (redirectTo) url.searchParams.set("redirectTo", redirectTo);

  const result = await sendEmail({
    to: input.email,
    subject: "Your Buildment sign-in link",
    html: await renderEmailTemplate("request-magic-link", { url: url }),
    text: `Sign in to Buildment: ${url}\n\nThis link expires in 15 minutes.`,
  });
  if (!result.sent) {
    logger.info({ email: input.email, url: url.toString() }, "[auth] magic link (email delivery disabled)");
  }
  return { sent: result.sent };
}

export type MagicLinkResult =
  | { ok: true; session: { sessionToken: string; expires: Date }; redirectTo: string }
  | { ok: false; reason: "invalid" | "expired" };

export async function consumeMagicLink(token: string, redirectTo?: string): Promise<MagicLinkResult> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || !row.identifier.startsWith(IDENTIFIER_PREFIX)) return { ok: false, reason: "invalid" };

  await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined);
  if (row.expires <= new Date()) return { ok: false, reason: "expired" };

  const email = row.identifier.slice(IDENTIFIER_PREFIX.length);
  const record = await prisma.user.upsert({
    where: { email },
    update: { emailVerified: new Date() },
    create: { email, role: "MENTEE", emailVerified: new Date(), profile: { create: { timezone: "UTC", skills: [] } } },
  });

  const { user, session } = await startSession(toSessionUser(record));
  return { ok: true, session, redirectTo: safeRedirectTo(redirectTo) ?? homeRouteForRole(user.role) };
}
