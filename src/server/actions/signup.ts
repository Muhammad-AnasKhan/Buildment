"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { sendVerificationEmail } from "@/server/auth/email-verification";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type SignupState = { ok: false; errors: string[] } | { ok: true };

export async function signupAction(
  _prev: SignupState | undefined,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      errors: ["An account with this email already exists. Sign in instead."],
    };
  }

  const passwordHash = hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: "MENTEE",
      profile: {
        create: {
          timezone: "UTC",
          skills: [],
        },
      },
    },
  });

  await sendVerificationEmail({ email, name: parsed.data.name });
  redirect("/verify-email?signup=1");
}
