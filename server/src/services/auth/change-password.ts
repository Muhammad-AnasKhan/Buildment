import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/errors.js";
import { hashPassword, verifyPassword } from "./password.js";

export function checkCurrentPassword(password: string | undefined, hash: string | null) {
  if (!hash) throw new AppError("This account has no password. Contact your administrator to set up password access.", 400, "PASSWORD_NOT_SET");
  if (!verifyPassword(password ?? "", hash)) throw new AppError("Current password is incorrect.", 400, "INVALID_PASSWORD");
}

export async function changePassword(userId: string, sessionToken: string, input: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  checkCurrentPassword(input.currentPassword, user.passwordHash);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: hashPassword(input.newPassword) } }),
    prisma.session.deleteMany({ where: { userId, sessionToken: { not: sessionToken } } }),
  ]);
}
