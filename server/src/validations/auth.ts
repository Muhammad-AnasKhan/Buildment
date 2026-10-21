import { z } from "zod";
import { email } from "./common.js";
import { authEmailSchema, loginSchema, signupSchema } from "../shared/lib/auth-validation.js";

const redirectTo = z.string().max(2048).optional();

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().max(128),
}).refine((input) => input.newPassword === input.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});
export type ChangePasswordBody = z.infer<typeof changePasswordBody>;

export const signupBody = signupSchema;
export type SignupBody = z.infer<typeof signupBody>;

export const loginBody = loginSchema;
export type LoginBody = z.infer<typeof loginBody>;

export const resendVerificationBody = z.object({ email: email.optional() });

export const magicLinkBody = z.object({ email: authEmailSchema, redirectTo });

export const magicLinkVerifyQuery = z.object({ token: z.string().trim().min(1), redirectTo });

export const confirmEmailQuery = z.object({ token: z.string().trim().optional() });

export const devLoginQuery = z.object({ email: email.optional(), redirectTo });
