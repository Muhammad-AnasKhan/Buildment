import { prisma } from "../../db/prisma.js";
import { BadRequestError } from "../../utils/errors.js";
import { hashPassword } from "./password.js";

export async function completeAccountSetup(
  userId: string,
  sessionToken: string,
  input: { name?: string; newPassword?: string; confirmPassword?: string },
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const needsName = !user.name?.trim();
  const needsPassword = !user.passwordHash;

  if (needsName && !input.name) throw new BadRequestError("Enter your name.");
  if (needsPassword && !input.newPassword) throw new BadRequestError("Choose a password to secure your account.");
  if (!needsPassword && input.newPassword) throw new BadRequestError("This account already has a password.");
  if (!needsName && !needsPassword) throw new BadRequestError("Your account is already set up.");

  const data: { name?: string; passwordHash?: string } = {};
  if (needsName) data.name = input.name!.trim();
  if (needsPassword) data.passwordHash = hashPassword(input.newPassword!);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data });
    if (needsPassword) {
      await tx.session.deleteMany({ where: { userId, sessionToken: { not: sessionToken } } });
    }
  });
}
