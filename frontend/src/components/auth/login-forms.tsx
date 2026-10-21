"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";
import { signInWithPasswordAction } from "@/server/actions/sign-in-credentials";
import { sendMagicLinkAction } from "@/server/actions/magic-link";
import { authEmailSchema, loginSchema } from "@/shared/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { zodAuthErrors, type AuthFormState } from "@/lib/auth-form-state";
import { useAuthFormErrors } from "@/components/auth/use-auth-form-errors";

const initial: AuthFormState = { fieldErrors: {}, formError: null };

export function PasswordLoginForm({ redirectTo, defaultEmail }: { redirectTo?: string | null; defaultEmail?: string }) {
  const [state, action, pending] = useActionState(signInWithPasswordAction, initial);
  const { errorFor, formError, clearField, setLocalErrors } = useAuthFormErrors(state);
  const emailError = errorFor("email");
  const passwordError = errorFor("password");

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
    if (!parsed.success) {
      event.preventDefault();
      setLocalErrors(zodAuthErrors(parsed.error));
    } else {
      setLocalErrors({});
    }
  }

  return (
    <form action={action} onSubmit={validateBeforeSubmit} noValidate className="space-y-3">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="h-10" defaultValue={defaultEmail ?? ""} onChange={() => clearField("email")} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "login-email-error" : undefined} />
        {emailError ? <p id="login-email-error" className="text-xs text-destructive">{emailError}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" required maxLength={128} autoComplete="current-password" className="h-10" onChange={() => clearField("password")} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "login-password-error" : undefined} />
        {passwordError ? <p id="login-password-error" className="text-xs text-destructive">{passwordError}</p> : null}
      </div>
      {formError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
      <Button type="submit" className="h-10 w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

export function MagicLinkForm({ redirectTo }: { redirectTo?: string | null }) {
  const [state, action, pending] = useActionState(sendMagicLinkAction, initial);
  const { errorFor, formError, clearField, setLocalErrors } = useAuthFormErrors(state);
  const emailError = errorFor("email");

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const parsed = authEmailSchema.safeParse(new FormData(event.currentTarget).get("email"));
    if (!parsed.success) {
      event.preventDefault();
      setLocalErrors({ email: parsed.error.issues[0]?.message ?? "Enter a valid email" });
    } else {
      setLocalErrors({});
    }
  }

  return (
    <form action={action} onSubmit={validateBeforeSubmit} noValidate className="space-y-3">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <div className="space-y-1.5">
        <Label htmlFor="magic-email">Email for magic link</Label>
        <Input id="magic-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="h-10" onChange={() => clearField("email")} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "magic-email-error" : undefined} />
        {emailError ? <p id="magic-email-error" className="text-xs text-destructive">{emailError}</p> : null}
      </div>
      {formError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
      <Button type="submit" variant="outline" className="h-10 w-full" disabled={pending}>{pending ? "Sending…" : "Send magic link"}</Button>
    </form>
  );
}
