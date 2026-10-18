import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/errors.js";
import { checkCurrentPassword } from "../auth/change-password.js";
export { changePassword as updateAdminPassword } from "../auth/change-password.js";

export async function updateAdminProfile(userId: string, input: { name: string; email: string; currentPassword?: string }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const emailChanged = input.email !== user.email;
  if (emailChanged) {
    checkCurrentPassword(input.currentPassword, user.passwordHash);
    const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (existing) throw new AppError("That email is already in use.", 409, "EMAIL_IN_USE");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, email: input.email, ...(emailChanged ? { emailVerified: null } : {}) },
  });
}

