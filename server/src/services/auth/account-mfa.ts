import { toDataURL } from "qrcode";
import { AUTH_ERROR_CODES } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import { generateRecoveryCodes } from "./recovery-codes.js";
import { generateTotpSecret, otpauthUri, verifyTotp } from "./totp.js";

const ISSUER = "Edorax";

export type AccountTotpEnrollment = { secret: string; otpauthUri: string; qrDataUrl: string };

export async function getAccountMfaStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totpEnabledAt: true, totpRecoveryCodes: true } });
  if (!user) throw new NotFoundError("User not found");
  return { enabled: user.totpEnabledAt !== null, recoveryCodesRemaining: user.totpRecoveryCodes.length };
}

export async function beginAccountTotpEnrollment(userId: string, email: string): Promise<AccountTotpEnrollment> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totpEnabledAt: true } });
  if (!user) throw new NotFoundError("User not found");
  if (user.totpEnabledAt) throw new ConflictError("An authenticator app is already enabled.", AUTH_ERROR_CODES.MFA_ALREADY_ENABLED);

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret } });
  const uri = otpauthUri({ issuer: ISSUER, account: email, secret });
  const qrDataUrl = await toDataURL(uri, { errorCorrectionLevel: "M", margin: 1, width: 240 });
  return { secret, otpauthUri: uri, qrDataUrl };
}

async function requireSelf(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, totpSecret: true, totpEnabledAt: true, totpRecoveryCodes: true },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}

function assertCurrentCode(secret: string | null, enabledAt: Date | null, code: string) {
  if (!enabledAt || !secret) throw new ConflictError("No authenticator app is enabled for this account.", AUTH_ERROR_CODES.MFA_NOT_ENABLED);
  if (!verifyTotp(secret, code)) throw new UnauthorizedError("That authenticator code is not valid.", AUTH_ERROR_CODES.MFA_INVALID);
}

export async function activateAccountTotp(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await requireSelf(userId);
  if (user.totpEnabledAt) throw new ConflictError("An authenticator app is already enabled.", AUTH_ERROR_CODES.MFA_ALREADY_ENABLED);
  if (!user.totpSecret) throw new ConflictError("Start enrollment before confirming a code.", AUTH_ERROR_CODES.MFA_NOT_ENABLED);
  if (!verifyTotp(user.totpSecret, code)) throw new UnauthorizedError("That authenticator code is not valid.", AUTH_ERROR_CODES.MFA_INVALID);

  const recovery = generateRecoveryCodes();
  await prisma.user.update({ where: { id: userId }, data: { totpEnabledAt: new Date(), totpRecoveryCodes: recovery.hashes } });
  return { recoveryCodes: recovery.plain };
}

export async function regenerateAccountRecoveryCodes(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await requireSelf(userId);
  assertCurrentCode(user.totpSecret, user.totpEnabledAt, code);
  const recovery = generateRecoveryCodes();
  await prisma.user.update({ where: { id: userId }, data: { totpRecoveryCodes: recovery.hashes } });
  return { recoveryCodes: recovery.plain };
}

export async function disableAccountTotp(userId: string, code: string): Promise<void> {
  const user = await requireSelf(userId);
  assertCurrentCode(user.totpSecret, user.totpEnabledAt, code);
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: [] } });
}
