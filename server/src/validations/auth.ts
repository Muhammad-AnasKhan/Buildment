import { z } from "zod";
import { email } from "./common.js";
import { authEmailSchema, loginSchema, realNameSchema, signupSchema } from "../shared/lib/auth-validation.js";

const redirectTo = z.string().max(2048).optional();

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().max(128),
}).refine((input) => input.newPassword === input.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});
export type ChangePasswordBody = z.infer<typeof changePasswordBody>;

export const mfaCodeBody = z.object({ code: z.string().trim().min(6, "Enter the 6-digit code").max(10) });
export type MfaCodeBody = z.infer<typeof mfaCodeBody>;

export const accountSetupBody = z.object({
  name: realNameSchema.optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
  confirmPassword: z.string().max(128).optional(),
}).superRefine((input, context) => {
  if (input.newPassword && input.newPassword !== input.confirmPassword) {
    context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
  }
  if (input.confirmPassword && !input.newPassword) {
    context.addIssue({ code: "custom", path: ["newPassword"], message: "Enter a new password" });
  }
  if (!input.name && !input.newPassword) {
    context.addIssue({ code: "custom", message: "Add your name or a password" });
  }
});
export type AccountSetupBody = z.infer<typeof accountSetupBody>;

// redirectTo carries a course page through the confirmation email (enroll after sign-up).
export const signupBody = signupSchema.extend({ redirectTo });
export type SignupBody = z.infer<typeof signupBody>;

export const loginBody = loginSchema;
export type LoginBody = z.infer<typeof loginBody>;

export const resendVerificationBody = z.object({ email: email.optional() });

export const magicLinkBody = z.object({ email: authEmailSchema, redirectTo });

export const magicLinkVerifyQuery = z.object({ token: z.string().trim().min(1), redirectTo });

export const confirmEmailQuery = z.object({ token: z.string().trim().optional(), redirectTo });

export const devLoginQuery = z.object({ email: email.optional(), redirectTo });
