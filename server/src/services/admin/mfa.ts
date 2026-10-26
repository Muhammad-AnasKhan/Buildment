import { toDataURL } from "qrcode";
import { AUTH_ERROR_CODES } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import { generateRecoveryCodes } from "../auth/recovery-codes.js";
import { generateTotpSecret, otpauthUri, verifyTotp } from "../auth/totp.js";
import { ADMIN_AUDIT_ACTIONS, recordAdminAction, type AdminActor } from "./audit.js";

// TOTP ("authenticator app") for platform admins. Enrollment is two-step: a secret
// is stored, then the admin proves one code before MFA is enforced — so a misread
// secret can never lock the account out. Admins can also reset another admin's MFA
// (e.g. a lost device), which is the recovery path while no backup codes exist.

const ISSUER = "Buildment";

export type TotpEnrollment = { secret: string; otpauthUri: string; qrDataUrl: string };

/** Whether the signed-in admin has an authenticator app enabled, and how many backup codes remain. */
export async function getMfaStatus(actor: AdminActor): Promise<{ enabled: boolean; recoveryCodesRemaining: number }> {
  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { totpEnabledAt: true, totpRecoveryCodes: true },
  });
  if (!user) throw new NotFoundError("User not found");
  return { enabled: user.totpEnabledAt !== null, recoveryCodesRemaining: user.totpRecoveryCodes.length };
}

export async function beginTotpEnrollment(actor: AdminActor): Promise<TotpEnrollment> {
  const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { totpEnabledAt: true } });
  if (!user) throw new NotFoundError("User not found");
  if (user.totpEnabledAt) {
    throw new ConflictError("An authenticator app is already enabled.", AUTH_ERROR_CODES.MFA_ALREADY_ENABLED);
  }
  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: actor.id }, data: { totpSecret: secret } });
  const uri = otpauthUri({ issuer: ISSUER, account: actor.email, secret });
  // Rendered server-side: no client QR library, and the secret never leaves our origin.
  const qrDataUrl = await toDataURL(uri, { errorCorrectionLevel: "M", margin: 1, width: 240 });
  return { secret, otpauthUri: uri, qrDataUrl };
}

async function requireSelf(actor: AdminActor) {
  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { id: true, totpSecret: true, totpEnabledAt: true },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}

function assertCode(secret: string | null, code: string, enabled: boolean): void {
  if (!enabled || !secret) {
    throw new ConflictError("No authenticator app is enabled for this account.", AUTH_ERROR_CODES.MFA_NOT_ENABLED);
  }
  if (!verifyTotp(secret, code)) {
    throw new UnauthorizedError("That authenticator code is not valid.", AUTH_ERROR_CODES.MFA_INVALID);
  }
}

export async function activateTotp(actor: AdminActor, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await requireSelf(actor);
  if (user.totpEnabledAt) {
    throw new ConflictError("An authenticator app is already enabled.", AUTH_ERROR_CODES.MFA_ALREADY_ENABLED);
  }
  if (!user.totpSecret) {
    throw new ConflictError("Start enrollment before confirming a code.", AUTH_ERROR_CODES.MFA_NOT_ENABLED);
  }
  if (!verifyTotp(user.totpSecret, code)) {
    throw new UnauthorizedError("That authenticator code is not valid.", AUTH_ERROR_CODES.MFA_INVALID);
  }
  const recovery = generateRecoveryCodes();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: actor.id },
      data: { totpEnabledAt: new Date(), totpRecoveryCodes: recovery.hashes },
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.MFA_ENABLE,
      targetType: "User",
      targetId: actor.id,
      summary: `Enabled an authenticator app for ${actor.email}`,
    });
  });
  // Returned once; only the hashes are stored.
  return { recoveryCodes: recovery.plain };
}

/** Issues a fresh set of backup codes, invalidating the old ones. Requires a current code. */
export async function regenerateRecoveryCodes(actor: AdminActor, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await requireSelf(actor);
  assertCode(user.totpSecret, code, user.totpEnabledAt !== null);
  const recovery = generateRecoveryCodes();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: actor.id }, data: { totpRecoveryCodes: recovery.hashes } });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.MFA_RECOVERY_REGENERATE,
      targetType: "User",
      targetId: actor.id,
      summary: `Regenerated backup codes for ${actor.email}`,
    });
  });
  return { recoveryCodes: recovery.plain };
}

export async function disableTotp(actor: AdminActor, code: string): Promise<void> {
  const user = await requireSelf(actor);
  assertCode(user.totpSecret, code, user.totpEnabledAt !== null);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: actor.id },
      data: { totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: [] },
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.MFA_DISABLE,
      targetType: "User",
      targetId: actor.id,
      summary: `Disabled the authenticator app for ${actor.email}`,
    });
  });
}

/** Clears another account's MFA — the recovery path when an admin loses their device. */
export async function resetUserTotp(actor: AdminActor, userId: string): Promise<void> {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, totpEnabledAt: true },
  });
  if (!target) throw new NotFoundError("User not found");
  if (!target.totpEnabledAt) {
    throw new ConflictError("This account has no authenticator app enabled.", AUTH_ERROR_CODES.MFA_NOT_ENABLED);
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: [] },
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.MFA_RESET,
      targetType: "User",
      targetId: userId,
      summary: `Reset the authenticator app for ${target.email}`,
    });
  });
}
