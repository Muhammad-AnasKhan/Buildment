import type { ZodError } from "zod";
import type { ApiFieldError } from "@/lib/api-client";

export type AuthField = "name" | "email" | "password";
export type AuthFieldErrors = Partial<Record<AuthField, string>>;
export type AuthFormState = { fieldErrors: AuthFieldErrors; formError: string | null };

const authFields: AuthField[] = ["name", "email", "password"];

export function zodAuthErrors(error: ZodError): AuthFieldErrors {
  const fields: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (authFields.includes(field as AuthField) && !fields[field as AuthField]) {
      fields[field as AuthField] = issue.message;
    }
  }
  return fields;
}

export function apiAuthErrors(issues: ApiFieldError[]): AuthFieldErrors {
  const fields: AuthFieldErrors = {};
  for (const issue of issues) {
    if (authFields.includes(issue.field as AuthField) && !fields[issue.field as AuthField]) {
      fields[issue.field as AuthField] = issue.message;
    }
  }
  return fields;
}
