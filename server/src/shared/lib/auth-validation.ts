import { z } from "zod";

export const authEmailSchema = z.string().trim()
  .min(1, "Email is required")
  .email("Enter a valid email")
  .transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: authEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
  /** TOTP code, or a longer backup code; required only when the account has MFA enabled. */
  code: z.string().trim().min(1, "Code is required").max(40, "Code is too long").optional(),
});
