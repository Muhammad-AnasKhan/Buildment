import { AUTH_ERROR_CODES } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../../utils/errors.js";
import { matchRecoveryCode } from "./recovery-codes.js";
import { verifyTotp } from "./totp.js";

// Sign-in MFA check. Accepts a current TOTP code, or a recovery code, which is
// consumed on use — so a lost device costs one backup code, not the account.

type MfaSubject = {
  id: string;
  totpSecret: string | null;
  totpEnabledAt: Date | null;
  totpRecoveryCodes: string[];
};

export async function assertMfaCode(user: MfaSubject, code: string | undefined): Promise<void> {
  if (!user.totpEnabledAt || !user.totpSecret) return;
  if (!code) {
    throw new ForbiddenError("Enter your authenticator code.", AUTH_ERROR_CODES.MFA_REQUIRED);
  }
  if (verifyTotp(user.totpSecret, code)) return;

  const index = matchRecoveryCode(code, user.totpRecoveryCodes);
  if (index >= 0) {
    const remaining = user.totpRecoveryCodes.filter((_, position) => position !== index);
    await prisma.user.update({ where: { id: user.id }, data: { totpRecoveryCodes: remaining } });
    return;
  }

  throw new UnauthorizedError("That authenticator code is not valid.", AUTH_ERROR_CODES.MFA_INVALID);
}
